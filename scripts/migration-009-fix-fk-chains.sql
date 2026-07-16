-- Migration 009: Fix FK chains that block cascading location/entity deletion
-- When sub_location or shift_policy_master rows are cascade-deleted,
-- other tables referencing them with NO ACTION would block the statement.

-- shift_policy_master FKs (blocked when shift policies are cascade-deleted)
ALTER TABLE employee_master DROP CONSTRAINT IF EXISTS fk_employee_default_shift;
ALTER TABLE employee_master ADD CONSTRAINT fk_employee_default_shift
  FOREIGN KEY (default_shift_id) REFERENCES shift_policy_master(policy_id)
  ON DELETE SET NULL;

ALTER TABLE employee_attendance DROP CONSTRAINT IF EXISTS employee_attendance_shift_id_fkey;
ALTER TABLE employee_attendance ADD CONSTRAINT employee_attendance_shift_id_fkey
  FOREIGN KEY (shift_id) REFERENCES shift_policy_master(policy_id)
  ON DELETE SET NULL;

ALTER TABLE shift_exceptions DROP CONSTRAINT IF EXISTS shift_exceptions_shift_id_fkey;
ALTER TABLE shift_exceptions ADD CONSTRAINT shift_exceptions_shift_id_fkey
  FOREIGN KEY (shift_id) REFERENCES shift_policy_master(policy_id)
  ON DELETE CASCADE;

-- role_master FKs (blocked when roles are cascade-deleted)
ALTER TABLE employee_master DROP CONSTRAINT IF EXISTS fk_employee_role;
ALTER TABLE employee_master ADD CONSTRAINT fk_employee_role
  FOREIGN KEY (role_id) REFERENCES role_master(role_id)
  ON DELETE SET NULL;
