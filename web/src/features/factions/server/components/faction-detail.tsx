import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StanceMark } from "../../client/components/stance-mark";
import type { Faction, FactionRecordSummary } from "../../shared/types";
import { formatBillResult } from "../../shared/utils/format-labels";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-mirai-surface-grouped px-2 py-3">
      <span className="text-2xl font-bold text-mirai-text">{value}</span>
      <span className="text-center text-xs text-mirai-text-secondary">
        {label}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-mirai-border pb-2 text-lg font-bold text-mirai-text">
      {children}
    </h2>
  );
}

interface FactionDetailProps {
  faction: Faction;
  summary: FactionRecordSummary;
}

export function FactionDetail({ faction, summary }: FactionDetailProps) {
  const { counts } = summary;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link
          href="/factions"
          className="mb-4 inline-flex items-center gap-1 text-sm text-mirai-text-secondary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          会派ごとの賛否
        </Link>
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
          <div className="overflow-x-auto rounded-xl border border-mirai-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-mirai-surface-grouped">
                <tr>
                  <th className="p-2 text-left font-bold">テーマ</th>
                  <th className="p-2 text-right font-bold">議案</th>
                  <th className="p-2 text-right font-bold">賛成</th>
                  <th className="p-2 text-right font-bold">反対</th>
                  <th className="p-2 text-right font-bold">分かれた</th>
                </tr>
              </thead>
              <tbody>
                {summary.byTag.map((row) => (
                  <tr key={row.tag} className="border-t border-mirai-border">
                    <td className="p-2">{row.tag}</td>
                    <td className="p-2 text-right">{row.total}</td>
                    <td className="p-2 text-right">{row.for}</td>
                    <td className="p-2 text-right">{row.against}</td>
                    <td className="p-2 text-right">{row.split}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-mirai-text-secondary">
            1つの議案に複数のテーマがつくことがあります。テーマのない議案は含みません。
          </p>
        </section>
      )}

      <section>
        <SectionHeading>全会一致でなかった議案での賛否</SectionHeading>
        {summary.contested.length === 0 ? (
          <p className="text-sm text-mirai-text-secondary">
            全会一致でなかった議案はありません。
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-mirai-border">
            {summary.contested.map((vote) => (
              <li key={vote.billId} className="flex items-start gap-3 py-3">
                <StanceMark stance={vote.stance} />
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`/bills/${vote.billId}`}
                    className="font-medium text-mirai-text hover:underline"
                  >
                    {vote.title}
                  </Link>
                  <span className="text-xs text-mirai-text-secondary">
                    {vote.sessionName} {vote.billNumber}・議会の結果：
                    {formatBillResult(
                      vote.billNumber,
                      vote.status,
                      vote.statusNote
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
