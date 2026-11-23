import type {
  BillStatusEnum,
  StanceTypeEnum,
} from "@/features/bills/shared/types";

export type Faction = {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
  is_active: boolean;
};

/** 公開済み議案1件と、その議案への各会派の賛否 */
export type BillVotes = {
  billId: string;
  billNumber: string;
  title: string;
  status: BillStatusEnum;
  statusNote: string | null;
  decidedDate: string | null;
  sessionName: string;
  sessionStartDate: string;
  tags: string[];
  stances: { factionId: string; type: StanceTypeEnum }[];
};

/** 賛否を「賛成・反対・会派内で分かれた・その他」の4つにまとめたもの */
export type StanceGroup = "for" | "against" | "split" | "other";

/** ある会派から見た、議案1件への賛否 */
export type FactionVote = Omit<BillVotes, "stances"> & {
  stance: StanceGroup;
  /** すべての会派が同じ賛否だったか */
  isUnanimous: boolean;
};

export type StanceCounts = {
  total: number;
  for: number;
  against: number;
  split: number;
};

export type FactionRecordSummary = {
  counts: StanceCounts;
  /** タグ（テーマ）ごとの賛否。議案数の多い順 */
  byTag: (StanceCounts & { tag: string })[];
  /** 全会一致でなかった議案（新しい順） */
  contested: FactionVote[];
  /** 最初と最後に賛否を記録した会期 */
  firstSessionName: string | null;
  lastSessionName: string | null;
};
