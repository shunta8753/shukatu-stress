# まいにちナビ2028（就活ストレスシミュレーター）

就活ナビサイトのマイページを模した、就活ストレス体験ネタサイトです（約5分）。
最後は必ずお祈りメールで終わります。企画の詳細は [docs/企画書.md](docs/企画書.md) を参照。

※登場する企業・サービスはすべて架空です。

## 開発

```bash
npm install      # 初回のみ
npm run dev      # 開発サーバー起動（http://localhost:5173）
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果の確認
```

## ファイル構成

```
src/
  game/        ゲーム状態（ストレス値・進捗など）、入力チェック、ES例文
  components/  ヘッダー・フッター・モーダル・通知
  stages/      各画面（会員登録 → ダッシュボード → エントリー → 説明会 → ES → Webテスト → 面接予約 → 面接 → 結果待ち → お祈り → リザルト）
  styles.css   全体のスタイル
```

## 公開（GitHub Pages）

`main` ブランチに push すると `.github/workflows/deploy.yml` により自動で公開されます。
初回のみ GitHub のリポジトリ設定 → Pages → Source を「GitHub Actions」にしてください。
