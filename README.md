# 工程现场影像智能标注与关联系统

一个用于工程监管、现场巡查、规划核实、违建调查的影像标注管理平台。

## ✨ 功能特性

- 📸 **影像管理**：上传航拍图与现场照片
- 🎯 **智能标注**：点、矩形、多边形标注工具
- 🔗 **附件关联**：标注关联文档、照片、视频
- 📊 **项目管理**：项目创建、任务分配
- 🚀 **云端部署**：支持 Fly.io 一键部署

## 🛠️ 技术栈

**前端**
- React 18 + TypeScript
- Vite
- Ant Design
- Zustand

**后端**
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)

## 📦 本地开发

```bash
# 安装依赖
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 启动后端 (终端1)
cd backend && npm run dev

# 启动前端 (终端2)
cd frontend && npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001/api

## 🚀 Fly.io 部署

```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 部署
fly apps create engineering-image-annotation
fly deploy
```

## 📁 项目结构

```
├── backend/           # 后端服务
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   ├── models/   # 数据模型
│   │   └── index.ts  # 入口文件
│   └── package.json
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   └── package.json
├── Dockerfile
└── fly.toml
```

## 📄 License

MIT
