import { unstable_cache } from "next/cache";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillVotes, Faction } from "../../shared/types";
import {
  findAllFactions,
  findPublishedBillsWithStances,
} from "../repositories/faction-repository";

export type FactionVotesData = {
  factions: Faction[];
  bills: BillVotes[];
};

/**
 * 会派一覧と、公開済み議案ごとの各会派の賛否を取得する
 * （会派ページの集計はすべてこのデータから行う）
 */
export async function getFactionVotes(
  difficultyLevel: DifficultyLevelEnum
): Promise<FactionVotesData> {
  return _getCachedFactionVotes(difficultyLevel);
}

const _getCachedFactionVotes = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<FactionVotesData> => {
    const [factions, rows] = await Promise.all([
      findAllFactions(),
      findPublishedBillsWithStances(difficultyLevel),
    ]);

    const bills = rows.map((row) => ({
      billId: row.id,
      billNumber: row.bill_number ?? "",
      title: row.bill_contents[0]?.title ?? row.name,
      status: row.status,
      statusNote: row.status_note,
      decidedDate: row.decided_date,
      sessionName: row.council_sessions?.name ?? "",
      sessionStartDate: row.council_sessions?.start_date ?? "",
      tags: row.bills_tags.flatMap((bt) => (bt.tags ? [bt.tags.label] : [])),
      stances: row.faction_stances.map((s) => ({
        factionId: s.faction_id,
        type: s.type,
      })),
    }));

    return { factions, bills };
  },
  ["faction-votes"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);
