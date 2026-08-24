// 玄鉴 AI · 会话查询（当前登录用户）

import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const username = await getSessionFromRequest(req)
  if (!username) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  return NextResponse.json({ username })
}
