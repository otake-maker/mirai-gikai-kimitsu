import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BillVotes } from "../../shared/types";
import { formatBillResult } from "../../shared/utils/format-labels";

/** 会派ページ・議員ページで共通の部品 */

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-mirai-text-secondary hover:underline"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-mirai-border pb-2 text-lg font-bold text-mirai-text">
      {children}
    </h2>
  );
}

export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-mirai-surface-grouped px-2 py-3">
      <span className="text-2xl font-bold text-mirai-text">{value}</span>
      <span className="text-center text-xs text-mirai-text-secondary">
        {label}
      </span>
    </div>
  );
}

type TagRow = { tag: string; total: number } & Record<string, number | string>;

/** テーマ（タグ）別の賛否の表。columns は [見出し, 行のキー] の組 */
export function TagTable({
  rows,
  columns,
}: {
  rows: TagRow[];
  columns: [label: string, key: string][];
}) {
  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-mirai-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-mirai-surface-grouped">
            <tr>
              <th className="p-2 text-left font-bold">テーマ</th>
              <th className="p-2 text-right font-bold">議案</th>
              {columns.map(([label]) => (
                <th key={label} className="p-2 text-right font-bold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.tag} className="border-t border-mirai-border">
                <td className="p-2">{row.tag}</td>
                <td className="p-2 text-right">{row.total}</td>
                {columns.map(([label, key]) => (
                  <td key={label} className="p-2 text-right">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-mirai-text-secondary">
        1つの議案に複数のテーマがつくことがあります。テーマのない議案は含みません。
      </p>
    </>
  );
}

type ListedBill = Pick<
  BillVotes,
  "billId" | "billNumber" | "title" | "status" | "statusNote" | "sessionName"
>;

/** 議案の一覧。mark には左側に出す賛否の印を渡す */
export function BillVoteList<T extends ListedBill>({
  bills,
  mark,
  emptyMessage,
}: {
  bills: T[];
  mark: (bill: T) => ReactNode;
  emptyMessage: string;
}) {
  if (bills.length === 0) {
    return <p className="text-sm text-mirai-text-secondary">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-mirai-border">
      {bills.map((bill) => (
        <li key={bill.billId} className="flex items-start gap-3 py-3">
          {mark(bill)}
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/bills/${bill.billId}`}
              className="font-medium text-mirai-text hover:underline"
            >
              {bill.title}
            </Link>
            <span className="text-xs text-mirai-text-secondary">
              {bill.sessionName} {bill.billNumber}・議会の結果：
              {formatBillResult(bill.billNumber, bill.status, bill.statusNote)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
