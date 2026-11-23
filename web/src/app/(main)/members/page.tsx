import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { MembersIndex } from "@/features/factions/server/components/members-index";
import { getFactionVotes } from "@/features/factions/server/loaders/get-faction-votes";

export const metadata: Metadata = {
  title: "議員ごとの賛否",
  description: "議員ごとに、これまでの議案への賛成・反対をまとめています。",
};

export default async function MembersPage() {
  const difficultyLevel = await getDifficultyLevel();
  const data = await getFactionVotes(difficultyLevel);

  return (
    <Container className="py-10">
      <MembersIndex data={data} />
    </Container>
  );
}
