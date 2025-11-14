# Database Migration Templates

## Migration Structure Pattern

### Migration File Template
```sql
-- Migration: 001_create_initial_tables.sql
-- Description: Create base tables for SMS campaign management
-- Author: Generated
-- Created: 2024-01-01

-- Check if migration already applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'schema_migrations') THEN
        IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001_create_initial_tables') THEN
            RAISE NOTICE 'Migration 001_create_initial_tables already applied';
            RETURN;
        END IF;
    END IF;
END $$;

-- Create migration tracking table if not exists
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- === Migration Start ===

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    message_content TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- === Migration End ===

-- Record migration
INSERT INTO schema_migrations (version, description, success)
VALUES ('001_create_initial_tables', 'Create base tables for SMS campaign management', true);

COMMIT;
```

## Common Migration Types

### Add Column Migration
```sql
-- Migration: 002_add_campaign_priority.sql
-- Description: Add priority column to campaigns table

BEGIN;

-- Add column with default
ALTER TABLE campaigns ADD COLUMN priority INTEGER DEFAULT 0;

-- Add constraint
ALTER TABLE campaigns ADD CONSTRAINT valid_priority
CHECK (priority >= 0 AND priority <= 10);

-- Create index for performance
CREATE INDEX CONCURRENTLY idx_campaigns_priority ON campaigns(priority);

-- Add comment
COMMENT ON COLUMN campaigns.priority IS 'Campaign priority: 0 (lowest) to 10 (highest)';

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('002_add_campaign_priority', 'Add priority column to campaigns table');

COMMIT;
```

### Create Table Migration
```sql
-- Migration: 003_create_customers_table.sql
-- Description: Create customers table with proper constraints

BEGIN;

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    sms_consent BOOLEAN DEFAULT true,
    do_not_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE customers ADD CONSTRAINT valid_phone
CHECK (phone ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE customers ADD CONSTRAINT valid_email
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL);

-- Create indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_dnc ON customers(do_not_contact) WHERE do_not_contact = true;

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('003_create_customers_table', 'Create customers table with validation');

COMMIT;
```

### Data Migration
```sql
-- Migration: 004_populate_timezone_defaults.sql
-- Description: Set default timezone based on phone number country codes

BEGIN;

-- Update customers timezone based on phone country code
UPDATE customers
SET timezone = CASE
    WHEN phone LIKE '+1%' THEN 'America/New_York'
    WHEN phone LIKE '+44%' THEN 'Europe/London'
    WHEN phone LIKE '+33%' THEN 'Europe/Paris'
    WHEN phone LIKE '+49%' THEN 'Europe/Berlin'
    WHEN phone LIKE '+81%' THEN 'Asia/Tokyo'
    ELSE 'UTC'
END
WHERE timezone = 'UTC' AND phone IS NOT NULL;

-- Add index for timezone-based queries
CREATE INDEX CONCURRENTLY idx_customers_timezone ON customers(timezone);

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('004_populate_timezone_defaults', 'Set default timezone based on phone country codes');

COMMIT;
```

### Index Management Migration
```sql
-- Migration: 005_optimize_campaign_indexes.sql
-- Description: Add performance indexes for campaign queries

BEGIN;

-- Create composite index for campaign status queries
CREATE INDEX CONCURRENTLY idx_campaigns_status_created
ON campaigns(status, created_at DESC);

-- Create partial index for active campaigns
CREATE INDEX CONCURRENTLY idx_campaigns_active
ON campaigns(scheduled_at, created_at)
WHERE status IN ('scheduled', 'sending');

-- Create index for campaign search
CREATE INDEX CONCURRENTLY idx_campaigns_name_gin
ON campaigns USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('005_optimize_campaign_indexes', 'Add performance indexes for campaign queries');

COMMIT;
```

### Table Rename Migration
```sql
-- Migration: 006_rename_customer_fields.sql
-- Description: Rename customer fields for clarity

BEGIN;

-- Rename columns safely
ALTER TABLE customers RENAME COLUMN first_name TO given_name;
ALTER TABLE customers RENAME COLUMN last_name TO family_name;

-- Update views if any exist
DROP VIEW IF EXISTS customer_summary;

CREATE VIEW customer_summary AS
SELECT
    id,
    given_name,
    family_name,
    phone,
    email,
    timezone,
    sms_consent,
    do_not_contact,
    created_at
FROM customers;

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('006_rename_customer_fields', 'Rename customer fields for clarity');

COMMIT;
```

## Advanced Migration Patterns

