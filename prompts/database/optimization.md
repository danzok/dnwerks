# PostgreSQL Optimization Patterns

## Query Optimization

### Analyze Query Performance
```sql
-- Get detailed query execution plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON)
SELECT
    c.name,
    COUNT(cm.id) as message_count,
    COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered_count
FROM campaigns c
LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.name
ORDER BY message_count DESC;

-- Check for sequential scans on large tables
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    ROUND(seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100, 2) as seq_scan_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan_tup_read DESC;
```

### Index Strategy for SMS Campaign System
```sql
-- Optimize campaign queries
CREATE INDEX CONCURRENTLY idx_campaigns_status_created_desc
ON campaigns(status, created_at DESC);

-- Optimize customer lookups by phone
CREATE INDEX CONCURRENTLY idx_customers_phone_hash
ON customers USING hash(phone);

-- Optimize message status tracking
CREATE INDEX CONCURRENTLY idx_campaign_messages_status_created
ON campaign_messages(status, created_at);

-- Partial index for active campaigns only
CREATE INDEX CONCURRENTLY idx_campaigns_active_scheduled
ON campaigns(scheduled_at, created_at)
WHERE status IN ('scheduled', 'sending');

-- Composite index for customer tag searches
CREATE INDEX CONCURRENTLY idx_customer_tags_customer_tag
ON customer_tags(customer_id, tag_id);
```

### Partitioning Strategy
```sql
-- Partition campaign_messages by month for large datasets
CREATE TABLE campaign_messages_partitioned (
    LIKE campaign_messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create automatic partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
    i integer;
BEGIN
    -- Create partitions for next 12 months
    FOR i IN 0..11 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::interval);
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'campaign_messages_' || to_char(start_date, 'YYYY_MM');

        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                        FOR VALUES FROM (%L) TO (%L)',
                       partition_name, 'campaign_messages_partitioned',
                       start_date, end_date);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run monthly
SELECT create_monthly_partitions();
```

## Performance Monitoring

### Slow Query Analysis
```sql
-- Enable pg_stat_statements if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking more than 100ms
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Database Size Monitoring
```sql
-- Table sizes for capacity planning
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Bloat detection
SELECT
    schemaname,
    tablename,
    ROUND(CASE WHEN otta=0 THEN 0.0 ELSE sml.relpages/otta::numeric END,1) AS tbloat,
    CASE WHEN relpages < otta THEN 0 ELSE relpages::bigint - otta END AS wastedpages,
    CASE WHEN relpages < otta THEN 0 ELSE bs*(sml.relpages-otta)::bigint END AS wastedbytes,
    CASE WHEN relpages < otta THEN 0 ELSE (bs*(relpages-otta))::bigint END AS wastedsize
