/**
 * サイト設定ファイル
 * Fork して別の地方議会向けに使用する場合はこのファイルを変更してください。
 * @see docs/kawasaki/20260304_1000_別地域向けfork手順.md
 */
export const siteConfig = {
  siteName: "みらい議会＠君津市",
  siteDescription:
    "君津市議会で今どんな議案が検討されているか、わかりやすく伝えるプラットフォームです",
  cityName: "君津市",
  councilName: "君津市議会",
  keywords: [
    "みらい議会ー君津市版",
    "議案",
    "君津市",
    "市議会",
    "地方政治",
    "政策",
    "解説",
  ],
  councilBaseUrl: "https://www.city.kimitsu.lg.jp/site/gikai/",
  /** 議案・議決結果の一覧ページ */
  councilBillsDetailUrl:
    "https://www.city.kimitsu.lg.jp/site/gikai/list46-56.html",
  /** 議会の会議録検索システム */
  councilMinutesSearchUrl:
    "https://ssp.kaigiroku.net/tenant/kimitsu/pg/index.html",
  /** 市長の呼び方（記者会見ページなどで使用） */
  mayorLabel: "石井市長",
  twitterHashtag: "みらい議会君津市版", // # なし
  externalLinks: {
    /**
     * 「税金の使い道マップ」（外部サイト）の自治体ページ。
     * 空文字列の場合はトップページ・メニューのリンクを表示しない。
     */
    taxMap:
      "https://tax.inshatancountry.com/local-tax/?pref=12&entity=122254" as string,
    report: "https://www.instagram.com/michitakaotake",
    aboutNote: "",
    donation: "https://team-mir.ai/support/donation",
    teamAbout: "https://team-mir.ai/about",
    terms: "https://team-mir.ai/terms",
    privacy: "https://team-mir.ai/privacy",
    faq: "https://team-mirai.notion.site/FAQ-28cf6f56bae180bd84e7f7ae80f806a1",
  },
  /**
   * ページを管理する政党名（空文字列の場合は政党名を省略した汎用表現を使用）
   * 例: "チームみらい"
   */
  managingParty: "" as string,
  /**
   * サービス運営者情報
   * 利用規約や問い合わせ先に使用します。
   */
  operator: {
    name: "大竹みちたか" as string,
    contactUrl: "https://www.instagram.com/michitakaotake" as string,
    /** 利用規約の準拠法・管轄裁判所（第一審の専属的合意管轄） */
    jurisdiction: "千葉地方裁判所" as string,
  },
  /**
   * AI機能の有効/無効設定
   * 本番環境のコスト管理のため、機能ごとにオン/オフを切り替えられます。
   */
  features: {
    /** AIチャット機能（議案への質問・テキスト選択からの質問）*/
    aiChat: false,
    /** AIインタビュー機能（議案当事者へのヒアリング）*/
    aiInterview: false,
    /**
     * チームみらいセクションの表示（トップページ・フッター・デスクトップメニュー）
     * 非公式運営など、党の公式サービスとして出さない場合は false にする。
     */
    showTeamMiraiSection: false as boolean,
    /**
     * 選挙特設ページ（/election）とトップページのバナーの表示。
     * 現在の中身は福岡市長選挙のデータのため、君津市版では false にしている。
     */
    election: false as boolean,
  },
} as const;
