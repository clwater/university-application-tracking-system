# 大学申请追踪系统

一个全面的大学申请管理平台，帮助学生和家长追踪申请进度、管理截止日期和要求。

## 🚀 功能特色

### 核心功能
- **用户角色管理**: 支持学生和家长两种角色，具有不同的权限和功能
- **申请追踪**: 完整的申请生命周期管理，从计划到决定
- **大学搜索**: 强大的搜索和筛选功能，支持多维度比较
- **截止日期提醒**: 智能通知系统，及时提醒重要截止日期
- **要求追踪**: 详细的申请材料和文档准备进度管理

### 学生功能
- 📊 **个人仪表板**: 申请概览、进度统计和重要提醒
- 📝 **申请管理**: 创建、编辑和追踪大学申请
- 🏫 **大学搜索**: 按地理位置、排名、专业等条件搜索大学
- ⚖️ **大学对比**: 并排比较不同大学的信息和要求
- 📋 **要求追踪**: 管理每个申请的具体要求和截止日期
- 🔔 **智能通知**: 截止日期提醒和状态变更通知

### 家长功能
- 👀 **只读访问**: 查看孩子的申请进度和状态
- 💰 **财务规划**: 查看申请费用和学费信息
- 📝 **备注功能**: 添加支持性备注和观察
- 📊 **进度监控**: 实时了解申请准备情况

## 🛠 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS v4
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **图标**: Lucide React
- **日期处理**: date-fns

## 📦 安装和运行

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Supabase 账户

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd university-application-tracking-system
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，添加你的 Supabase 配置：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **设置数据库**

在 Supabase 中执行以下 SQL 创建必要的表结构：

```sql
-- 学生表
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  graduation_year INTEGER,
  gpa DECIMAL(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  target_countries TEXT[],
  intended_majors TEXT[],
  user_id UUID NOT NULL,
  parent_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 家长表
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  user_id UUID NOT NULL,
  student_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 大学表
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  us_news_ranking INTEGER,
  acceptance_rate DECIMAL(4,2),
  application_system VARCHAR(100),
  tuition_in_state DECIMAL(10,2),
  tuition_out_state DECIMAL(10,2),
  application_fee DECIMAL(6,2),
  deadlines JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 申请表
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  university_id UUID REFERENCES universities(id),
  application_type VARCHAR(50),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'not_started',
  submitted_date DATE,
  decision_date DATE,
  decision_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 申请要求表
CREATE TABLE application_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  requirement_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'not_started',
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建枚举类型
CREATE TYPE application_status AS ENUM (
  'not_started', 'in_progress', 'submitted', 
  'under_review', 'accepted', 'rejected', 'waitlisted'
);

CREATE TYPE application_type AS ENUM (
  'early_decision', 'early_action', 
  'regular_decision', 'rolling_admission'
);

CREATE TYPE requirement_status AS ENUM (
  'not_started', 'in_progress', 'completed'
);

CREATE TYPE user_role AS ENUM (
  'student', 'parent', 'teacher', 'admin'
);
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 响应式设计

系统完全支持响应式设计，在以下设备上都有良好体验：
- 📱 移动设备 (320px+)
- 📱 平板设备 (768px+) 
- 💻 桌面设备 (1024px+)

## 🔐 权限系统

### 角色权限
- **学生**: 完整的申请管理权限
- **家长**: 只读访问 + 备注权限
- **管理员**: 全部权限（扩展功能）

### 安全特性
- JWT 认证
- 基于角色的访问控制 (RBAC)
- 资源所有权验证
- 输入验证和 XSS 防护

## 🎯 核心业务流程

### 申请状态工作流
```
未开始 → 进行中 → 已提交 → 审核中 → 决定（录取/拒绝/候补）
```

### 申请类型
- **提前决定 (ED)**: 具有约束力的早期申请
- **提前行动 (EA)**: 非约束性早期申请  
- **常规决定 (RD)**: 标准申请周期
- **滚动录取**: 持续接受申请

## 📁 项目结构

```
├── app/                    # Next.js App Router
├── components/            # React 组件
│   ├── auth/             # 认证相关组件
│   ├── applications/     # 申请管理组件
│   ├── dashboard/        # 仪表板组件
│   ├── notifications/    # 通知组件
│   ├── requirements/     # 要求追踪组件
│   └── universities/     # 大学相关组件
├── contexts/             # React Context
├── lib/                  # 工具函数和配置
├── public/               # 静态资源
└── README.md
```

## 🔧 开发脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如有问题或建议，请：
- 创建 [Issue](../../issues)
- 发送邮件至 [your-email@example.com]
- 查看 [文档](../../wiki)

---

**注意**: 这是一个演示项目，用于展示大学申请追踪系统的实现。在生产环境中使用前，请确保完成必要的安全审计和性能优化。
