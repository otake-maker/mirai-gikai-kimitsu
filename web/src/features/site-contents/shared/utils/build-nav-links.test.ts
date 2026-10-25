import { describe, expect, it } from "vitest";
import type { AvailableContents } from "../types";
import { buildNavLinks } from "./build-nav-links";

const NONE: AvailableContents = {
  committees: false,
  budget: false,
  pressConferences: false,
  jimuJigyo: false,
};

describe("buildNavLinks", () => {
  it("データが無ければトップページと過去の定例会だけを返す", () => {
    expect(buildNavLinks(NONE).map((l) => l.href)).toEqual(["/", "/sessions"]);
  });

  it("データがあるコーナーだけを元の順番で追加する", () => {
    const links = buildNavLinks({
      ...NONE,
      committees: true,
      pressConferences: true,
    });
    expect(links.map((l) => l.href)).toEqual([
      "/",
      "/sessions",
      "/committees",
      "/press-conferences",
    ]);
  });

  it("すべてのデータがあれば全リンクを返す", () => {
    const links = buildNavLinks({
      committees: true,
      budget: true,
      pressConferences: true,
      jimuJigyo: true,
    });
    expect(links).toEqual([
      { href: "/", label: "トップページ" },
      { href: "/sessions", label: "過去の定例会" },
      { href: "/committees", label: "委員会" },
      { href: "/budget", label: "過去の予算" },
      { href: "/press-conferences", label: "市長記者会見" },
    ]);
  });
});
