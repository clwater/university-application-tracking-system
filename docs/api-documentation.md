# API 文档

本文档描述了大学申请追踪系统的API端点设计和使用方法。

## 基础信息

- **基础URL**: `/api`
- **认证方式**: JWT Token (通过 Supabase Auth)
- **响应格式**: JSON
- **请求格式**: JSON

## 错误响应格式

```json
{
  "error": "错误描述"
}
```

## 学生端API (`/api/student/*`)

### 档案管理

#### GET `/api/student/profile`
获取学生档案信息

**响应**:
```json
{
  "student": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "graduation_year": "number",
    "gpa": "number",
    "sat_score": "number",
    "act_score": "number",
    "target_countries": ["string"],
    "intended_majors": ["string"],
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### PUT `/api/student/profile`
更新学生档案

**请求体**:
```json
{
  "name": "string",
  "graduation_year": "number",
  "gpa": "number",
  "sat_score": "number",
  "act_score": "number",
  "target_countries": ["string"],
  "intended_majors": ["string"]
}
```

### 申请管理

#### GET `/api/student/applications`
获取学生的所有申请

**响应**:
```json
{
  "applications": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "university_id": "uuid",
      "application_type": "early_decision|early_action|regular_decision|rolling_admission",
      "deadline": "date",
      "status": "not_started|in_progress|submitted|under_review|accepted|rejected|waitlisted",
      "submitted_date": "date",
      "decision_date": "date",
      "decision_type": "accepted|rejected|waitlisted",
      "notes": "string",
      "universities": {
        "id": "uuid",
        "name": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "us_news_ranking": "number",
        "acceptance_rate": "number",
        "application_system": "string",
        "tuition_in_state": "number",
        "tuition_out_state": "number",
        "application_fee": "number",
        "deadlines": "object"
      }
    }
  ]
}
```

#### POST `/api/student/applications`
创建新的申请

**请求体**:
```json
{
  "university_id": "uuid",
  "application_type": "early_decision|early_action|regular_decision|rolling_admission",
  "deadline": "date",
  "status": "not_started",
  "notes": "string"
}
```

#### GET `/api/student/applications/{id}`
获取特定申请的详细信息

#### PUT `/api/student/applications/{id}`
更新申请信息

**请求体**:
```json
{
  "application_type": "string",
  "deadline": "date",
  "status": "string",
  "submitted_date": "date",
  "decision_date": "date",
  "decision_type": "string",
  "notes": "string"
}
```

#### DELETE `/api/student/applications/{id}`
删除申请

### 申请要求管理

#### GET `/api/student/applications/{id}/requirements`
获取申请的所有要求

**响应**:
```json
{
  "requirements": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "requirement_type": "string",
      "status": "not_started|in_progress|completed",
      "deadline": "date",
      "notes": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### POST `/api/student/applications/{id}/requirements`
创建申请要求

**请求体**:
```json
{
  "requirement_type": "string",
  "status": "not_started|in_progress|completed",
  "deadline": "date",
  "notes": "string"
}
```

#### PUT `/api/student/requirements/{id}`
更新申请要求

#### DELETE `/api/student/requirements/{id}`
删除申请要求

### 仪表板数据

#### GET `/api/student/dashboard/stats`
获取仪表板统计数据

**响应**:
```json
{
  "stats": {
    "total": "number",
    "submitted": "number",
    "accepted": "number",
    "rejected": "number",
    "waitlisted": "number",
    "inProgress": "number",
    "notStarted": "number",
    "urgentDeadlines": "number",
    "acceptanceRate": "number"
  },
  "progressDistribution": {
    "notStarted": "number",
    "inProgress": "number",
    "submitted": "number",
    "completed": "number"
  },
  "applicationTypes": {
    "earlyDecision": "number",
    "earlyAction": "number",
    "regularDecision": "number",
    "rollingAdmission": "number"
  }
}
```

#### GET `/api/student/dashboard/upcoming-deadlines`
获取即将到期的申请

**查询参数**:
- `days`: 天数范围 (默认: 30)

**响应**:
```json
{
  "applications": [
    {
      "id": "uuid",
      "university_name": "string",
      "deadline": "date",
      "status": "string",
      "application_type": "string",
      "daysUntil": "number",
      "urgency": "critical|high|medium|normal"
    }
  ]
}
```

## 家长端API (`/api/parent/*`)

### 档案管理

#### GET `/api/parent/profile`
获取家长档案

#### PUT `/api/parent/profile`
更新家长档案

### 学生管理

#### GET `/api/parent/students`
获取关联的学生列表

**响应**:
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "graduation_year": "number",
      "applications": [
        {
          "id": "uuid",
          "status": "string",
          "universities": {
            "name": "string",
            "city": "string",
            "state": "string"
          }
        }
      ]
    }
  ]
}
```

#### GET `/api/parent/students/{id}/applications`
获取指定学生的申请列表

### 备注管理

#### PUT `/api/parent/applications/{id}/notes`
为申请添加家长备注

**请求体**:
```json
{
  "parent_note": "string",
  "current_notes": "string"
}
```

## 通用API

### 大学管理

#### GET `/api/universities`
搜索和筛选大学

**查询参数**:
- `search`: 搜索关键词
- `country`: 国家
- `state`: 州
- `minRanking`: 最低排名
- `maxRanking`: 最高排名
- `minAcceptanceRate`: 最低录取率 (0-100)
- `maxAcceptanceRate`: 最高录取率 (0-100)
- `applicationSystem`: 申请系统
- `limit`: 每页数量 (默认: 50)
- `offset`: 偏移量 (默认: 0)

**响应**:
```json
{
  "universities": [
    {
      "id": "uuid",
      "name": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "us_news_ranking": "number",
      "acceptance_rate": "number",
      "application_system": "string",
      "tuition_in_state": "number",
      "tuition_out_state": "number",
      "application_fee": "number",
      "deadlines": "object"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "hasMore": "boolean"
  }
}
```

#### GET `/api/universities/{id}`
获取大学详细信息

## 认证和权限

### 认证头
所有API请求都需要在请求头中包含认证信息：

```
Authorization: Bearer <jwt_token>
```

### 权限级别

#### 学生权限
- 完整的申请管理权限 (CRUD)
- 个人档案管理
- 申请要求管理
- 仪表板数据访问

#### 家长权限
- 只读访问关联学生的申请
- 为申请添加备注
- 查看财务信息
- 个人档案管理

#### 资源所有权验证
- 学生只能访问自己的申请和要求
- 家长只能访问关联学生的申请
- 所有API都会验证资源所有权

## 错误码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突 (如重复申请)
- `500`: 服务器错误

## 使用示例

### 创建申请
```javascript
const response = await fetch('/api/student/applications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    university_id: 'uuid',
    application_type: 'regular_decision',
    deadline: '2024-01-15',
    status: 'not_started'
  })
})

const data = await response.json()
```

### 搜索大学
```javascript
const params = new URLSearchParams({
  search: 'MIT',
  state: 'Massachusetts',
  maxRanking: '50'
})

const response = await fetch(`/api/universities?${params}`)
const data = await response.json()
```

## 速率限制

- 每用户每分钟最多 100 个请求
- 搜索API每分钟最多 30 个请求

## API客户端

项目提供了 TypeScript API客户端 (`lib/api-client.ts`)，包含：
- 类型安全的方法调用
- 自动错误处理
- React Hook 集成
- 请求/响应拦截器

```javascript
import { apiClient } from '@/lib/api-client'

// 获取申请列表
const response = await apiClient.student.getApplications()

// 使用React Hook
const { data, loading, error } = useApi(
  () => apiClient.student.getApplications()
)
```