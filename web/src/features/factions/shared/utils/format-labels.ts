import type { BillStatusEnum } from "@/features/bills/shared/types";
import { getCardStatusLabel } from "@/features/bills/shared/utils/bill-status";

/** 「希望にみらい（林 祥子）」のような1人会派の議員名を外した短い名前 */
export function shortFactionName(displayName: string): string {
  return displayName.replace(/（[^）]*）$/, "");
}

/** 議決結果の表示。陳情は「採択・不採択」、それ以外は「可決・否決」など */
export function formatBillResult(
  billNumber: string,
  status: BillStatusEnum,
  statusNote: string | null
): string {
  if (billNumber.startsWith("陳情")) {
    if (status === "approved") return "採択";
    if (status === "rejected") return "不採択";
  }
  return statusNote ?? getCardStatusLabel(status);
}
