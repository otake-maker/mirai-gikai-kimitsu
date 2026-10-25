/**
 * 君津市議会の議決結果を bills.status / status_note に変換する。
 */

export type BillStatus = "approved" | "rejected" | "in_committee";

export type StatusMapping = {
  status: BillStatus;
  statusNote: string | null;
};

export function resultToStatus(result: string): StatusMapping {
  const normalized = result.replace(/\s/g, "");

  // 「不採択」は「採択」を含むため、先に判定する
  if (normalized.includes("不採択") || normalized.includes("否決")) {
    return { status: "rejected", statusNote: null };
  }
  if (normalized.includes("継続審査")) {
    return { status: "in_committee", statusNote: "継続審査" };
  }
  if (normalized === "認定") {
    return { status: "approved", statusNote: "認定" };
  }
  if (normalized === "承認") {
    return { status: "approved", statusNote: "承認" };
  }
  if (normalized === "採択") {
    return { status: "approved", statusNote: "採択" };
  }
  if (normalized.includes("可決")) {
    return { status: "approved", statusNote: null };
  }
  throw new Error(`未対応の議決結果です: ${result}`);
}
