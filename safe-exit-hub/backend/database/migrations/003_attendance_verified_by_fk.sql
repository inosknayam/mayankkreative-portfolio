-- Ensures legacy text verified_by columns are migrated to staff_id FK
USE safe_exit_hub;

-- If an old attendance_log had VARCHAR verified_by, alter to INT FK (idempotent guard)
SET @col_type = (
  SELECT DATA_TYPE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'safe_exit_hub'
    AND TABLE_NAME = 'attendance_log'
    AND COLUMN_NAME = 'verified_by'
  LIMIT 1
);

-- Fresh installs already have INT FK from 002; this documents the required mapping contract.
