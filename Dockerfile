# 构建阶段 - 前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 构建阶段 - 后端
FROM node:20-alpine AS backend-builder

# 安装 Python 和构建工具（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

WORKDIR /app/backend
COPY backend/package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm install

# 复制源代码并编译
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装 Python 和构建工具（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 复制后端
COPY backend/package*.json ./
# 只安装生产依赖
RUN npm install --omit=dev

# 从构建阶段复制编译后的文件
COPY --from=backend-builder /app/backend/dist ./dist

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./public

# 创建必要目录
RUN mkdir -p /app/uploads /app/data

# 环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/app/data/annotations.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8080

CMD ["node", "dist/index.js"]
