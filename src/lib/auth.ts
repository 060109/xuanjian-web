// 玄鉴 AI · 服务端鉴权核心
// - AUTH_USERS 环境变量解析（JSON 数组，密码为 bcrypt 哈希）
// - bcrypt 密码比对（bcryptjs 纯 JS 实现，兼容 Cloudflare 运行时）
// - jose 签发 / 验证 JWT（edge 兼容）
// - HttpOnly Cookie 会话

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { NextRequest } from 'next/server'

export const AUTH_COOKIE = 'xj_token'
export const SESSION_DAYS = 7

/** 本地兜底密钥 —— 生产环境必须在 Cloudflare 配置 JWT_SECRET */
function jwtSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'xuanjian-dev-secret-do-not-use-in-prod',
  )
}

export interface AuthUser {
  username: string
  passwordHash: string
}

/**
 * 解析 AUTH_USERS 环境变量。
 * 格式：[{"username":"admin","password":"$2b$10$..."}]
 * 解析失败时返回空数组（此时登录接口对任何账号都拒绝）。
 */
export function parseAuthUsers(): AuthUser[] {
  const raw = process.env.AUTH_USERS || '[]'
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .filter(
        (u: unknown): u is { username: string; password: string } =>
          !!u &&
          typeof (u as { username?: unknown }).username === 'string' &&
          typeof (u as { password?: unknown }).password === 'string',
      )
      .map((u) => ({ username: u.username, passwordHash: u.password }))
  } catch {
    return []
  }
}

/** 供「账号不存在」分支使用的假哈希，保证两种分支耗时一致，防时序侧信道 */
const DUMMY_HASH = bcrypt.hashSync('xuanjian-dummy-password', 10)

/**
 * 校验用户名 + 明文密码。成功返回用户，失败返回 null。
 * 账号不存在时也执行一次 bcrypt 比对，避免时序差异。
 * 使用同步 API（Turbopack/Workers 打包环境下异步 API 不可靠）。
 */
export function verifyCredentials(
  username: string,
  password: string,
): AuthUser | null {
  const users = parseAuthUsers()
  const user = users.find((u) => u.username === username)
  const ok = bcrypt.compareSync(password, user ? user.passwordHash : DUMMY_HASH)
  return user && ok ? user : null
}

/** 签发会话 JWT（HS256，7 天有效） */
export async function signSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(jwtSecret())
}

/** 验证会话 JWT，有效返回用户名，无效/过期返回 null */
export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/** 从 NextRequest 中解析当前登录用户名（middleware / API 通用） */
export async function getSessionFromRequest(
  req: NextRequest,
): Promise<string | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
