// 玄鉴 AI · Cloudflare Pages 构建准备脚本
// 在 opennextjs-cloudflare build 之后执行：
// 1. 将 .open-next/worker.js 复制为 _worker.js（Pages 识别为 Worker 入口）
// 2. 将 .open-next/assets/* 展开到 .open-next/ 根（静态资源由 Pages 直接服务）
import { cpSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const root = resolve('.')
const out = resolve(root, '.open-next')
const assets = resolve(out, 'assets')

if (!existsSync(resolve(out, 'worker.js'))) {
  console.error('✗ .open-next/worker.js 不存在，请先运行 opennextjs-cloudflare build')
  process.exit(1)
}

// 1. _worker.js
cpSync(resolve(out, 'worker.js'), resolve(out, '_worker.js'))
console.log('✓ _worker.js 已生成')

// 2. 展开 assets 到根目录
if (existsSync(assets)) {
  cpSync(assets, out, { recursive: true })
  console.log('✓ assets 已展开到 .open-next/ 根')
}

// 3. 确保 .open-next 目录可被 Pages 识别（防止空目录）
mkdirSync(out, { recursive: true })
console.log('✓ Cloudflare Pages 构建准备完成')
