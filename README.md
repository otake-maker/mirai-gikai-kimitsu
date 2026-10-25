# みらい議会＠君津市

君津市議会で議論されていることを、やさしい言葉で説明する**非公式**のサイトです。

- 公開URL: https://mirai-gikai-kimitsu-web.vercel.app/
- 開発・運営: 大竹みちたか（連絡先: [Instagram @michitakaotake](https://www.instagram.com/michitakaotake)）
- 掲載している会議: 君津市議会 令和7年第4回定例会〜令和8年第3回定例会（議案・賛否・解説）

## 注意事項

- **このサービスは政党チームみらいが運営しているものではありません。**
- 「チームみらい」が開発・公開している「[みらい議会](https://gikai.team-mir.ai/)」（[ソースコード](https://github.com/team-mirai/mirai-gikai)）をもとに、君津市議会向けに作り替えたものです。
- 不具合や気になる点は、党の公式窓口ではなく、開発者（大竹みちたか）までご連絡ください。
- 解説は、AIを活用しながら公開資料をもとに整理したものです。正確性・完全性は保証できません。正式な内容は、君津市議会の公式の資料・会議録でご確認ください。

## ライセンス

[GNU Affero General Public License v3.0（AGPL-3.0）](LICENSE)

本家の [Fork ガイドライン](https://github.com/team-mirai/mirai-gikai/blob/develop/FORK_GUIDELINES.md) に沿って運営しています（名称「みらい議会＠地域名」／独自のロゴ・配色／免責文言の表示／このリポジトリへのリンクの表示）。

## 君津市版での主な変更

AGPL-3.0 第5条(a) にもとづき、改変の内容と日付を記します。2026年10月24日〜25日に、[福岡市版](https://github.com/bakumon1107/mirai-gikai-fukuoka-city)をもとに次の変更を行いました。

- サービス名を「みらい議会＠君津市」に変更
- 君津市議会の議案・賛否のデータと解説を追加（令和7年第4回定例会〜令和8年第3回定例会。`packages/seed/kimitsu/`）
- ロゴ・アイコン・OGP画像・トップの背景を君津市版に差し替え
- AIチャット・AIインタビュー・選挙特設ページ・チームみらいの紹介欄を非表示に（`web/src/config/site.config.ts`）
- 利用規約・プライバシーポリシー・問い合わせ先の運営者を「大竹みちたか」に
- フッターの「ソースコード（GitHub）」のリンク先を、このリポジトリに変更
- 「みらい議会＠君津市とは」から「チームみらい」のサイトへのリンクを外し、本家「みらい議会」へのリンクだけを残す
- 自動チェック・自動公開の対象ブランチを `kimitsu/develop` に変更

その後の変更は、このリポジトリのコミット履歴をご覧ください。

## フォークの系譜

```
チームみらい「みらい議会」（国会版）   team-mirai/mirai-gikai
  └ 川崎市版                           GondoTakashi/mirai-gikai-kawasaki
     └ 福岡市版                        bakumon1107/mirai-gikai-fukuoka-city
        └ 君津市版（このリポジトリ）   otake-maker/mirai-gikai-kimitsu
```

---

## 開発

開発ブランチは `kimitsu/develop` です。**push すると、自動チェック（Lint・型チェック・テスト）と、本番への自動公開が動きます。**

### ローカル環境のセットアップ

**前提条件**: Node.js 20+ / pnpm 9+ / Docker

```bash
# 1. クローン
git clone https://github.com/otake-maker/mirai-gikai-kimitsu.git
cd mirai-gikai-kimitsu
git checkout kimitsu/develop

# 2. 環境変数を設定
cp .env.example .env

# 3. パッケージインストール
pnpm install

# 4. Supabase 起動 + DB 初期化
npx supabase start
pnpm db:reset

# 5. 開発サーバー起動
pnpm dev   # web(:3000) + admin(:3001)
```

開発用 Admin アカウント（ローカル環境専用）: `admin@example.com` / `admin123456`

> [!NOTE]
> 君津市議会の議案データは `packages/seed/kimitsu/` にあります。

### push の前に

```bash
pnpm lint && pnpm typecheck && pnpm test  # 全て通ること
```

### よく使うコマンド

| コマンド | 内容 |
|---------|------|
| `pnpm dev` | web + admin 同時起動 |
| `pnpm test` | 全テスト実行 |
| `pnpm lint` | Biome フォーマット + Lint |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm db:migrate` | マイグレーション実行 + 型ファイル更新 |
| `pnpm db:types:gen` | Supabase 型定義を再生成 |

### プロジェクト構成

```
web/src/
├── app/            # Next.js ルーティング
├── components/     # 共通UIコンポーネント
├── config/         # サイトの設定（site.config.ts：サービス名・運営者・機能のオン/オフ）
├── features/       # 機能別モジュール（bills / budget / general-questions / press-conferences 等）
└── lib/            # 共通ユーティリティ

admin/src/          # データ管理・AI生成等の管理画面

packages/
├── supabase/       # Supabase クライアント・型定義
└── seed/           # 初期データ投入スクリプト（kimitsu/ に君津市議会の議案データ）

supabase/migrations/ # DB マイグレーションファイル
docs/                # 設計ドキュメント（本家・川崎市版・福岡市版から引き継いだもの）
```

### 関連ドキュメント

- [CLAUDE.md](CLAUDE.md) — AI（Claude Code）で開発する場合のルール
- [別の地域向けにフォークする手順](docs/kawasaki/20260304_1000_別地域向けfork手順.md)（川崎市版で作成されたもの）

---

# （参考）本家「みらい議会」のREADME

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/team-mirai-volunteer/mirai-gikai)
[![codecov](https://codecov.io/gh/team-mirai/mirai-gikai/branch/develop/graph/badge.svg)](https://codecov.io/gh/team-mirai/mirai-gikai)

## セットアップ

```bash
# Supabaseの起動
npx supabase start

# 環境変数の設定（必要に応じて.envの内容を変更してください）
cp .env.example .env

# パッケージインストール
pnpm install

# SupabaseのDB初期化, 開発用シードデータのセットアップ
pnpm db:reset

# サーバー起動
pnpm dev
```

## マイグレーション

```bash
# マイグレーションファイル生成
npx supabase migration new マイグレーション名

# マイグレーション実行 & 型ファイル更新
pnpm db:migrate
```

## Adminユーザーの作成

1. Supabase Studio上で Authentication > Add User からユーザーを作成
2. Supabase Studio上で以下のSQLを実行

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = '<1で作成したユーザーのemail>';
```

> [!NOTE]
> 開発環境では、seedデータによって、`email: admin@example.com, password: admin123456` のAdminユーザーが作成されます。
