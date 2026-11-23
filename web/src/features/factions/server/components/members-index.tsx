import Link from "next/link";
import {
  listMembers,
  type MemberListItem,
} from "../../shared/utils/summarize-member-votes";
import type { FactionVotesData } from "../loaders/get-faction-votes";
import { SectionHeading } from "./record-parts";

function MemberLinks({ items }: { items: MemberListItem[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ member }) => (
        <li key={member.id}>
          <Link
            href={`/members/${member.id}`}
            className="inline-flex rounded-full border border-mirai-border px-3 py-1 text-sm text-mirai-text hover:bg-mirai-surface-grouped"
          >
            {member.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MembersIndex({ data }: { data: FactionVotesData }) {
  const items = listMembers(data.bills, data.members);
  const current = items.filter((item) => item.isCurrent);
  const former = items.filter((item) => !item.isCurrent);
  const byFaction = data.factions
    .map((faction) => ({
      faction,
      members: current.filter((item) => item.factionId === faction.id),
    }))
    .filter(({ members }) => members.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-mirai-text">議員ごとの賛否</h1>
        <p className="mt-2 text-sm leading-relaxed text-mirai-text-secondary">
          議員一人ひとりが、本会議の採決でどの議案に賛成・反対したかをまとめています。議員の名前を選ぶと、その議員の賛否の記録が見られます。会派ごとの賛否は
          <Link href="/factions" className="text-mirai-text underline">
            会派ごとの賛否
          </Link>
          をご覧ください。
        </p>
      </div>

      <section>
        <SectionHeading>現在の議員（会派別）</SectionHeading>
        <div className="flex flex-col gap-5">
          {byFaction.map(({ faction, members }) => (
            <div key={faction.id}>
              <h3 className="mb-2 text-sm font-bold text-mirai-text">
                <Link
                  href={`/factions/${faction.name}`}
                  className="hover:underline"
                >
                  {faction.display_name}
                </Link>
                <span className="ml-1 font-normal text-mirai-text-secondary">
                  {members.length}人
                </span>
              </h3>
              <MemberLinks items={members} />
            </div>
          ))}
        </div>
      </section>

      {former.length > 0 && (
        <section>
          <SectionHeading>以前の議員</SectionHeading>
          <MemberLinks items={former} />
        </section>
      )}
    </div>
  );
}
