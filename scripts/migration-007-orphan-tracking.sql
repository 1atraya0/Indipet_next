-- Migration 007: Enable orphan detection when locations are deleted
-- 1. Change FK on employee_master.location_id to ON DELETE SET NULL
--    so location deletion succeeds while clearing the FK automatically
-- 2. Add previous_location_id to remember the deleted location's ID
--    for frontend orphan detection (slot the LEFT JOIN returns NULL)

ALTER TABLE employee_master DROP CONSTRAINT IF EXISTS fk_employee_location;

ALTER TABLE employee_master ADD CONSTRAINT fk_employee_location
  FOREIGN KEY (location_id) REFERENCES sub_location(location_id)
  ON DELETE SET NULL;

ALTER TABLE employee_master ADD COLUMN IF NOT EXISTS previous_location_id INTEGER;
