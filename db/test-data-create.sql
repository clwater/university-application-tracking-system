-- ==============================================
-- 大学申请追踪系统 - 数据库表结构
-- ==============================================
-- 执行此脚本在 Supabase 中创建完整的数据库结构

-- ==============================================
-- 1. 创建枚举类型
-- ==============================================

-- 申请状态枚举
CREATE TYPE application_status AS ENUM (
  'not_started',    -- 未开始
  'in_progress',    -- 进行中
  'submitted',      -- 已提交
  'under_review',   -- 审核中
  'accepted',       -- 已录取
  'rejected',       -- 已拒绝
  'waitlisted'      -- 候补名单
);

-- 申请类型枚举
CREATE TYPE application_type AS ENUM (
  'early_decision',     -- 提前决定 (ED)
  'early_action',       -- 提前行动 (EA)
  'regular_decision',   -- 常规决定 (RD)
  'rolling_admission'   -- 滚动录取
);

-- 决定类型枚举
CREATE TYPE decision_type AS ENUM (
  'accepted',   -- 录取
  'rejected',   -- 拒绝
  'waitlisted'  -- 候补
);

-- 要求状态枚举
CREATE TYPE requirement_status AS ENUM (
  'not_started',  -- 未开始
  'in_progress',  -- 进行中
  'completed'     -- 已完成
);

-- 用户角色枚举
CREATE TYPE user_role AS ENUM (
  'student',  -- 学生
  'parent',   -- 家长
  'teacher',  -- 老师
  'admin'     -- 管理员
);

-- ==============================================
-- 2. 创建主要数据表
-- ==============================================

-- 学生表
CREATE TABLE students (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL,
                          graduation_year INTEGER,
                          gpa DECIMAL(3,2),           -- GPA (0.00 - 4.00)
                          sat_score INTEGER,          -- SAT 总分 (400-1600)
                          act_score INTEGER,          -- ACT 总分 (1-36)
                          target_countries TEXT[],    -- 目标国家数组
                          intended_majors TEXT[],     -- 意向专业数组
                          user_id TEXT NOT NULL,      -- 对应 auth.users.id
                          parent_ids TEXT[],          -- 关联的家长 ID 数组
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
                          CONSTRAINT students_email_unique UNIQUE (email),
                          CONSTRAINT students_gpa_check CHECK (gpa >= 0 AND gpa <= 4),
                          CONSTRAINT students_sat_check CHECK (sat_score >= 400 AND sat_score <= 1600),
                          CONSTRAINT students_act_check CHECK (act_score >= 1 AND act_score <= 36),
                          CONSTRAINT students_graduation_year_check CHECK (graduation_year >= 2020 AND graduation_year <= 2030)
);

-- 家长表
CREATE TABLE parents (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         name VARCHAR(255) NOT NULL,
                         email VARCHAR(255) NOT NULL,
                         user_id TEXT NOT NULL,      -- 对应 auth.users.id
                         student_ids TEXT[],         -- 关联的学生 ID 数组
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
                         CONSTRAINT parents_email_unique UNIQUE (email)
);

-- 大学表
CREATE TABLE universities (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              name VARCHAR(255) NOT NULL,
                              country VARCHAR(100),
                              state VARCHAR(100),
                              city VARCHAR(100),
                              us_news_ranking INTEGER,
                              acceptance_rate DECIMAL(4,4),        -- 录取率 (0.0000 - 1.0000)
                              application_system VARCHAR(100),     -- 申请系统 (Common App, Coalition, etc.)
                              tuition_in_state DECIMAL(10,2),      -- 州内学费
                              tuition_out_state DECIMAL(10,2),     -- 州外学费
                              application_fee DECIMAL(8,2),        -- 申请费
                              deadlines JSONB,                     -- 申请截止日期 (JSON格式)
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
                              CONSTRAINT universities_acceptance_rate_check CHECK (acceptance_rate >= 0 AND acceptance_rate <= 1),
                              CONSTRAINT universities_ranking_check CHECK (us_news_ranking > 0),
                              CONSTRAINT universities_tuition_check CHECK (tuition_in_state >= 0 AND tuition_out_state >= 0),
                              CONSTRAINT universities_fee_check CHECK (application_fee >= 0)
);

-- 申请表
CREATE TABLE applications (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              student_id UUID NOT NULL,
                              university_id UUID NOT NULL,
                              application_type application_type,
                              deadline DATE,
                              status application_status DEFAULT 'not_started',
                              submitted_date DATE,
                              decision_date DATE,
                              decision_type decision_type,
                              notes TEXT,
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 外键约束
                              CONSTRAINT applications_student_id_fkey
                                  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                              CONSTRAINT applications_university_id_fkey
                                  FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,

    -- 检查约束
                              CONSTRAINT applications_dates_check CHECK (
                                  submitted_date IS NULL OR deadline IS NULL OR submitted_date <= deadline
                                  ),
                              CONSTRAINT applications_decision_check CHECK (
                                  (decision_date IS NULL AND decision_type IS NULL) OR
                                  (decision_date IS NOT NULL AND decision_type IS NOT NULL)
                                  ),

    -- 唯一约束 (一个学生不能向同一所大学重复申请同种类型)
                              CONSTRAINT applications_unique UNIQUE (student_id, university_id, application_type)
);

