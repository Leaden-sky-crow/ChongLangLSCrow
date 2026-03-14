# Vercel 部署指南

## 1. 准备工作

### 1.1 确保项目可以正常构建
```bash
# 安装依赖
npm install

# 本地构建测试
npm run build
```

### 1.2 准备环境变量
创建 `.env.local` 文件，包含以下内容：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. 上传到 GitHub

### 2.1 初始化 Git 仓库
```bash
# 初始化仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: ChongLangLSCrow website"

# 添加远程仓库
git remote add origin https://github.com/Leaden-sky-crow/ChongLangLSCrow.git

# 推送代码
git push -u origin main
```

## 3. Vercel 部署步骤

### 3.1 通过 Vercel Dashboard 部署
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库 `Leaden-sky-crow/ChongLangLSCrow`
4. 配置项目设置：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.2 配置环境变量
在 Vercel 项目设置中添加以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL` - 您的 Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 您的 Supabase Anon Key

### 3.3 部署
1. 点击 "Deploy"
2. 等待构建完成
3. 获取部署 URL

## 4. Supabase 配置

### 4.1 数据库迁移
确保 Supabase 数据库已应用所有迁移：
```sql
-- 检查是否已应用所有迁移
-- 迁移文件位于 supabase/migrations/ 目录
```

### 4.2 RLS 策略验证
确保以下 RLS 策略已正确设置：
- profiles 表：用户只能访问自己的数据
- posts 表：已发布文章公开可见，作者和管理员有特殊权限
- notifications 表：用户只能查看自己的通知

## 5. 部署后验证

### 5.1 功能测试
1. **主页访问**：确保网站正常加载
2. **用户注册/登录**：测试认证功能
3. **文章发布**：测试创作功能
4. **分类筛选**：测试分类功能
5. **后台管理**：测试管理员功能

### 5.2 性能检查
1. **页面加载速度**：使用 Lighthouse 测试
2. **API 响应**：确保 Supabase 连接正常
3. **图片加载**：确保背景图片正常显示

## 6. 故障排除

### 6.1 常见问题
1. **构建失败**：
   - 检查 Node.js 版本（需要 18+）
   - 检查依赖冲突
   - 查看构建日志

2. **Supabase 连接失败**：
   - 验证环境变量是否正确
   - 检查 Supabase 项目状态
   - 验证网络连接

3. **数据库错误**：
   - 确保迁移已应用
   - 检查 RLS 策略
   - 验证表结构

### 6.2 日志查看
- Vercel 部署日志：Vercel Dashboard → Deployments → 选择部署 → Logs
- Supabase 日志：Supabase Dashboard → Logs

## 7. 持续部署

### 7.1 自动部署
- 每次推送到 `main` 分支时自动部署
- 预览分支部署：每个 PR 创建预览部署

### 7.2 环境管理
- **Production**: `main` 分支
- **Preview**: 功能分支
- **Development**: 本地开发

## 8. 监控和维护

### 8.1 性能监控
- Vercel Analytics
- Supabase Monitoring
- 错误跟踪（考虑集成 Sentry）

### 8.2 定期维护
- 更新依赖包
- 数据库备份
- 日志清理

---

## 快速部署命令（如果使用 Vercel CLI）

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

## 技术支持
- Vercel 文档：https://vercel.com/docs
- Next.js 文档：https://nextjs.org/docs
- Supabase 文档：https://supabase.com/docs