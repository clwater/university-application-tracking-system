-- 正确版测试数据SQL脚本（基于真实表结构）
-- 请在Supabase SQL编辑器中运行此脚本

-- 1. 插入大学数据
INSERT INTO universities (
  id, name, country, state, city, us_news_ranking, 
  acceptance_rate, application_system, 
  tuition_in_state, tuition_out_state, application_fee,
  deadlines
) VALUES 
-- 美国顶尖大学
('550e8400-e29b-41d4-a716-446655440001', 'Harvard University', 'United States', 'Massachusetts', 'Cambridge', 1, 0.032, 'Common Application', 57261, 57261, 85, '{"early_decision": "2024-11-01", "regular_decision": "2024-01-01"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Stanford University', 'United States', 'California', 'Stanford', 2, 0.038, 'Common Application', 59479, 59479, 90, '{"early_action": "2024-11-01", "regular_decision": "2024-01-05"}'),
('550e8400-e29b-41d4-a716-446655440003', 'MIT', 'United States', 'Massachusetts', 'Cambridge', 3, 0.066, 'Common Application', 57590, 57590, 75, '{"early_action": "2024-11-01", "regular_decision": "2024-01-01"}'),
('550e8400-e29b-41d4-a716-446655440004', 'Yale University', 'United States', 'Connecticut', 'New Haven', 4, 0.046, 'Common Application', 62250, 62250, 80, '{"early_decision": "2024-11-01", "regular_decision": "2024-01-02"}'),
('550e8400-e29b-41d4-a716-446655440005', 'University of Pennsylvania', 'United States', 'Pennsylvania', 'Philadelphia', 5, 0.056, 'Common Application', 63452, 63452, 75, '{"early_decision": "2024-11-01", "regular_decision": "2024-01-05"}'),

-- 公立大学
('550e8400-e29b-41d4-a716-446655440006', 'UC Berkeley', 'United States', 'California', 'Berkeley', 20, 0.144, 'UC Application', 14226, 46326, 70, '{"regular_decision": "2023-11-30"}'),
('550e8400-e29b-41d4-a716-446655440007', 'UCLA', 'United States', 'California', 'Los Angeles', 25, 0.102, 'UC Application', 14436, 46436, 70, '{"regular_decision": "2023-11-30"}'),
('550e8400-e29b-41d4-a716-446655440008', 'University of Michigan', 'United States', 'Michigan', 'Ann Arbor', 28, 0.20, 'Common Application', 15948, 52266, 65, '{"early_action": "2024-11-01", "regular_decision": "2024-02-01"}'),

-- 加拿大大学
('550e8400-e29b-41d4-a716-446655440009', 'University of Toronto', 'Canada', 'Ontario', 'Toronto', NULL, 0.43, 'OUAC', 6100, 59310, 250, '{"regular_decision": "2024-01-15"}'),
('550e8400-e29b-41d4-a716-446655440010', 'University of British Columbia', 'Canada', 'British Columbia', 'Vancouver', NULL, 0.52, 'UBC Application', 5729, 40733, 118, '{"regular_decision": "2024-01-15"}'),

-- 英国大学
('550e8400-e29b-41d4-a716-446655440011', 'Oxford University', 'United Kingdom', 'England', 'Oxford', NULL, 0.175, 'UCAS', 11230, 37510, NULL, '{"ucas_deadline": "2023-10-16"}'),
('550e8400-e29b-41d4-a716-446655440012', 'Cambridge University', 'United Kingdom', 'England', 'Cambridge', NULL, 0.21, 'UCAS', 11230, 35517, NULL, '{"ucas_deadline": "2023-10-16"}'),

-- 澳洲大学
('550e8400-e29b-41d4-a716-446655440013', 'University of Melbourne', 'Australia', 'Victoria', 'Melbourne', NULL, 0.70, 'UAC', 33632, 45824, 100, '{"regular_decision": "2024-01-31"}'),
('550e8400-e29b-41d4-a716-446655440014', 'Australian National University', 'Australia', 'Australian Capital Territory', 'Canberra', NULL, 0.35, 'UAC', 37104, 46080, 100, '{"regular_decision": "2024-01-31"}');

-- 2. 插入学生数据
INSERT INTO students (
  id, user_id, name, email, graduation_year, gpa, sat_score, act_score, 
  target_countries, intended_majors, parent_ids
) VALUES 
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', '张小明', 'zhang.xiaoming@example.com', 2025, 3.8, 1450, 32, ARRAY['United States', 'Canada'], ARRAY['Computer Science', 'Mathematics'], ARRAY['770e8400-e29b-41d4-a716-446655440001']),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440102', '李小红', 'li.xiaohong@example.com', 2025, 3.9, 1520, 34, ARRAY['United States', 'United Kingdom'], ARRAY['Economics', 'Business Administration'], ARRAY['770e8400-e29b-41d4-a716-446655440002']),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440103', '王小强', 'wang.xiaoqiang@example.com', 2024, 3.7, 1380, 30, ARRAY['Canada', 'Australia'], ARRAY['Engineering', 'Physics'], ARRAY['770e8400-e29b-41d4-a716-446655440003']);

