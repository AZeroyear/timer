# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「Loopy Timer」（旧 Tabata Timer / 元はポモドーロタイマー）。Create React App (react-scripts 5, React 18, TypeScript strict) 製の**サイクル／インターバルタイマー SPA**。トップに複数のタイマーカードを並べ、プリセット（Pomodoro / Tabata / HIIT など）から追加して**同時並行**で動かせる。タイマーは localStorage に保存される。12 言語対応で、言語ごとに URL（`/ja/` など）を持つ。パッケージマネージャは yarn (`yarn.lock`)。

## コマンド

- `yarn start` — 開発サーバー (http://localhost:3000)
- `yarn build` — 本番ビルド（出力 `build/` はコミット対象）。`react-scripts build` の後に `scripts/prerender.js` が言語別 HTML・`sitemap.xml`・`llms.txt` を生成する。Node 18 でビルドできる（`resolutions` の `loader-utils` ^2.0.4 固定のため）
- `yarn test` — Jest (watch モード)。単一テスト: `yarn test -- App.test.tsx` / `yarn test -t "テスト名"`。CI 等では `CI=true yarn test`
- `yarn lint` — stylelint + ESLint。`yarn lint:es` / `yarn lint:style` で個別実行、`yarn fix` で prettier + 自動修正
- 型チェック: `npx tsc --noEmit`
- コミット時に husky + lint-staged が prettier / eslint --fix / stylelint --fix を自動実行する

## アーキテクチャ

`tsconfig.json` の `baseUrl: "src"` により、import は `features/tabata` のように `src` 起点の絶対パスで書く。

- `src/features/tabata.ts` — **ロジックの中核（純粋関数）**。
  - `Settings`（prepare / work / rest 秒、rounds、sets、setRest 秒）。`clampSetting` と `settingLimits` で入力範囲を制限する。
  - `buildSegments(settings)` が `prepare → (work → rest)×rounds → setRest → … → done` のセグメント列を作る。**各セットの最後の rest と、最後のセットの後の setRest は省略**。
  - `computeProgress(segments, elapsedMs)` が経過時間から現在のフェーズ・ラウンド・残り時間を求める。`formatTime` は 1 時間以上で `h:mm:ss`。
  - 実行状態 `RunState` は `{ running, startedAt, accumulated }`。経過時間は `accumulated + (now - startedAt)` で導出するため、`setInterval` のずれは蓄積しない。
- `src/features/timers.ts` — `TimerItem`（id / emoji / name / presetName / settings / run）、localStorage の読み書きと検証（キー `loopy-timer:v1`、`loopy-timer:muted`）。壊れた保存データは補正して読む。
- `src/features/presets.ts` — 組み込みプリセット（設定値のみ。表示名は i18n の `preset.<id>`）。`EMOJIS` はアイコン候補。
- `src/features/sound.ts` — Web Audio API でビープ音を生成。`initAudio()` はユーザー操作内で呼ぶ必要がある。
- `src/features/timerLink.ts` — タイマーを URL で共有する仕組み（`/<lang>/?n=名前&e=絵文字&c=準備,ワーク,休憩,ラウンド,セット,セット間休憩`）。`decodeTimerLink` は値を検証・clamp する。初回訪問者は共有されたタイマーでそのまま始まり、既存ユーザーには確認バナー（`ImportBanner`）を出してから追加する。処理後は `clearTimerLinkFromUrl` でクエリを消す。
- `src/features/stats.ts` — 完了した回数と「完了した日」を localStorage（`loopy-timer:stats`）に保存し、連続日数を計算する。共有文・共有画像に「通算 N 回目 · N 日連続」を出すために使う。
- `src/features/landing.json` — プリセット別ページ（`/ja/tabata-timer/` など）の一覧（id / slug / emoji）。`presets.ts` の `landingFromPath` と `scripts/prerender.js` の両方が読む。
- `src/features/share.ts` — アプリ名・URL・ハッシュタグ定数（`APP_NAME` など）、共有文の生成、X の投稿 URL、共有用画像（canvas, 4:5）の描画。
- `src/containers/useTimers.ts` — 全タイマーの状態・操作・保存・**共有 ticker（100ms を 1 本）**・音（同一 tick で 1 音に集約）・完了検知・タブタイトルを担当するフック。
- `src/containers/TimerList.tsx` — トップ画面。ヘッダー（言語 select・ミュート）、カード一覧、追加ボタン、各ダイアログ。
- `src/components/organisms/{TimerCard,AboutSection}.tsx`, `src/components/molecules/{PresetDialog,TimerEditDialog,ShareDialog}.tsx` — 表示と入力。スタイルは `TimerList.css`（フェーズ色は `.phase-*`）。モバイル優先（最大幅 480px、追加ボタンは画面下に固定）。
- `src/components/molecules/{Coffee,Join}.tsx` — フッターのリンク（Buy me a coffee / SNS）。スタイルは `TimerList.css` の `.timer-footer` 配下。

### 多言語化（i18n）

- 文言は `src/i18n/locales/<code>.json`（12 言語）。キーは `en.json` が基準で、`useI18n().t('card.round', { a, b })` のように使う。複数形は `unit.round.one` / `.other` / `.few` / `.many` を `Intl.PluralRules` で選ぶ（`{ n }` を渡す）。足りないキーは英語にフォールバックする。
- `src/i18n/i18n.test.ts` が「全言語に全キーがあり、プレースホルダーが一致する」ことを検証する。文言を足したら全言語に足すこと。
- **言語は URL で決まる**（`/en/` `/ja/` `/zh-cn/` `/zh-tw/` `/ko/` `/es/` `/fr/` `/de/` `/pt/` `/it/` `/ru/` `/id/`）。`/` に来たら保存済みの選択 → ブラウザ言語 → 英語の順で決めて `replaceState` する。切替は `pushState`（再読み込みなし）。
- 言語を追加する手順: `locales/<code>.json` を作る → `languages.json` に追加 → `messages.ts` の `Lang` と `messages` に追加。

### SEO / AI 向け

- `scripts/prerender.js`（ビルド後に実行）が `build/<code>/index.html`（言語ごと）と `build/<code>/<slug>/index.html`（プリセット別ページ。12 言語 × 4 プリセット）を生成する。プリセット別ページは `seo.presetTitle` / `seo.presetDescription` / `preset.about.<id>` から title・description を作る。`<title>`・description・canonical・hreflang・OGP・JSON-LD（WebApplication / FAQPage）と、`#root` 内に About / FAQ の静的テキストを埋め込む（JS を実行しないクローラー向け。React が起動すると置き換わる）。`/` は英語の x-default。
- 同じスクリプトが `sitemap.xml`（hreflang 付き）と `llms.txt` を出力する。`public/robots.txt` は AI クローラーを明示的に許可している。
- `public/index.html` の `<meta name="prerender-head">` は差し込み位置のマーカーなので削除しないこと。
- サイト URL・Twitter アカウントは `scripts/prerender.js` と `src/features/share.ts` の定数にある（正: `https://timer.eastazy.com/`）。

### 計測・検索登録

- Google アナリティクス（GA4）: プロパティ「Loopy Timer」、測定 ID `G-K20ZBJ10CN`（`public/index.html` の gtag）。同意（Cookie）バナーは未導入。
- Search Console: ドメインプロパティ `eastazy.com`（Cloudflare 経由で自動確認済み）。`https://timer.eastazy.com/sitemap.xml` を送信済み。ページや言語を足したら `scripts/prerender.js` が sitemap を作り直すので、再デプロイ後に Search Console で状態を確認する。

### プリセット別ページ・共有画像・告知文

- `/<lang>/<slug>/` は同じ SPA を開く。初回訪問者にはそのプリセットのタイマーが入った状態で始まり、既存ユーザーには「追加しますか？」を出す。言語を切り替えてもスラッグは維持される。
- プリセット別の共有画像（OGP）は `node scripts/make-og.js` で `design/og/*.svg` → `public/og/<id>.png` を再生成する（macOS の Chrome が必要。`CHROME` で上書き可）。
- 公開用の下書き（X / Zenn / Product Hunt / Show HN / Reddit、デモ動画の台本）は `docs/launch-posts.md`。

### PWA

`public/sw.js`（本番のみ `src/index.tsx` で登録）。ページは network-first、その他の同一オリジンファイルは stale-while-revalidate。アイコンは `public/logo.svg` が元データ（PNG は `logo*.png`）、共有画像の元は `design/og-image.svg`（`public/og-image.png`）。

## デプロイ

https://timer.eastazy.com/ に Cloudflare Pages で公開しており、`main` への push で自動デプロイされる（リポジトリ内にデプロイ設定ファイルは無い）。**コミット済みの `build/` がそのまま配信される**ため、ソースを変更したら push 前に `yarn build` で `build/` を再生成してコミットすること。`public/` やソースだけの変更は本番に反映されない。言語別ページ（`build/<code>/`）も `build/` に含まれる。反映は push から 1 分前後。

## コードスタイル

- ESLint は airbnb + typescript-eslint（型情報あり）+ prettier。`return` の前は必ず空行（`padding-line-between-statements`）。関数は arrow function を推奨（`prefer-arrow`）。
- Prettier: シングルクォート、セミコロンあり、末尾カンマ `all`、80 桁。
- UI 文言は直接書かず、`src/i18n/locales/*.json` に追加して `t()` で使う（全言語分）。
