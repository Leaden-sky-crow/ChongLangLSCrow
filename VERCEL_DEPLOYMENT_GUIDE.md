# Vercel 部署操作指南

本文档将指导您完成将 ChongLangLSCrow 项目部署到 Vercel 的完整流程。

## 目录

1. [项目概述](#项目概述)
2. [部署前准备](#部署前准备)
3. [Vercel 项目配置](#vercel-项目配置)
4. [环境变量配置](#环境变量配置)
5. [推送代码到 GitHub](#推送代码到-github)
6. [部署到 Vercel](#部署到-vercel)
7. [部署后验证](#部署后验证)
8. [常见问题解决](#常见问题解决)

---

## 项目概述

**项目名称**: ChongLangLSCrow  
**技术栈**: Next.js 16.1.6 + TypeScript + Supabase + Tailwind CSS  
**GitHub 仓库**: https://github.com/Leaden-sky-crow/ChongLangLSCrow

### 重要更新

⚠️ **Next.js 16 变更**: 本项目已使用新的 `proxy.ts` 文件替代已废弃的 `middleware.ts`。这是 Next.js 16 的新规范，用于更好地描述代理功能的用途。

---

## 部署前准备

### 1. 确认本地文件完整性

确保以下关键文件存在：

```bash
# 检查关键文件
- vercel.json              # Vercel 配置文件
- .env.local              # 本地环境变量（不会上传到 Git）
- .nvmrc                  # Node.js 版本配置
- package.json            # 项目依赖配置
```

### 2. 本地构建测试

在部署前，先在本地运行构建命令确保没有错误：

```bash
npm run build
```

如果构建成功，会显示类似以下输出：
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Vercel 项目配置

### 1. 登录 Vercel

访问 [vercel.com](https://vercel.com) 并登录您的账号。

### 2. 创建新项目

1. 点击 **"Add New Project"**
2. 选择 **"Import Git Repository"**
3. 找到并选择 `ChongLangLSCrow` 仓库
4. 点击 **"Import"**

### 3. 配置项目设置

在 **"Configure Project"** 页面，配置以下选项：

#### 基础设置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Project Name** | `chonglanglscrow` | 项目名称（可自定义） |
| **Framework Preset** | `Next.js` | 自动检测 |
| **Root Directory** | `./` | 保持默认 |
| **Monorepo** | `No` | 保持默认 |

#### Build and Output Settings

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Build Command** | `npm run build` | 构建命令 |
| **Output Directory** | `.next` | 输出目录（自动填充） |
| **Install Command** | `npm install` | 安装依赖命令 |

#### Node.js 版本设置

⚠️ **重要**: 需要设置 Node.js 版本为 **20.x** 或 **18.x**

在 Vercel 项目设置中：
1. 进入项目后，点击 **"Settings"** 标签
2. 选择左侧 **"Build & Development Settings"**
3. 找到 **"Node.js Version"**
4. 选择 **`20.x`** 或 **`18.x`**（推荐 20.x）
5. 点击 **"Save Changes"**

### 4. 配置 vercel.json

项目已包含 `vercel.json` 文件，内容如下：

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

这个配置文件会自动被 Vercel 识别，无需额外配置。

---

## 环境变量配置

### 1. 必需的环境变量

在 Vercel 项目设置中配置以下环境变量：

进入项目 → **Settings** → **Environment Variables** → **Add New**

| 变量名 | 值 | 环境 | 说明 |
|--------|-----|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://omfuxbjszqihquvmwpyt.supabase.co` | Production, Preview, Development | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development | Supabase 匿名密钥 |

### 2. 添加环境变量的步骤

1. 点击 **"Add New"**
2. 输入变量名（如 `NEXT_PUBLIC_SUPABASE_URL`）
3. 输入变量值
4. 选择环境（勾选 Production、Preview、Development）
5. 点击 **"Save"**

### 3. 从 .env.local 复制值

本地 `.env.local` 文件中的值可以直接复制使用：

```bash
# .env.local 文件内容
NEXT_PUBLIC_SUPABASE_URL=https://omfuxbjszqihquvmwpyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZnV4YmpzenFpaHF1dm13cHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDcwNTEsImV4cCI6MjA4ODk4MzA1MX0.8KNZ__DzwO2ubg1dx4HovmERAhuEzEvglFZ5iaqquDQ
```

⚠️ **注意**: 
- 不要将 `.env.local` 文件提交到 Git
- 项目已配置 `.gitignore`，该文件不会被上传

---

## 推送代码到 GitHub

### 方法一：使用 HTTPS（推荐）

```bash
# 1. 确认远程仓库
git remote -v

# 2. 添加远程仓库（如果还没有）
git remote add origin https://github.com/Leaden-sky-crow/ChongLangLSCrow.git

# 3. 推送代码
git push -u origin master
```

### 方法二：使用 SSH

如果您配置了 SSH 密钥：

```bash
# 1. 修改远程仓库为 SSH 地址
git remote set-url origin git@github.com:Leaden-sky-crow/ChongLangLSCrow.git

# 2. 推送代码
git push -u origin master
```

### 解决权限问题

如果遇到 **403 权限错误**，可能是 Git 凭证缓存问题：

#### Windows 系统：

1. 打开 **控制面板** → **用户账户** → **凭据管理器**
2. 找到 **Windows 凭据** → **普通凭据**
3. 找到 `git:https://github.com` 相关凭据
4. 删除或更新凭据
5. 重新执行 `git push`，会提示输入用户名和密码

#### 或使用 Git Credential Manager：

```bash
# 清除缓存的凭据
git credential-manager erase
# 然后重新 push
git push -u origin master
```

---

## 部署到 Vercel

### 方式一：通过 GitHub 自动部署（推荐）

1. **连接 GitHub 仓库**
   - 在 Vercel 创建项目时连接 GitHub 仓库
   - 每次推送到 `master` 分支都会自动部署

2. **查看部署状态**
   - 推送代码后，访问 Vercel 项目页面
   - 在 **"Deployments"** 标签页查看部署进度
   - 通常部署需要 2-5 分钟

### 方式二：使用 Vercel CLI 手动部署

```bash
# 1. 安装 Vercel CLI（如果还没有）
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 链接项目
vercel link

# 4. 部署到预览环境
vercel

# 5. 部署到生产环境
vercel --prod
```

### 部署流程

1. **初始化** - Vercel 检测项目类型
2. **安装依赖** - 运行 `npm install`
3. **构建** - 运行 `npm run build`
4. **部署** - 上传构建产物到 CDN
5. **完成** - 分配域名并上线

### 部署时间

- 首次部署：约 3-5 分钟
- 后续部署：约 2-3 分钟（有缓存）

---

## 部署后验证

### 1. 检查部署状态

访问 Vercel 项目页面，确认部署状态为 **"Ready"**

### 2. 访问网站

- **生产环境**: `https://chonglanglscrow.vercel.app`
- **自定义域名**: 如果配置了自定义域名，访问您的域名

### 3. 功能测试清单

- [ ] 首页加载正常
- [ ] 文章列表显示正常
- [ ] 文章详情页面正常
- [ ] 用户登录/注册功能正常
- [ ] 管理员后台功能正常
- [ ] 图片资源加载正常
- [ ] 移动端响应式布局正常

### 4. 检查环境变量

在 Vercel 控制台中：
1. 进入项目 → **Settings** → **Environment Variables**
2. 确认所有环境变量已正确配置
3. 状态应为 **"Active"**

---

## 常见问题解决

### 问题 1: 构建失败 - Node.js 版本不兼容

**错误信息**: 
```
Error: Command "npm run build" exited with 1
```

**解决方案**:
1. 在 Vercel 项目设置中修改 Node.js 版本为 `20.x` 或 `18.x`
2. 确保本地 `.nvmrc` 文件指定了正确的版本
3. 重新部署

### 问题 2: 环境变量未生效

**症状**: 应用无法连接 Supabase

**解决方案**:
1. 检查环境变量名称是否正确（区分大小写）
2. 确认环境变量已添加到所有环境（Production/Preview/Development）
3. 重新部署项目使环境变量生效
4. 检查变量值是否正确复制（没有多余空格）

### 问题 3: 推送代码到 GitHub 时权限错误

**错误信息**:
```
fatal: unable to access 'https://github.com/...': The requested URL returned error: 403
```

**解决方案**:
1. 清除 Git 凭据缓存（见上文）
2. 使用 Personal Access Token 代替密码
3. 或配置 SSH 密钥

### 问题 4: 图片无法加载

**症状**: 背景图或头像无法显示

**解决方案**:
1. 确认图片文件在 `public/` 目录下
2. 检查图片路径引用是否正确
3. 确认 `.vercelignore` 没有排除图片文件

### 问题 5: 部署后页面 404

**解决方案**:
1. 检查 `vercel.json` 中的 rewrites 配置
2. 确认 `next.config.js` 配置正确
3. 查看 Vercel 部署日志获取详细错误信息

---

## 持续集成和自动部署

### 配置自动部署

1. 在 Vercel 项目设置中：
   - **Settings** → **Git** → **Production Branch**
   - 设置为 `master` 或 `main`

2. 每次推送到生产分支都会自动部署到 Production

### 预览部署

- 推送到其他分支会自动创建 Preview 部署
- 每个 Preview 部署都有独立的预览 URL
- 可用于测试新功能而不影响生产环境

---

## 性能优化建议

### 1. 启用 Vercel Analytics

在项目设置中启用：
- **Settings** → **Analytics** → **Enable**

### 2. 启用 Speed Insights

在项目设置中启用：
- **Settings** → **Speed Insights** → **Enable**

### 3. 配置缓存策略

Vercel 自动为静态资源配置最优缓存策略，无需手动配置。

---

## 自定义域名配置（可选）

### 1. 添加域名

1. 进入项目 → **Settings** → **Domains**
2. 点击 **"Add"**
3. 输入您的域名
4. 按照提示配置 DNS 记录

### 2. DNS 配置

Vercel 会提供两种 DNS 配置方式：

**方式 A: CNAME（推荐）**
```
类型：CNAME
主机记录：www
记录值：cname.vercel-dns.com
```

**方式 B: A 记录**
```
类型：A
主机记录：@
记录值：76.76.21.21
```

### 3. 等待 DNS 生效

DNS 配置通常需要 10-30 分钟生效，最长可能需要 48 小时。

---

## 监控和维护

### 1. 查看部署日志

- 进入项目 → **Deployments** → 点击具体部署 → **View Logs**

### 2. 实时监控

- **Analytics**: 查看访问量、性能指标
- **Speed Insights**: 查看页面加载速度
- **Web Vitals**: 查看核心性能指标

### 3. 回滚部署

如果需要回滚：
1. 进入 **Deployments**
2. 找到之前的成功部署
3. 点击 **"..."** → **"Promote to Production"**

---

## 联系支持

如果遇到问题：
- Vercel 文档：https://vercel.com/docs
- Next.js 文档：https://nextjs.org/docs
- GitHub Issues: https://github.com/Leaden-sky-crow/ChongLangLSCrow/issues

---

## 快速检查清单

部署前请确认：

- [ ] 本地构建成功 (`npm run build`)
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] Node.js 版本设置为 20.x
- [ ] 环境变量已配置
- [ ] 部署状态为 Ready
- [ ] 网站访问正常
- [ ] 所有功能测试通过

---

**最后更新时间**: 2026-03-15  
**文档版本**: 1.0
