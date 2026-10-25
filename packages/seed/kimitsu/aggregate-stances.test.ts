import { describe, expect, it } from "vitest";
import {
  aggregateFactionStances,
  type FactionMembers,
} from "./aggregate-stances";

const FACTIONS: FactionMembers[] = [
  { name: "a", members: ["議長", "A1", "A2"] },
  { name: "b", members: ["B1", "B2", "B3"] },
  { name: "c", members: ["C1"] },
];

describe("aggregateFactionStances", () => {
  it("全員賛成なら全会派が for になる", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: [] },
      ["議長"]
    );
    expect(result).toEqual([
      { factionName: "a", type: "for", comment: null },
      { factionName: "b", type: "for", comment: null },
      { factionName: "c", type: "for", comment: null },
    ]);
  });

  it("会派全員が例外なら、その会派は逆の賛否になる", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: ["C1"] },
      ["議長"]
    );
    expect(result[2]).toEqual({
      factionName: "c",
      type: "against",
      comment: null,
    });
  });

  it("会派内で割れたら split とし、賛成・反対の議員名を残す", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: ["B1", "B3"] },
      ["議長"]
    );
    expect(result[1]).toEqual({
      factionName: "b",
      type: "split",
      comment: "賛成：B2／反対：B1、B3",
    });
  });

  it("既定が反対のときも例外の議員を賛成として数える", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "against", exceptions: ["C1"] },
      ["議長"]
    );
    expect(result.map((r) => r.type)).toEqual(["against", "against", "for"]);
  });

  it("採決に加わらない議員は集計から外す", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: ["A1", "A2"] },
      ["議長"]
    );
    expect(result[0]).toEqual({
      factionName: "a",
      type: "against",
      comment: null,
    });
  });

  it("採決に加わる議員がいない会派は返さない", () => {
    const result = aggregateFactionStances(
      [{ name: "only-chair", members: ["議長"] }],
      { default: "for", exceptions: [] },
      ["議長"]
    );
    expect(result).toEqual([]);
  });

  it("その議案の採決に加わらなかった議員は除外し、comment に残す", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: ["B1"], absent: ["B2"] },
      ["議長"]
    );
    expect(result[1]).toEqual({
      factionName: "b",
      type: "split",
      comment: "賛成：B3／反対：B1／採決に加わらず：B2",
    });
  });

  it("採決に加わらなかった議員がいても残りが全員同じなら split にしない", () => {
    const result = aggregateFactionStances(
      FACTIONS,
      { default: "for", exceptions: [], absent: ["A1"] },
      ["議長"]
    );
    expect(result[0]).toEqual({
      factionName: "a",
      type: "for",
      comment: "採決に加わらず：A1",
    });
  });

  it("採決に加わらなかった議員を例外にも指定するとエラーにする", () => {
    expect(() =>
      aggregateFactionStances(FACTIONS, {
        default: "for",
        exceptions: ["B1"],
        absent: ["B1"],
      })
    ).toThrow("採決に加わらなかった議員が例外に");
  });

  it("名簿にいない議員を例外に指定するとエラーにする", () => {
    expect(() =>
      aggregateFactionStances(FACTIONS, { default: "for", exceptions: ["X"] })
    ).toThrow("会派名簿にいない議員");
  });

  it("採決に加わらない議員を例外に指定するとエラーにする", () => {
    expect(() =>
      aggregateFactionStances(
        FACTIONS,
        { default: "for", exceptions: ["議長"] },
        ["議長"]
      )
    ).toThrow("採決に加わらない議員");
  });
});
