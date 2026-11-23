import { describe, expect, it } from "vitest";
import type { BillVotes } from "../types";
import {
  extractMemberVotes,
  listFactionMembers,
  listMembers,
  summarizeMemberVotes,
} from "./summarize-member-votes";

function bill(
  overrides: Partial<BillVotes> & Pick<BillVotes, "billId" | "memberVotes">
): BillVotes {
  return {
    billNumber: "第1号",
    title: "テスト議案",
    status: "approved",
    statusNote: null,
    decidedDate: "2026-09-30",
    sessionName: "令和8年 第3回",
    sessionStartDate: "2026-09-01",
    tags: [],
    stances: [
      { factionId: "a", type: "for" },
      { factionId: "b", type: "for" },
    ],
    ...overrides,
  };
}

// m1 は令和7年は会派 x、令和8年は会派 a に所属。m4 は令和7年だけ在籍
const r8Unanimous = bill({
  billId: "b1",
  tags: ["財政・予算"],
  memberVotes: [
    { memberId: "m1", factionId: "a", vote: "for" },
    { memberId: "m2", factionId: "a", vote: "for" },
    { memberId: "m3", factionId: "b", vote: "not_voting" },
  ],
});

const r8Split = bill({
  billId: "b2",
  decidedDate: "2026-06-20",
  sessionName: "令和8年 第2回",
  sessionStartDate: "2026-06-01",
  tags: ["財政・予算", "福祉・医療"],
  stances: [
    { factionId: "a", type: "split" },
    { factionId: "b", type: "for" },
  ],
  memberVotes: [
    { memberId: "m1", factionId: "a", vote: "against" },
    { memberId: "m2", factionId: "a", vote: "for" },
    { memberId: "m5", factionId: "a", vote: "for" },
    { memberId: "m3", factionId: "b", vote: "for" },
  ],
});

const r7 = bill({
  billId: "b3",
  decidedDate: "2025-03-15",
  sessionName: "令和7年 第1回",
  sessionStartDate: "2025-02-20",
  memberVotes: [
    { memberId: "m1", factionId: "x", vote: "absent" },
    { memberId: "m4", factionId: "x", vote: "for" },
  ],
});

describe("extractMemberVotes", () => {
  const votes = extractMemberVotes([r7, r8Unanimous, r8Split], "m1");

  it("その議員の賛否を新しい順に返す", () => {
    expect(votes.map((v) => [v.billId, v.vote, v.factionId])).toEqual([
      ["b1", "for", "a"],
      ["b2", "against", "a"],
      ["b3", "absent", "x"],
    ]);
  });

  it("会派の多数と違う投票をしたかを判定する", () => {
    expect(votes.map((v) => v.differsFromFaction)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("会派内で同数なら、違う投票とはしない", () => {
    const tie = bill({
      billId: "b4",
      memberVotes: [
        { memberId: "m1", factionId: "a", vote: "for" },
        { memberId: "m2", factionId: "a", vote: "against" },
      ],
    });
    expect(extractMemberVotes([tie], "m1")[0].differsFromFaction).toBe(false);
  });
});

describe("summarizeMemberVotes", () => {
  const summary = summarizeMemberVotes(
    extractMemberVotes([r7, r8Unanimous, r8Split], "m1")
  );

  it("賛成・反対・欠席・採決に加わらなかった件数を数える", () => {
    expect(summary.counts).toEqual({
      total: 3,
      for: 1,
      against: 1,
      absent: 1,
      notVoting: 0,
    });
  });

  it("タグごとの賛否は採決に加わった議案だけを数える", () => {
    expect(summary.byTag).toEqual([
      { tag: "財政・予算", total: 2, for: 1, against: 1 },
      { tag: "福祉・医療", total: 1, for: 0, against: 1 },
    ]);
  });

  it("全会一致でなかった議案と、会派の多数と違う投票の議案を返す", () => {
    expect(summary.contested.map((v) => v.billId)).toEqual(["b2"]);
    expect(summary.differing.map((v) => v.billId)).toEqual(["b2"]);
  });

  it("所属会派の移り変わりを古い順に返す", () => {
    expect(summary.factionHistory).toEqual([
      {
        factionId: "x",
        firstSessionName: "令和7年 第1回",
        lastSessionName: "令和7年 第1回",
      },
      {
        factionId: "a",
        firstSessionName: "令和8年 第2回",
        lastSessionName: "令和8年 第3回",
      },
    ]);
  });
});

describe("listMembers", () => {
  it("最後の所属会派と、いまの議員かどうかを返す。記録のない議員は除く", () => {
    const result = listMembers(
      [r7, r8Unanimous, r8Split],
      [
        { id: "m1", name: "議員1" },
        { id: "m4", name: "議員4" },
        { id: "m9", name: "記録なし" },
      ]
    );
    expect(result.map((r) => [r.member.id, r.factionId, r.isCurrent])).toEqual([
      ["m1", "a", true],
      ["m4", "x", false],
    ]);
  });
});

describe("listFactionMembers", () => {
  it("その会派に所属したことのある議員を、いまの所属議員を先にして返す", () => {
    const result = listFactionMembers(
      [r7, r8Unanimous, r8Split],
      [
        { id: "m4", name: "議員4" },
        { id: "m1", name: "議員1" },
        { id: "m2", name: "議員2" },
      ],
      "x"
    );
    expect(result.map((r) => r.member.id)).toEqual(["m4", "m1"]);
  });
});
