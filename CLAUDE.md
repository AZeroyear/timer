# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「Tabata Timer」。Create React App (react-scripts 4, React 17, TypeScript strict) 製のタバタタイマー SPA（元はポモドーロタイマーだったものを置き換えた）。状態管理は Recoil、設定の永続化は `react-cookie`。パッケージマネージャは yarn (`yarn.lock`)。

## コマンド

- `yarn start` — 開発サーバー (http://localhost:3000)
- `yarn build` — 本番ビルド（出力 `build/` はコミット対象）。**Node 16 系でビルドすること**（Node 18 以上は postcss の export エラーで失敗する。例: `~/.nodenv/versions/16.4.0`）
- `yarn test` — Jest (watch モード)。単一テスト: `yarn test -- App.test.tsx` / `yarn test -t "テスト名"`。CI 等では `CI=true yarn test`
- `yarn lint` — stylelint + ESLint。`yarn lint:es` / `yarn lint:style` で個別実行、`yarn fix` で prettier + 自動修正
- 型チェック: `npx tsc --noEmit`
- コミット時に husky + lint-staged が prettier / eslint --fix / stylelint --fix を自動実行する

## アーキテクチャ

`tsconfig.json` の `baseUrl: "src"` により、import は `features/tabata` のように `src` 起点の絶対パスで書く。

- `src/features/tabata.ts` — **ロジックの中核（純粋関数 + Recoil atom）**。
  - `Settings`（prepare / work / rest 秒、rounds、sets、setRest 秒）。既定値は 10/20/10 秒 × 8 ラウンド × 1 セット。`clampSetting` と `settingLimits` で入力範囲を制限する。
  - `buildSegments(settings)` が `prepare → (work → rest)×rounds → setRest → … → done` のセグメント列を作る。**各セットの最後の rest と、最後のセットの後の setRest は省略**。
  - `computeProgress(segments, elapsedMs)` が経過時間から現在のフェーズ・ラウンド・残り時間を求める。
  - 実行状態 `RunState` は `{ running, startedAt, accumulated }` のみ。経過時間は `accumulated + (now - startedAt)` で導出するため、`setInterval`（100ms）のずれは蓄積しない。一時停止は `accumulated` に加算して止める。
- `src/features/sound.ts` — Web Audio API でビープ音を生成（音源ファイル無し）。`initAudio()` は自動再生制限のため開始ボタンのクリック内で呼ぶ必要がある。
- `src/containers/TabataTimer.tsx` — Recoil・cookie・タイマー駆動・音・タブタイトル/favicon（`public/index.html` の `id="fa"`）を担当するコンテナ。フェーズ切替音はセグメント index の変化で、カウントダウン音は work 以外の残り 3 秒で鳴らす。設定は cookie `tabata` に保存・復元する。
- `src/components/organisms/TabataBoard.tsx` — 表示専用。フェーズごとの配色は `Tabata.css` の `.phase-*` クラス。設定入力は実行中・一時停止中は無効（Reset で変更可）。
- `src/components/molecules/{Tweet,Coffee,Join}.tsx` — 共有ボタン等。`CounterBoard.css` / `Dialog.css` は旧ポモドーロ時代の共有スタイル（`flex-center`、`tweet-button`、`icon` など）を含むため残している。

## デプロイ

https://timer.eastazy.com/ に Cloudflare Pages で公開しており、`main` への push で自動デプロイされる（リポジトリ内にデプロイ設定ファイルは無い）。**コミット済みの `build/` がそのまま配信される**ため、ソースを変更したら push 前に `yarn build` で `build/` を再生成してコミットすること。`public/` やソースだけの変更は本番に反映されない。反映は push から 1 分前後。

## コードスタイル

- ESLint は airbnb + typescript-eslint（型情報あり）+ prettier。`return` の前は必ず空行（`padding-line-between-statements`）。関数は arrow function を推奨（`prefer-arrow`）。
- Prettier: シングルクォート、セミコロンあり、末尾カンマ `all`、80 桁。
- UI 文言は英語。