FROM (
    SELECT
        schemaname, tablename, cc.reltuples, cc.relpages, bs,
        CEIL((cc.reltuples*((datahdr+ma-
            (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
    FROM (
        SELECT
            ma,bs,schemaname,tablename,
            (datawidth+(hdr+ma-(CASE WHEN hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
            (maxfracsum*(nullhdr+ma-(CASE WHEN nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
        FROM (
            SELECT
                schemaname, tablename, hdr, ma, bs,
                SUM((1-null_frac)*avg_width) AS datawidth,
                MAX(null_frac) AS maxfracsum,
                hdr+(
                    SELECT 1+COUNT(*)*(8-CASE WHEN avg_width<=248 THEN 1 ELSE 2 END)
                    FROM pg_stats s2
                    WHERE null_frac<>0 AND s2.schemaname=s.schemaname AND s2.tablename=s.tablename
                ) AS nullhdr
            FROM pg_stats s, (
                SELECT
                    (SELECT current_setting('block_size')::integer) AS bs,
                    CASE WHEN substring(v,12,3) IN ('8.0','8.1','8.2') THEN 27 ELSE 23 END AS hdr,
                    CASE WHEN v ~ 'mingw32' THEN 8 ELSE 4 END AS ma
                FROM (SELECT version() AS v) AS foo
            ) AS constants
            WHERE schemaname='public'
            GROUP BY 1,2,3,4,5
        ) AS foo
    ) AS rs
    JOIN pg_class cc ON cc.relname = rs.tablename
    JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname AND nn.nspname <> 'information_schema'
) AS sml
WHERE tbloat > 1.5
ORDER BY wastedibytes DESC;
```

## Connection Pooling and Resource Management

### Connection Pooling Setup
```sql
-- Configure connection limits
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
```

### Query Timeouts and Resource Limits
```sql
-- Set statement timeout for long-running queries
SET LOCAL statement_timeout = '30s'; -- For current transaction only

-- Set globally (requires restart)
ALTER SYSTEM SET statement_timeout = '5min';

-- Create resource queue for different user types
ALTER ROLE readonly SET statement_timeout = '1min';
ALTER ROLE analytics SET statement_timeout = '10min';
ALTER ROLE app_user SET statement_timeout = '5min';
```

## Caching Strategies

### Materialized Views for Reporting
```sql
-- Create materialized view for campaign analytics
CREATE MATERIALIZED VIEW campaign_analytics AS
SELECT
    c.id,
    c.name,
    c.created_at as campaign_created,
    COUNT(cm.id) as total_messages,
    COUNT(CASE WHEN cm.status = 'sent' THEN 1 END) as sent_count,
    COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN cm.status = 'failed' THEN 1 END) as failed_count,
    ROUND(
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) * 100.0 /
        NULLIF(COUNT(cm.id), 0), 2
    ) as delivery_rate,
    AVG(CASE WHEN cm.status = 'delivered'
        THEN EXTRACT(EPOCH FROM (cm.delivered_at - cm.sent_at))
        ELSE NULL END) as avg_delivery_time_seconds
FROM campaigns c
LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
GROUP BY c.id, c.name, c.created_at;

-- Create unique index for refresh concurrency
CREATE UNIQUE INDEX idx_campaign_analytics_id ON campaign_analytics(id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_campaign_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
SELECT cron.schedule('refresh-campaign-analytics', '0 */2 * * *', 'SELECT refresh_campaign_analytics();');
```

### Query Result Caching
```sql
-- Create function for cached customer segment counts
CREATE OR REPLACE FUNCTION get_customer_segment_count(segment_name text)
RETURNS integer AS $$
DECLARE
    result integer;
    cache_key text := 'segment_count_' || segment_name;
    cached_value integer;
BEGIN
    -- Try to get from cache (using a simple table-based cache)
    SELECT value INTO cached_value
    FROM query_cache
    WHERE key = cache_key
    AND expires_at > NOW();

    IF cached_value IS NOT NULL THEN
        RETURN cached_value;
    END IF;

    -- Calculate actual result
    EXECUTE format('
        SELECT COUNT(DISTINCT sm.customer_id)
        FROM customer_segments cs
        JOIN segment_memberships sm ON cs.id = sm.segment_id
        WHERE cs.name = %L
    ', segment_name) INTO result;

    -- Cache result for 1 hour
    INSERT INTO query_cache (key, value, expires_at)
    VALUES (cache_key, result, NOW() + INTERVAL '1 hour')
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        expires_at = EXCLUDED.expires_at;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## Bulk Operations Optimization

### Efficient Bulk Inserts
```sql
-- Bulk insert with COPY command (most efficient)
COPY campaign_messages (campaign_id, customer_id, phone_number, message_content, status)
FROM STDIN WITH (FORMAT csv, HEADER false);

-- For application code: batch inserts
INSERT INTO campaign_messages (campaign_id, customer_id, phone_number, message_content, status)
VALUES
    (uuid1, uuid2, '+1234567890', 'Message 1', 'pending'),
    (uuid3, uuid4, '+1234567891', 'Message 2', 'pending'),
    (uuid5, uuid6, '+1234567892', 'Message 3', 'pending')
ON CONFLICT DO NOTHING;
```

### Efficient Updates
```sql
-- Update multiple rows in single statement
UPDATE campaign_messages
SET
    status = CASE
        WHEN id = ANY($1::uuid[]) THEN 'sent'
        WHEN id = ANY($2::uuid[]) THEN 'failed'
        ELSE status
    END,
    sent_at = CASE
        WHEN id = ANY($1::uuid[]) THEN NOW()
        ELSE sent_at
    END,
    error_message = CASE
        WHEN id = ANY($2::uuid[]) THEN 'Delivery timeout'
        ELSE error_message
    END
WHERE id = ANY($1::uuid[] OR $2::uuid[]);
```

### Batch Processing Pattern
```sql
-- Process messages in batches to avoid locking
CREATE OR REPLACE FUNCTION process_pending_messages(batch_size integer DEFAULT 1000)
RETURNS integer AS $$
DECLARE
    processed_count integer := 0;
    batch_ids uuid[];
BEGIN
    LOOP
        -- Get a batch of pending messages
        SELECT array_agg(id)
        INTO batch_ids
        FROM campaign_messages
        WHERE status = 'pending'
        AND next_retry_at <= NOW()
        LIMIT batch_size;

        EXIT WHEN batch_ids IS NULL;

        -- Process this batch
        UPDATE campaign_messages
        SET status = 'processing',
            next_retry_at = NULL
        WHERE id = ANY(batch_ids);

        -- Here you would call your SMS sending service
        -- For example: SELECT send_sms_batch(batch_ids);

        processed_count := processed_count + array_length(batch_ids, 1);

        -- Add small delay to prevent overwhelming
        PERFORM pg_sleep(0.1);
    END LOOP;

    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;
```

## Maintenance and Cleanup

### Automated Maintenance
```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;

    -- Clean up old audit logs (keep 1 year)
    DELETE FROM audit_logs
    WHERE timestamp < NOW() - INTERVAL '1 year';

    -- Clean up old failed messages (keep 30 days)
    DELETE FROM campaign_messages
    WHERE status = 'failed'
    AND created_at < NOW() - INTERVAL '30 days';

    -- Rebuild corrupted indexes if needed
    REINDEX DATABASE dnwerks;

    -- Update materialized views
    PERFORM refresh_campaign_analytics();

    RAISE NOTICE 'Maintenance completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily maintenance (requires pg_cron)
SELECT cron.schedule('daily-maintenance', '0 3 * * *', 'SELECT perform_maintenance();');
```

### Performance Alert Queries
```sql
-- Alert on slow queries
CREATE OR REPLACE FUNCTION check_slow_queries()
RETURNS TABLE(query_text text, avg_time numeric, call_count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        LEFT(query, 100) as query_text,
        mean_exec_time as avg_time,
        calls as call_count
    FROM pg_stat_statements
    WHERE mean_exec_time > 5000  -- 5 seconds
    AND calls > 10
    ORDER BY mean_exec_time DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Alert on table bloat
CREATE OR REPLACE FUNCTION check_table_bloat()
RETURNS TABLE(table_name text, bloat_pct numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tablename,
        ROUND(((relpages - otta)::numeric / relpages) * 100, 2) as bloat_pct
    FROM (
        SELECT
            t.tablename,
            relpages,
            CEIL(reltuples * (24 + t.header_len)) AS otta
        FROM pg_class c
        JOIN pg_tables t ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND relpages > 100
    ) t
    WHERE relpages > otta
    ORDER BY bloat_pct DESC;
END;
$$ LANGUAGE plpgsql;

---

# AI Prompt: Supabase Free Plan Database Optimization

## Context
I need help optimizing my Supabase database (Free Plan) with these constraints:
- **Database Size**: 500 MB limit
- **RAM**: 500 MB (Shared CPU)
- **Monthly Active Users**: 50,000 limit
- **Egress**: 5 GB limit
- **File Storage**: 1 GB limit

## Your Task: Multi-Phase Analysis Approach

**IMPORTANT**: Do NOT immediately suggest solutions. Follow this structured analysis process:

### Phase 1: Information Gathering
Ask me for and analyze:
1. Current database schema (tables, columns, relationships)
2. Frequently executed queries from my application
3. Results from these diagnostic queries:
   ```sql
   -- Database size
   select pg_size_pretty(pg_database_size(current_database())) as database_size;

   -- Table sizes
   select
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
   from
     pg_tables
   where
     schemaname not in ('pg_catalog', 'information_schema')
   order by
     pg_total_relation_size(schemaname||'.'||tablename) desc
   limit 20;

   -- Unused indexes
   select
     schemaname,
     tablename,
     indexname,
     idx_scan,
     pg_size_pretty(pg_relation_size(indexrelid)) as index_size
   from
     pg_stat_user_indexes
   where
     idx_scan = 0
   and
     indexrelname not like '%_pkey'
   order by
     pg_relation_size(indexrelid) desc;
   ```

### Phase 2: Analysis & Identification
Before suggesting any changes:
1. **Identify Bottlenecks**: Pinpoint exact issues (slow queries, large tables, missing indexes, bloat)
2. **Assess Risk Level**: Categorize each potential optimization as:
   - Zero Risk (e.g., VACUUM ANALYZE)
   - Low Risk (e.g., adding indexes with CONCURRENTLY)
   - Medium Risk (e.g., data archival)
   - High Risk (e.g., schema changes)
3. **Estimate Impact**: Quantify expected improvements and trade-offs

### Phase 3: Recommendation with Confirmation
For EACH optimization suggestion, provide:

#### 1. Problem Statement
- What specific issue does this address?
- Current metrics (size, query time, etc.)

#### 2. Proposed Solution
- Exact SQL statement(s) following the style guide below
- Step-by-step execution plan

#### 3. Impact Analysis
**Positive Impacts:**
- Performance improvement (estimated %)
- Storage saved (estimated MB)
- Query speed improvement (estimated ms)

**Negative Impacts:**
- Write performance impact (if any)
- Additional storage required (for indexes)
- Temporary CPU/memory usage
- Downtime or locking (if any)

#### 4. Rollback Plan
- How to undo the change if needed
- What to monitor after implementation

#### 5. Confirmation Required
Ask me: "Do you want to proceed with this optimization? Shall I provide the implementation SQL?"

---

## SQL Style Guide Requirements

All SQL recommendations MUST follow these rules:

### General Rules
```sql
-- Use lowercase for SQL keywords
-- Use snake_case for identifiers
-- Add comments for complex logic

/* Block comment example:
   This CTE calculates department statistics */

-- Line comment for single line explanations
```

### Naming Conventions
- Tables: plural, snake_case (e.g., `users`, `order_items`)
- Columns: singular, snake_case (e.g., `user_id`, `created_at`)
- Foreign keys: `{singular_table_name}_id` (e.g., `author_id` references `authors`)
- Avoid prefixes like `tbl_` or `idx_`
- Names under 63 characters

### Table Structure
```sql
-- Always include id as identity generated always
-- Always add table comments
-- Always specify schema (public)

create table public.books (
  id bigint generated always as identity primary key,
  title text not null,
  author_id bigint references public.authors (id),
  created_at timestamptz default now()
);

comment on table public.books is 'Stores all books in the library catalog with author references';
```

### Index Creation
```sql
-- Always use CONCURRENTLY to avoid locking
-- Use descriptive names: idx_{table}_{column(s)}
-- Add comments explaining the purpose

create index concurrently idx_books_author_id
on public.books (author_id);

comment on index idx_books_author_id is 'Speeds up queries filtering books by author';

-- Composite index
create index concurrently idx_orders_user_status
on public.orders (user_id, status);

-- Partial index for specific conditions
create index concurrently idx_orders_pending
on public.orders (created_at)
where status = 'pending';
```

### Query Formatting

**Simple Queries:**
```sql
select * from public.employees where end_date is null;

update public.employees set end_date = '2023-12-31' where employee_id = 1001;
```

**Complex Queries:**
```sql
select
  employees.first_name,
  employees.last_name,
  departments.department_name
from
  public.employees
join
  public.departments on employees.department_id = departments.department_id
where
  employees.start_date between '2021-01-01' and '2021-12-31'
and
  employees.status = 'employed'
order by
  employees.last_name;
```

**CTEs (For Complex Logic):**
```sql
with active_users as (
  -- Get all users who logged in last 30 days
  select
    users.id,
    users.email,
    users.created_at
  from
    public.users
  where
    users.last_login_at > now() - interval '30 days'
),
user_orders as (
  -- Count orders per active user
  select
    orders.user_id,
    count(*) as order_count,
    sum(orders.total_amount) as total_spent
  from
    public.orders
  where
    orders.user_id in (select id from active_users)
  group by
    orders.user_id
)
select
  active_users.email,
  coalesce(user_orders.order_count, 0) as order_count,
  coalesce(user_orders.total_spent, 0) as total_spent
from
  active_users
left join
  user_orders on active_users.id = user_orders.user_id
order by
  user_orders.total_spent desc nulls last;
```

### Aliases
```sql
-- Always use 'as' keyword
select
  count(*) as total_employees,
  avg(salary) as average_salary
from
  public.employees
where
  end_date is null;
```

---

## Optimization Categories to Consider

### 1. Index Optimization
- Add missing indexes for frequently queried columns
- Remove unused indexes to save space
- Create composite indexes for multi-column queries
- Implement partial indexes for filtered queries

### 2. Query Optimization
- Implement pagination (LIMIT/OFFSET or cursor-based)
- Select only needed columns (avoid SELECT *)
- Optimize JOINs with proper indexes
- Rewrite N+1 queries

### 3. Storage Optimization
- Run VACUUM ANALYZE to reclaim space
- Archive or delete old data
- Compress large text columns
- Identify and remove duplicate data

### 4. RLS (Row Level Security) Optimization
- Ensure RLS policies have supporting indexes
- Simplify complex RLS conditions
- Consider denormalization for RLS-heavy queries

### 5. Schema Optimization
- Normalize over-denormalized tables
- Add appropriate constraints (NOT NULL, CHECK)
- Use appropriate data types (avoid oversized types)
- Consider partitioning for very large tables

---

## Safety Requirements

Before any recommendation:
1. ✅ Assume I will backup first (remind me to do so)
2. ✅ Prefer `CONCURRENTLY` for index operations
3. ✅ Suggest testing in development first
4. ✅ Provide rollback instructions
5. ✅ Warn about peak hours for heavy operations
6. ✅ Estimate execution time for long-running queries

Never suggest:
- ❌ `VACUUM FULL` (locks tables)
- ❌ `REINDEX` without `CONCURRENTLY`
- ❌ Dropping tables or columns without confirmation
- ❌ Bulk operations without batch processing
- ❌ Schema changes during peak hours

---

## Output Format for Each Recommendation

```
### Optimization #X: [Brief Title]

**Problem Identified:**
[Describe the issue with current metrics]

**Proposed Solution:**
[Explain the approach]

**SQL Implementation:**
```sql
-- [Comments explaining each step]
[SQL statements following style guide]
```

**Impact Analysis:**

✅ **Positive Impacts:**
- Performance: [estimated improvement]
- Storage: [estimated savings]
- Other benefits: [list]

⚠️ **Negative Impacts:**
- [Any performance trade-offs]
- [Storage overhead if any]
- [Temporary resource usage]

**Execution Steps:**
1. [Step-by-step instructions]
2. [Include verification queries]
3. [Monitoring commands]

**Rollback Plan:**
```sql
-- [SQL to undo changes if needed]
```

**Verification Query:**
```sql
-- [Query to confirm optimization worked]
```

**Ready to Proceed?**
- [ ] I have backed up my database
- [ ] I have tested in development
- [ ] I understand the impacts
- [ ] Proceed with implementation: YES / NO
```

---

## Example Dialog Flow

**You:** "I need to optimize my Supabase database."

**AI:** "I'll help you optimize your database systematically. First, I need to understand your current setup. Please provide:

1. Your database schema (table definitions)
2. Results from these diagnostic queries: [queries]
3. Your most frequently executed queries
4. Your application type and main features

Once I have this information, I'll analyze and provide specific, safe recommendations with full impact assessment."

**You:** [Provides information]

**AI:** "Thank you. I've analyzed your database and identified 5 optimization opportunities. Let me present them in priority order, starting with zero-risk optimizations:

### Optimization #1: Run VACUUM ANALYZE (Zero Risk)
[Full details with impact analysis]
Shall I proceed with the next recommendation?"

---

## Ready to Start?

Please provide:
1. **Database Schema**: Share your table definitions
2. **Query Results**: Run the diagnostic queries above
3. **Common Queries**: Your 5-10 most frequent queries
4. **Application Context**: What type of app? Main features?

I'll then analyze and provide prioritized, safe optimization recommendations.
```