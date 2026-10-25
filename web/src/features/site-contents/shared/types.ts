/**
 * データ投入状況に応じて表示を切り替えるコンテンツの有無。
 * データが1件も無いコーナーはトップページ・メニューに出さない。
 */
export type AvailableContents = {
  committees: boolean;
  budget: boolean;
  pressConferences: boolean;
  jimuJigyo: boolean;
};

export type NavLink = {
  href: string;
  label: string;
};
