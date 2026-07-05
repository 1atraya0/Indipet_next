CREATE TABLE IF NOT EXISTS employee_attendance (
  attendance_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employee_master(employee_id),
  attendance_date DATE NOT NULL,
  location_id INTEGER REFERENCES sub_location(location_id),
  shift_id INTEGER REFERENCES shift_policy_master(policy_id),
  check_in TIME,
  check_out TIME,
  total_hours NUMERIC(5,2),
  status VARCHAR(20) NOT NULL DEFAULT 'Present',
  source VARCHAR(20) DEFAULT 'manual',
  roster_linked BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON employee_attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON employee_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON employee_attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_location ON employee_attendance(location_id);

CREATE TABLE IF NOT EXISTS attendance_regularization (
  request_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employee_master(employee_id),
  attendance_date DATE NOT NULL,
  issue_type VARCHAR(50) NOT NULL,
  description TEXT,
  requested_status VARCHAR(20),
  supporting_evidence TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  approved_by INTEGER REFERENCES employee_master(employee_id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_employee ON attendance_regularization(employee_id);
CREATE INDEX IF NOT EXISTS idx_reg_status ON attendance_regularization(status);

CREATE TABLE IF NOT EXISTS shift_exceptions (
  exception_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employee_master(employee_id),
  exception_date DATE NOT NULL,
  shift_id INTEGER REFERENCES shift_policy_master(policy_id),
  exception_type VARCHAR(30) NOT NULL,
  severity VARCHAR(20) DEFAULT 'Open',
  expected_in TIME,
  actual_in TIME,
  expected_out TIME,
  actual_out TIME,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exc_employee ON shift_exceptions(employee_id);
CREATE INDEX IF NOT EXISTS idx_exc_severity ON shift_exceptions(severity);

CREATE TABLE IF NOT EXISTS co_ledger (
  entry_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employee_master(employee_id),
  entry_type VARCHAR(20) NOT NULL,
  units NUMERIC(5,2) NOT NULL,
  balance_after NUMERIC(5,2) NOT NULL,
  source VARCHAR(50),
  attendance_date DATE,
  expiry_date DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_co_employee ON co_ledger(employee_id);
CREATE INDEX IF NOT EXISTS idx_co_expiry ON co_ledger(expiry_date);

CREATE TABLE IF NOT EXISTS attendance_reports (
  report_id SERIAL PRIMARY KEY,
  report_name VARCHAR(100) NOT NULL,
  scope VARCHAR(20),
  scope_value INTEGER,
  period_start DATE,
  period_end DATE,
  filters JSONB DEFAULT '{}',
  owner_id INTEGER REFERENCES employee_master(employee_id),
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_owner ON attendance_reports(owner_id);
