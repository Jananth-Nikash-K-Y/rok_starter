# Giving Rok a human voice — step by step

Two things are covered here, and they solve different problems:

- **Part A (5 minutes, free)** improves the voice **on your own machine**.
  This is what the demo video records, so do this first.
- **Part B (about an hour)** ships recorded audio to **everyone who opens the
  live link**. Do it after the link is live — it needs no app code changes,
  so it is safe to land after submission.

---

## Part A — better voices on your Mac (do this before filming)

macOS ships *compact* voices by default. Those are the robotic ones. The
Enhanced versions are a free download and sound dramatically better.

1. **System Settings → Accessibility → Spoken Content**
2. Click the **ⓘ** next to **System Voice → Manage Voices…**
3. Download the **Enhanced** (or Premium) version of:
   - **Rishi** — English (India)
   - **Lekha** — Hindi
   - **Vani** — Tamil
   - **Geeta** — Telugu
4. Quit and reopen your browser.

No code change needed. Rok's voice ranking already prefers Enhanced and
Premium voices over compact ones, so it will pick them up automatically.

> Check it worked: open Rok, press **Read this to me** on the first screen.

---

## Part B — generate the 120 clips with Indic Parler-TTS

`ai4bharat/indic-parler-tts` is Apache 2.0, covers all four languages, and is
built by AI4Bharat at IIT Madras. It cannot run in the browser (0.9B
parameters), so clips are generated once and shipped as static MP3s.

This runs on Colab rather than your laptop because `parler-tts` depends on
`descript-audiotools`, which does not build against current setuptools on
macOS. Colab's Linux image installs it cleanly, and the GPU is free.

### Step 1 — accept the model terms

Sign in to Hugging Face and open:

    https://huggingface.co/ai4bharat/indic-parler-tts

Click to accept the terms. The model is gated — without this, downloads
return HTTP 401.

### Step 2 — create a read token

**Settings → Access Tokens → Create new token**, type **Read**. Copy it.

> Keep the token to yourself. Do not paste it into a chat, a code cell, or
> this repo — Colab has a secrets panel for exactly this.

### Step 3 — open Colab with a GPU

Go to <https://colab.research.google.com>, **New notebook**, then
**Runtime → Change runtime type → T4 GPU → Save**.

### Step 4 — add the token to Colab secrets

Click the **key icon** in the left sidebar. **Add new secret**:

- Name: `HF_TOKEN`
- Value: your token
- Toggle **Notebook access** on

### Step 5 — install (first cell)

```python
!pip install -q git+https://github.com/huggingface/parler-tts.git
!pip install -q soundfile
!apt-get -qq install -y ffmpeg
```

### Step 6 — sign in (second cell)

```python
from google.colab import userdata
from huggingface_hub import login
login(userdata.get("HF_TOKEN"))
```

### Step 7 — upload the manifest (third cell)

```python
from google.colab import files
files.upload()
```

Choose **`docs/audio-manifest.json`** from this repo. Regenerate it any time
the copy changes with `npm run audio:script`.

### Step 8 — generate (fourth cell)

Paste the body of **`docs/colab_generate_audio.py`** — everything from
`import json` down to `print("done")`.

Before running, look at the `SPEAKERS` dictionary near the top. It pins one
named voice per language. **Keep one name per language**: without it the model
picks a different voice each time and the app sounds like eight different
people reading one form. The model card lists the recommended speakers for
each language if you want to try others.

Expect roughly 15–25 minutes for 120 clips on a T4. The loop is resumable —
if Colab disconnects, re-run the cell and it skips what is already done.

### Step 9 — download (fifth cell)

```python
!zip -qr rok-audio.zip audio
from google.colab import files
files.download("rok-audio.zip")
```

### Step 10 — drop the clips in

Unzip so the files land as `public/audio/<locale>/<file>.mp3`:

```bash
unzip -o ~/Downloads/rok-audio.zip -d /tmp/rok-audio
cp -R /tmp/rok-audio/audio/. public/audio/
```

### Step 11 — register them

```bash
npm run audio:register
```

This rewrites `src/i18n/recordings.js` from the files actually on disk, so the
list can never claim a recording that is not there. It prints what it found
and warns about any misnamed file.

### Step 12 — verify

```bash
npm run lint && npm run test && npm run build
npm run dev
```

Open Rok, press **Read this to me**, and step through. Anything with a clip
plays the recording; anything without falls back to synthesis, so a partial
set is completely safe to ship.

---

## Before you ship the audio

**Listen to the Tamil and Telugu with a native speaker.** A 0.9B multilingual
model is not uniformly good across 21 languages, and a confidently wrong
pronunciation is worse than the synthetic voice it replaced, because it
sounds authoritative. This is the same session as the copy review you already
owe — do both at once.

If a clip is bad, delete the file and re-run `npm run audio:register`. That
prompt returns to speech synthesis and nothing else changes.

---

## What stays synthetic, and why

Sentences carrying live data — *"₹45,000 left your State Bank of India
account on 24/08/2026"* — are never pre-recorded. You cannot record a number
you do not know yet, and splicing a synthetic amount into a recorded sentence
sounds worse than either alone. `npm run audio:script` marks those as skipped.

The fixed prompts are what a user hears most, and those are the 120.
