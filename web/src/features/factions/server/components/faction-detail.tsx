import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StanceMark } from "../../client/components/stance-mark";
import type { Faction, FactionRecordSummary } from "../../shared/types";
import type { MemberListItem } from "../../shared/utils/summarize-member-votes";
import {
  BackLink,
  BillVoteList,
  SectionHeading,
  StatTile,
  TagTable,
} from "./record-parts";

interface FactionDetailProps {
  faction: Faction;
  summary: FactionRecordSummary;
  /** この会派に所属したことのある議員 */
  members: MemberListItem[];
}

export function FactionDetail({
  faction,
  summary,
  members,
}: FactionDetailProps) {
  const { counts } = summary;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <BackLink href="/factions" label="会派ごとの賛否" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-mirai-text">
            {faction.display_name}
          </h1>
          {!faction.is_active && <Badge variant="muted">過去の会派</Badge>}
        </div>
        {counts.total > 0 && (
          <p className="mt-2 text-sm text-mirai-text-secondary">
            {summary.firstSessionName}〜{summary.lastSessionName}
            の議案への賛否
          </p>
        )}
      </div>

      {members.length > 0 && (
        <section>
          <SectionHeading>所属した議員</SectionHeading>
          <ul className="flex flex-wrap gap-2">
            {members.map(({ member, factionId, isCurrent }) => (
              <li key={member.id}>
                <Link
                  href={`/members/${member.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-mirai-border px-3 py-1 text-sm text-mirai-text hover:bg-mirai-surface-grouped"
                >
                  {member.name}
                  {faction.is_active &&
                    !(isCurrent && factionId === faction.id) && (
                      <span className="text-xs text-mirai-text-secondary">
                        （以前）
                      </span>
                    )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeading>賛否の記録</SectionHeading>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="議案" value={counts.total} />
          <StatTile label="賛成" value={counts.for} />
          <StatTile label="反対" value={counts.against} />
          <StatTile label="会派内で分かれた" value={counts.split} />
        </div>
      </section>

      {summary.byTag.length > 0 && (
        <section>
          <SectionHeading>テーマ別の賛否</SectionHeading>
          <TagTable
            rows={summary.byTag}
            columns={[
              ["賛成", "for"],
              ["反対", "against"],
              ["分かれた", "split"],
            ]}
          />
        </section>
      )}

      <section>
        <SectionHeading>全会一致でなかった議案での賛否</SectionHeading>
        <BillVoteList
          bills={summary.contested}
          mark={(vote) => <StanceMark stance={vote.stance} />}
          emptyMessage="全会一致でなかった議案はありません。"
        />
      </section>
    </div>
  );
}
