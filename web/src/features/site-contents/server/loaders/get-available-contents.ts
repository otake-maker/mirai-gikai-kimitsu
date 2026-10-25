import "server-only";
import { unstable_cache } from "next/cache";
import { getSessionsWithBudget } from "@/features/budget-overview/server/loaders/get-sessions-with-budget";
import { findAllMeetings } from "@/features/committee-minutes/server/repositories/committee-meeting-repository";
import { loadJimuJigyoList } from "@/features/jimu-jigyo/server/loaders/load-jimu-jigyo-list";
import { findPublishedPressConferences } from "@/features/press-conferences/server/repositories/press-conference-repository";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { AvailableContents } from "../../shared/types";

/**
 * 各コーナーに公開データがあるかを取得する。
 * ヘッダーのメニューで全ページから呼ばれるため、結果を5分間キャッシュする。
 */
export async function getAvailableContents(): Promise<AvailableContents> {
  return _getCachedAvailableContents();
}

const _getCachedAvailableContents = unstable_cache(
  async (): Promise<AvailableContents> => {
    const [meetings, budgetSessions, pressConferences, jimuJigyo] =
      await Promise.all([
        findAllMeetings(),
        getSessionsWithBudget(),
        findPublishedPressConferences(),
        loadJimuJigyoList("r6"),
      ]);

    return {
      committees: meetings.length > 0,
      budget: budgetSessions.length > 0,
      pressConferences: pressConferences.length > 0,
      jimuJigyo: jimuJigyo.length > 0,
    };
  },
  ["available-contents"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.COUNCIL_SESSIONS],
  }
);
