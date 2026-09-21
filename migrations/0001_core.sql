CREATE TABLE campaigns (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  platform TEXT NOT NULL,
  audience TEXT NOT NULL,
  offer TEXT,
  tone TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);

CREATE TABLE brand_sources (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_sources_user_id ON brand_sources(user_id);

CREATE TABLE creatives (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  campaign_id BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  cta TEXT,
  visual_direction TEXT,
  rationale TEXT,
  source_ids TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_creatives_user_id ON creatives(user_id);
CREATE INDEX idx_creatives_campaign_id ON creatives(campaign_id);

CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  creative_id BIGINT REFERENCES creatives(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  note TEXT,
  metric_name TEXT,
  metric_value NUMERIC,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);