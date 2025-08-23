-- 修复级联删除约束的SQL脚本
-- 在Supabase SQL编辑器中运行此脚本

-- 1. 查看当前外键约束
SELECT conname, confrelid::regclass as parent_table, conrelid::regclass as child_table
FROM pg_constraint 
WHERE contype = 'f' 
AND (conrelid::regclass::text = 'application_requirements' OR confrelid::regclass::text = 'applications');

-- 2. 删除现有的外键约束（如果存在）
ALTER TABLE application_requirements 
DROP CONSTRAINT IF EXISTS application_requirements_application_id_fkey;

-- 3. 重新创建外键约束，添加级联删除
ALTER TABLE application_requirements 
ADD CONSTRAINT application_requirements_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

-- 4. 验证约束已正确创建
SELECT 
  conname as constraint_name,
  confrelid::regclass as parent_table,
  conrelid::regclass as child_table,
  confdeltype as delete_action
FROM pg_constraint 
WHERE conname = 'application_requirements_application_id_fkey';

-- 说明：
-- delete_action 含义：
-- 'a' = NO ACTION
-- 'r' = RESTRICT  
-- 'c' = CASCADE (我们想要的)
-- 'n' = SET NULL
-- 'd' = SET DEFAULT