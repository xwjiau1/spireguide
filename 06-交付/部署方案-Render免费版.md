# SpireGuide 免费部署方案（Render.com）

> 不需要云服务器，不需要域名，全程免费

---

## 方案概览

| 项目 | 选择 | 费用 |
|------|------|------|
| 代码托管 | GitHub | 免费 |
| 后端部署 | Render Web Service | 免费 |
| 前端 | 由后端Express静态托管（合并部署） | 免费 |
| 数据库 | SQLite（文件存储，随服务持久） | 免费 |
| 域名 | Render自动分配 `xxx.onrender.com` | 免费 |

**限制：** 免费服务15分钟无访问会休眠，下次访问冷启动约30秒。个人使用完全够用。

---

## 第一步：代码推送到 GitHub

### 1.1 注册 GitHub 账号
- 访问 https://github.com/signup
- 用邮箱注册，验证即可

### 1.2 创建仓库
- 登录后点击右上角 `+` → `New repository`
- Repository name: `spireguide`（或任意名称）
- 选择 `Public`（免费）
- 不要勾选 README 或 .gitignore
- 点击 `Create repository`

### 1.3 推送本地代码

在服务器终端执行：

```bash
cd /root/.openclaw/workspace/tech/projects/slay-spire-guide

# 设置Git用户信息（首次）
git config user.name "JiaWen"
git config user.email "your-email@example.com"

# 添加GitHub远程仓库
# 注意：将下方URL中的 YOUR_USERNAME 替换为你的GitHub用户名
git remote add origin https://github.com/YOUR_USERNAME/spireguide.git

# 推送代码
git push -u origin master
```

> 提示：如果提示输入密码，用 GitHub Personal Access Token 代替密码。
> 生成方式：GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → 勾选 `repo` 权限 → 复制token作为密码输入。

---

## 第二步：注册 Render 账号

1. 访问 https://dashboard.render.com/
2. 点击 `Get Started` → 选择 `GitHub` 登录（推荐，一键授权）
3. 完成授权，进入 Dashboard

> 无需绑定信用卡，免费 tier 直接可用。

---

## 第三步：部署后端服务

### 3.1 创建 Web Service

1. Render Dashboard → `New +` → `Web Service`
2. 选择你刚创建的 GitHub 仓库 `spireguide`
3. 点击 `Connect`

### 3.2 配置服务参数

| 参数 | 填写内容 |
|------|----------|
| Name | `spireguide` |
| Region | Singapore（离你最近） |
| Branch | `master` |
| Root Directory | `03-源码/src/backend` |
| Runtime | `Node` |
| Build Command | `npm install && cd ../../frontend && npm install && npm run build && cp -r dist ../backend/public 2>/dev/null || mkdir -p ../backend/public` |
| Start Command | `node dist/index.js` |

> 说明：这个Build Command做了三件事：
> 1. 安装后端依赖
> 2. 进入前端目录，安装依赖并构建
> 3. 将前端构建产物复制到后端的 public 目录

### 3.3 环境变量

点击 `Advanced` → 添加环境变量：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000`（Render默认端口，也可不填） |

### 3.4 创建服务

点击 `Create Web Service`

Render 会自动：
1. 拉取代码
2. 执行 Build Command（安装依赖 + 构建前后端）
3. 执行 Start Command 启动服务
4. 分配域名：`https://spireguide-xxx.onrender.com`

首次构建约需 2-3 分钟。

---

## 第四步：访问你的应用

构建完成后，Render 会显示服务 URL，例如：

```
https://spireguide-abc123.onrender.com
```

点击即可访问尖塔智囊首页。

---

## 第五步：配置 AI（关键）

1. 打开部署后的网站
2. 侧边栏 →「系统设置」
3. 开启 AI 开关 → 选择 Kimi
4. 粘贴你的 Kimi API 密钥
5. 测试连接 → 保存
6. 返回「AI助手」使用

---

## 数据库说明

**SQLite 在 Render 免费 tier 的持久化情况：**

- ✅ 运行时数据会保存（对局记录、截图、配置）
- ⚠️ 重新部署（git push 新代码）时数据可能丢失
- 解决方案：定期备份或接受 MVP 阶段数据不长期保存

**如需长期保存数据**，后续可迁移到 Render 的免费 PostgreSQL（90天后删除，需定期备份）或 Supabase 免费 PostgreSQL。

---

## 常见问题

### Q: 访问很慢？
免费服务 15 分钟无访问会休眠，首次访问需等待 30 秒左右唤醒。之后正常速度。

### Q: 如何更新代码？
本地修改 → `git add -A && git commit -m "更新内容" && git push`
Render 自动检测推送并重新部署。

### Q: 免费 tier 够用吗？
- 个人使用完全够用
- 每月 750 小时运行时间（≈24/7）
- 100GB 流量
- 如访问量增大，可升级到 $7/月的 Starter plan（不休眠）

### Q: 想用自己的域名？
Render 免费 tier 支持自定义域名：
1. Dashboard → 你的服务 → `Settings` → `Custom Domains`
2. 添加你的域名
3. 按提示配置 DNS CNAME 记录
4. Render 自动提供 HTTPS 证书

---

## 备选方案（如果 Render 不满意）

| 平台 | 费用 | 特点 |
|------|------|------|
| **Railway** | $5/月免费额度 | 部署更简单，但额度用完会暂停 |
| **Vercel + 单独后端** | 前端免费 | 前端用Vercel，后端用Render/Railway |
| **Cloudflare Pages + Workers** | 免费 | 需要代码改造成Workers模式，较复杂 |

---

## 一键部署脚本（可选）

如果你不想手动配置 Render，我可以写一个 `render.yaml` 文件放到项目根目录，实现 Git push 即自动部署（Infrastructure as Code）。需要的话告诉我。

---

**下一步：** 先完成第一步（GitHub 注册 + 推送代码），告诉我你的 GitHub 用户名，我帮你检查配置是否正确。
