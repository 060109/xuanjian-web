// 玄鉴 AI · 路由守卫（Next.js middleware，Edge Runtime）
// 规则：
//  1. 未登录访问任何页面（含 / 与子页面）→ 302 /login?next=<原路径>，登录后跳回
//  2. 已登录访问 /login → 302 到首页
//  3. API：除 /api/auth/login 外一律要求登录，未登录返回 401 JSON（防止绕过页面直接调接口）
//  4. 白名单：/login、/api/auth/login、静态资源（_next、图标、manifest、sw 等）

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { AUTH_COOKIE } from '@/lib/auth'

/** 页面/API 白名单（精确匹配） */
const PUBLIC_PATHS = new Set(['/login', '/api/auth/login'])
/** 静态资源前缀白名单（即使被 middleware 捕获也放行） */
const STATIC_PREFIXES = ['/_next/', '/icons/', '/icon-', '/maskable-']
const STATIC_FILES = new Set([
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/offline.html',
  '/robots.txt',
  '/logo.svg',
  '/site.webmanifest',
])

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (STATIC_FILES.has(pathname)) return true
  return STATIC_PREFIXES.some((p) => pathname.startsWith(p))
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (!token) return false
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'xuanjian-dev-secret-do-not-use-in-prod',
  )
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  const loggedIn = await hasValidSession(req)

  // API 路由：未登录一律 401
  if (pathname.startsWith('/api/')) {
    if (!loggedIn) {
      return NextResponse.json({ error: '未登录或会话已过期' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // 页面路由
  if (!loggedIn) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    // 携带原路径，登录成功后跳回
    loginUrl.search = `next=${encodeURIComponent(pathname + req.nextUrl.search)}`
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // 排除纯静态资源，减少 edge 调用开销
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-|maskable-|logo\\.svg|manifest\\.json|sw\\.js|offline\\.html|robots\\.txt|icons/).*)',
  ],
}
