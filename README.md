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

### 1. 克隆项目

```bash
git clone https://github.com/wengweng66/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

复制 `.env.example` 为 `.env.local`，填入你的 Remove.bg API Key：

```bash
cp .env.example .env.local
# 编辑 .env.local，替换 REMOVE_BG_API_KEY 的值
```

获取 API Key: https://www.remove.bg/api

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wengweng66/image-background-remover)

部署时需要在 Vercel 项目设置中添加 `REMOVE_BG_API_KEY` 环境变量。

### Cloudflare Pages

1. 推送代码到 GitHub
2. 在 Cloudflare Pages 绑定 GitHub 仓库
3. 构建命令: `npm run build`
4. 输出目录: `.next`
5. 添加环境变量 `REMOVE_BG_API_KEY`

## 技术栈

- **框架**: Next.js
- **样式**: Tailwind CSS
- **API**: Remove.bg

## 许可证

MIT