 
CREATE TABLE
  IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'CUSTOMER', -- ADMIN, MANAGER, STAFF, CUSTOMER
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE INDEX IF NOT EXISTS idx_users_uuid ON users (uuid);

-- ALTER TABLE users ALTER COLUMN role SET DEFAULT 'CUSTOMER';

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
  user_uuid UUID NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user_uuid FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user_uuid ON sessions (user_uuid);

CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_uuid UUID REFERENCES users(uuid) ON DELETE CASCADE,
  full_name VARCHAR(100),
  birth_date DATE,
  address TEXT,
  phone_number VARCHAR(20),
  profile_picture_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_uuid ON user_profiles (user_uuid);
 

CREATE TABLE
  IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,

  uuid UUID DEFAULT gen_random_uuid() UNIQUE,
phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

ALTER TABLE customers
ADD CONSTRAINT unique_phone_number UNIQUE (phone_number);
 ALTER TABLE customers
  ADD COLUMN first_name VARCHAR(50) NOT NULL,
  ADD COLUMN last_name VARCHAR(50) NOT NULL,
  ADD COLUMN gender VARCHAR(10), -- consider using an ENUM if applicable
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN emergency_contact VARCHAR(50),
  ADD COLUMN emergency_phone VARCHAR(20),
  ADD COLUMN street_address VARCHAR(255),
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN state VARCHAR(100),
  ADD COLUMN state_code VARCHAR(10),
  ADD COLUMN membership_type VARCHAR(50) NOT NULL, -- or use ENUM
  ADD COLUMN membership_start_date DATE,
  ADD COLUMN membership_end_date DATE,
  ADD COLUMN status VARCHAR(50) NOT NULL, -- or use ENUM
  ADD COLUMN notes TEXT;

CREATE TABLE
  IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    customer_uuid UUID,
    payment_method VARCHAR(20) DEFAULT 'Cash', -- Cash, Credit
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_customer_uuid FOREIGN KEY (customer_uuid) REFERENCES customers (uuid) ON DELETE CASCADE
  );

CREATE INDEX idx_payments_customer_uuid ON payments (customer_uuid);
 
CREATE VIEW vw_users_with_uuid AS
SELECT uuid, username, password, role, is_enabled, created_at, updated_at
FROM users;

CREATE VIEW vw_user_profiles_view AS
SELECT 
  up.profile_id, 
  up.user_uuid, 
  up.full_name, 
  up.birth_date, 
  up.address, 
  up.phone_number, 
  up.profile_picture_url, 
  up.created_at, 
  up.updated_at, 
  u.username,
  u.role
FROM user_profiles up
JOIN users u ON up.user_uuid = u.uuid;
 
SELECT * FROM "information_schema"."views" 
WHERE "table_schema" = 'public';
 