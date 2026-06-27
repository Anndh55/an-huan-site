# an-huan-site 技术栈

## 概览

这是一个情侣纪念空间 Web 应用，基于 Next.js App Router 构建，使用 SQLite 数据库配合 Prisma ORM，集成了身份认证、图片存储、动画交互等功能。

---

## 核心技术

| 技术 | 版本 | 用途 |
|---|---|---|
| **Next.js** | 16.2.9 | 全栈 React 框架，App Router 路由 |
| **React** | 19.2.4 | UI 组件库 |
| **TypeScript** | ^5 | 类型安全 |
| **Node.js** | — | 运行时 |
| **Turbopack** | — | 开发环境打包（Next.js 内置） |

---

## UI & 样式

| 技术 | 版本 | 用途 |
|---|---|---|
| **Tailwind CSS** | ^4 | 原子化 CSS 框架 |
| **@tailwindcss/postcss** | ^4 | Tailwind PostCSS 插件（v4 新架构） |
| **PostCSS** | — | CSS 预处理管道 |
| **Geist** | — | Vercel 开源字体（通过 next/font 加载） |
| **CSS 自定义属性** | — | 主题色系定义（胭粉 / 暖杏色系） |
| **CSS 动画** | — | 呼吸、漂浮、粒子、流光等自定义关键帧动画 |

---

## 动画

| 技术 | 版本 | 用途 |
|---|---|---|
| **Motion** | 12.42.0 | React 声明式动画库（Framer Motion 继任者） |

---

## 数据库 & ORM

| 技术 | 版本 | 用途 |
|---|---|---|
| **Prisma** | 6.19.3 | ORM — 数据建模、迁移、生成的类型客户端 |
| **@prisma/client** | 6.19.3 | Prisma 客户端运行时 |
| **SQLite** | — | 数据库引擎 |
| **@libsql/client** | 0.17.4 | libSQL 客户端，直接执行原生 SQL 查询 |

数据模型包含 User、Message、Photo、Anniversary、TimeCapsule。

---

## 认证 & 安全

| 技术 | 版本 | 用途 |
|---|---|---|
| **NextAuth** | ^5.0.0-beta.31 | 认证框架（v5 beta，App Router 原生支持） |
| **@auth/prisma-adapter** | ^2.11.2 | Prisma 适配器 |
| **bcryptjs** | ^3.0.3 | 密码哈希与校验 |

认证策略：JWT Session，手机号 + 密码登录（Credentials Provider）。

---

## 文件存储

| 技术 | 版本 | 用途 |
|---|---|---|
| **qiniu（七牛云）** | ^7.15.2 | 对象存储 SDK（图片上传托管） |

---

## 工具库

| 技术 | 版本 | 用途 |
|---|---|---|
| **date-fns** | ^4.4.0 | 日期格式化与计算 |
| **crypto.randomUUID()** | — | 内置 UUID 生成 |

---

## 开发工具 & 代码质量

| 技术 | 版本 | 用途 |
|---|---|---|
| **ESLint** | ^9 | 代码检查（Flat Config） |
| **eslint-config-next** | 16.2.9 | Next.js 官方 ESLint 规则集 |
| **tsx** | ^4.22.4 | TypeScript 直接执行（Prisma seed） |
| **tsconfig paths** | — | @/* 映射到 ./src/* |

---

## 项目结构重点

`
src/
├── app/
│   ├── (auth)/              # 认证相关路由组
│   ├── (dashboard)/         # 仪表盘路由组
│   │   ├── messages/        # 留言 / 日记
│   │   ├── photos/          # 照片
│   │   ├── anniversaries/   # 纪念日
│   │   └── time-capsule/    # 时光胶囊
│   └── api/                 # RESTful API 路由
│       ├── auth/            # NextAuth 认证端点
│       ├── users/
│       ├── messages/
│       ├── photos/
│       ├── anniversaries/
│       └── time-capsules/
├── components/              # 共享 UI 组件（BottomNav）
├── lib/                     # 工具函数（auth.ts, db.ts）
└── middleware.ts            # 路由守卫
prisma/
└── schema.prisma            # Prisma 数据模型
`

---

## 部署

| 平台 | 说明 |
|---|---|
| **Vercel** | 默认推荐部署目标（next build 构建） |
