-- Schema renovation: simplify trials, remove figure_positions
-- - Remove figure_positions table (no longer storing individual figure coordinates)
-- - Remove centroid calculation columns (replaced by simpler distance_from_center)
-- - Remove attn_check_1 (third condition's attention check, correct answer = 1)
-- - Add distance_from_center for the new drag task metric

-- 1. Drop figure_positions table
DROP TABLE IF EXISTS figure_positions;

-- 2. Remove unused columns from trials
ALTER TABLE trials
  DROP COLUMN IF EXISTS centroid_x,
  DROP COLUMN IF EXISTS centroid_y,
  DROP COLUMN IF EXISTS focal_distance_from_centroid,
  DROP COLUMN IF EXISTS avg_distance_from_centroid,
  DROP COLUMN IF EXISTS focal_distance_to_neighbor,
  DROP COLUMN IF EXISTS attn_check_1;

-- 3. Add distance_from_center column
ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS distance_from_center FLOAT;

COMMENT ON COLUMN trials.distance_from_center IS 'Distance in pixels from leader figure to center of group';

-- 4. Update condition constraint (remove low_status)
ALTER TABLE trials DROP CONSTRAINT IF EXISTS trials_condition_check;
ALTER TABLE trials ADD CONSTRAINT trials_condition_check
  CHECK (condition IN ('dominant', 'prestigious'));

-- 5. Update trial_index constraint (1-2 instead of 1-3)
ALTER TABLE trials DROP CONSTRAINT IF EXISTS trials_trial_index_check;
ALTER TABLE trials ADD CONSTRAINT trials_trial_index_check
  CHECK (trial_index >= 1 AND trial_index <= 2);
