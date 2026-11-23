import { describe, expect, it } from "vitest";
import { formatBillResult, shortFactionName } from "./format-labels";

describe("shortFactionName", () => {
  it("末尾の（議員名）を外す", () => {
    expect(shortFactionName("希望にみらい（林 祥子）")).toBe("希望にみらい");
  });

  it("かっこがなければそのまま", () => {
    expect(shortFactionName("令和新政")).toBe("令和新政");
  });
});

describe("formatBillResult", () => {
  it("陳情の可決は採択", () => {
    expect(formatBillResult("陳情第7号", "approved", null)).toBe("採択");
  });

  it("陳情の否決は不採択", () => {
    expect(formatBillResult("陳情第7号", "rejected", null)).toBe("不採択");
  });

  it("status_note があればそれを使う", () => {
    expect(formatBillResult("第6号", "approved", "承認")).toBe("承認");
  });

  it("それ以外は可決・否決", () => {
    expect(formatBillResult("第1号", "approved", null)).toBe("可決");
    expect(formatBillResult("第1号", "rejected", null)).toBe("否決");
  });
});
