// 玄鉴 AI · 登录接口
// - 服务端校验 AUTH_USERS（bcrypt 比对，bcryptjs 纯 JS 实现）
// - 防暴力破解：连续失败 5 次锁定 15 分钟 + 恒定失败延迟
// - 成功签发 JWT 写入 HttpOnly + Secure + SameSite=Lax Cookie（7 天）
// 注意：使用 bcryptjs 同步 API（Turbopack/Workers 打包环境下异步 API 不可靠）

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { AUTH_COOKIE, parseAuthUsers, signSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000
const FAIL_DELAY_MS = 700
/** 进程内失败计数（Cloudflare 多实例各自独立，仅作基础防护；生产建议叠加 Cloudflare Rate Limiting） */
const attempts = new Map<string, { fails: number; lockedUntil: number }>()
/** 账号不存在分支的假哈希（保证两种分支耗时一致，防时序侧信道） */
const DUMMY_HASH = bcrypt.hashSync('xuanjian-nonexistent-account', 10)

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const now = Date.now()
  const rec = attempts.get(ip)

  // 锁定中
  if (rec && rec.lockedUntil > now) {
    const remainMin = Math.ceil((rec.lockedUntil - now) / 60000)
    return NextResponse.json(
      { error: `失败次数过多，已临时锁定，请 ${remainMin} 分钟后再试` },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password) {
    return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 })
  }

  const users = parseAuthUsers()
  // [debug] bcrypt 自检：验证库在打包环境下是否正常工作
  console.log(
    '[login-debug] bcrypt selfcheck:',
    bcrypt.compareSync('test-pw', bcrypt.hashSync('test-pw', 10)),
    '| hash type:',
    users[0]?.passwordHash?.slice(0, 7),
  )
  const user = users.find((u) => u.username === username)
  // 账号不存在时也对假哈希做一次比对，保证耗时一致
  const valid = user
    ? bcrypt.compareSync(password, user.passwordHash)
    : bcrypt.compareSync(password, DUMMY_HASH)

  if (!valid) {
    // 固定延迟：无论账号是否存在，响应时间一致
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS))
    const cur = attempts.get(ip)
    const fails = (cur?.fails || 0) + 1
    if (fails >= MAX_FAILS) {
      attempts.set(ip, { fails: 0, lockedUntil: now + LOCK_MS })
    } else {
      attempts.set(ip, { fails, lockedUntil: 0 })
    }
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  // 登录成功：清空失败计数，签发会话
  attempts.delete(ip)
  const token = await signSessionToken(user!.username)
  const res = NextResponse.json({ ok: true, username: user!.username })
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}
