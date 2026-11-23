import { describe, expect, it } from "vitest";
import type { BillVotes } from "../types";
import {
  buildContestedRows,
  extractFactionVotes,
  isUnanimous,
  summarizeFactionVotes,
  toStanceGroup,
} from "./summarize-faction-votes";

function bill(
  overrides: Partial<BillVotes> & Pick<BillVotes, "billId" | "stances">
): BillVotes {
  return {
    billNumber: "第1号",
    title: "テスト議案",
    status: "approved",
    statusNote: null,
    decidedDate: "2026-09-30",
    sessionName: "令和8年 第3回定例会（9月）",
    sessionStartDate: "2026-09-01",
    tags: [],
    ...overrides,
  };
}

const unanimous = bill({
  billId: "b1",
  decidedDate: "2026-09-30",
  tags: ["財政・予算"],
  stances: [
    { factionId: "a", type: "for" },
    { factionId: "b", type: "for" },
  ],
});

const contested = bill({
  billId: "b2",
  decidedDate: "2026-06-20",
  sessionName: "令和8年 第2回定例会（6月）",
  sessionStartDate: "2026-06-01",
  tags: ["財政・予算", "子育て・教育"],
  stances: [
    { factionId: "a", type: "for" },
    { factionId: "b", type: "against" },
  ],
});

const splitInside = bill({
  billId: "b3",
  decidedDate: "2026-03-15",
  sessionName: "令和8年 第1回定例会（2・3月）",
  sessionStartDate: "2026-02-20",
  stances: [
    { factionId: "a", type: "split" },
    { factionId: "b", type: "for" },
  ],
});

const withoutB = bill({
  billId: "b4",
  decidedDate: "2025-03-15",
  sessionName: "令和7年 第1回定例会（2・3月）",
  sessionStartDate: "2025-02-20",
  stances: [{ factionId: "a", type: "against" }],
});

describe("toStanceGroup", () => {
  it.each([
    ["for", "for"],
    ["conditional_for", "for"],
    ["against", "against"],
    ["conditional_against", "against"],
    ["split", "split"],
    ["neutral", "other"],
  ] as const)("%s → %s", (type, expected) => {
    expect(toStanceGroup(type)).toBe(expected);
  });
});

describe("isUnanimous", () => {
  it("全会派が賛成なら全会一致", () => {
    expect(isUnanimous(unanimous.stances)).toBe(true);
  });

  it("賛成と反対がまじれば全会一致ではない", () => {
    expect(isUnanimous(contested.stances)).toBe(false);
  });

  it("会派内で分かれていれば全会一致ではない", () => {
    expect(isUnanimous(splitInside.stances)).toBe(false);
  });
});

describe("extractFactionVotes", () => {
  it("その会派が賛否を記録した議案だけを新しい順に返す", () => {
    const votes = extractFactionVotes(
      [withoutB, contested, unanimous, splitInside],
      "b"
    );
    expect(votes.map((v) => [v.billId, v.stance, v.isUnanimous])).toEqual([
      ["b1", "for", true],
      ["b2", "against", false],
      ["b3", "for", false],
    ]);
  });
});

describe("summarizeFactionVotes", () => {
  const summary = summarizeFactionVotes(
    extractFactionVotes([unanimous, contested, splitInside, withoutB], "a")
  );

  it("賛成・反対・会派内で分かれた件数を数える", () => {
    expect(summary.counts).toEqual({
      total: 4,
      for: 2,
      against: 1,
      split: 1,
    });
  });

  it("タグごとの件数を議案数の多い順に返す", () => {
    expect(summary.byTag).toEqual([
      { tag: "財政・予算", total: 2, for: 2, against: 0, split: 0 },
      { tag: "子育て・教育", total: 1, for: 1, against: 0, split: 0 },
    ]);
  });

  it("全会一致でなかった議案を新しい順に返す", () => {
    expect(summary.contested.map((v) => v.billId)).toEqual(["b2", "b3"]);
  });

  it("最初と最後の会期を返す", () => {
    expect(summary.firstSessionName).toBe("令和7年 第1回定例会（2・3月）");
    expect(summary.lastSessionName).toBe("令和8年 第3回定例会（9月）");
  });

  it("議案がなければ0件と null を返す", () => {
    expect(summarizeFactionVotes([])).toEqual({
      counts: { total: 0, for: 0, against: 0, split: 0 },
      byTag: [],
      contested: [],
      firstSessionName: null,
      lastSessionName: null,
    });
  });
});

describe("buildContestedRows", () => {
  it("全会一致でない議案だけを、会派ごとの賛否つきで新しい順に返す", () => {
    const rows = buildContestedRows([
      splitInside,
      unanimous,
      contested,
      withoutB,
    ]);
    expect(rows.map((r) => [r.billId, r.stanceByFaction])).toEqual([
      ["b2", { a: "for", b: "against" }],
      ["b3", { a: "split", b: "for" }],
    ]);
  });
});
