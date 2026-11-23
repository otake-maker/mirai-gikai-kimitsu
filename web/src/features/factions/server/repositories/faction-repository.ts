import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { Faction } from "../../shared/types";

/** PostgREST が1回に返す行数の上限 */
const PAGE_SIZE = 1000;

/**
 * 会派を表示順に全件取得（現在の会派が先）
 */
export async function findAllFactions(): Promise<Faction[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("factions")
    .select("id, name, display_name, sort_order, is_active")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch factions: ${error.message}`);
  }

  return data;
}

/**
 * 公開済み議案を、会期・タグ・各会派の賛否・解説タイトル付きで全件取得
 */
export async function findPublishedBillsWithStances(
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("bills")
      .select(
        `
        id,
        bill_number,
        name,
        status,
        status_note,
        decided_date,
        council_sessions (name, start_date),
        bill_contents (title, difficulty_level),
        faction_stances (faction_id, type),
        bills_tags (tags (label))
      `
      )
      .eq("publish_status", "published")
      .eq("bill_contents.difficulty_level", difficultyLevel)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch bills with stances: ${error.message}`);
    }

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}
