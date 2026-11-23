import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { FactionDetail } from "@/features/factions/server/components/faction-detail";
import { getFactionVotes } from "@/features/factions/server/loaders/get-faction-votes";
import {
  extractFactionVotes,
  summarizeFactionVotes,
} from "@/features/factions/shared/utils/summarize-faction-votes";
import { listFactionMembers } from "@/features/factions/shared/utils/summarize-member-votes";

interface FactionRouteProps {
  params: Promise<{
    faction_name: string;
  }>;
}

export async function generateMetadata({
  params,
}: FactionRouteProps): Promise<Metadata> {
  const { faction_name } = await params;
  const { factions } = await getFactionVotes("normal");
  const faction = factions.find((f) => f.name === faction_name);

  if (!faction) {
    return { title: "会派が見つかりません" };
  }

  return {
    title: `${faction.display_name}の賛否`,
    description: `${faction.display_name}の、これまでの議案への賛成・反対をまとめています。`,
  };
}

export default async function FactionRoute({ params }: FactionRouteProps) {
  const { faction_name } = await params;
  const difficultyLevel = await getDifficultyLevel();
  const data = await getFactionVotes(difficultyLevel);
  const faction = data.factions.find((f) => f.name === faction_name);

  if (!faction) {
    notFound();
  }

  const summary = summarizeFactionVotes(
    extractFactionVotes(data.bills, faction.id)
  );

  return (
    <Container className="py-10">
      <FactionDetail
        faction={faction}
        summary={summary}
        members={listFactionMembers(data.bills, data.members, faction.id)}
      />
    </Container>
  );
}
