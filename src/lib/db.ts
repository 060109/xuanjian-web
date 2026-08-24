// 玄鉴 AI · 数据库客户端
// 本地开发（Node）：Prisma + SQLite 文件（DATABASE_URL）
// 生产（Cloudflare Pages/Workers）：Prisma + D1 adapter（env.DB 绑定）
// D1 binding 通过 @opennextjs/cloudflare 的 getCloudflareContext() 获取

import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

// Return a plain (non-URL-encoded) absolute path. better-sqlite3 / Prisma's
// sqlite connector cannot open file:// URLs whose Chinese characters have been
// percent-encoded, so we pass a raw Windows/Posix path instead.
function normalizeDatabaseUrl(url?: string): string {
  // already an absolute path or remote url -> keep as-is
  if (url && !url.startsWith('file:')) {
    return url
  }

  let relative = url ? url.slice('file:'.length) : './db/custom.db'
  if (relative.startsWith('//')) relative = relative.slice(2)
  if (/^\/[A-Za-z]:[\\/]/.test(relative)) relative = relative.slice(1)

  const abs = resolve(projectRoot, relative)
  return 'file:' + abs.replace(/\\/g, '/')
}

/** 尝试从 Cloudflare 运行时上下文获取 D1 binding（找不到返回 null） */
function getD1Binding(): D1Database | null {
  try {
    // @opennextjs/cloudflare（Next.js 16 在 Cloudflare 的官方适配器）
    // 本地 Node 环境下 getCloudflareContext 会抛错，捕获后回退 SQLite
    const env = getCloudflareContext().env as unknown as Record<string, unknown>
    if (env?.DB) return env.DB as unknown as D1Database
  } catch {
    /* 非 Cloudflare 环境 */
  }
  // 显式注入（本地模拟 / 测试）
  const injected = (process.env as unknown as Record<string, unknown>).DB
  return injected ? (injected as unknown as D1Database) : null
}

function createClient(): PrismaClient {
  const d1 = getD1Binding()
  if (d1) {
    // Cloudflare D1 环境（生产）
    const adapter = new PrismaD1(d1)
    return new PrismaClient({ adapter })
  }
  // 本地 SQLite（开发）
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
  return new PrismaClient()
}

/** 惰性获取客户端（避免在模块加载时初始化 Prisma，防止静态页面/worker 启动崩溃） */
let lazyClient: PrismaClient | null = null
function getClient(): PrismaClient {
  if (!lazyClient) {
    lazyClient = globalForPrisma.prisma ?? createClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = lazyClient
  }
  return lazyClient
}

/** 惰性代理：首次访问 db.xxx 时才真正初始化 PrismaClient */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient()
    return (client as unknown as Record<string | symbol, unknown>)[prop]
  },
})
