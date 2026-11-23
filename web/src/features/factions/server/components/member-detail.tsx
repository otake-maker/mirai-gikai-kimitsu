import Link from "next/link";
import { MemberVoteMark } from "../../client/components/stance-mark";
import type { CouncilMember, Faction } from "../../shared/types";
import type { MemberRecordSummary } from "../../shared/utils/summarize-member-votes";
import {
  BackLink,
  BillVoteList,
  SectionHeading,
  StatTile,
  TagTable,
} from "./record-parts";

interface MemberDetailProps {
  member: CouncilMember;
  summary: MemberRecordSummary;
  factions: Faction[];
}

export function MemberDetail({ member, summary, factions }: MemberDetailProps) {
  const { counts } = summary;
  const factionById = new Map(factions.map((f) => [f.id, f]));
  const current = summary.factionHistory.at(-1);
  const currentFaction = current && factionById.get(current.factionId);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <BackLink href="/members" label="議員ごとの賛否" />
        <h1 className="text-2xl font-bold text-mirai-text">{member.name}</h1>
        {currentFaction && (
          <p className="mt-2 text-sm text-mirai-text-secondary">
            {currentFaction.is_active ? "所属会派：" : "最後の所属会派："}
            <Link
              href={`/factions/${currentFaction.name}`}
              className="text-mirai-text hover:underline"
            >
              {currentFaction.display_name}
            </Link>
          </p>
        )}
      </div>

      {summary.factionHistory.length > 1 && (
        <section>
          <SectionHeading>所属会派の移り変わり</SectionHeading>
          <ol className="flex flex-col gap-2">
            {summary.factionHistory.map((period) => {
              const faction = factionById.get(period.factionId);
              return (
                <li
                  key={`${period.factionId}-${period.firstSessionName}`}
                  className="text-sm"
                >
                  <span className="text-mirai-text-secondary">
                    {period.firstSessionName === period.lastSessionName
                      ? period.firstSessionName
                      : `${period.firstSessionName}〜${period.lastSessionName}`}
                    ：
                  </span>
                  {faction ? (
                    <Link
                      href={`/factions/${faction.name}`}
                      className="font-medium text-mirai-text hover:underline"
                    >
                      {faction.display_name}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section>
        <SectionHeading>賛否の記録</SectionHeading>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="議案" value={counts.total} />
          <StatTile label="賛成" value={counts.for} />
          <StatTile label="反対" value={counts.against} />
          <StatTile
            label="採決に加わらず"
            value={counts.absent + counts.notVoting}
          />
        </div>
        {counts.notVoting > 0 && (
          <p className="mt-2 text-xs text-mirai-text-secondary">
            議長は原則として採決に加わらないため、議長を務めた期間の議案は「採決に加わらず」に含まれます。
          </p>
        )}
      </section>

      {summary.byTag.length > 0 && (
        <section>
          <SectionHeading>テーマ別の賛否</SectionHeading>
          <TagTable
            rows={summary.byTag}
            columns={[
              ["賛成", "for"],
              ["反対", "against"],
            ]}
          />
        </section>
      )}

      <section>
        <SectionHeading>会派の多数と違う投票をした議案</SectionHeading>
        <BillVoteList
          bills={summary.differing}
          mark={(vote) => <MemberVoteMark vote={vote.vote} />}
          emptyMessage="会派の多数と違う投票をした議案はありません。"
        />
      </section>

      <section>
        <SectionHeading>全会一致でなかった議案での賛否</SectionHeading>
        <BillVoteList
          bills={summary.contested}
          mark={(vote) => <MemberVoteMark vote={vote.vote} />}
          emptyMessage="全会一致でなかった議案で採決に加わった記録はありません。"
        />
      </section>
    </div>
  );
}
