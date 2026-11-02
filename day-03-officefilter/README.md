# Day 3 · Office Filter

Type what you really think at work. Get three versions you can actually send: diplomatic, direct, firm. A refusal stays a refusal.

- One HTML file, no build step, no external library.
- Bring your own AI: Claude, ChatGPT, Gemini, Grok, or any OpenAI-compatible endpoint (your own proxy). The key lives only in the tab's memory: never saved, never in the URL.
- The AI layer is one function, `callAI(system, user, signal)`, easy to swap.
- Strict JSON answer, validated before display. Errors (network, auth, quota, model, bad format) keep your text.
- "Shorter / Warmer / Firmer" really ask the AI to revise the selected version.
- English and French interface, output language chosen separately. Nothing kept after reload, except provider, endpoint and model.

Part of [The Unfinished 30](https://the-unfinished-30.vercel.app/) by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).
