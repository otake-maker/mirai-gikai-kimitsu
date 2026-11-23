import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { MemberDetail } from "@/features/factions/server/components/member-detail";
import { getFactionVotes } from "@/features/factions/server/loaders/get-faction-votes";
import {
  extractMemberVotes,
  summarizeMemberVotes,
} from "@/features/factions/shared/utils/summarize-member-votes";

interface MemberRouteProps {
  params: Promise<{
    member_id: string;
  }>;
}

export async function generateMetadata({
  params,
}: MemberRouteProps): Promise<Metadata> {
  const { member_id } = await params;
  const { members } = await getFactionVotes("normal");
  const member = members.find((m) => m.id === member_id);

  if (!member) {
    return { title: "議員が見つかりません" };
  }

  return {
    title: `${member.name} 議員の賛否`,
    description: `${member.name} 議員の、これまでの議案への賛成・反対をまとめています。`,
  };
}

export default async function MemberRoute({ params }: MemberRouteProps) {
  const { member_id } = await params;
  const difficultyLevel = await getDifficultyLevel();
  const data = await getFactionVotes(difficultyLevel);
  const member = data.members.find((m) => m.id === member_id);

  if (!member) {
    notFound();
  }

  const summary = summarizeMemberVotes(
    extractMemberVotes(data.bills, member.id)
  );

  return (
    <Container className="py-10">
      <MemberDetail
        member={member}
        summary={summary}
        factions={data.factions}
      />
    </Container>
  );
}
