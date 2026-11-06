# Loopy Timer — launch drafts

Drafts only; nothing here has been posted. Replace `<VIDEO>` with the screen recording below before posting. Keep claims to what the app does (no health claims).

## One-line positioning

- EN: **Run several interval timers at once — Tabata, HIIT, EMOM, Pomodoro or your own. Free, no sign-up.**
- JA: **タバタ・HIIT・ポモドーロなどのタイマーを、複数同時に動かせる無料のインターバルタイマー。登録不要。**

## 15-second demo video (the most important asset)

Record the phone-width browser (375px) with sound on.

| Sec | Screen | Caption |
|---|---|---|
| 0–2 | Open `/ja/` — a Pomodoro card is already there | 「開いたらすぐ使える」 |
| 2–5 | Tap **Add timer** → Tabata. Two cards now | 「タイマーを追加」 |
| 5–10 | Start both. Phases change colour, countdown beeps, the tab title shows the time | 「複数を同時に動かせる」 |
| 10–13 | Open settings: minutes + seconds, the round/set diagram, **Copy link** | 「分・秒で入力、リンクで共有」 |
| 13–15 | Finish → **Share result** card | 「結果もシェア」 |

Also export a 1:1 or 9:16 cut for X / Shorts / TikTok.

## X (Twitter)

**JA**

> 複数のタイマーを同時に動かせるインターバルタイマーを作りました。
> タバタ／HIIT／EMOM／ポモドーロのプリセット付き、秒じゃなく「分＋秒」で設定、メニューはリンクで共有。
> 無料・登録不要・12言語。
> https://timer.eastazy.com/ja/
> #LoopyTimer
> <VIDEO>

**EN**

> I built a free interval timer that runs several timers at once.
> Presets for Tabata, HIIT, EMOM and Pomodoro, minutes + seconds input, share a timer by link. No sign-up, 12 languages.
> https://timer.eastazy.com/en/
> #LoopyTimer
> <VIDEO>

Reply-thread ideas (one per day): the round-vs-set diagram; "share a workout as a link"; offline / install as an app; the story of why (see Zenn).

## Zenn / note (JA) — outline

Title ideas:
- 「複数同時に動くインターバルタイマーを作った話（React 18 / PWA / 12言語）」
- 「CRA の SPA で 12 言語 × 検索・AI 向け静的 HTML を出す方法」

Outline:
1. なぜ作ったか（ポモドーロと筋トレのタイマーを同時に使いたかった）
2. 設計: 経過時間を `accumulated + (now - startedAt)` で導出 → 複数タイマーでもずれない／共有 ticker 1 本
3. 複数タイマーで音が重ならないようにした（1 tick 1 音に集約）
4. 12 言語と言語別 URL（`/ja/` など）、複数形は `Intl.PluralRules`
5. SPA でも SEO / AI 向けに: ビルド後に言語別 HTML・hreflang・JSON-LD・`sitemap.xml`・`llms.txt` を生成
6. PWA（サービスワーカー）と localStorage 保存
7. 公開して見えた数字（後日追記）

Link to the live app and the repo at the top and bottom.

## Product Hunt

- **Name:** Loopy Timer
- **Tagline (≤60):** Run several interval timers at once. Free, no sign-up.
- **Description:** Loopy Timer is a free web app for Tabata, HIIT, EMOM, Pomodoro and custom work/rest cycles. Add as many timers as you like and run them side by side. Enter times in minutes and seconds, see the round/set structure drawn to scale, share a timer as a link, and share your finished session as an image. Works offline as an installable web app, in 12 languages.
- **Topics:** Productivity, Fitness, Web App
- **First comment:** I wanted a Pomodoro timer and a workout timer running at the same time, and every app I tried did one thing at a time. So each timer in Loopy Timer is independent. Everything is stored in your browser; there is no account. Feedback welcome — especially on the presets you'd like to see.

Launch checklist: gallery = the demo video + 3 screenshots (list, settings with round/set diagram, share card); schedule for 00:01 PT; be around to reply for the first 6 hours.

## Hacker News — Show HN

- **Title:** Show HN: Loopy Timer – run several interval timers at once (Tabata, HIIT, Pomodoro)
- **First comment:** Free, no account, runs in the browser (React, no backend). Timer state is derived from timestamps so several timers never drift, and the SPA ships pre-rendered per-language pages (12 languages) for search engines and LLM crawlers (`/llms.txt`). Happy to talk about the multi-timer audio handling or the i18n/SEO build step.

## Reddit

Read each subreddit's self-promotion rules first; lead with the problem, not the link.

- r/productivity, r/Pomodoro: "I wanted a Pomodoro timer and a kitchen timer running together, so I built a free one that runs several at once. Feedback?"
- r/HIIT, r/bodyweightfitness (check rules): "Free web timer for Tabata/EMOM/HIIT with minutes+seconds input and a diagram of rounds vs. sets."
- r/SideProject, r/webdev: the build story (pre-rendered i18n + SEO on a CRA SPA).

## Japanese channels

- はてなブックマーク向け: Zenn / note の記事を先に出し、記事から本体へリンクする。
- X: 毎日 1 つ、機能を短い動画で見せる。ハッシュタグは `#LoopyTimer` に統一。
- ポモドーロ／筋トレ／勉強垢のコミュニティには、売り込みでなく「使い方の例（このメニューで使ってみて）」として、**タイマーのリンク**を配る。

## Links to share

- Home: https://timer.eastazy.com/ja/ ・ https://timer.eastazy.com/en/
- Preset pages: `/ja/tabata-timer/`, `/ja/pomodoro-timer/`, `/ja/hiit-timer/`, `/ja/emom-timer/` (and the same in every language)
- A custom timer link: open a timer's settings → **Copy link to this timer**

## After posting

- Watch GA4 realtime and Search Console (indexing of the new preset pages).
- Reply to every comment in the first 24 hours; collect requested presets.
- Add the numbers to the Zenn article.
