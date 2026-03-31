# ImageBackgroundRemover

一键移除图片背景的在线工具。

## 功能特性

- 📤 支持拖拽或点击上传图片
- 🖼️ 支持 JPG、PNG 格式（最大 10MB）
- ✨ 自动移除背景，返回透明 PNG
- 📱 支持移动端使用
- 🔄 前后对比预览
- 💾 一键下载结果

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制 `.env.example` 为 `.env.local`，填入你的 Remove.bg API Key：

```bash
cp .env.example .env.local
# 编辑 .env.local，替换 REMOVE_BG_API_KEY 的值
```

获取 API Key: https://www.remove.bg/api

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Cloudflare Pages

### 方式一：GitHub 部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "ready for cloudflare"
   # 创建 GitHub 仓库并推送
   ```

2. **登录 Cloudflare Pages**
   - 访问 https://pages.cloudflare.com
   - 新建项目 → 连接到 GitHub
   - 选择仓库 `image-background-remover`

3. **配置构建**
   - 构建命令: `npm run build`
   - 输出目录: `.next`

4. **添加环境变量**
   - 变量名: `REMOVE_BG_API_KEY`
   - 值: 你的 Remove.bg API Key

5. **Node 版本**
   - 在 Pages 设置中找到"环境变量"或"Functions"
   - 添加: `NODE_VERSION = 18`

6. **部署完成！**
   - 访问分配的域名即可使用

### 方式二：wrangler CLI 部署

```bash
# 安装 wrangler
npm install wrangler --save-dev

# 登录 Cloudflare
npx wrangler login

# 部署
npx wrangler pages deploy .next
```

## 技术栈

- **框架**: Next.js 14
- **样式**: Tailwind CSS
- **API**: Remove.bg
- **托管**: Cloudflare Pages

## 许可证

MIT
