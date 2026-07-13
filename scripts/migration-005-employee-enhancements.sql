-- Migration 005: Employee enhancements
-- Adds document_file column, multi-skill support, certifications table

ALTER TABLE employee_documents ADD COLUMN IF NOT EXISTS document_file VARCHAR(255);

ALTER TABLE employee_skills DROP CONSTRAINT IF EXISTS uq_employee_skills_employee_id;

CREATE TABLE IF NOT EXISTS employee_certifications (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employee_master(employee_id) ON DELETE CASCADE,
  certification_name VARCHAR(255) NOT NULL,
  issuing_authority VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  certificate_file VARCHAR(255)
);
