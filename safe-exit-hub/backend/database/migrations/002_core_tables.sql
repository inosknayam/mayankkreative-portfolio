USE safe_exit_hub;

CREATE TABLE IF NOT EXISTS children (
  child_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  guardian_name VARCHAR(150) NOT NULL,
  guardian_phone VARCHAR(20) NOT NULL,
  allergies_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  event_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(200),
  lead_staff_id INT UNSIGNED NULL,
  status ENUM('SCHEDULED', 'ACTIVE', 'COMPLETED') DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_lead FOREIGN KEY (lead_staff_id) REFERENCES staff_users(staff_id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS check_ins (
  check_in_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  child_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  checked_in_by INT UNSIGNED NOT NULL,
  check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pickup_code VARCHAR(12) NOT NULL,
  status ENUM('CHECKED_IN', 'RELEASED', 'CANCELLED') DEFAULT 'CHECKED_IN',
  CONSTRAINT fk_ci_child FOREIGN KEY (child_id) REFERENCES children(child_id),
  CONSTRAINT fk_ci_event FOREIGN KEY (event_id) REFERENCES events(event_id),
  CONSTRAINT fk_ci_staff FOREIGN KEY (checked_in_by) REFERENCES staff_users(staff_id)
) ENGINE=InnoDB;

-- attendance_log: verified_by maps to staff_users.staff_id (never static text)
CREATE TABLE IF NOT EXISTS attendance_log (
  log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  check_in_id INT UNSIGNED NOT NULL,
  action_type ENUM('CHECK_IN', 'SAFE_EXIT', 'NOTE', 'STATUS_CHANGE') NOT NULL,
  verified_by INT UNSIGNED NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_al_checkin FOREIGN KEY (check_in_id) REFERENCES check_ins(check_in_id),
  CONSTRAINT fk_al_verified_by FOREIGN KEY (verified_by) REFERENCES staff_users(staff_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_logs (
  event_log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  verified_by INT UNSIGNED NOT NULL,
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_el_event FOREIGN KEY (event_id) REFERENCES events(event_id),
  CONSTRAINT fk_el_verified_by FOREIGN KEY (verified_by) REFERENCES staff_users(staff_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS otp_sessions (
  otp_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_expires (phone_number, expires_at)
) ENGINE=InnoDB;
