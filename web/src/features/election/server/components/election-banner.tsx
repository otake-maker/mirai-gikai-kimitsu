import "server-only";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { siteConfig } from "@/config/site.config";
import { CANDIDATES } from "../../shared/data/candidates";
import { ISSUES } from "../../shared/data/issues";
import { ELECTION_SCHEDULE } from "../../shared/data/schedule";
import { getCountdown } from "../../shared/utils/countdown";
import {
  getCandidateNoun,
  getElectionPhase,
} from "../../shared/utils/election-phase";

/**
 * TOPページに置く特設ページへの導線。
 * 投開票日を過ぎたら非表示にする（結果ページを用意するまでの暫定運用）。
 */
export function ElectionBanner() {
  if (!siteConfig.features.election) {
    return null;
  }

  const now = new Date();
  const phase = getElectionPhase(now, ELECTION_SCHEDULE);
  if (phase === "after-vote") {
    return null;
  }

  const noun = getCandidateNoun(phase);
  const { days } = getCountdown(now, ELECTION_SCHEDULE.voteClosesAt);

  return (
    <Container className="pt-4">
      <Link
        href="/election/2026"
        className="relative block overflow-hidden rounded-[14px] border border-primary-darkest/20 bg-mirai-gradient p-[22px] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-election-banner-hover"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 top-3 select-none font-lexend text-[76px] font-black leading-none tracking-[-0.055em] text-white/45"
        >
          2026
        </span>

        <span className="relative block">
          <span className="inline-block rounded-[5px] bg-primary-accent px-2.5 py-1 text-[10.5px] font-bold tracking-[0.1em] text-white">
            特設ページ
          </span>
          <span className="mt-3 block text-[21px] font-bold leading-[1.4] tracking-[-0.02em] text-mirai-text">
            福岡市長選挙
            <br />
            {noun}と争点
          </span>
          <span className="mt-2.5 block max-w-[400px] text-xs leading-[1.85] text-mirai-text-secondary">
            {phase === "before-kokuji" ? "出馬の意向を示した" : "立候補した"}
            {CANDIDATES.length}
            人の公表内容を、{ISSUES.length}
            つの分野で同じ物差しに並べています。評価や推薦は行いません。
          </span>

          <span className="mt-4 flex flex-wrap items-center gap-4">
            <span className="inline-flex h-[42px] items-center gap-1.5 rounded-full border border-mirai-text bg-card px-5 text-[12.5px] font-bold text-mirai-text">
              特設ページを見る
              <ArrowRight className="size-4" />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold text-primary-deep">
                投票日まで
              </span>
              <span className="font-lexend text-2xl font-black tracking-[-0.04em] text-mirai-text">
                {days}
              </span>
              <span className="text-[11px] font-bold text-mirai-text-secondary">
                日
              </span>
            </span>
          </span>
        </span>
      </Link>
    </Container>
  );
}