-- 3. 插入家长数据
INSERT INTO parents (
  id, user_id, name, email, student_ids
) VALUES 
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', '张先生', 'zhang.father@example.com', ARRAY['660e8400-e29b-41d4-a716-446655440001']),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440202', '李女士', 'li.mother@example.com', ARRAY['660e8400-e29b-41d4-a716-446655440002']),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440203', '王女士', 'wang.mother@example.com', ARRAY['660e8400-e29b-41d4-a716-446655440003']);

-- 4. 插入申请数据（注意date类型）
INSERT INTO applications (
  id, student_id, university_id, status, application_type, deadline, 
  submitted_date, decision_date, decision_type, notes
) VALUES 
-- 张小明的申请
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'submitted', 'regular_decision', '2024-01-01', '2023-12-15', NULL, NULL, '梦校申请，已提交所有材料'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'in_progress', 'regular_decision', '2024-01-05', NULL, NULL, NULL, '正在准备推荐信'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'accepted', 'regular_decision', '2023-11-30', '2023-11-25', '2024-03-15', 'accepted', '安全学校，已录取！'),

-- 李小红的申请
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'submitted', 'early_decision', '2024-01-02', '2023-12-20', NULL, NULL, '早申请已提交'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'in_progress', 'regular_decision', '2024-01-05', NULL, NULL, NULL, '文书还需要修改'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', 'not_started', NULL, '2023-10-16', NULL, NULL, NULL, '需要准备IELTS考试'),

-- 王小强的申请
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'submitted', 'regular_decision', '2024-02-01', '2024-01-25', NULL, NULL, '工程专业申请'),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 'accepted', 'regular_decision', '2024-01-15', '2024-01-10', '2024-04-01', 'accepted', '多伦多大学工程系录取'),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'rejected', 'regular_decision', '2024-01-31', '2024-01-20', '2024-03-20', 'rejected', '墨尔本大学工程系未录取');

-- 5. 插入申请要求数据（注意date类型）
INSERT INTO application_requirements (
  id, application_id, requirement_type, status, deadline, notes
) VALUES 
-- 哈佛申请要求
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Personal Statement', 'completed', '2023-12-15', '个人陈述已完成，经过3轮修改'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Teacher Recommendation', 'completed', '2023-12-15', '数学老师推荐信已提交'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'SAT Score', 'completed', '2023-12-15', 'SAT 1450分官方成绩单'),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Official Transcript', 'completed', '2023-12-15', '学校已寄送官方成绩单'),

-- 斯坦福申请要求（进行中）
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Personal Statement', 'in_progress', '2024-01-05', '斯坦福个人陈述第二稿修改中'),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'Counselor Recommendation', 'not_started', '2024-01-05', '已联系升学顾问'),
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', 'Research Portfolio', 'not_started', '2024-01-05', '需要整理之前的项目'),

-- 牛津申请要求（未开始）
('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440006', 'IELTS Score', 'not_started', '2023-10-16', '需要达到7.5分'),
('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440006', 'Personal Statement', 'not_started', '2023-10-16', '需要了解专业要求'),

-- UC Berkeley申请要求（已完成）
('990e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440003', 'UC PIQs', 'completed', '2023-11-30', '4篇UC个人见解问题已完成'),
('990e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440003', 'Self-Reported Transcript', 'completed', '2023-11-30', '已在UC系统中填写'),

-- 多伦多大学申请要求（已录取）
('990e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440008', 'Supplemental Essays', 'completed', '2024-01-15', '工程系专业文书已完成'),
('990e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440008', 'Official Transcript', 'completed', '2024-01-15', '已通过学校寄送');

-- 查询验证数据
SELECT 
  '大学数据' as table_name, 
  COUNT(*) as record_count 
FROM universities
UNION ALL
SELECT 
  '学生数据' as table_name, 
  COUNT(*) as record_count 
FROM students
UNION ALL  
SELECT 
  '家长数据' as table_name, 
  COUNT(*) as record_count 
FROM parents
UNION ALL
SELECT 
  '申请数据' as table_name, 
  COUNT(*) as record_count 
FROM applications
UNION ALL
SELECT 
  '申请要求数据' as table_name, 
  COUNT(*) as record_count 
FROM application_requirements;