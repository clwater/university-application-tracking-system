-- ==============================================
-- 大学申请追踪系统 - RLS 行级安全策略
-- ==============================================
-- 在创建表结构后执行此脚本以配置行级安全

-- ==============================================
-- 1. 启用行级安全策略
-- ==============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. 学生表 RLS 策略
-- ==============================================

-- 学生可以查看和修改自己的信息
CREATE POLICY "Students can view own profile" ON students
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Students can update own profile" ON students
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Students can insert own profile" ON students
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 家长可以查看关联学生的信息
CREATE POLICY "Parents can view linked students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parents 
            WHERE parents.user_id = auth.uid()::text 
            AND students.id::text = ANY(parents.student_ids)
        )
    );

-- ==============================================
-- 3. 家长表 RLS 策略
-- ==============================================

-- 家长可以查看和修改自己的信息
CREATE POLICY "Parents can view own profile" ON parents
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Parents can update own profile" ON parents
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Parents can insert own profile" ON parents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 学生可以查看关联的家长信息
CREATE POLICY "Students can view linked parents" ON parents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.user_id = auth.uid()::text 
            AND parents.id::text = ANY(students.parent_ids)
        )
    );

-- ==============================================
-- 4. 大学表 RLS 策略
-- ==============================================

-- 所有认证用户都可以查看大学信息
CREATE POLICY "All authenticated users can view universities" ON universities
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 只有管理员可以修改大学信息 (暂时允许所有用户插入用于测试)
CREATE POLICY "Authenticated users can insert universities" ON universities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update universities" ON universities
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ==============================================
-- 5. 申请表 RLS 策略
-- ==============================================

-- 学生可以查看和管理自己的申请
CREATE POLICY "Students can view own applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = applications.student_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can insert own applications" ON applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = applications.student_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can update own applications" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = applications.student_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can delete own applications" ON applications
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = applications.student_id 
            AND students.user_id = auth.uid()::text
        )
    );

-- 家长可以查看关联学生的申请
CREATE POLICY "Parents can view linked student applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            JOIN parents ON students.id::text = ANY(parents.student_ids)
            WHERE students.id = applications.student_id 
            AND parents.user_id = auth.uid()::text
        )
    );

-- ==============================================
-- 6. 申请要求表 RLS 策略
-- ==============================================

-- 学生可以查看和管理自己申请的要求
CREATE POLICY "Students can view own application requirements" ON application_requirements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN students ON students.id = applications.student_id
            WHERE applications.id = application_requirements.application_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can insert own application requirements" ON application_requirements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN students ON students.id = applications.student_id
            WHERE applications.id = application_requirements.application_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can update own application requirements" ON application_requirements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN students ON students.id = applications.student_id
            WHERE applications.id = application_requirements.application_id 
            AND students.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Students can delete own application requirements" ON application_requirements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN students ON students.id = applications.student_id
            WHERE applications.id = application_requirements.application_id 
            AND students.user_id = auth.uid()::text
        )
    );

-- 家长可以查看关联学生的申请要求
CREATE POLICY "Parents can view linked student application requirements" ON application_requirements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN students ON students.id = applications.student_id
            JOIN parents ON students.id::text = ANY(parents.student_ids)
            WHERE applications.id = application_requirements.application_id 
            AND parents.user_id = auth.uid()::text
        )
    );

-- ==============================================
-- 7. 视图的 RLS 策略
-- ==============================================

-- 为视图启用 RLS (如果需要)
-- 注意: 视图的权限通常继承自底层表的 RLS 策略

-- ==============================================
-- 完成提示
-- ==============================================

-- RLS 策略配置完成！
--
-- 配置内容包括：
-- ✅ 所有表都启用了行级安全
-- ✅ 学生只能访问自己的数据
-- ✅ 家长可以访问关联学生的数据
-- ✅ 大学信息对所有认证用户可见
-- ✅ 申请和要求数据受到适当保护
--
-- 测试建议：
-- 1. 使用不同用户账户测试数据访问
-- 2. 确认跨用户数据访问被正确阻止
-- 3. 验证家长-学生关联权限正常工作

COMMENT ON SCHEMA public IS '大学申请追踪系统 - 已配置完整的行级安全策略';