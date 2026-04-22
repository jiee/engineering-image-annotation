# 🚀 Fly.io 部署指南

## 前置要求

1. 注册 Fly.io 账号：https://fly.io/app/sign-up
2. 安装 Fly CLI：
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

## 部署步骤

### 1. 登录 Fly.io
```bash
fly auth login
```

### 2. 进入项目目录
```bash
cd fly-deploy
```

### 3. 创建应用
```bash
fly apps create engineering-image-annotation
```

### 4. 创建持久化存储（可选，用于保存数据）
```bash
fly volumes create data --size 1
```

### 5. 部署
```bash
fly deploy
```

### 6. 查看部署状态
```bash
fly status
fly logs
```

### 7. 访问应用
部署成功后会显示访问地址，格式为：
- https://engineering-image-annotation.fly.dev

## 环境变量设置（可选）

如需自定义配置：
```bash
fly secrets set MY_SECRET=value
```

## 常用命令

```bash
# 查看日志
fly logs

# SSH 进入容器
fly ssh console

# 扩容
fly scale count 2

# 销毁应用
fly apps destroy engineering-image-annotation
```

## 注意事项

1. **免费额度**：Fly.io 提供每月 3 个共享 CPU VM 和 3GB 持久化存储
2. **数据持久化**：应用重启后数据会丢失，建议创建 volume
3. **镜像大小**：构建时间约 3-5 分钟
4. **冷启动**：免费套餐的应用长时间不用会休眠，首次访问较慢

## 故障排查

```bash
# 查看详细日志
fly logs -a engineering-image-annotation

# 检查部署配置
fly info

# 本地测试 Docker 构建
docker build -t test-app .
docker run -p 8080:8080 test-app
```
