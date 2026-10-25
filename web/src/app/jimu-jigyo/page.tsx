import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { JimuJigyoArchivePage } from "@/features/jimu-jigyo/server/components/jimu-jigyo-archive-page";

export const metadata: Metadata = {
  title: "事務事業評価",
  description: `${siteConfig.cityName}の事務事業マネジメントシートをもとに、市民の視点で客観的に評価・可視化したアーカイブです。`,
};

export default function Page() {
  return <JimuJigyoArchivePage />;
}
