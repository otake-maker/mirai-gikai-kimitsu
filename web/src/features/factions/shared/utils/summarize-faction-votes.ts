import type { StanceTypeEnum } from "@/features/bills/shared/types";
import type {
  BillVotes,
  FactionRecordSummary,
  FactionVote,
  StanceCounts,
  StanceGroup,
} from "../types";

export function toStanceGroup(type: StanceTypeEnum): StanceGroup {
  switch (type) {
    case "for":
    case "conditional_for":
      return "for";
    case "against":
    case "conditional_against":
      return "against";
    case "split":
      return "split";
    default:
      return "other";
  }
}

/** すべての会派が同じ賛否で、会派内でも分かれていないか */
export function isUnanimous(stances: BillVotes["stances"]): boolean {
  const groups = new Set(stances.map((s) => toStanceGroup(s.type)));
  return groups.size === 1 && !groups.has("split");
}

/** 新しい順（議決日 → 会期の開始日）に並べるための比較関数 */
export function compareNewestFirst(a: BillVotes, b: BillVotes): number {
  const byDate = (b.decidedDate ?? "").localeCompare(a.decidedDate ?? "");
  if (byDate !== 0) return byDate;
  return b.sessionStartDate.localeCompare(a.sessionStartDate);
}

/** 会派1つ分の賛否を、その会派が採決に加わった議案だけ取り出す（新しい順） */
export function extractFactionVotes(
  bills: BillVotes[],
  factionId: string
): FactionVote[] {
  return [...bills]
    .sort(compareNewestFirst)
    .flatMap(({ stances, memberVotes: _memberVotes, ...bill }) => {
      const own = stances.find((s) => s.factionId === factionId);
      if (!own) return [];
      return [
        {
          ...bill,
          stance: toStanceGroup(own.type),
          isUnanimous: isUnanimous(stances),
        },
      ];
    });
}

function countStances(votes: FactionVote[]): StanceCounts {
  return {
    total: votes.length,
    for: votes.filter((v) => v.stance === "for").length,
    against: votes.filter((v) => v.stance === "against").length,
    split: votes.filter((v) => v.stance === "split").length,
  };
}

export function summarizeFactionVotes(
  votes: FactionVote[]
): FactionRecordSummary {
  const tags = [...new Set(votes.flatMap((v) => v.tags))];
  const byTag = tags
    .map((tag) => ({
      tag,
      ...countStances(votes.filter((v) => v.tags.includes(tag))),
    }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, "ja"));

  return {
    counts: countStances(votes),
    byTag,
    contested: votes.filter((v) => !v.isUnanimous),
    // votes は新しい順なので、末尾が最初の会期
    firstSessionName: votes.at(-1)?.sessionName ?? null,
    lastSessionName: votes[0]?.sessionName ?? null,
  };
}

export type ContestedBillRow = Omit<BillVotes, "stances" | "memberVotes"> & {
  /** 会派ID → 賛否（その会期に存在しない会派は含まない） */
  stanceByFaction: Record<string, StanceGroup>;
};

/** 全会一致でなかった議案について、会派ごとの賛否を並べた表の行を作る（新しい順） */
export function buildContestedRows(bills: BillVotes[]): ContestedBillRow[] {
  return [...bills]
    .sort(compareNewestFirst)
    .flatMap(({ stances, memberVotes: _memberVotes, ...bill }) => {
      if (stances.length === 0 || isUnanimous(stances)) return [];
      return [
        {
          ...bill,
          stanceByFaction: Object.fromEntries(
            stances.map((s) => [s.factionId, toStanceGroup(s.type)])
          ),
        },
      ];
    });
}
