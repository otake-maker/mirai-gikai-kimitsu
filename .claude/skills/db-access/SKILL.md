---
name: db-access
description: 本番DB・ローカルDB接続の規約（君津市版）。DBデータを参照・更新する際に必ず確認すること。
---

# DB接続規約（君津市版）

## 重要：福岡市版の本番DBに接続しない

このリポジトリは福岡市版（bakumon1107/mirai-gikai-fukuoka-city）から作られている。
福岡市版の本番 Supabase（プロジェクト ref `xklzpkqtyeuqgawnzgrs`）は**君津市版では絶対に使わない**。
他のスキル（`committee-minutes-ai` 等）に残っている福岡市版の URL・ref も同様に使わないこと。

## 接続先

| 用途 | 接続先 | 認証情報 |
|---|---|---|
| ローカル開発 | `http://127.0.0.1:54421`（`npx supabase start`） | `.env` |
| 本番（君津市版） | 君津市版専用の Supabase Cloud プロジェクト | `.env.production`（`.gitignore` 対象。値はコミットしない） |

本番の接続先は `.env.production` の `SUPABASE_URL` を正とする。作業前に、その値が福岡市版の ref を含んでいないことを確認する。

## データ投入

議案データは `packages/seed/kimitsu/` の JSON と取り込みスクリプトで投入する（何度実行しても重複しない）。

```bash
cd packages/seed
# ローカル
pnpm exec tsx --env-file=../../.env kimitsu/import-bills.ts kimitsu/bills-r8-3.json --publish
# 本番（ユーザーの確認を取ってから実行する）
pnpm exec tsx --env-file=../../.env.production kimitsu/import-bills.ts kimitsu/bills-r8-3.json --publish
```

- `kimitsu/purge-sample-data.ts` はローカル専用（接続先がローカルでなければ停止する）。本番では使わない
- 本番への書き込みは、内容と対象をユーザーに示して確認を取ってから行う

## REST API での参照例

```bash
curl -s "$SUPABASE_URL/rest/v1/council_sessions?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
