# Loopy Timer

A free interval timer for Tabata, HIIT, EMOM, Pomodoro and your own work / rest cycles. Run several timers at once, right in the browser — no sign-up, no install. Available in 12 languages.

Live: https://timer.eastazy.com/

## Features

- Several timers running at the same time, each with its own cycle (prepare → work / rest × rounds → set rest × sets)
- Presets (Pomodoro, Tabata, Beginner, HIIT, EMOM) or build your own; emoji icons
- Sound cues, mute, saved timers (localStorage), installable offline PWA
- Share a finished session as text or an image (X, Web Share API) — with session count and day streak
- Share a timer as a link ("Copy link to this timer"); preset pages such as `/en/tabata-timer/`
- Per-language URLs (`/en/`, `/ja/`, …) with pre-rendered HTML, sitemap and `llms.txt`

## Development

Requires Node 18+ and yarn.

```sh
yarn install
yarn start        # http://localhost:3000
yarn test         # CI=true yarn test for a single run
yarn lint         # stylelint + ESLint
npx tsc --noEmit  # type check
yarn build        # build/ (committed) + per-language pages via scripts/prerender.js
```

`build/` is committed and served as-is by Cloudflare Pages, so rebuild it before pushing to `main`. See [CLAUDE.md](CLAUDE.md) for the architecture, i18n and SEO details.

---

## 日本語

タバタ、HIIT、EMOM、ポモドーロなどに使える無料のインターバルタイマーです。複数のタイマーを同時に動かせ、登録もインストールも不要です。12 言語に対応しています。開発手順は上記の Development を参照してください。
