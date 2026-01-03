-- Update trials table to use new survey response columns
-- Dropping old columns and adding new ones for the 7 Likert-scale questions

ALTER TABLE trials
  DROP COLUMN IF EXISTS dominance_check_1,
  DROP COLUMN IF EXISTS dominance_check_2;

ALTER TABLE trials
  ADD COLUMN dom_manip_1 INT NOT NULL DEFAULT 0,
  ADD COLUMN dom_manip_2 INT NOT NULL DEFAULT 0,
  ADD COLUMN pre_manip_1 INT NOT NULL DEFAULT 0,
  ADD COLUMN pre_manip_2 INT NOT NULL DEFAULT 0,
  ADD COLUMN attn_check INT NOT NULL DEFAULT 0,
  ADD COLUMN status_manip_1 INT NOT NULL DEFAULT 0,
  ADD COLUMN status_manip_2 INT NOT NULL DEFAULT 0;
