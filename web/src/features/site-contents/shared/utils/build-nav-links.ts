import type { AvailableContents, NavLink } from "../types";

/**
 * メニューに並べるリンクを、データのあるコーナーだけに絞って返す。
 */
export function buildNavLinks(available: AvailableContents): NavLink[] {
  const links: (NavLink & { visible: boolean })[] = [
    { href: "/", label: "トップページ", visible: true },
    { href: "/sessions", label: "過去の定例会", visible: true },
    { href: "/committees", label: "委員会", visible: available.committees },
    { href: "/budget", label: "過去の予算", visible: available.budget },
    {
      href: "/press-conferences",
      label: "市長記者会見",
      visible: available.pressConferences,
    },
  ];

  return links
    .filter((link) => link.visible)
    .map(({ href, label }) => ({ href, label }));
}
