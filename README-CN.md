中文版本 | [English Version](README.md)

# 🎓 大学申请追踪系统

一个全面的大学申请管理平台，帮助学生和家长追踪申请进度、管理截止日期和要求。支持完整的申请生命周期管理，从大学搜索到最终录取决定。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/university-application-tracking-system)

## 🌟 在线演示

- **生产环境**: [https://university-application-tracking-sys.vercel.app](https://university-application-tracking-sys.vercel.app)
- **测试账户**: 
  - 学生账户: `s.li@clwater.com` / 密码请联系管理员
  - 家长账户: `p.li@clwater.com` / 密码请联系管理员

## ✨ 功能特色

### 🎯 核心功能
- **🔐 双角色系统**: 支持学生和家长两种角色，具有不同的权限和功能
- **📊 智能仪表板**: 个性化的申请概览、进度统计和重要提醒
- **📝 申请管理**: 完整的申请生命周期管理，从计划到决定
- **🏫 大学搜索**: 强大的搜索和筛选功能，支持多维度比较
- **⏰ 智能提醒**: 截止日期通知和状态变更提醒
- **📋 要求追踪**: 详细的申请材料和文档准备进度管理

### 👨‍🎓 学生功能
- **个人档案管理**: GPA、标化成绩、目标国家等信息维护
- **大学搜索与对比**: 按排名、地理位置、录取率等条件筛选大学
- **申请创建与管理**: 支持 ED/EA/RD/滚动录取等不同类型申请
- **材料要求追踪**: 管理每个申请的具体要求和截止日期
- **进度可视化**: 直观的申请状态和完成度展示
- **移动端优化**: 响应式设计，支持手机和平板使用

### 👨‍👩‍👧‍👦 家长功能
- **只读权限访问**: 查看孩子的申请进度和状态
- **财务信息查看**: 申请费用和学费信息一览
- **协作备注**: 添加支持性备注和观察
- **进度监控**: 实时了解申请准备情况

## 🛠 技术栈

### 前端技术
- **⚛️ Next.js 15**: App Router + 服务端渲染
- **🔷 React 19**: 最新版本 React + TypeScript
- **🎨 Tailwind CSS v4**: 现代化的 CSS 框架
- **🔣 Lucide React**: 美观的图标库
- **📅 date-fns**: 日期处理工具

### 后端服务
- **🗃️ Supabase**: PostgreSQL 数据库 + 实时订阅
- **🔐 Supabase Auth**: 用户认证和授权
- **📧 邮件服务**: 注册确认和密码重置
- **🛡️ RLS 策略**: 行级安全策略保护数据

### 开发工具
- **📝 TypeScript 5**: 类型安全
- **🔧 ESLint**: 代码质量检查
- **📱 响应式设计**: 移动端优化
- **🚀 Vercel 部署**: 自动化 CI/CD

## 🚀 快速开始

### 前置要求
- Node.js 18+ (推荐 LTS 版本)
- npm 或 yarn 包管理器
- Supabase 账户 (免费层可用)

### 安装步骤

1. **克隆项目**
```bash
git clone git@github.com:clwater/university-application-tracking-system.git
cd university-application-tracking-system
```

2. **安装依赖**
```bash
npm install
# 或者
yarn install
```

3. **配置环境变量**

创建 `.env.local` 文件并添加以下配置：
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **设置数据库**

- 在 Supabase Dashboard 中执行 `test-data-create.sql` 创建数据表
- 导入 `test-data-real-users.sql` 获取测试数据（可选）

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 响应式设计

系统完全支持响应式设计，针对不同设备进行了优化：

- **📱 手机设备** (320px - 768px): 垂直导航、触摸优化
- **📱 平板设备** (768px - 1024px): 适应性布局
- **💻 桌面设备** (1024px+): 完整功能展示

### 移动端特色功能
- 可滑动的标签导航
- 智能的搜索/详情页面切换
- 触摸友好的操作界面
- 优化的文字大小和间距

## 🔐 安全与权限

### 认证系统
- **JWT Token**: 基于 Supabase Auth
- **邮箱验证**: 注册时需要验证邮箱
- **密码重置**: 安全的密码重置流程
- **会话管理**: 自动令牌刷新

### 权限控制
- **基于角色的访问控制 (RBAC)**
- **行级安全策略 (RLS)**: 数据库层面的安全保护
- **API 权限验证**: 每个 API 端点都有权限检查
- **前端路由保护**: 未授权访问自动重定向

### 角色权限矩阵

| 功能 | 学生 | 家长 | 管理员(DB配置) |
|------|------|------|-----------|
| 查看个人申请 | ✅ | ✅ | ✅         |
| 创建/编辑申请 | ✅ | ❌ | ✅         |
| 大学搜索 | ✅ | ✅ | ✅         |
| 添加备注 | ✅ | ✅ | ✅         |
| 管理用户 | ❌ | ❌ | ✅         |

## 📊 项目结构

```
university-application-tracking-system/
├── 🗂️ app/                          # Next.js 13+ App Router
│   ├── api/                         # API 路由
│   │   ├── auth/                    # 认证相关 API
│   │   ├── student/                 # 学生功能 API
│   │   ├── parent/                  # 家长功能 API
│   │   └── universities/            # 大学数据 API
│   ├── auth/                        # 认证页面
│   ├── dashboard/                   # 主仪表板
│   └── globals.css                  # 全局样式
├── 🧩 components/                   # React 组件
│   ├── auth/                        # 认证相关组件
│   ├── applications/                # 申请管理组件
│   ├── dashboard/                   # 仪表板组件
│   ├── universities/                # 大学相关组件
│   └── requirements/                # 要求追踪组件
├── 🔧 contexts/                     # React Context
│   └── AuthContext.tsx              # 认证状态管理
├── 📚 lib/                          # 工具函数和配置
│   ├── supabase.ts                  # Supabase 客户端
│   ├── database.types.ts            # 数据库类型定义
│   └── permissions.ts               # 权限检查工具
├── 📊 docs/                         # 文档
│   └── api-documentation.md         # API 文档
└── 📋 配置文件
    ├── package.json                 # 项目依赖
    ├── next.config.ts               # Next.js 配置
    ├── tailwind.config.js           # Tailwind 配置
    └── tsconfig.json                # TypeScript 配置
```

## 🔧 可用脚本

```bash
# 开发模式 (使用 Turbopack 加速)
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint-check

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 构建检查
npm run check-build
```

## 🎯 核心业务流程

### 申请状态工作流
```
未开始 → 进行中 → 已提交 → 审核中 → 决定
                                     ├── 录取
                                     ├── 拒绝
                                     └── 候补
```

### 申请类型支持
- **提前决定 (ED)**: 具有约束力的早期申请
- **提前行动 (EA)**: 非约束性早期申请  
- **常规决定 (RD)**: 标准申请周期
- **滚动录取**: 持续接受申请

### 要求类型管理
- 📝 申请文书
- 📊 成绩单
- 💼 推荐信
- 🎨 作品集
- 📄 标化成绩
- 💰 财务证明

## 🌐 部署指南

### Vercel 部署 (推荐)

1. **连接 GitHub**: 将项目推送到 GitHub
2. **导入到 Vercel**: 在 Vercel Dashboard 导入项目
3. **配置环境变量**: 添加所有必需的环境变量
4. **自动部署**: 每次 push 自动触发部署

### 环境变量配置

生产环境需要设置以下变量：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```
