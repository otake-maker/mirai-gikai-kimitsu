/**
 * purge-sample-data.ts
 *
 * `pnpm seed` が入れる架空の議案・会派・委員会・会期・タグを、ローカルDBから消す。
 * 議案に紐づく解説・賛否・インタビュー等は外部キーの CASCADE で一緒に消える。
 * 君津市の実データを取り込む前に使う。本番DBで誤って動かないよう、接続先がローカルの場合のみ実行する。
 *
 * 実行方法:
 *   pnpm --filter @mirai-gikai/seed exec tsx --env-file=../../.env \
 *     kimitsu/purge-sample-data.ts
 */

import { createAdminClient } from "../shared/helper";

const TABLES_IN_ORDER = [
  "bills",
  "tags",
  "factions",
  "committees",
  "council_sessions",
] as const;

function isLocalUrl(url: string | undefined): boolean {
  if (!url) return false;
  const { hostname } = new URL(url);
  return hostname === "127.0.0.1" || hostname === "localhost";
}

async function main() {
  if (!isLocalUrl(process.env.SUPABASE_URL)) {
    console.error(
      `❌ ローカルDB以外では実行できません（SUPABASE_URL=${process.env.SUPABASE_URL}）`
    );
    process.exit(1);
  }

  const supabase = createAdminClient();
  for (const table of TABLES_IN_ORDER) {
    const { error, count } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .not("id", "is", null);
    if (error) throw new Error(`${table} の削除に失敗しました: ${error.message}`);
    console.log(`🧹 ${table}: ${count ?? 0} 件を削除`);
  }
  console.log("✅ サンプルデータを削除しました");
}

main().catch((error) => {
  console.error("❌", error);
  process.exit(1);
});
