-- Migration 006: Add weekly_off_day column to shift_policy_master

ALTER TABLE shift_policy_master
  ADD COLUMN IF NOT EXISTS weekly_off_day VARCHAR(20);
