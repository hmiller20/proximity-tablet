-- Add trajectory column for drag movement tracking
ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS trajectory JSONB;

COMMENT ON COLUMN trials.trajectory IS 'Array of {x, t} objects tracking leader position over time during drag task';
