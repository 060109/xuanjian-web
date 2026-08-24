// 玄鉴 AI · AI 配置状态接口
// GET：返回环境变量中的 AI 配置状态（不含 Key 明文）
// POST：仅支持 action=test（用环境变量中的 Key 测试连接）
// 注意：配置已迁移到 Cloudflare Pages 环境变量，不再写入数据库

import { NextRequest, NextResponse } from 'next/server'
import { AI_PROVIDERS, getAIConfig, testAIConnection } from '@/lib/ai-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cfg = await getAIConfig()
    const preset = AI_PROVIDERS[cfg.provider]
    return NextResponse.json({
      config: {
        provider: cfg.provider,
        label: preset.label,
        hasKey: cfg.enabled,
        endpoint: cfg.endpoint || preset.endpoint,
        model: cfg.model || preset.model,
        enabled: cfg.enabled,
        envKey: preset.envKey,
      },
      providers: Object.values(AI_PROVIDERS),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action } = body
    if (action !== 'test') {
      return NextResponse.json(
        { error: 'AI 配置已改为环境变量模式，请在 Cloudflare Pages 控制台配置后重新部署' },
        { status: 400 },
      )
    }
    const result = await testAIConnection()
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('[/api/ai-config] error:', e)
    return NextResponse.json({ error: e?.message || '测试失败' }, { status: 500 })
  }
}
