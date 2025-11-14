# Database Schema Design Patterns

## Core Table Structures

### Campaigns Table
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    message_content TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Campaign settings
    send_immediately BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'UTC',
    max_retries INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 15
);

-- Indexes for performance
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
```

### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    date_of_birth DATE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Consent and preferences
    sms_consent BOOLEAN DEFAULT true,
    email_consent BOOLEAN DEFAULT false,
    consent_given_at TIMESTAMP WITH TIME ZONE,
    do_not_contact BOOLEAN DEFAULT false,

    -- Metadata
    source VARCHAR(100), -- Where customer came from
    notes TEXT
);

-- Indexes
CREATE UNIQUE INDEX idx_customers_phone ON customers(phone);
CREATE UNIQUE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_dnc ON customers(do_not_contact) WHERE do_not_contact = true;
CREATE INDEX idx_customers_sms_consent ON customers(sms_consent) WHERE sms_consent = true;
```

### Campaign Messages Table
```sql
CREATE TABLE campaign_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'rejected')
    ),
    error_message TEXT,
    external_id VARCHAR(255), -- SMS provider message ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_customer_id ON campaign_messages(customer_id);
CREATE INDEX idx_campaign_messages_status ON campaign_messages(status);
CREATE INDEX idx_campaign_messages_next_retry ON campaign_messages(next_retry_at) WHERE status = 'failed';
CREATE UNIQUE INDEX idx_campaign_messages_external_id ON campaign_messages(external_id) WHERE external_id IS NOT NULL;
```

### Tags and Tagging System
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff', -- Hex color code
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE customer_tags (
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    PRIMARY KEY (customer_id, tag_id)
);

-- Indexes
CREATE INDEX idx_customer_tags_customer_id ON customer_tags(customer_id);
CREATE INDEX idx_customer_tags_tag_id ON customer_tags(tag_id);
CREATE INDEX idx_tags_name ON tags(name);
```

## Enhanced Schema Patterns

### Audit Trail Pattern
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### Message Templates Pattern
```sql
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    variables JSONB, -- Available template variables
    category VARCHAR(100),
    is_system BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_system ON message_templates(is_system) WHERE is_system = true;
```

### Customer Segments Pattern
```sql
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- Complex filtering conditions
    customer_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE segment_memberships (
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (segment_id, customer_id)
);

-- Materialized view for fast segment queries
CREATE MATERIALIZED VIEW customer_segment_stats AS
SELECT
    cs.id,
    cs.name,
    COUNT(sm.customer_id) as actual_count,
    cs.updated_at
FROM customer_segments cs
LEFT JOIN segment_memberships sm ON cs.id = sm.segment_id
GROUP BY cs.id, cs.name, cs.updated_at;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_segment_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_segment_stats;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization Patterns

### Partitioning Pattern for Large Message Tables
```sql
-- Partition campaign_messages by month
CREATE TABLE campaign_messages_partitioned (
    LIKE campaign_messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE campaign_messages_2024_01 PARTITION OF campaign_messages_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE campaign_messages_2024_02 PARTITION OF campaign_messages_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Function to create new partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';

    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### Read Replicas for Reporting
```sql
-- Create read-only user for reporting queries
CREATE ROLE reporting_readonly;
GRANT CONNECT ON DATABASE dnwerks TO reporting_readonly;
GRANT USAGE ON SCHEMA public TO reporting_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reporting_readonly;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reporting_readonly;
```

## Data Integrity Patterns

### Check Constraints
```sql
-- Phone number validation
ALTER TABLE customers ADD CONSTRAINT valid_phone_number
CHECK (phone ~ '^\+?[1-9]\d{1,14}$');

-- Email validation
ALTER TABLE customers ADD CONSTRAINT valid_email
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL);

-- Campaign date validation
ALTER TABLE campaigns ADD CONSTRAINT valid_scheduled_date
CHECK (scheduled_at IS NULL OR scheduled_at >= created_at);

-- Message content length
ALTER TABLE campaigns ADD CONSTRAINT message_length_limit
CHECK (LENGTH(TRIM(message_content)) > 10 AND LENGTH(message_content) <= 1600);
```

### Foreign Key Cascade Strategies
```sql
-- Soft delete pattern
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update foreign keys to respect soft deletes
ALTER TABLE campaign_messages ADD CONSTRAINT valid_customer
CHECK (customer_id NOT IN (
    SELECT id FROM customers WHERE deleted_at IS NOT NULL
));
```

## Migration Patterns

### Schema Versioning
```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rollback_sql TEXT
);

-- Example migration record
INSERT INTO schema_migrations (version, rollback_sql) VALUES
('001_create_initial_tables', 'DROP TABLE IF EXISTS campaign_messages CASCADE; DROP TABLE IF EXISTS campaigns CASCADE;');
```

### Backwards Compatible Changes
```sql
-- Add new column with default
ALTER TABLE campaigns ADD COLUMN priority INTEGER DEFAULT 0;
ALTER TABLE campaigns ALTER COLUMN priority SET NOT NULL;

-- Create new index concurrently
CREATE INDEX CONCURRENTLY idx_campaigns_priority ON campaigns(priority);

-- Rename column with temporary name
ALTER TABLE campaigns RENAME COLUMN message TO message_old;
ALTER TABLE campaigns ADD COLUMN message_content TEXT;
UPDATE campaigns SET message_content = message_old;
ALTER TABLE campaigns ALTER COLUMN message_content SET NOT NULL;
ALTER TABLE campaigns DROP COLUMN message_old;
```