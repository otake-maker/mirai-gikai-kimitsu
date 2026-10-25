/**
 * 議員ごとの賛否（君津市議会の審議結果PDF）から会派ごとの賛否を集計する。
 *
 * 審議結果は「全員と違う投票をした議員」だけを書けば済むように、
 * 既定の賛否（default）と例外の議員（exceptions）で表す。
 */

export type VoteType = "for" | "against";

export type FactionMembers = {
  /** factions.name（英字のキー） */
  name: string;
  members: string[];
};

export type MemberVotes = {
  default: VoteType;
  /** default と逆の投票をした議員 */
  exceptions: string[];
};

export type AggregatedStance = {
  factionName: string;
  type: VoteType | "split";
  comment: string | null;
};

function opposite(type: VoteType): VoteType {
  return type === "for" ? "against" : "for";
}

/**
 * 会派ごとの賛否を返す。
 * 会派内で割れた場合は split とし、comment に「賛成：…／反対：…」を入れる。
 * 採決に加わらない議員（議長など）は nonVoting で除外する。
 */
export function aggregateFactionStances(
  factions: FactionMembers[],
  votes: MemberVotes,
  nonVoting: string[] = []
): AggregatedStance[] {
  const allMembers = new Set(factions.flatMap((f) => f.members));
  for (const name of votes.exceptions) {
    if (!allMembers.has(name)) {
      throw new Error(`会派名簿にいない議員が指定されています: ${name}`);
    }
    if (nonVoting.includes(name)) {
      throw new Error(`採決に加わらない議員が指定されています: ${name}`);
    }
  }

  const exceptions = new Set(votes.exceptions);

  return factions.flatMap((faction): AggregatedStance[] => {
    const voters = faction.members.filter((m) => !nonVoting.includes(m));
    if (voters.length === 0) return [];

    const forMembers = voters.filter(
      (m) =>
        (exceptions.has(m) ? opposite(votes.default) : votes.default) === "for"
    );
    const againstMembers = voters.filter((m) => !forMembers.includes(m));

    if (againstMembers.length === 0) {
      return [{ factionName: faction.name, type: "for", comment: null }];
    }
    if (forMembers.length === 0) {
      return [{ factionName: faction.name, type: "against", comment: null }];
    }
    return [
      {
        factionName: faction.name,
        type: "split",
        comment: `賛成：${forMembers.join("、")}／反対：${againstMembers.join("、")}`,
      },
    ];
  });
}
