-- Add pilot status to forms
-- The status column already supports text values; this adds a check constraint
-- to ensure only valid statuses are used.

-- Update the check constraint to include 'pilot'
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_status_check;

ALTER TABLE forms ADD CONSTRAINT forms_status_check
  CHECK (status IN ('draft', 'published', 'closed', 'pilot'));

-- Add is_pilot flag to submissions metadata (stored in JSONB, no schema change needed)
-- Submissions with metadata->>'is_pilot' = 'true' are pilot submissions

COMMENT ON CONSTRAINT forms_status_check ON forms IS
  'Valid form statuses: draft, published, closed, pilot';
