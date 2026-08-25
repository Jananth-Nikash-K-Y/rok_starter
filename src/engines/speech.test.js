import { beforeEach, describe, expect, it, vi } from "vitest";

/** Minimal stand-in for the browser's SpeechSynthesis voice list. */
function installVoices(voices) {
  const spoken = [];
  global.window = {
    speechSynthesis: {
      getVoices: () => voices,
      cancel: () => {},
      speak: (utterance) => spoken.push(utterance),
      addEventListener: () => {},
    },
  };
  global.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  return spoken;
}

const voice = (name, lang, extra = {}) => ({ name, lang, voiceURI: name, ...extra });

describe("voice selection", () => {
  beforeEach(() => vi.resetModules());

  /* Operating systems list joke voices beside real ones, and one is
     occasionally the default. Reading a stolen-savings report in a novelty
     voice would be its own kind of harm. */
  it("never picks a novelty system voice", async () => {
    const spoken = installVoices([
      voice("Bad News", "en-IN", { default: true }),
      voice("Zarvox", "en-IN"),
      voice("Rishi", "en-IN"),
    ]);
    const { speak } = await import("./speech.js");
    speak("Hello", "en");
    expect(spoken[0].voice.name).toBe("Rishi");
  });

  /* Browsers often list a small robotic fallback first. Taking the first
     match is what makes an app sound like a 1990s screen reader. */
  it("prefers a neural voice over the first one listed", async () => {
    const spoken = installVoices([
      voice("English Compact", "en-IN", { default: true }),
      voice("Google UK English Neural", "en-IN", { localService: false }),
    ]);
    const { speak } = await import("./speech.js");
    speak("Hello", "en");
    expect(spoken[0].voice.name).toBe("Google UK English Neural");
  });

  it("falls back to the base language when no exact tag exists", async () => {
    const spoken = installVoices([voice("Lekha", "hi-IN"), voice("Vani", "ta")]);
    const { speak } = await import("./speech.js");
    speak("வணக்கம்", "ta");
    expect(spoken[0].voice.name).toBe("Vani");
  });

  /* One long utterance is read in a single flat contour; clause-by-clause
     restores the pauses a person would take. */
  it("speaks clause by clause rather than as one flat block", async () => {
    const spoken = installVoices([voice("Rishi", "en-IN")]);
    const { speak } = await import("./speech.js");
    speak("Your case is open. Your reference is ROK-NX7-V4K.", "en");
    expect(spoken.length).toBe(2);
    expect(spoken[0].text).toBe("Your case is open.");
  });

  it("slows the pace and drops the pitch slightly", async () => {
    const spoken = installVoices([voice("Rishi", "en-IN")]);
    const { speak } = await import("./speech.js");
    speak("Hello", "en");
    expect(spoken[0].rate).toBeLessThan(1);
    expect(spoken[0].pitch).toBeLessThan(1);
  });

  it("reports honestly when a language has no voice at all", async () => {
    installVoices([voice("Rishi", "en-IN")]);
    const { canSpeak } = await import("./speech.js");
    expect(canSpeak("en")).toBe(true);
    expect(canSpeak("te")).toBe(false);
  });
});
