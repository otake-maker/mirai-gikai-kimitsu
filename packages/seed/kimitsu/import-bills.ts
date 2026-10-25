/**
 * import-bills.ts
 *
 * 君津市議会の議案・議決結果・会派別の賛否（と、あれば AI 解説）を取り込む。
 * データは会期ごとの JSON（例: kimitsu/bills-r8-3.json）で管理する。
 * 同じ JSON を何度流しても結果が変わらないよう、既存レコードは更新する。
 *
 * 実行方法（ローカルDB）:
 *   pnpm --filter @mirai-gikai/seed exec tsx --env-file=../../.env \
 *     kimitsu/import-bills.ts kimitsu/bills-r8-3.json [--dry-run] [--publish]
 *
 * --publish を付けると、解説（contents）がある議案だけを published にする。
 * 解説は JSON に入れる前にユーザーの確認を取ること（AGENTS.md「AI生成コンテンツのDB更新ルール」）。
 * 付けない場合、新規の議案は draft で登録する。
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { type AdminClient, createAdminClient } from "../shared/helper";
import {
  type AggregatedStance,
  aggregateFactionStances,
  type FactionMembers,
  type MemberVotes,
} from "./aggregate-stances";
import { resultToStatus } from "./result-to-status";

type BillContentEntry = {
  title: string;
  summary: string;
  content: string;
};

type BillEntry = {
  billNumber: string;
  name: string;
  officialSummary: string;
  submittedDate: string;
  decidedDate: string;
  result: string;
  votes: MemberVotes;
  /**
   * この議案だけ採決に加わらない議員を上書きする（省略時はファイル全体の nonVoting）。
   * 議長を含めた特別多数議決の議案では [] を指定する。
   */
  nonVoting?: string[];
  /** 省略時は bill。発議案（意見書）は opinion、議員提出の意見書以外は member_bill */
  billType?: BillType;
  /** tags.json の label のいずれか */
  tags: string[];
  /** トップページの「注目の議案」に出すか */
  isFeatured: boolean;
  contents?: {
    normal: BillContentEntry;
    hard: BillContentEntry;
  };
};

type TagEntry = {
  label: string;
  /** トップページのタグ別一覧での表示順（小さいほど上）。null なら一覧に出さない */
  featuredPriority: number | null;
};

type BillsFile = {
  councilSession: {
    slug: string;
    name: string;
    startDate: string;
    endDate: string;
    councilUrl: string;
  };
  nonVoting: string[];
  factions: (FactionMembers & {
    displayName: string;
    /** 表示順。会期をまたいで同じ会派の順番がそろうよう指定する（省略時はファイル内の順番） */
    sortOrder?: number;
    /** 現在も存在する会派か（解散した会派は false。省略時 true） */
    isActive?: boolean;
  })[];
  bills: BillEntry[];
};

type BillType = "bill" | "opinion" | "resolution" | "member_bill";

/** タグは会期をまたいで表示順をそろえるため、全会期共通のファイルで管理する */
const TAGS_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "tags.json"
);

async function upsertTags(
  supabase: AdminClient,
  tags: TagEntry[]
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("tags")
    .upsert(
      tags.map((tag) => ({
        label: tag.label,
        featured_priority: tag.featuredPriority,
      })),
      { onConflict: "label" }
    )
    .select("id, label");
  if (error) throw error;
  return new Map(data.map((tag) => [tag.label, tag.id]));
}

async function replaceBillTags(
  supabase: AdminClient,
  billId: string,
  labels: string[],
  tagIds: Map<string, string>
) {
  const { error: deleteError } = await supabase
    .from("bills_tags")
    .delete()
    .eq("bill_id", billId);
  if (deleteError) throw deleteError;
  if (labels.length === 0) return;

  const rows = labels.map((label) => {
    const tagId = tagIds.get(label);
    if (!tagId) throw new Error(`タグが見つかりません: ${label}`);
    return { bill_id: billId, tag_id: tagId };
  });
  const { error } = await supabase.from("bills_tags").insert(rows);
  if (error) throw error;
}

async function upsertFactions(
  supabase: AdminClient,
  factions: BillsFile["factions"]
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const [index, faction] of factions.entries()) {
    const values = {
      name: faction.name,
      display_name: faction.displayName,
      sort_order: faction.sortOrder ?? index + 1,
      is_active: faction.isActive ?? true,
    };
    const { data: existing, error: selectError } = await supabase
      .from("factions")
      .select("id")
      .eq("name", faction.name)
      .maybeSingle();
    if (selectError) throw selectError;

    if (existing) {
      const { error } = await supabase
        .from("factions")
        .update(values)
        .eq("id", existing.id);
      if (error) throw error;
      ids.set(faction.name, existing.id);
    } else {
      const { data, error } = await supabase
        .from("factions")
        .insert(values)
        .select("id")
        .single();
      if (error) throw error;
      ids.set(faction.name, data.id);
    }
  }

  return ids;
}

