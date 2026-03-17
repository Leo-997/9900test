FROM node:24.13.0-slim

# 设置工作目录
WORKDIR /app

# 复制依赖定义文件
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# 安装依赖及基础构建工具
RUN npm install
RUN npm install -g @nestjs/cli 

# 复制所有源代码
COPY . .

# 暴露所有相关微服务端口
EXPOSE 3000 3001 3002 3003 3004 3006

# 启动命令
CMD ["npx", "nx", "run-many", "-t", "start:dev", "--projects=zero-dash-frontend,zero-dash-api,zero-dash-clinical,zero-dash-reports,zero-dash-evidence"]