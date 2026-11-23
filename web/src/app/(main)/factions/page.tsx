import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { FactionsIndex } from "@/features/factions/server/components/factions-index";
import { getFactionVotes } from "@/features/factions/server/loaders/get-faction-votes";

export const metadata: Metadata = {
  title: "会派ごとの賛否",
  description: "会派ごとに、これまでの議案への賛成・反対をまとめています。",
};

export default async function FactionsPage() {
  const difficultyLevel = await getDifficultyLevel();
  const data = await getFactionVotes(difficultyLevel);

  return (
    <Container className="py-10">
      <FactionsIndex data={data} />
    </Container>
  );
}
