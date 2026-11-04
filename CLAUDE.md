# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「Pomodoro Health Timer」。Create React App (react-scripts 4, React 17, TypeScript strict) 製のポモドーロタイマー SPA。状態管理は Recoil、設定の永続化は `react-cookie`。パッケージマネージャは yarn (`yarn.lock`)。

## コマンド

- `yarn start` — 開発サーバー (http://localhost:3000)
- `yarn build` — 本番ビルド（`build/` はコミット対象。再ビルドすると差分が大きくなる点に注意）
- `yarn test` — Jest (watch モード)。単一テスト: `yarn test -- App.test.tsx` / `yarn test -t "テスト名"`。CI 等では `CI=true yarn test`
- `yarn lint` — stylelint + ESLint。`yarn lint:es` / `yarn lint:style` で個別実行、`yarn fix` で prettier + 自動修正
- 型チェック: `npx tsc --noEmit`
- コミット時に husky + lint-staged が prettier / eslint --fix / stylelint --fix を自動実行する

## アーキテクチャ

`tsconfig.json` の `baseUrl: "src"` により、import は `features/counter`、`components/molecules/...` のように `src` 起点の絶対パスで書く。

### 層構造（Atomic Design + Container/Presentational）

- `src/components/{atom,molecules,organisms}` — 表示専用コンポーネント
- `src/containers/organisms/CounterBoard.tsx` — **アプリの中核**。Recoil の状態を購読し、タイマーのロジック全体を持つ。`components/organisms/CounterBoard.tsx` へ props を渡す
- `src/features/` — Recoil の atom と純粋関数
  - `counter.ts`: `counterState`（作業）/ `breakState`（休憩）/ `totalCount` / `notifyState` の atom、時間整形（`getTime`, `getHourTime`）
  - `dialog.ts`: ダイアログ表示状態の atom（`DialogForm` が状態に応じて各 `Dialog*` を出し分ける）
  - `notify.ts`: アラート / デスクトップ通知の発火
  - `notificationVerify.ts`: Notification API 対応・許可状態・ブラウザ判定
- `src/actions.ts` — Redux 風の action 定義だが、現状 Recoil 化により実質未使用

### タイマーの動作（複数ファイルを跨ぐ要点）

- コンテナ内の `setInterval`（980ms）が、`start + set - Date.now()` から残り時間 `current` を計算する（カウントダウンの積算ではなく開始時刻基準）。0 以下で `notifyCall` が走り、作業 ↔ 休憩を切り替える。
- `timeType`: `0` = 作業タイマー、`1` = 休憩タイマー。時間の単位はミリ秒（作業既定 1500000 = 25 分、休憩 300000 = 5 分）。
- 通知設定は数値コードで保持する（`notifyState`）。意味は `features/counter.ts` の `cycleSelect` / `notifySelect` を参照:
  - `cycle`: 0=未選択, 1=Timer Cycle（自動で次のタイマー開始）, 2=Click Cycle（通知を閉じる/OK で次を開始）
  - `select`: 0=未選択, 1=Alert, 2=Desktop, 4=通知なし
  - `browser`: 1=IE/その他, 2=Edge/Safari/Firefox, 3=Chrome。2 または 3 の場合のみ初回開始時にデスクトップ通知を既定選択する
  - `permission`: 0=default, 1=granted, 2=denied
- マウント時に cookie（`notify`, `timer`, `breakTimer`）から設定を復元し、変更時に書き戻す。
- タイマー動作中は `document.title` と favicon（`#fa` 要素、`public/favicon*.ico`）を動的に書き換える。`public/index.html` の `id="fa"` に依存。

## コードスタイル

- ESLint は airbnb + typescript-eslint（型情報あり）+ prettier。`return` の前は必ず空行（`padding-line-between-statements`）。関数は arrow function を推奨（`prefer-arrow`）。
- Prettier: シングルクォート、セミコロンあり、末尾カンマ `all`、80 桁。
- UI 文言・コメントは日本語と英語が混在している。
