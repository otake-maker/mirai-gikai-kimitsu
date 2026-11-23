import type { BillVotes, CouncilMember, MemberVoteType } from "../types";
import { compareNewestFirst, isUnanimous } from "./summarize-faction-votes";

/** ある議員から見た、議案1件への賛否 */
export type MemberBillVote = Omit<BillVotes, "stances" | "memberVotes"> & {
  vote: MemberVoteType;
  /** 採決のときに所属していた会派 */
  factionId: string;
  /** すべての会派が同じ賛否だったか */
  isUnanimous: boolean;
  /** 同じ会派で採決に加わった議員の多数と、違う投票をしたか */
  differsFromFaction: boolean;
};

export type FactionPeriod = {
  factionId: string;
  firstSessionName: string;
  lastSessionName: string;
};

export type MemberRecordSummary = {
  counts: {
    total: number;
    for: number;
    against: number;
    absent: number;
    notVoting: number;
  };
  /** タグ（テーマ）ごとの賛否。採決に加わった議案だけを数える */
  byTag: { tag: string; total: number; for: number; against: number }[];
  /** 全会一致でなかった議案のうち、採決に加わったもの（新しい順） */
  contested: MemberBillVote[];
  /** 会派の多数と違う投票をした議案（新しい順） */
  differing: MemberBillVote[];
  /** 所属会派の移り変わり（古い順） */
  factionHistory: FactionPeriod[];
};

function isVoted(vote: MemberVoteType): vote is "for" | "against" {
  return vote === "for" || vote === "against";
}

/** 議員1人分の賛否を取り出す（新しい順） */
export function extractMemberVotes(
  bills: BillVotes[],
  memberId: string
): MemberBillVote[] {
  return [...bills]
    .sort(compareNewestFirst)
    .flatMap(({ stances, memberVotes, ...bill }) => {
      const own = memberVotes.find((v) => v.memberId === memberId);
      if (!own) return [];

      const sameFaction = memberVotes.filter(
        (v) => v.factionId === own.factionId && isVoted(v.vote)
      );
      const agreeing = sameFaction.filter((v) => v.vote === own.vote).length;
      const differsFromFaction =
        isVoted(own.vote) && agreeing < sameFaction.length - agreeing;

      return [
        {
          ...bill,
          vote: own.vote,
          factionId: own.factionId,
          isUnanimous: isUnanimous(stances),
          differsFromFaction,
        },
      ];
    });
}

export function summarizeMemberVotes(
  votes: MemberBillVote[]
): MemberRecordSummary {
  const voted = votes.filter((v) => isVoted(v.vote));
  const tags = [...new Set(voted.flatMap((v) => v.tags))];

  const factionHistory: FactionPeriod[] = [];
  for (const vote of [...votes].reverse()) {
    const last = factionHistory.at(-1);
    if (last?.factionId === vote.factionId) {
      last.lastSessionName = vote.sessionName;
    } else {
      factionHistory.push({
        factionId: vote.factionId,
        firstSessionName: vote.sessionName,
        lastSessionName: vote.sessionName,
      });
    }
  }

  return {
    counts: {
      total: votes.length,
      for: votes.filter((v) => v.vote === "for").length,
      against: votes.filter((v) => v.vote === "against").length,
      absent: votes.filter((v) => v.vote === "absent").length,
      notVoting: votes.filter((v) => v.vote === "not_voting").length,
    },
    byTag: tags
      .map((tag) => {
        const tagged = voted.filter((v) => v.tags.includes(tag));
        return {
          tag,
          total: tagged.length,
          for: tagged.filter((v) => v.vote === "for").length,
          against: tagged.filter((v) => v.vote === "against").length,
        };
      })
      .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, "ja")),
    contested: voted.filter((v) => !v.isUnanimous),
    differing: voted.filter((v) => v.differsFromFaction),
    factionHistory,
  };
}

export type MemberListItem = {
  member: CouncilMember;
  /** 最後に賛否を記録した議案のときの会派 */
  factionId: string;
  /** いちばん新しい会期の議案に賛否の記録があるか */
  isCurrent: boolean;
};

/** 議員の一覧（最後の所属会派つき）。賛否の記録がない議員は含まない */
export function listMembers(
  bills: BillVotes[],
  members: CouncilMember[]
): MemberListItem[] {
  const sorted = [...bills].sort(compareNewestFirst);
  const latestSession = sorted[0]?.sessionName;

  return members.flatMap((member) => {
    const latest = sorted.find((bill) =>
      bill.memberVotes.some((v) => v.memberId === member.id)
    );
    const own = latest?.memberVotes.find((v) => v.memberId === member.id);
    if (!latest || !own) return [];
    return [
      {
        member,
        factionId: own.factionId,
        isCurrent: latest.sessionName === latestSession,
      },
    ];
  });
}

/** ある会派に所属したことのある議員（いま所属している議員が先） */
export function listFactionMembers(
  bills: BillVotes[],
  members: CouncilMember[],
  factionId: string
): MemberListItem[] {
  const everIn = new Set(
    bills.flatMap((bill) =>
      bill.memberVotes
        .filter((v) => v.factionId === factionId)
        .map((v) => v.memberId)
    )
  );
  const isNow = (item: MemberListItem) =>
    item.isCurrent && item.factionId === factionId;

  return listMembers(bills, members)
    .filter((item) => everIn.has(item.member.id))
    .sort((a, b) => Number(isNow(b)) - Number(isNow(a)));
}
