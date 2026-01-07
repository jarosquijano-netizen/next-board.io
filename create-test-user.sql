-- Create a test user for email notifications
-- Run this with: sqlite3 prisma/dev.db < create-test-user.sql

-- Insert test user
INSERT OR REPLACE INTO User (id, clerkUserId, email, name, createdAt, updatedAt)
VALUES (
  'test-user-001',
  'test_clerk_user',
  'jarosquijano@gmail.com',
  'Jaros Quijano',
  datetime('now'),
  datetime('now')
);

-- Create notification preferences with digest at current hour
INSERT OR REPLACE INTO NotificationPreferences (
  id,
  userId,
  dailyDigest,
  dailyDigestTime,
  overdueAlerts,
  dueTodayAlerts,
  createdAt,
  updatedAt
) VALUES (
  'test-prefs-001',
  'test-user-001',
  1,
  strftime('%H:00', 'now'),
  1,
  1,
  datetime('now'),
  datetime('now')
);

-- Show what was created
SELECT 'User created:' as info;
SELECT * FROM User WHERE id = 'test-user-001';

SELECT 'Preferences created:' as info;
SELECT * FROM NotificationPreferences WHERE userId = 'test-user-001';