-- 申请要求表
CREATE TABLE application_requirements (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          application_id UUID NOT NULL,
                                          requirement_type VARCHAR(100) NOT NULL,   -- 要求类型 (文书、推荐信、成绩单等)
                                          status requirement_status DEFAULT 'not_started',
                                          deadline DATE,
                                          notes TEXT,
                                          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 外键约束
                                          CONSTRAINT application_requirements_application_id_fkey
                                              FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,

    -- 唯一约束 (同一个申请不能有重复的要求类型)
                                          CONSTRAINT application_requirements_unique UNIQUE (application_id, requirement_type)
);

-- ==============================================
-- 3. 创建索引优化查询性能
-- ==============================================

-- 学生表索引
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_graduation_year ON students(graduation_year);
CREATE INDEX idx_students_email ON students(email);

-- 家长表索引
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_parents_email ON parents(email);

-- 大学表索引
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_country_state ON universities(country, state);
CREATE INDEX idx_universities_ranking ON universities(us_news_ranking);
CREATE INDEX idx_universities_acceptance_rate ON universities(acceptance_rate);

-- 申请表索引
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_university_id ON applications(university_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_deadline ON applications(deadline);
CREATE INDEX idx_applications_decision_date ON applications(decision_date);

-- 申请要求表索引
CREATE INDEX idx_application_requirements_application_id ON application_requirements(application_id);
CREATE INDEX idx_application_requirements_status ON application_requirements(status);
CREATE INDEX idx_application_requirements_deadline ON application_requirements(deadline);

-- 数组字段的 GIN 索引 (用于数组查询优化)
CREATE INDEX idx_students_target_countries_gin ON students USING GIN(target_countries);
CREATE INDEX idx_students_intended_majors_gin ON students USING GIN(intended_majors);
CREATE INDEX idx_students_parent_ids_gin ON students USING GIN(parent_ids);
CREATE INDEX idx_parents_student_ids_gin ON parents USING GIN(student_ids);

-- JSONB 字段索引
CREATE INDEX idx_universities_deadlines_gin ON universities USING GIN(deadlines);

-- ==============================================
-- 4. 创建更新时间触发器
-- ==============================================

-- 创建更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加 updated_at 触发器
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_requirements_updated_at
    BEFORE UPDATE ON application_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 5. 插入基础数据 (可选)
-- ==============================================

-- 插入一些常见的申请要求类型作为参考
-- 注意: 这些只是示例，实际使用时会根据具体申请动态创建

-- 示例: 常见申请要求类型
/*
INSERT INTO application_requirements (application_id, requirement_type, status) VALUES
-- 这里的 application_id 需要替换为实际的申请 ID
('your-application-id', '个人陈述', 'not_started'),
('your-application-id', '推荐信1', 'not_started'),
('your-application-id', '推荐信2', 'not_started'),
('your-application-id', '成绩单', 'not_started'),
('your-application-id', '语言成绩', 'not_started'),
('your-application-id', '标化成绩', 'not_started'),
('your-application-id', '财务证明', 'not_started'),
('your-application-id', '作品集', 'not_started'),
('your-application-id', '面试', 'not_started');
*/

-- ==============================================
-- 6. 创建有用的视图 (可选)
-- ==============================================

-- 申请概览视图 (包含学生和大学信息)
CREATE VIEW applications_overview AS
SELECT
    a.id,
    a.status,
    a.application_type,
    a.deadline,
    a.submitted_date,
    a.decision_date,
    a.decision_type,
    s.name as student_name,
    s.email as student_email,
    u.name as university_name,
    u.country,
    u.state,
    u.us_news_ranking,
    u.acceptance_rate,
    a.created_at,
    a.updated_at
FROM applications a
         JOIN students s ON a.student_id = s.id
         JOIN universities u ON a.university_id = u.id;

-- 申请统计视图
CREATE VIEW application_stats AS
SELECT
    s.id as student_id,
    s.name as student_name,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN a.status = 'waitlisted' THEN 1 END) as waitlisted_count,
    COUNT(CASE WHEN a.status IN ('not_started', 'in_progress') THEN 1 END) as pending_count
FROM students s
         LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.name;

-- ==============================================
-- 完成提示
-- ==============================================

-- 数据库表结构创建完成！
--
-- 创建的内容包括：
-- ✅ 5个枚举类型 (申请状态、申请类型等)
-- ✅ 5个主要数据表 (students, parents, universities, applications, application_requirements)
-- ✅ 完整的外键约束和检查约束
-- ✅ 性能优化索引 (包括 GIN 索引)
-- ✅ 自动更新时间戳触发器
-- ✅ 实用的数据库视图
--
-- 下一步：
-- 1. 执行 RLS 策略配置 (rls-policies-simple.sql)
-- 2. 导入测试数据 (test-data-real-users.sql)
-- 3. 在应用中测试数据库连接和查询

COMMENT ON DATABASE postgres IS '大学申请追踪系统数据库 - 支持学生和家长协作管理申请流程';