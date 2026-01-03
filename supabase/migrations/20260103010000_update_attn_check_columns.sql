-- Replace single attn_check column with three separate attention check columns
-- Each condition has a different attention check at a different position with a different answer
-- Condition 1: position 3, answer "five" (5)
-- Condition 2: position 5, answer "three" (3)
-- Condition 3: position 6, answer "one" (1)

-- Drop old column if it exists
ALTER TABLE trials DROP COLUMN IF EXISTS attn_check;

-- Add new attention check columns (nullable since only one is filled per trial)
ALTER TABLE trials
ADD COLUMN attn_check_1 INT,
ADD COLUMN attn_check_2 INT,
ADD COLUMN attn_check_3 INT;

-- Add comments for documentation
COMMENT ON COLUMN trials.attn_check_1 IS 'Attention check for condition 1: "select option five" (correct answer = 5)';
COMMENT ON COLUMN trials.attn_check_2 IS 'Attention check for condition 2: "select option three" (correct answer = 3)';
COMMENT ON COLUMN trials.attn_check_3 IS 'Attention check for condition 3: "select option one" (correct answer = 1)';