async function upsertCouncilSession(
  supabase: AdminClient,
  session: BillsFile["councilSession"]
): Promise<string> {
  const { data, error } = await supabase
    .from("council_sessions")
    .upsert(
      {
        slug: session.slug,
        name: session.name,
        start_date: session.startDate,
        end_date: session.endDate,
        council_url: session.councilUrl,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertBill(
  supabase: AdminClient,
  sessionId: string,
  sourceUrl: string,
  bill: BillEntry,
  publish: boolean
): Promise<string> {
  const { status, statusNote } = resultToStatus(bill.result);
  const billType = bill.billType ?? "bill";
  const values = {
    council_session_id: sessionId,
    bill_number: bill.billNumber,
    bill_type: billType,
    name: bill.name,
    status,
    status_note: statusNote,
    submitted_date: bill.submittedDate,
    decided_date: bill.decidedDate,
    source_url: sourceUrl,
    is_featured: bill.isFeatured,
    ...(publish
      ? { publish_status: "published" as const, published_at: new Date().toISOString() }
      : {}),
  };

  // bills の一意制約は部分インデックスのため upsert(onConflict) が使えない
  const { data: existing, error: selectError } = await supabase
    .from("bills")
    .select("id")
    .eq("council_session_id", sessionId)
    .eq("bill_number", bill.billNumber)
    .eq("bill_type", billType)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("bills")
      .update(values)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("bills")
    .insert({ publish_status: "draft", ...values })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function replaceStances(
  supabase: AdminClient,
  billId: string,
  stances: AggregatedStance[],
  factionIds: Map<string, string>
) {
  const { error: deleteError } = await supabase
    .from("faction_stances")
    .delete()
    .eq("bill_id", billId);
  if (deleteError) throw deleteError;

  const rows = stances.map((stance) => {
    const factionId = factionIds.get(stance.factionName);
    if (!factionId) {
      throw new Error(`会派が見つかりません: ${stance.factionName}`);
    }
    return {
      bill_id: billId,
      faction_id: factionId,
      type: stance.type,
      comment: stance.comment,
    };
  });

  const { error } = await supabase.from("faction_stances").insert(rows);
  if (error) throw error;
}

async function upsertContents(
  supabase: AdminClient,
  billId: string,
  contents: NonNullable<BillEntry["contents"]>
) {
  const rows = (["normal", "hard"] as const).map((level) => ({
    bill_id: billId,
    difficulty_level: level,
    ...contents[level],
  }));
  const { error } = await supabase
    .from("bill_contents")
    .upsert(rows, { onConflict: "bill_id,difficulty_level" });
  if (error) throw error;
}

async function main() {
  const [dataArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const isDryRun = process.argv.includes("--dry-run");
  const publish = process.argv.includes("--publish");

  if (!dataArg) {
    console.error(
      "❌ 取り込むJSONファイルを指定してください（例: kimitsu/bills-r8-3.json）"
    );
    process.exit(1);
  }

  const data: BillsFile = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), dataArg), "utf-8")
  );

  const tags: TagEntry[] = JSON.parse(fs.readFileSync(TAGS_FILE, "utf-8"));

  // 先に全議案を検証・集計し、途中で失敗して中途半端に書き込まれないようにする
  const tagLabels = new Set(tags.map((tag) => tag.label));
  for (const bill of data.bills) {
    const unknown = bill.tags.filter((label) => !tagLabels.has(label));
    if (unknown.length > 0) {
      throw new Error(
        `${bill.billNumber} に未定義のタグがあります: ${unknown.join(", ")}`
      );
    }
  }
  const prepared = data.bills.map((bill) => ({
    bill,
    status: resultToStatus(bill.result),
    stances: aggregateFactionStances(
      data.factions,
      bill.votes,
      bill.nonVoting ?? data.nonVoting
    ),
  }));

  console.log(
    `📋 ${data.councilSession.name}: 議案 ${prepared.length} 件 / 会派 ${data.factions.length}`
  );
  for (const { bill, status, stances } of prepared) {
    const summary = stances
      .map((s) => `${s.factionName}:${s.type}`)
      .join(" ");
    const hasContents = bill.contents ? "解説あり" : "解説なし";
    const featured = bill.isFeatured ? "★注目 " : "";
    console.log(
      `  ${bill.billNumber} ${status.status}${status.statusNote ? `(${status.statusNote})` : ""} [${hasContents}] ${featured}{${bill.tags.join(",")}} ${summary}`
    );
    for (const s of stances.filter((s) => s.comment)) {
      console.log(`      ${s.factionName}: ${s.comment}`);
    }
  }

  if (isDryRun) {
    console.log("🔍 --dry-run のため DB には書き込みません");
    return;
  }

  const supabase = createAdminClient();
  const factionIds = await upsertFactions(supabase, data.factions);
  const tagIds = await upsertTags(supabase, tags);
  const sessionId = await upsertCouncilSession(supabase, data.councilSession);

  for (const { bill, stances } of prepared) {
    const billId = await upsertBill(
      supabase,
      sessionId,
      data.councilSession.councilUrl,
      bill,
      publish && Boolean(bill.contents)
    );
    await replaceStances(supabase, billId, stances, factionIds);
    await replaceBillTags(supabase, billId, bill.tags, tagIds);
    if (bill.contents) {
      await upsertContents(supabase, billId, bill.contents);
    }
  }

  console.log(
    `✅ 取り込み完了: 議案 ${prepared.length} 件 / 賛否 ${prepared.reduce((n, p) => n + p.stances.length, 0)} 件`
  );
}

main().catch((error) => {
  console.error("❌ 取り込みに失敗しました:", error);
  process.exit(1);
});
