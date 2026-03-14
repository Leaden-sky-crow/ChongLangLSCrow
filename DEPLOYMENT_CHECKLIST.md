# 快速部署清单

## ✅ 已完成的工作

1. **代码优化**
   - ✅ 将 `middleware.ts` 重命名为 `proxy.ts`（符合 Next.js 16 规范）
   - ✅ 创建 `vercel.json` 配置文件
   - ✅ 创建 `.nvmrc` 指定 Node.js 版本
   - ✅ 本地构建测试通过

2. **文档准备**
   - ✅ 创建详细的部署操作指南（`VERCEL_DEPLOYMENT_GUIDE.md`）
   - ✅ 创建快速部署清单（本文件）

3. **Git 提交**
   - ✅ 所有更改已提交到本地仓库

---

## 📋 需要手动完成的步骤

### 1. 推送代码到 GitHub

由于权限问题，需要您手动推送代码：

```bash
# 方法 A: 使用 HTTPS（推荐）
git push -u origin master

# 如果遇到 403 错误，需要：
# 1. 清除 Git 凭据缓存
# 2. 重新输入 GitHub 用户名和密码
# 或使用 Personal Access Token
```

**GitHub 仓库地址**: https://github.com/Leaden-sky-crow/ChongLangLSCrow

---

### 2. 配置 Vercel 项目

#### 步骤 1: 创建/访问 Vercel 项目

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New Project"** 或选择现有项目
3. 选择 **"Import Git Repository"**
4. 找到并选择 `ChongLangLSCrow` 仓库

#### 步骤 2: 配置项目设置

在 **"Configure Project"** 页面：

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `chonglanglscrow` |
| **Framework Preset** | `Next.js`（自动检测） |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

#### 步骤 3: 设置 Node.js 版本 ⚠️

**重要**: 必须设置 Node.js 版本为 **20.x**

1. 进入项目后，点击 **"Settings"** 标签
2. 选择 **"Build & Development Settings"**
3. 找到 **"Node.js Version"**
4. 选择 **`20.x`**
5. 点击 **"Save Changes"**

---

### 3. 配置环境变量

在 Vercel 项目设置中配置以下环境变量：

**路径**: Settings → Environment Variables → Add New

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://omfuxbjszqihquvmwpyt.supabase.co` | 全选 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZnV4YmpzenFpaHF1dm13cHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDcwNTEsImV4cCI6MjA4ODk4MzA1MX0.8KNZ__DzwO2ubg1dx4HovmERAhuEzEvglFZ5iaqquDQ` | 全选 |

**添加步骤**:
1. 点击 **"Add New"**
2. 输入变量名和值
3. 勾选 Production、Preview、Development
4. 点击 **"Save"**

---

### 4. 部署项目

#### 方式 A: 自动部署（推荐）

1. 连接 GitHub 仓库后，Vercel 会自动开始部署
2. 等待 2-5 分钟完成部署
3. 部署完成后会显示预览 URL

#### 方式 B: 使用 CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

---

## ✅ 部署后验证

### 检查清单

- [ ] 部署状态为 **"Ready"**
- [ ] 访问生产 URL 正常
- [ ] 首页加载正常
- [ ] 文章列表显示正常
- [ ] 登录/注册功能正常
- [ ] 管理员后台功能正常
- [ ] 图片资源加载正常

### 访问 URL

- **生产环境**: `https://chonglanglscrow.vercel.app`
- **自定义域名**: 如果配置了自定义域名，访问您的域名

---

## 🔧 常见问题

### 问题 1: 构建失败

**错误**: `Command "npm run build" exited with 1`

**解决**:
1. 确认 Node.js 版本设置为 `20.x`
2. 检查本地构建是否正常：`npm run build`
3. 查看 Vercel 部署日志获取详细错误

### 问题 2: 环境变量未生效

**症状**: 无法连接 Supabase

**解决**:
1. 检查环境变量名称是否正确（区分大小写）
2. 确认已添加到所有环境
3. 重新部署项目

### 问题 3: 推送代码权限错误

**错误**: `403 permission denied`

**解决**:
1. 清除 Git 凭据缓存
2. 使用 Personal Access Token
3. 或配置 SSH 密钥

---

## 📚 参考文档

- 详细部署指南：`VERCEL_DEPLOYMENT_GUIDE.md`
- Vercel 文档：https://vercel.com/docs
- Next.js 文档：https://nextjs.org/docs

---

## 📝 联系支持

如果遇到问题：
- 查看 `VERCEL_DEPLOYMENT_GUIDE.md` 获取详细说明
- 访问 Vercel 文档中心
- 在 GitHub 仓库提交 Issue

---

**最后更新**: 2026-03-15  
**文档版本**: 1.0
