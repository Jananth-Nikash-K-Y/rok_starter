# Setting up OpenAI Codex for this repo

## Install

```bash
npm install -g @openai/codex
# or: brew install --cask codex   (macOS)
# or: winget install OpenAI.Codex  (Windows)
```

## Sign in

```bash
codex
```

First run prompts you to authenticate — sign in with your ChatGPT account
(recommended: gives access to current models without separate billing) or
an API key (better if you want to run Codex non-interactively in CI).

## Verify it sees this repo correctly

From the repo root:

```bash
codex
> Read AGENTS.md and docs/BUILD_BRIEF.md, then summarize the plan back to
  me in your own words before writing any code.
```

Confirm its summary matches your understanding of the phases before you
let it start Phase 0. This costs two minutes and catches
misunderstandings before they turn into fifty lines of wrong code.

## Recommended approval mode for this project

Use the CLI's interactive approval mode (the default) rather than
full-auto, for two reasons specific to this repo:

1. Several phases touch `localStorage`/`Web Speech API`/file uploads —
   worth eyeballing the diff before it runs, since browser-permission
   prompts and accessibility behavior are hard to unit-test and easy to
   get subtly wrong.
2. The deploy step (`docs/DEPLOY.md`) runs a real `vercel --prod` command
   that pushes a public URL — you want a human in the loop for that one
   command specifically, even if you trust Codex for the rest.

## Model

Route implementation work to a coding-focused model rather than a
general reasoning model if your account has both available — check
`codex /model` for what's currently selectable; the specific model names
change over time so this file intentionally doesn't hardcode one.

## Running a phase

```bash
codex "Read docs/BUILD_BRIEF.md section 9 (Phased task list). \
Implement Phase 1 only: the Evidence Recognition Engine and its tests. \
Stop and summarize when npm run test passes for all six fixtures."
```

Repeat per phase. Review the diff after each phase before starting the
next — this keeps each Codex session focused and each commit reviewable,
per the "small, single-purpose commits" rule in `AGENTS.md`.

## Non-interactive / scripted use

For CI or a hands-off pass:

```bash
codex exec "Run npm run lint && npm run test. Report failures only."
```

## Long-running or parallel phases

Phases 3–5 touch mostly independent files (different screens, different
engine modules). If your Codex setup supports subagents/parallel tasks,
this is a reasonable place to use them — but only after Phases 0–2 are
merged and green, since every later screen depends on the state machine
and the parser being stable first.
