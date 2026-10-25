import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { BannerAccordion } from "@/components/top/banner-accordion";
import { BudgetOverviewBanner } from "@/components/top/budget-overview-banner";
import { CityFinanceBanner } from "@/components/top/city-finance-banner";
import { CommitteeBanner } from "@/components/top/committee-banner";
import { GeneralQuestionsBanner } from "@/components/top/general-questions-banner";
import { JimuJigyoArchiveSection } from "@/components/top/jimu-jigyo-archive-section";
import { JimuJigyoBanner } from "@/components/top/jimu-jigyo-banner";
import { Hero } from "@/components/top/hero";
import { PastSessionsSection } from "@/components/top/past-sessions-section";
import { TeamMirai } from "@/components/top/team-mirai";
import { siteConfig } from "@/config/site.config";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import type { BillWithContent } from "@/features/bills/shared/types";
import { getSessionsWithBudget } from "@/features/budget-overview/server/loaders/get-sessions-with-budget";
import { getLatestBudgetSession } from "@/features/budget-overview/server/loaders/get-latest-budget-session";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";
import { CurrentCouncilSession } from "@/features/council-sessions/client/components/current-council-session";
import { getAllPastSessions } from "@/features/council-sessions/server/loaders/get-all-past-sessions";
import { getCurrentCouncilSession } from "@/features/council-sessions/server/loaders/get-current-council-session";
import { ElectionBanner } from "@/features/election/server/components/election-banner";
import { getLatestSessionWithQuestions } from "@/features/general-questions/server/loaders/get-latest-session-with-questions";
import { PressConferenceArchiveSection } from "@/features/press-conferences/client/components/press-conference-archive-section";
import { PressConferenceNoticeBanner } from "@/features/press-conferences/client/components/press-conference-notice-banner";
import { getLatestPressConference } from "@/features/press-conferences/server/loaders/get-latest-press-conference";
import { getPressConferences } from "@/features/press-conferences/server/loaders/get-press-conferences";
import { getAvailableContents } from "@/features/site-contents/server/loaders/get-available-contents";
import { getJapanTime } from "@/lib/utils/date";

export default async function Home() {
  const { billsByTag, featuredBills } = await loadHomeData();

  // ゆくゆくタグ機能がマージされたらBFFに統合する
  const [
    currentSession,
    currentDifficulty,
    pastSessions,
    budgetSessions,
    latestQuestionsSlug,
    latestPressConference,
    pressConferences,
    latestBudgetSession,
    availableContents,
  ] = await Promise.all([
    getCurrentCouncilSession(getJapanTime()),
    getDifficultyLevel(),
    getAllPastSessions(),
    getSessionsWithBudget(),
    getLatestSessionWithQuestions(),
    getLatestPressConference(),
    getPressConferences(),
    getLatestBudgetSession(),
    getAvailableContents(),
  ]);

  const hasTaxMap = Boolean(siteConfig.externalLinks.taxMap);
  const showMoneyBanners =
    Boolean(latestBudgetSession?.slug) ||
    availableContents.jimuJigyo ||
    hasTaxMap;

  const toBillChatContext = (bill: BillWithContent) => {
    return {
      name: `${bill.bill_content?.title}（${bill.name}）`,
      summary: bill.bill_content?.summary,
      tags: bill.tags?.map((tag) => tag.label) || [],
      isFeatured: featuredBills.some((b) => b.id === bill.id),
    };
  };

  return (
    <>
      <Hero />

      {/* 選挙特設ページバナー（無効設定時・投開票日を過ぎたら非表示） */}
      <ElectionBanner />

      {/* 本日の定例会セクション */}
      <CurrentCouncilSession session={currentSession} />

      {/* 市長記者会見バナー */}
      {latestPressConference && (
        <Container className="pt-4">
          <PressConferenceNoticeBanner
            pressConference={latestPressConference}
          />
        </Container>
      )}

      {/* 一般質問バナー */}
      {latestQuestionsSlug && (
        <Container className="pt-6">
          <GeneralQuestionsBanner sessionSlug={latestQuestionsSlug} />
        </Container>
      )}

      {/* 委員会バナー */}
      {availableContents.committees && (
        <Container className="pt-3">
          <CommitteeBanner />
        </Container>
      )}

      {/* 予算・事務事業評価・お金の使い道（まとめてアコーディオン） */}
      {showMoneyBanners && (
        <Container className="pt-3">
          <BannerAccordion
            title={`${siteConfig.cityName}の予算・評価・お金の使い道`}
            description="各局の重点施策、事務事業評価、財政の状況をまとめて見る"
          >
            {latestBudgetSession?.slug && (
              <BudgetOverviewBanner sessionSlug={latestBudgetSession.slug} />
            )}
            {availableContents.jimuJigyo && <JimuJigyoBanner />}
            {hasTaxMap && <CityFinanceBanner />}
          </BannerAccordion>
        </Container>
      )}

      {/* 議案一覧セクション */}
      <Container className="">
        <div className="py-10">
          <main className="flex flex-col gap-16">
            {/* 注目の議案セクション */}
            <FeaturedBillSection bills={featuredBills} />

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection billsByTag={billsByTag} />
          </main>
        </div>
      </Container>

      {/* Archive セクション（過去の定例会・過去の予算・市長記者会見） */}
      <div className="bg-mirai-surface-muted py-10">
        <Container>
          <div className="flex flex-col gap-8">
            <PastSessionsSection
              sessions={pastSessions}
              budgetSessions={budgetSessions}
            />
            <PressConferenceArchiveSection
              pressConferences={pressConferences}
            />
            {availableContents.jimuJigyo && <JimuJigyoArchiveSection />}
          </div>
        </Container>
      </div>

      <Container>
        {/* みらい議会とは セクション */}
        <About />

        {/* チームみらいについて セクション */}
        <TeamMirai />

        {/* 免責事項 */}
        <BillDisclaimer />
      </Container>

      {/* チャット機能 */}
      {siteConfig.features.aiChat && (
        <HomeChatClient
          currentDifficulty={currentDifficulty}
          bills={billsByTag
            .flatMap((x) => x.bills)
            .concat(featuredBills)
            .map(toBillChatContext)}
        />
      )}
    </>
  );
}
