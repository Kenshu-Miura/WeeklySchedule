# 配信スケジュールメーカー 🎬

配信スケジュール画像を、Webブラウザ上で作って **PNG画像として保存** できるアプリです。
（参考画像のような「WEEK」レイアウトを再現できます）

![screenshot placeholder](docs/screenshot.png)

## ✨ できること

- 開始日を **今日** または **任意の日付** から指定
- **1〜7日間** の範囲で日数を変更（3日・5日など）
- 配信者アイコンを **アップロード → 丸型** に自動加工（ズーム・位置調整つき）
- タイトル「WEEK」の **フォント・字間・サイズ・色** を調整
- 各日ごとに **配信時間・配信内容・補足2行** を入力
- **「お休み」チェック** で自動的に「お休み」表示に切替
- 各日の **色をパレットから選択**、文字の強調色も設定可能
- 完成したスケジュールを **高解像度PNG** でダウンロード

## 🧰 使用技術

| 目的 | 技術 |
|---|---|
| フレームワーク | Vite + React |
| スタイル | Tailwind CSS |
| 画像書き出し | html-to-image |
| フォント | Google Fonts |

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

## 🌐 GitHub で公開 → Netlify で無料デプロイ

サーバーをレンタルせず、誰でもアクセスできるURLで公開できます。

### 1. GitHub にリポジトリを作成して push

```bash
git init
git add .
git commit -m "初回コミット: 配信スケジュールメーカー"
git branch -M main
# GitHub で作成した空リポジトリの URL に置き換えてください
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 2. Netlify と連携（無料）

1. [https://app.netlify.com/](https://app.netlify.com/) にログイン（GitHubアカウントでOK）
2. **「Add new site」→「Import an existing project」** を選択
3. GitHub を連携し、作成したリポジトリを選ぶ
4. ビルド設定は自動で読み込まれます（このリポジトリの `netlify.toml` に記載済み）
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **「Deploy」** を押すと数分で公開URLが発行されます

以降、GitHub に `git push` するたびに Netlify が自動で再デプロイします。

> 💡 Netlify のほか、**Vercel** や **GitHub Pages** でも同様に無料公開できます。
> `netlify.toml` があるため Netlify が最も手軽です。

---

## 📁 主なファイル構成

```
├─ index.html                # フォント読み込み・エントリ
├─ netlify.toml              # Netlify ビルド設定
├─ src/
│  ├─ App.jsx                # 全体の状態管理・レイアウト・PNG書き出し
│  ├─ constants.js           # 色パレット・フォント一覧
│  ├─ components/
│  │  ├─ Editor.jsx          # 左側の編集パネル
│  │  └─ ScheduleCard.jsx    # 右側のスケジュール表（画像化する部分）
│  └─ utils/
│     ├─ date.js             # 日付の生成・整形
│     └─ fontEmbed.js        # 書き出し時のフォント埋め込み
```

## 📝 ライセンス

個人利用・改変自由です。
