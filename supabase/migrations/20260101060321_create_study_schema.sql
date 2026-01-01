-- Create participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  permutation TEXT NOT NULL, -- e.g., "DPL", "PDL", "LDP", etc.
  experimenter TEXT NOT NULL,
  session_notes TEXT,
  previous_participation BOOLEAN NOT NULL DEFAULT false
);

-- Create trials table
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('dominant', 'prestigious', 'low_status')),
  trial_index INT NOT NULL CHECK (trial_index >= 1 AND trial_index <= 3),
  dominance_check_1 INT NOT NULL,
  dominance_check_2 INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (participant_id, trial_index)
);

-- Create figure_positions table
CREATE TABLE figure_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  figure_type TEXT NOT NULL CHECK (figure_type IN ('focal', 'worker')),
  figure_index INT CHECK (
    (figure_type = 'focal' AND figure_index IS NULL) OR
    (figure_type = 'worker' AND figure_index >= 1 AND figure_index <= 6)
  ),
  x FLOAT NOT NULL,
  y FLOAT NOT NULL
);

-- Create indexes for common queries
CREATE INDEX idx_trials_participant_id ON trials(participant_id);
CREATE INDEX idx_figure_positions_trial_id ON figure_positions(trial_id);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE figure_positions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for your auth setup)
CREATE POLICY "Allow all operations on participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on trials" ON trials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on figure_positions" ON figure_positions FOR ALL USING (true) WITH CHECK (true);
