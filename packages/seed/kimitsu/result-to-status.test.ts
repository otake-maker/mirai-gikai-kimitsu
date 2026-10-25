import { describe, expect, it } from "vitest";
import { resultToStatus } from "./result-to-status";

describe("resultToStatus", () => {
  it("原案可決・修正可決は approved", () => {
    expect(resultToStatus("原案可決")).toEqual({
      status: "approved",
      statusNote: null,
    });
    expect(resultToStatus("修正可決").status).toBe("approved");
  });

  it("不採択は採択より先に判定して rejected にする", () => {
    expect(resultToStatus("不採択")).toEqual({
      status: "rejected",
      statusNote: null,
    });
  });

  it("否決は rejected", () => {
    expect(resultToStatus("否決").status).toBe("rejected");
  });

  it("認定・承認・採択は approved と補足を返す", () => {
    expect(resultToStatus("認　　定")).toEqual({
      status: "approved",
      statusNote: "認定",
    });
    expect(resultToStatus("承認").statusNote).toBe("承認");
    expect(resultToStatus("採択").statusNote).toBe("採択");
  });

  it("趣旨採択は approved と補足を返す", () => {
    expect(resultToStatus("趣旨採択")).toEqual({
      status: "approved",
      statusNote: "趣旨採択",
    });
  });

  it("継続審査は in_committee", () => {
    expect(resultToStatus("継続審査")).toEqual({
      status: "in_committee",
      statusNote: "継続審査",
    });
  });

  it("想定外の結果はエラーにする", () => {
    expect(() => resultToStatus("同意")).toThrow("未対応の議決結果");
  });
});
