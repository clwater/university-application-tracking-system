[中文版本](README-CN.md) | English Version

# 🎓 University Application Tracking System

A comprehensive university application management platform that helps students and parents track application progress, manage deadlines and requirements. Supports complete application lifecycle management, from university search to final admission decisions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/university-application-tracking-system)

## 🌟 Live Demo

- **Production Environment**: [https://university-application-tracking-sys.vercel.app](https://university-application-tracking-sys.vercel.app)
- **Test Accounts**: 
  - Student Account: `s.li@clwater.com` / Contact admin for password
  - Parent Account: `p.li@clwater.com` / Contact admin for password

## ✨ Features

### 🎯 Core Functions
- **🔐 Dual Role System**: Supports both student and parent roles with different permissions and functions
- **📊 Smart Dashboard**: Personalized application overview, progress statistics, and important reminders
- **📝 Application Management**: Complete application lifecycle management, from planning to decision
- **🏫 University Search**: Powerful search and filtering capabilities with multi-dimensional comparison
- **⏰ Smart Reminders**: Deadline notifications and status change alerts
- **📋 Requirements Tracking**: Detailed application materials and document preparation progress management

### 👨‍🎓 Student Features
- **Personal Profile Management**: GPA, standardized test scores, target countries, and other information maintenance
- **University Search & Comparison**: Filter universities by ranking, location, acceptance rate, and other criteria
- **Application Creation & Management**: Supports ED/EA/RD/Rolling admissions and other application types
- **Material Requirements Tracking**: Manage specific requirements and deadlines for each application
- **Progress Visualization**: Intuitive application status and completion display
- **Mobile Optimization**: Responsive design supporting phone and tablet use

### 👨‍👩‍👧‍👦 Parent Features
- **Read-only Access**: View child's application progress and status
- **Financial Information View**: Overview of application fees and tuition costs
- **Collaborative Notes**: Add supportive notes and observations
- **Progress Monitoring**: Real-time understanding of application preparation status

## 🛠 Technology Stack

### Frontend Technologies
- **⚛️ Next.js 15**: App Router + Server-side rendering
- **🔷 React 19**: Latest React version + TypeScript
- **🎨 Tailwind CSS v4**: Modern CSS framework
- **🔣 Lucide React**: Beautiful icon library
- **📅 date-fns**: Date handling utilities

### Backend Services
- **🗃️ Supabase**: PostgreSQL database + real-time subscriptions
- **🔐 Supabase Auth**: User authentication and authorization
- **📧 Email Service**: Registration confirmation and password reset
- **🛡️ RLS Policies**: Row Level Security policies for data protection

### Development Tools
- **📝 TypeScript 5**: Type safety
- **🔧 ESLint**: Code quality checking
- **📱 Responsive Design**: Mobile optimization
- **🚀 Vercel Deployment**: Automated CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS version recommended)
- npm or yarn package manager
- Supabase account (free tier available)

### Installation Steps

1. **Clone the Project**
```bash
git clone git@github.com:clwater/university-application-tracking-system.git
cd university-application-tracking-system
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure Environment Variables**

Create `.env.local` file and add the following configuration:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup Database**

- Execute `test-data-create.sql` in Supabase Dashboard to create data tables
- Import `test-data-real-users.sql` for test data (optional)

5. **Start Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Responsive Design

The system fully supports responsive design, optimized for different devices:

- **📱 Mobile Devices** (320px - 768px): Vertical navigation, touch optimization
- **📱 Tablet Devices** (768px - 1024px): Adaptive layout
- **💻 Desktop Devices** (1024px+): Full feature display

### Mobile Features
- Swipeable tab navigation
- Smart search/details page switching
- Touch-friendly operation interface
- Optimized text size and spacing

## 🔐 Security & Permissions

### Authentication System
- **JWT Token**: Based on Supabase Auth
- **Email Verification**: Email verification required during registration
- **Password Reset**: Secure password reset process
- **Session Management**: Automatic token refresh

### Permission Control
- **Role-Based Access Control (RBAC)**
- **Row Level Security (RLS)**: Database-level security protection
- **API Permission Verification**: Permission checks for every API endpoint
- **Frontend Route Protection**: Automatic redirection for unauthorized access

### Role Permission Matrix

| Function | Student | Parent | Admin(DB Config) |
|----------|---------|--------|------------------|
| View Personal Applications | ✅ | ✅ | ✅ |
| Create/Edit Applications | ✅ | ❌ | ✅ |
| University Search | ✅ | ✅ | ✅ |
| Add Notes | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

## 📊 Project Structure

```
university-application-tracking-system/
├── 🗂️ app/                          # Next.js 13+ App Router
│   ├── api/                         # API routes
│   │   ├── auth/                    # Authentication APIs
│   │   ├── student/                 # Student function APIs
│   │   ├── parent/                  # Parent function APIs
│   │   └── universities/            # University data APIs
│   ├── auth/                        # Authentication pages
│   ├── dashboard/                   # Main dashboard
│   └── globals.css                  # Global styles
├── 🧩 components/                   # React components
│   ├── auth/                        # Authentication components
│   ├── applications/                # Application management components
│   ├── dashboard/                   # Dashboard components
│   ├── universities/                # University-related components
│   └── requirements/                # Requirements tracking components
├── 🔧 contexts/                     # React Context
│   └── AuthContext.tsx              # Authentication state management
├── 📚 lib/                          # Utility functions and configuration
│   ├── supabase.ts                  # Supabase client
│   ├── database.types.ts            # Database type definitions
│   └── permissions.ts               # Permission checking utilities
├── 📊 docs/                         # Documentation
│   └── api-documentation.md         # API documentation
└── 📋 Configuration files
    ├── package.json                 # Project dependencies
    ├── next.config.ts               # Next.js configuration
    ├── tailwind.config.js           # Tailwind configuration
    └── tsconfig.json                # TypeScript configuration
```

## 🔧 Available Scripts

```bash
# Development mode (with Turbopack acceleration)
npm run dev

# Type checking
npm run type-check

# Code linting
npm run lint-check

# Build production version
npm run build

# Start production server
npm start

# Build check
npm run check-build
```

## 🎯 Core Business Processes

### Application Status Workflow
```
Not Started → In Progress → Submitted → Under Review → Decision
                                                        ├── Accepted
                                                        ├── Rejected
                                                        └── Waitlisted
```

### Application Type Support
- **Early Decision (ED)**: Binding early application
- **Early Action (EA)**: Non-binding early application
- **Regular Decision (RD)**: Standard application cycle
- **Rolling Admission**: Continuously accepting applications

### Requirement Type Management
- 📝 Application Essays
- 📊 Transcripts
- 💼 Recommendation Letters
- 🎨 Portfolio
- 📄 Standardized Test Scores
- 💰 Financial Documentation

## 🌐 Deployment Guide

### Vercel Deployment (Recommended)

1. **Connect GitHub**: Push the project to GitHub
2. **Import to Vercel**: Import project in Vercel Dashboard
3. **Configure Environment Variables**: Add all required environment variables
4. **Automatic Deployment**: Automatic deployment triggered on every push

### Environment Variable Configuration

Production environment requires setting the following variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```