import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StanceMark } from "../../client/components/stance-mark";
import type { Faction, FactionRecordSummary } from "../../shared/types";
import {
  formatBillResult,
  shortFactionName,
} from "../../shared/utils/format-labels";
import {
  buildContestedRows,
  extractFactionVotes,
  summarizeFactionVotes,
} from "../../shared/utils/summarize-faction-votes";
import type { FactionVotesData } from "../loaders/get-faction-votes";

type FactionWithSummary = {
  faction: Faction;
  summary: FactionRecordSummary;
};

function FactionCard({ faction, summary }: FactionWithSummary) {
  const { counts } = summary;

  return (
    <li>
      <Link
        href={`/factions/${faction.name}`}
        className="flex h-full items-center justify-between gap-3 rounded-xl border border-mirai-border bg-white p-4 transition-colors hover:bg-mirai-surface-grouped group"
      >
        <div className="flex flex-col gap-1">
          <span className="font-bold text-base text-mirai-text">
            {faction.display_name}
          </span>
          <span className="text-xs text-mirai-text-secondary">
            {summary.firstSessionName === summary.lastSessionName
              ? summary.firstSessionName
              : `${summary.firstSessionName}〜${summary.lastSessionName}`}
          </span>
          <span className="text-sm text-mirai-text">
            議案{counts.total}件のうち 賛成{counts.for}・反対{counts.against}
            {counts.split > 0 && `・会派内で分かれた${counts.split}`}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-mirai-text-muted transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function ContestedTable({ data }: { data: FactionVotesData }) {
  const rows = buildContestedRows(data.bills);
  const columns = data.factions.filter((faction) =>
    rows.some((row) => faction.id in row.stanceByFaction)
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-mirai-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="bg-mirai-surface-grouped">
          <tr>
            <th className="sticky left-0 z-10 bg-mirai-surface-grouped p-2 text-left font-bold">
              議案
            </th>
            {columns.map((faction) => (
              <th
                key={faction.id}
                className="p-2 text-center text-xs font-bold leading-tight"
              >
                <Link href={`/factions/${faction.name}`}>
                  {shortFactionName(faction.display_name)}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.billId} className="border-t border-mirai-border">
              <td className="sticky left-0 z-10 w-56 min-w-56 bg-white p-2 align-top">
                <Link
                  href={`/bills/${row.billId}`}
                  className="font-medium text-mirai-text hover:underline"
                >
                  {row.title}
                </Link>
                <div className="mt-0.5 text-xs text-mirai-text-secondary">
                  {row.sessionName} {row.billNumber}・
                  {formatBillResult(row.billNumber, row.status, row.statusNote)}
                </div>
              </td>
              {columns.map((faction) => {
                const stance = row.stanceByFaction[faction.id];
                return (
                  <td key={faction.id} className="p-2 text-center">
                    {stance ? (
                      <StanceMark stance={stance} compact />
                    ) : (
                      <span className="text-mirai-text-muted">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FactionsIndex({ data }: { data: FactionVotesData }) {
  // 賛否の記録がない会派は出さない
  const withSummaries: FactionWithSummary[] = data.factions
    .map((faction) => ({
      faction,
      summary: summarizeFactionVotes(
        extractFactionVotes(data.bills, faction.id)
      ),
    }))
    .filter(({ summary }) => summary.counts.total > 0);
  const current = withSummaries.filter(({ faction }) => faction.is_active);
  const past = withSummaries.filter(({ faction }) => !faction.is_active);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-mirai-text">会派ごとの賛否</h1>
        <p className="mt-2 text-sm leading-relaxed text-mirai-text-secondary">
          会派（考え方の近い議員のグループ）が、これまでの議案にどう賛成・反対したかをまとめています。会派の賛否は、所属する議員の本会議での投票をもとにしています。所属議員の投票が分かれたときは「会派内で分かれた」としています。
        </p>
      </div>

      <section>
        <h2 className="mb-3 border-b border-mirai-border pb-2 text-lg font-bold text-mirai-text">
          現在の会派
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {current.map((item) => (
            <FactionCard key={item.faction.id} {...item} />
          ))}
        </ul>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-mirai-border pb-2 text-lg font-bold text-mirai-text">
            過去の会派
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {past.map((item) => (
              <FactionCard key={item.faction.id} {...item} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-1 border-b border-mirai-border pb-2 text-lg font-bold text-mirai-text">
          賛否が分かれた議案
        </h2>
        <p className="mb-3 text-sm text-mirai-text-secondary">
          全会一致ではなかった議案について、会派ごとの賛否を並べています（新しい順）。「—」はその時期に存在しなかった会派です。
        </p>
        <ContestedTable data={data} />
      </section>
    </div>
  );
}
