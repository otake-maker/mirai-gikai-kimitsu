import type {
  BillStatusEnum,
  FactionStance,
  StanceTypeEnum,
} from "../../../shared/types";
import { STANCE_LABELS } from "../../../shared/types";

function getStanceBadgeStyle(type: StanceTypeEnum) {
  switch (type) {
    case "for":
    case "conditional_for":
      return {
        bg: "bg-stance-for-bg",
        textColor: "text-stance-for",
      };
    case "against":
    case "conditional_against":
      return {
        bg: "bg-stance-against-bg",
        textColor: "text-stance-against",
      };
    default:
      return {
        bg: "bg-mirai-surface-muted",
        textColor: "text-black",
      };
  }
}

type FactionStanceRowProps = {
  stance: FactionStance;
};

function FactionStanceRow({ stance }: FactionStanceRowProps) {
  const style = getStanceBadgeStyle(stance.stance);

  return (
    <div className="flex flex-col gap-2 py-4 border-b last:border-0">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-base">
          {stance.faction.display_name}
        </span>
        <span
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold ${style.bg} ${style.textColor}`}
        >
          {STANCE_LABELS[stance.stance]}
        </span>
      </div>
      {stance.comment && (
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {stance.comment}
        </p>
      )}
    </div>
  );
}

// 無所属議員の個人名一覧。空の場合は「無所属」を1行のまま表示する。
// 君津市議会（令和7年11月10日現在の会派別議員名簿）には無所属議員がいない。
const MUSHOZOKU_MEMBERS: string[] = [];

function expandStances(stances: FactionStance[]): FactionStance[] {
  return stances.flatMap((stance) => {
    if (
      stance.faction.display_name !== "無所属" ||
      MUSHOZOKU_MEMBERS.length === 0
    ) {
      return [stance];
    }
    return MUSHOZOKU_MEMBERS.map((name, i) => ({
      ...stance,
      id: `${stance.id}-${i}`,
      faction: { ...stance.faction, display_name: name },
    }));
  });
}

interface FactionStanceCardProps {
  stances: FactionStance[];
  billStatus?: BillStatusEnum;
}

export function FactionStanceCard({
  stances,
  billStatus,
}: FactionStanceCardProps) {
  const isPreparing = billStatus === "preparing";

  if (!isPreparing && stances.length === 0) {
    return null;
  }

  const expandedStances = expandStances(stances);

  return (
    <>
      <h2 className="text-[22px] font-bold mb-4">🗳️会派の賛否</h2>
      <div className="rounded-2xl border bg-white px-6 py-2">
        {isPreparing && expandedStances.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            議案上程後に各会派の賛否を表明します。
          </p>
        ) : (
          <div>
            {expandedStances.map((stance) => (
              <FactionStanceRow key={stance.id} stance={stance} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
