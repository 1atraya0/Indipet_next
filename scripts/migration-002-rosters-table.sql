CREATE TABLE IF NOT EXISTS rosters (
  roster_id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES sub_location(location_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  version VARCHAR(10) NOT NULL DEFAULT 'v1',
  status VARCHAR(20) NOT NULL DEFAULT 'Published',
  filled_slots INTEGER NOT NULL DEFAULT 0,
  open_slots INTEGER NOT NULL DEFAULT 0,
  conflicts INTEGER NOT NULL DEFAULT 0,
  keyholder_status VARCHAR(20) DEFAULT 'Configured',
  roster_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rosters_location_id ON rosters(location_id);
CREATE INDEX IF NOT EXISTS idx_rosters_status ON rosters(status);
CREATE INDEX IF NOT EXISTS idx_rosters_created_at ON rosters(created_at DESC);
