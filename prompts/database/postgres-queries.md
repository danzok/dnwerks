# PostgreSQL Query Patterns

## Campaign Management Queries

### Get Campaign Statistics
```sql
-- Get comprehensive campaign statistics
SELECT
    c.id,
    c.name,
    c.message_content,
    c.scheduled_at,
    COUNT(cm.id) as total_messages,
    COUNT(CASE WHEN cm.status = 'sent' THEN 1 END) as sent_messages,
    COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered_messages,
    COUNT(CASE WHEN cm.status = 'failed' THEN 1 END) as failed_messages,
    ROUND(
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) * 100.0 /
        NULLIF(COUNT(cm.id), 0), 2
    ) as delivery_rate
FROM campaigns c
LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
GROUP BY c.id, c.name, c.message_content, c.scheduled_at
ORDER BY c.created_at DESC;
```

### Customer Segmentation
```sql
-- Get customers by tags and activity
SELECT DISTINCT
    cu.id,
    cu.first_name,
    cu.last_name,
    cu.phone,
    cu.email,
    COALESCE(
        STRING_AGG(DISTINCT t.name, ', ')
        ORDER BY t.name,
        ', '
    ) as tags
FROM customers cu
LEFT JOIN customer_tags ct ON cu.id = ct.customer_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE 1=1
    AND (
        -- Filter by specific tags
        t.name = ANY($1::text[]) OR $1 IS NULL
    )
    AND (
        -- Filter by active customers
        cu.created_at > NOW() - INTERVAL '30 days'
    )
GROUP BY cu.id, cu.first_name, cu.last_name, cu.phone, cu.email
HAVING
    -- Only include customers with specific tags if specified
    ($1 IS NULL OR COUNT(CASE WHEN t.name = ANY($1::text[]) THEN 1 END) > 0)
ORDER BY cu.last_name, cu.first_name;
```

### Message Delivery Tracking
```sql
-- Track message delivery status over time
SELECT
    DATE_TRUNC('hour', cm.updated_at) as hour,
    cm.status,
    COUNT(*) as count,
    SUM(CASE WHEN cm.error_message IS NOT NULL THEN 1 ELSE 0 END) as errors
FROM campaign_messages cm
WHERE cm.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', cm.updated_at), cm.status
ORDER BY hour DESC, cm.status;
```

### Campaign Performance Analysis
```sql
-- Analyze campaign performance with customer engagement
WITH campaign_stats AS (
    SELECT
        c.id,
        c.name,
        COUNT(cm.id) as total_messages,
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN cm.sent_at IS NOT NULL THEN 1 END) as sent
    FROM campaigns c
    LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
    WHERE c.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY c.id, c.name
)
SELECT
    name,
    total_messages,
    delivered,
    sent,
    ROUND(delivered * 100.0 / NULLIF(total_messages, 0), 2) as delivery_rate,
    ROUND(sent * 100.0 / NULLIF(total_messages, 0), 2) as send_rate
FROM campaign_stats
ORDER BY delivery_rate DESC, total_messages DESC;
```

## Customer Management Queries

### Active Customers by Time Period
```sql
-- Get customers who received messages in specific timeframe
SELECT DISTINCT
    cu.id,
    cu.first_name,
    cu.last_name,
    cu.phone,
    MAX(cm.created_at) as last_message_date,
    COUNT(cm.id) as message_count
FROM customers cu
INNER JOIN campaign_messages cm ON cu.id = cm.customer_id
WHERE cm.created_at >= NOW() - INTERVAL $1
GROUP BY cu.id, cu.first_name, cu.last_name, cu.phone
HAVING COUNT(cm.id) > 0
ORDER BY last_message_date DESC;
```

### Customer Tag Management
```sql
-- Add or remove tags from customers
-- Add tags:
INSERT INTO customer_tags (customer_id, tag_id)
SELECT
    cu.id as customer_id,
    t.id as tag_id
FROM customers cu
CROSS JOIN tags t
WHERE
    cu.phone = ANY($1::text[])  -- Array of phone numbers
    AND t.name = ANY($2::text[]) -- Array of tag names
ON CONFLICT (customer_id, tag_id) DO NOTHING;

-- Remove tags:
DELETE FROM customer_tags ct
USING customers cu, tags t
WHERE
    ct.customer_id = cu.id
    AND ct.tag_id = t.id
    AND cu.phone = ANY($1::text[])  -- Array of phone numbers
    AND t.name = ANY($2::text[]);   -- Array of tag names
```

### Customer Analytics
```sql
-- Customer engagement analytics
WITH customer_activity AS (
    SELECT
        cu.id,
        cu.first_name,
        cu.last_name,
        COUNT(cm.id) as total_messages,
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered_messages,
        MAX(cm.created_at) as last_message_date,
        DATE_PART('day', NOW() - MAX(cm.created_at)) as days_since_last_message
    FROM customers cu
    LEFT JOIN campaign_messages cm ON cu.id = cm.customer_id
    GROUP BY cu.id, cu.first_name, cu.last_name
)
SELECT
    id,
    first_name,
    last_name,
    total_messages,
    delivered_messages,
    ROUND(delivered_messages * 100.0 / NULLIF(total_messages, 0), 2) as success_rate,
    last_message_date,
    days_since_last_message,
    CASE
        WHEN days_since_last_message <= 7 THEN 'Active'
        WHEN days_since_last_message <= 30 THEN 'Recent'
        ELSE 'Inactive'
    END as activity_status
FROM customer_activity
ORDER BY success_rate DESC, days_since_last_message ASC;
```

## Performance Optimization Queries

### Index Usage Analysis
```sql
-- Check query performance and index usage
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT c.*, COUNT(cm.id) as message_count
FROM campaigns c
LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### Database Size Monitoring
```sql
-- Monitor database table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### Slow Query Detection
```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- milliseconds
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Data Validation Queries

### Phone Number Validation
```sql
-- Find invalid phone numbers
SELECT
    id,
    first_name,
    last_name,
    phone,
    CASE
        WHEN phone ~ '^\+?[1-9]\d{1,14}$' THEN 'Valid'
        ELSE 'Invalid'
    END as validation_status
FROM customers
WHERE phone IS NOT NULL
AND phone !~ '^\+?[1-9]\d{1,14}$';
```

### Duplicate Detection
```sql
-- Find duplicate customers by phone or email
WITH duplicates AS (
    SELECT
        phone,
        email,
        COUNT(*) as duplicate_count,
        ARRAY_AGG(id ORDER BY id) as customer_ids
    FROM customers
    WHERE phone IS NOT NULL OR email IS NOT NULL
    GROUP BY phone, email
    HAVING COUNT(*) > 1
)
SELECT
    d.phone,
    d.email,
    d.duplicate_count,
    d.customer_ids,
    STRING_AGG(cu.first_name || ' ' || cu.last_name, ', ') as names
FROM duplicates d
LEFT JOIN customers cu ON cu.id = ANY(d.customer_ids)
GROUP BY d.phone, d.email, d.duplicate_count, d.customer_ids;
```

## Backup and Maintenance

### Campaign Archive
```sql
-- Archive old campaigns (move to archive table)
INSERT INTO campaign_archive
SELECT * FROM campaigns
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM campaigns
WHERE created_at < NOW() - INTERVAL '1 year'
AND id IN (SELECT id FROM campaign_archive);
```