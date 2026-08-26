# ============================================================================
# Rok — generate spoken prompts with AI4Bharat Indic Parler-TTS
#
# Run this in Google Colab with a GPU runtime (Runtime > Change runtime type
# > T4 GPU). It reads docs/audio-manifest.json, generates one MP3 per clip,
# and zips them ready to drop into public/audio/.
#
# Colab is used rather than a laptop because parler-tts depends on
# descript-audiotools, which does not build against current setuptools on
# macOS/Python 3.13+. Colab's Linux + Python 3.11 image installs it cleanly.
# ============================================================================

# --- Cell 1: install ---------------------------------------------------------
# !pip install -q git+https://github.com/huggingface/parler-tts.git
# !pip install -q soundfile
# !apt-get -qq install -y ffmpeg

# --- Cell 2: authenticate ----------------------------------------------------
# The model is gated (`gated: auto`). Accept the terms once at
# https://huggingface.co/ai4bharat/indic-parler-tts while signed in, then add
# a read token to Colab's Secrets panel (key icon, left sidebar) named HF_TOKEN
# with notebook access enabled. Never paste the token into a code cell.
#
# from google.colab import userdata
# from huggingface_hub import login
# login(userdata.get("HF_TOKEN"))

# --- Cell 3: upload the manifest --------------------------------------------
# from google.colab import files
# files.upload()   # choose docs/audio-manifest.json from your repo

# --- Cell 4: generate --------------------------------------------------------
import json
import os
import subprocess

import soundfile as sf
import torch
from transformers import AutoTokenizer

from parler_tts import ParlerTTSForConditionalGeneration

MODEL_ID = "ai4bharat/indic-parler-tts"
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"device: {device}")

model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL_ID).to(device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

# One named speaker per language, held constant across every clip.
#
# This matters more than it looks: without a fixed speaker the model picks a
# different voice each time, and the app would sound like eight different
# people reading one form. The model card lists the recommended speakers for
# each language — open it and swap these for whichever you prefer, but keep
# one name per language.
SPEAKERS = {
    "en": "Thoma",
    "hi": "Rohit",
    "ta": "Jaya",
    "te": "Prakash",
}

# The delivery Rok needs: unhurried, warm, close to the microphone, clean.
# Parler takes this as free text, so it is worth tuning by ear.
def description_for(locale):
    speaker = SPEAKERS.get(locale, "")
    who = f"{speaker} speaks" if speaker else "A speaker talks"
    return (
        f"{who} in a calm, warm, reassuring tone at a slightly slow pace. "
        "The recording is very close-sounding, with no background noise and "
        "very clear audio quality."
    )

with open("audio-manifest.json", encoding="utf-8") as handle:
    manifest = json.load(handle)

clips = manifest["clips"]
print(f"{len(clips)} clips to generate")

for index, clip in enumerate(clips, start=1):
    locale, name, text = clip["locale"], clip["file"], clip["text"]
    out_dir = os.path.join("audio", locale)
    os.makedirs(out_dir, exist_ok=True)

    wav_path = os.path.join(out_dir, name.replace(".mp3", ".wav"))
    mp3_path = os.path.join(out_dir, name)

    if os.path.exists(mp3_path):
        continue  # resumable: re-running skips what is already done

    description = description_for(locale)
    desc_ids = description_tokenizer(description, return_tensors="pt").to(device)
    prompt_ids = tokenizer(text, return_tensors="pt").to(device)

    with torch.no_grad():
        generation = model.generate(
            input_ids=desc_ids.input_ids,
            attention_mask=desc_ids.attention_mask,
            prompt_input_ids=prompt_ids.input_ids,
            prompt_attention_mask=prompt_ids.attention_mask,
        )

    sf.write(wav_path, generation.cpu().numpy().squeeze(), model.config.sampling_rate)

    # MP3 keeps the shipped payload small — these are static assets a victim
    # on a rural connection has to download.
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-b:a", "64k", mp3_path],
        check=True,
    )
    os.remove(wav_path)

    print(f"[{index}/{len(clips)}] {locale}/{name}")

print("done")

# --- Cell 5: download --------------------------------------------------------
# !zip -qr rok-audio.zip audio
# from google.colab import files
# files.download("rok-audio.zip")
