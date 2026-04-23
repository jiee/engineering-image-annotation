# 构建阶段 - 前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build && ls -la dist/

# 构建阶段 - 后端
FROM node:20-alpine AS backend-builder

RUN apk add --no-cache python3 make g++

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && ls -la dist/

# 生产阶段
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

# 复制后端依赖和代码
COPY backend/package*.json ./
RUN npm install --omit=dev

# 从构建阶段复制编译后的后端代码
COPY --from=backend-builder /app/backend/dist ./dist

# 从构建阶段复制前端构建产物到 public 目录
COPY --from=frontend-builder /app/frontend/dist ./public

# 验证文件
RUN echo "=== 验证构建产物 ===" && \
    echo "dist 目录:" && ls -la dist/ && \
    echo "public 目录:" && ls -la public/ && \
    echo "public/index.html:" && ls -la public/index.html

# 创建必要目录
RUN mkdir -p /app/uploads /app/data

# 环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/app/data/annotations.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8080

CMD ["node", "dist/index.js"]
