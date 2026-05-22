USE safe_exit_hub;

INSERT IGNORE INTO staff_roles (role_name, permission_level) VALUES
  ('Branch Manager', 100),
  ('Event Lead', 80),
  ('Floor Staff', 50),
  ('Caretaker', 40),
  ('Volunteer', 30);

INSERT IGNORE INTO staff_users (role_id, full_name, phone_number, account_status)
SELECT r.role_id, 'Alex Rivera', '+15550001001', 'ACTIVE'
FROM staff_roles r WHERE r.role_name = 'Branch Manager' LIMIT 1;

INSERT IGNORE INTO staff_users (role_id, full_name, phone_number, account_status)
SELECT r.role_id, 'Jordan Lee', '+15550001002', 'ACTIVE'
FROM staff_roles r WHERE r.role_name = 'Event Lead' LIMIT 1;

INSERT IGNORE INTO staff_users (role_id, full_name, phone_number, account_status)
SELECT r.role_id, 'Sam Taylor', '+15550001003', 'ACTIVE'
FROM staff_roles r WHERE r.role_name = 'Floor Staff' LIMIT 1;

INSERT IGNORE INTO events (event_name, event_date, location, lead_staff_id, status)
SELECT 'Sunday Kids Zone', CURDATE(), 'Main Hall', s.staff_id, 'ACTIVE'
FROM staff_users s
JOIN staff_roles r ON s.role_id = r.role_id
WHERE r.role_name = 'Event Lead'
LIMIT 1;

INSERT IGNORE INTO children (full_name, guardian_name, guardian_phone) VALUES
  ('Mia Chen', 'Parent Chen', '+15550002001'),
  ('Noah Patel', 'Parent Patel', '+15550002002');
