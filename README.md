# 尖塔智囊 (SpireGuide)

> 杀戮尖塔 AI 攻略平台 — 截图识别 + 策略建议

**版本：** v0.1.1  
**技术栈：** React + TypeScript + Express + SQLite + Kimi AI

---

## 功能

- **AI截图问答** — 上传游戏截图，AI识别角色/血量/手牌/敌人状态，给出策略建议
- **卡牌数据库** — StS1（4角色~350张）+ StS2早期数据，支持搜索/筛选/对比
- **敌人/BOSS数据库** — 血量、意图、对策
- **遗物数据库** — 效果、适用场景
- **对局记录** — 截图时间线 + 文字备注
- **系统设置** — 可视化配置AI提供商（Kimi/OpenAI/自定义）、API密钥、模型参数

---

## 目录结构

```
slay-spire-guide/
├── 01-预实验/          # Vision测试截图 + 精度报告
├── 02-方案/            # 技术方案 + 数据库Schema
├── 03-源码/src/        # 完整项目源码
│   ├── backend/        # Express + SQLite 后端
│   └── frontend/       # React + Tailwind 前端
├── 04-测试/            # API测试 + 测试报告
├── 05-构建/            # 构建脚本
└── 06-交付/            # 部署方案 + 使用说明 + 过程文档
```

---

## 快速启动

### 1. 后端

```bash
cd 03-源码/src/backend
npm install
npm run seed      # 初始化数据库（首次）
npm run dev       # 开发模式 http://localhost:3001
```

### 2. 前端

```bash
cd 03-源码/src/frontend
npm install
npm run dev       # http://localhost:5173
```

---

## 配置AI

1. 打开前端 → 侧边栏「系统设置」
2. 开启AI开关
3. 选择提供商（Kimi/OpenAI/自定义）
4. 输入API密钥
5. 测试连接 → 保存配置
6. 返回AI助手页面即可使用真实AI策略

---

## 部署

```bash
cd 05-构建
bash build.sh     # 一键构建前端+后端
cd ../06-交付/build
bash start.sh     # 启动生产服务
```

详见 `06-交付/部署方案.md`

---

## 说明

- AI策略仅供参考，游戏决策需结合实际判断
- StS2数据随Early Access持续更新，部分卡牌/敌人可能缺失
- 所有数据本地存储，无云端依赖（除AI API调用）

---

**开发：** Irra (CTO) @ 启明科技  
**需求：** JiaWen (CEO)
