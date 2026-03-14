# ChongLangLSCrow - 文学创作社区

一个现代化的文学创作与分享平台，支持小说、散文、诗歌等多种文学体裁。

## ✨ 功能特性

### 🎨 用户界面
- 响应式设计，支持移动端和桌面端
- 深色/浅色主题切换
- 全屏背景 Hero 区域
- 平滑动画和过渡效果

### 📝 创作功能
- Markdown 编辑器支持
- 文章分类（小说、散文、诗歌）
- 系列管理功能
- 草稿自动保存
- 封面图上传（支持外部图床）

### 👥 用户系统
- 邮箱注册/登录
- 个人资料管理
- 头像上传
- 站内通知系统

### 🛠️ 后台管理
- 文章审核（通过/拒绝/隐藏）
- 用户管理（封禁/解封）
- 权限管理（管理员/普通用户）
- 系统通知发送

### 🔍 内容发现
- 分类筛选
- 搜索功能
- 热门文章
- 作者关注

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Supabase 账户

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/Leaden-sky-crow/ChongLangLSCrow.git
cd ChongLangLSCrow

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入您的 Supabase 配置

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 🗄️ 数据库设置

### Supabase 配置
1. 创建新的 Supabase 项目
2. 在 SQL 编辑器中运行 `schema.sql` 文件
3. 应用所有迁移文件（位于 `supabase/migrations/`）
4. 获取项目 URL 和 Anon Key

### 环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 项目结构

```
ChongLangLSCrow/
├── app/                    # Next.js App Router 页面
│   ├── admin/             # 后台管理页面
│   ├── create/            # 创作页面
│   ├── posts/             # 文章列表和详情页
│   └── ...
├── components/            # React 组件
│   ├── admin/             # 后台管理组件
│   ├── ui/                # UI 基础组件
│   └── ...
├── supabase/              # Supabase 配置和迁移
│   └── migrations/        # 数据库迁移文件
├── utils/                 # 工具函数
│   └── supabase/          # Supabase 客户端
└── public/                # 静态资源
```

## 🚀 部署到 Vercel

### 自动部署
1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入仓库 `Leaden-sky-crow/ChongLangLSCrow`
3. 配置环境变量
4. 点击部署

### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

详细部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式框架
- **Shadcn/UI v4** - UI 组件库
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 后端
- **Supabase** - 后端即服务
- **PostgreSQL** - 数据库
- **Row Level Security** - 行级安全策略

### 工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Git** - 版本控制

## 📄 文档

- [NOTES.md](NOTES.md) - 开发笔记和功能记录
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 配置指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Supabase](https://supabase.com) - 后端服务
- [Vercel](https://vercel.com) - 部署平台
- 所有贡献者和用户

---

**项目仓库**: https://github.com/Leaden-sky-crow/ChongLangLSCrow  
**问题反馈**: 请在 GitHub Issues 中提交
