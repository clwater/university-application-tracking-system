-- ==============================================
-- 临时禁用 RLS 策略 - 仅用于测试
-- ==============================================
-- 警告：这将暂时禁用所有安全策略，仅用于调试
-- 生产环境请使用 rls-policies.sql 配置正确的安全策略

-- 禁用 RLS
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE universities DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements DISABLE ROW LEVEL SECURITY;

-- 注意：这是临时解决方案
-- 生产环境中应该：
-- 1. 重新启用 RLS: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- 2. 执行 rls-policies.sql 配置正确的权限策略