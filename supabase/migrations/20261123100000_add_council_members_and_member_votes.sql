-- ----------------------------------------
-- 議員と、議員ごとの賛否
-- 議員ごとの賛否を公開している議会向け。会派の賛否（faction_stances）は
-- これを会派ごとにまとめたもので、取り込み時に両方を書き込む。
-- ----------------------------------------

-- absent: その議案の採決に加わらなかった（欠席・除斥など）
-- not_voting: 議長など、採決に加わらない立場だった
CREATE TYPE member_vote_type_enum AS ENUM ('for', 'against', 'absent', 'not_voting');

CREATE TABLE council_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_council_members_updated_at
    BEFORE UPDATE ON council_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE member_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES council_members(id) ON DELETE CASCADE,
    -- 採決のときに所属していた会派（会派は組み替わるため議案ごとに持つ）
    faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    vote member_vote_type_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(bill_id, member_id)
);

ALTER TABLE member_votes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_member_votes_bill_id ON member_votes(bill_id);
CREATE INDEX idx_member_votes_member_id ON member_votes(member_id);
CREATE INDEX idx_member_votes_faction_id ON member_votes(faction_id);

CREATE TRIGGER set_member_votes_updated_at
    BEFORE UPDATE ON member_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