### Backwards Compatible Column Addition
```sql
-- Migration: 007_add_message_status_enum.sql
-- Description: Add message status enum with backwards compatibility

BEGIN;

-- Create new enum type
CREATE TYPE message_status AS ENUM (
    'pending', 'queued', 'sent', 'delivered',
    'failed', 'bounced', 'rejected', 'expired'
);

-- Add new column with default conversion
ALTER TABLE campaign_messages ADD COLUMN status_new message_status
    GENERATED ALWAYS AS (
        CASE status
            WHEN 'pending' THEN 'pending'::message_status
            WHEN 'sent' THEN 'sent'::message_status
            WHEN 'delivered' THEN 'delivered'::message_status
            WHEN 'failed' THEN 'failed'::message_status
            ELSE 'pending'::message_status
        END
    ) STORED;

-- Create index on new column
CREATE INDEX CONCURRENTLY idx_campaign_messages_status_new
ON campaign_messages(status_new);

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('007_add_message_status_enum', 'Add message status enum with backwards compatibility');

COMMIT;
```

### Partitioning Migration
```sql
-- Migration: 008_partition_campaign_messages.sql
-- Description: Partition campaign_messages table by month

BEGIN;

-- Create partitioned table
CREATE TABLE campaign_messages_partitioned (
    LIKE campaign_messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create current month partition
CREATE TABLE campaign_messages_current PARTITION OF campaign_messages_partitioned
    FOR VALUES FROM (DATE_TRUNC('month', CURRENT_DATE))
                    TO (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'));

-- Create future partitions
DO $$
DECLARE
    start_date date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end_date date;
    partition_name text;
BEGIN
    FOR i IN 0..11 LOOP
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'campaign_messages_' || to_char(start_date, 'YYYY_MM');

        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF campaign_messages_partitioned
                        FOR VALUES FROM (%L) TO (%L)',
                       partition_name, start_date, end_date);

        start_date := end_date;
    END LOOP;
END $$;

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('008_partition_campaign_messages', 'Partition campaign_messages table by month');

COMMIT;
```

### Constraint Migration
```sql
-- Migration: 009_add_data_validation_constraints.sql
-- Description: Add comprehensive data validation constraints

BEGIN;

-- Campaign constraints
ALTER TABLE campaigns ADD CONSTRAINT valid_campaign_name
CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE campaigns ADD CONSTRAINT valid_message_content
CHECK (LENGTH(TRIM(message_content)) BETWEEN 10 AND 1600);

-- Customer constraints
ALTER TABLE customers ADD CONSTRAINT valid_customer_name
CHECK (LENGTH(TRIM(given_name)) > 0 OR LENGTH(TRIM(family_name)) > 0);

-- Campaign message constraints
ALTER TABLE campaign_messages ADD CONSTRAINT valid_message_phone
CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES ('009_add_data_validation_constraints', 'Add comprehensive data validation constraints');

COMMIT;
```

## Rollback Templates

### Rollback Script Template
```sql
-- Rollback: 005_optimize_campaign_indexes.sql
-- Description: Remove performance indexes

BEGIN;

-- Drop indexes (reverse order of creation)
DROP INDEX CONCURRENTLY IF EXISTS idx_campaigns_name_gin;
DROP INDEX CONCURRENTLY IF EXISTS idx_campaigns_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_campaigns_status_created;

-- Update migration record
UPDATE schema_migrations
SET success = false,
    error_message = 'Rollback executed'
WHERE version = '005_optimize_campaign_indexes';

COMMIT;
```

### Safe Rollback Function
```sql
CREATE OR REPLACE FUNCTION rollback_migration(migration_version text)
RETURNS void AS $$
DECLARE
    rollback_sql text;
BEGIN
    SELECT rollback_sql INTO rollback_sql
    FROM schema_migrations
    WHERE version = migration_version;

    IF rollback_sql IS NOT NULL THEN
        EXECUTE rollback_sql;
        RAISE NOTICE 'Rollback completed for migration: %', migration_version;
    ELSE
        RAISE EXCEPTION 'No rollback script found for migration: %', migration_version;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Migration Management Scripts

### Apply Migrations Script
```sql
CREATE OR REPLACE FUNCTION apply_pending_migrations()
RETURNS TABLE(version text, success boolean) AS $$
DECLARE
    migration_record RECORD;
    migration_files text[] := ARRAY[
        '001_create_initial_tables.sql',
        '002_add_campaign_priority.sql',
        '003_create_customers_table.sql'
        -- Add all migration files here
    ];
BEGIN
    FOREACH migration_file IN ARRAY migration_files LOOP
        IF NOT EXISTS (
            SELECT 1 FROM schema_migrations
            WHERE version = replace(migration_file, '.sql', '')
        ) THEN
            -- Execute migration file logic here
            -- This would typically load and execute the SQL file
            RETURN NEXT (replace(migration_file, '.sql', ''), true);
        END IF;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE plpgsql;
```