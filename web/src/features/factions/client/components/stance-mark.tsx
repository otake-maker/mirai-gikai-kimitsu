import { cn } from "@/lib/utils";
import type { MemberVoteType, StanceGroup } from "../../shared/types";

const STANCE_MARKS: Record<
  StanceGroup,
  { label: string; short: string; className: string }
> = {
  for: {
    label: "賛成",
    short: "賛",
    className: "bg-stance-for-bg text-stance-for",
  },
  against: {
    label: "反対",
    short: "反",
    className: "bg-stance-against-bg text-stance-against",
  },
  split: {
    label: "会派内で分かれた",
    short: "分",
    className: "bg-stance-neutral-bg text-stance-neutral",
  },
  other: {
    label: "その他",
    short: "他",
    className: "bg-mirai-surface-muted text-mirai-text",
  },
};

interface StanceMarkProps {
  stance: StanceGroup;
  /** 表の中で使う1文字の表示 */
  compact?: boolean;
}

export function StanceMark({ stance, compact = false }: StanceMarkProps) {
  const mark = STANCE_MARKS[stance];

  return (
    <span
      title={mark.label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        compact ? "size-7 text-xs" : "px-3 py-1 text-xs",
        mark.className
      )}
    >
      {compact ? mark.short : mark.label}
    </span>
  );
}

const MEMBER_VOTE_LABELS: Record<"absent" | "not_voting", string> = {
  absent: "採決に加わらず",
  not_voting: "議長など",
};

/** 議員1人の賛否の印。採決に加わらなかったときは灰色で理由を出す */
export function MemberVoteMark({ vote }: { vote: MemberVoteType }) {
  if (vote === "for" || vote === "against") {
    return <StanceMark stance={vote} />;
  }
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-mirai-surface-muted px-3 py-1 text-xs font-bold text-mirai-text-secondary">
      {MEMBER_VOTE_LABELS[vote]}
    </span>
  );
}
