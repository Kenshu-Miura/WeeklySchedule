# 配信スケジュールメーカー 🎬

配信スケジュール画像を、Webブラウザ上で作成して **高解像度PNGとして保存** できるWebアプリです。
インストール不要・サーバー保存なしで、誰でも無料で使えます。

**🌐 公開URL:** <https://ebiweeklyschedue.netlify.app/>

---

## ✨ 主な機能

### 期間・日付
- 開始日を **「今日」** または **任意の日付** から指定
- **1〜7日間** の範囲で日数を変更（3日・5日など）

### 配信者アイコン
- 画像を **アップロード → 丸型** に自動加工
- **ズーム**・**上下左右の位置** を調整

### タイトル（WEEK）
- 文字内容の変更、**フォント5種** の切り替え
- **字間・サイズ・色・左右位置** を調整

### 各日のスケジュール
- 1日あたり **最大3配信** を登録（追加／削除可）
- 各配信に **配信時間・配信内容・補足2行** を入力
- **配信サイトのアイコン** を付与（YouTube / Twitch / TikTok / X / ニコニコ、**複数選択で同時配信**）
- 文字の **強調色** を配信ごとに設定
- **「お休み」チェック** で自動的にお休み表示に切替
- 日ごとに **配色をパレットから選択**

### 利便性
- 入力内容（アップロード画像を含む）を **ブラウザに自動保存・復元**
- すべてを初期状態に戻す **リセットボタン**
- 完成品を **高解像度PNG（3倍解像度）** でダウンロード

### 表示（レスポンシブ対応）
- **PC**：左に操作パネル・右にプレビューの2カラム
- **スマホ**：プレビューを画面上部に固定し、操作しながら即確認

---

## 🧰 使用技術

| 分類 | 技術 | 役割 |
|---|---|---|
| フレームワーク | **React 18 + Vite** | 高速な開発・ビルド、入力の即時反映 |
| スタイル | **Tailwind CSS** | 色・線・角丸を統一的にデザイン |
| 画像書き出し | **html-to-image** | 画面レイアウトをそのまま高解像度PNGに変換 |
| フォント | **Google Fonts** | Poppins / Montserrat / Oswald / Playfair Display / M PLUS Rounded 1c / Noto Sans JP |
| アイコン | **インラインSVG** | 配信サイトのロゴを画像出力にもそのまま埋め込み |
| データ保存 | **localStorage** | 前回入力・画像をブラウザに保存／復元 |
| ホスティング | **GitHub + Netlify** | `git push` で自動ビルド・自動公開（サーバー費用ゼロ） |

### 技術的な工夫
- **フォント埋め込み**：PNG書き出し時に、クロスオリジンで読めない Google Fonts を自前でフェッチして埋め込み、タイトル書体を確実に再現。
- **アイコンの位置調整**：`object-position` ではなく `transform: translate` 方式で実装し、枠にぴったり収まっても移動できるように。
- **レスポンシブ**：画面幅（`matchMedia`）を判定し、PCとスマホでレイアウトを自動切り替え。スマホでは720px固定のカードを表示幅に合わせて自動縮小。

---

## 💻 ローカルでの動かし方

事前に [Node.js](https://nodejs.org/)（18以上推奨）が必要です。

```bash
# 1. 依存関係をインストール
npm install

# 2. 開発サーバーを起動
npm run dev
```

表示された `http://localhost:5173` をブラウザで開けば動作します。

本番用にビルドして確認する場合：

```bash
npm run build     # dist/ に出力
npm run preview   # ビルド結果をローカル確認
```

---

## 🌐 デプロイ（GitHub → Netlify）

このリポジトリは Netlify に接続済みで、**`main` ブランチへ `git push` するたびに自動で再ビルド・再公開** されます。

```bash
git add .
git commit -m "変更内容"
git push
```

> 💡 Netlify のビルド設定は `netlify.toml` に記載済み（Build command: `npm run build` / Publish directory: `dist`）。
> Vercel や GitHub Pages でも同様に無料公開できます。

<details>
<summary>新しく別リポジトリで公開する場合</summary>

```bash
git init
git add .
git commit -m "初回コミット"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

その後 [Netlify](https://app.netlify.com/) で「Add new site」→「Import an existing project」からリポジトリを選ぶだけで公開できます。
</details>

---

## 📁 ファイル構成

```
├─ index.html                   # フォント読み込み・エントリ
├─ netlify.toml                 # Netlify ビルド設定
├─ tailwind.config.js           # Tailwind 設定（フォント登録など）
├─ src/
│  ├─ App.jsx                   # 状態管理・レイアウト・保存/復元・PNG書き出し
│  ├─ constants.js              # 色パレット・フォント一覧・配信サイト等の定数
│  ├─ components/
│  │  ├─ Editor.jsx             # 操作パネル（入力UI）
│  │  ├─ ScheduleCard.jsx       # スケジュール表（画像化する部分）
│  │  ├─ PlatformIcons.jsx      # 配信サイトのSVGアイコン
│  │  └─ ScaledPreview.jsx      # スマホ用：カードを幅に合わせて縮小表示
│  └─ utils/
│     ├─ date.js                # 日付の生成・整形
│     └─ fontEmbed.js           # 書き出し時のフォント埋め込み
```

---

## 📝 ライセンス

個人利用・改変自由です。
