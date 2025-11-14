-- Database Optimization Commands for DNwerks
-- Run these commands in Supabase SQL Editor
-- Back up your database before running these commands

-- Phase 1: Strategic Index Creation
-- ==================================

-- 1. Composite index for customers filtering by user_id and status with ordering
-- Improves: Contacts page loading, user-specific customer queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_user_status_created
ON customers(user_id, status, created_at DESC);

-- 2. Composite index for customers filtering by user_id and state with ordering
-- Improves: State-based filtering, geographic queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_user_state_created
ON customers(user_id, state, created_at DESC);

-- 3. Optimized GIN index for tags filtering
-- Improves: Tag search performance, array operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_tags_gin
ON customers USING gin(tags) WHERE tags IS NOT NULL;

-- 4. Composite index for campaigns by user and status
-- Improves: Campaign dashboard, status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_user_status_created
ON campaigns(user_id, status, created_at DESC);

-- 5. Composite index for campaign messages with status
-- Improves: Message analytics, delivery tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_campaign_status
ON messages(campaign_id, status);

-- 6. Index for message delivery tracking
-- Improves: Performance analytics, timeline queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_status_sent_at
ON messages(status, sent_at);

-- 7. Index for user_profiles status filtering
-- Improves: Admin dashboard, user management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_status_approved
ON user_profiles(status, approved_at);

-- 8. Partial index for active users only
-- Improves: Active customer queries, targeting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_active_users
ON customers(user_id, created_at DESC) WHERE status = 'active';

-- 9. Composite index for invite codes management
-- Improves: Admin invite management, code validation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invite_codes_active_expires
ON invite_codes(is_active, expires_at);

-- 10. Index for campaign templates by category and usage
-- Improves: Template browsing, popular templates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_category_usage
ON campaign_templates(category, usage_count DESC);

-- Phase 2: Database Statistics Update
-- ==================================

-- Update database statistics for better query planning
ANALYZE customers;
ANALYZE campaigns;
ANALYZE messages;
ANALYZE user_profiles;
ANALYZE campaign_templates;
ANALYZE invite_codes;

-- Phase 3: Performance Verification Queries
-- =========================================

-- Verify indexes were created successfully
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check table sizes after optimization
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Test query performance improvements
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, user_id, phone, first_name, last_name, email, status, state, created_at, tags
FROM customers
WHERE user_id = 'your-test-user-id'
AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;