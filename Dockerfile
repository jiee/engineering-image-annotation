# 构建阶段 - 前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 构建阶段 - 后端
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装 Python 和构建工具（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 复制后端
COPY backend/package*.json ./
RUN npm install --production

# 编译 TypeScript
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm install -g typescript && tsc

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
