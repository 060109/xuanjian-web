// 玄鉴 AI · 大模型配置层
// 统一 AI 调用入口，支持 DeepSeek / OpenAI / 通义千问（OpenAI 兼容协议）
// 所有敏感配置一律从环境变量读取（生产：Cloudflare Pages Environment Variables）
//   通用：AI_PROVIDER(deepseek|openai|qwen) · AI_MODEL · AI_ENDPOINT · AI_API_KEY
//   Provider 专属：DEEPSEEK_API_KEY / OPENAI_API_KEY / DASHSCOPE_API_KEY

export type AIProvider = 'deepseek' | 'openai' | 'qwen'

export interface AIProviderConfig {
  id: AIProvider
  label: string
  desc: string
  endpoint: string
  model: string
  needsKey: boolean
  keyPlaceholder?: string
  keyHint?: string
  envKey: string
}

/** 各 provider 的默认配置（用户可在环境变量中覆盖 endpoint/model） */
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek 深度求索',
    desc: '所有回答基于 DeepSeek 大模型 + 用户上传典籍，推荐',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    needsKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyHint: '在 platform.deepseek.com 获取 API Key',
    envKey: 'DEEPSEEK_API_KEY',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI GPT',
    desc: '使用 GPT-4o 系列模型（需科学上网）',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    needsKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyHint: '在 platform.openai.com 获取 API Key',
    envKey: 'OPENAI_API_KEY',
  },
  qwen: {
    id: 'qwen',
    label: '阿里通义千问',
    desc: '使用 DashScope 通义千问模型',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    needsKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyHint: '在 dashscope.aliyun.com 获取 API Key',
    envKey: 'DASHSCOPE_API_KEY',
  },
}

export interface ChatMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
}

export interface AICompletionResult {
  content: string
  provider: AIProvider
  model?: string
}

export interface AIConfigRecord {
  provider: AIProvider
  apiKey: string | null
  endpoint: string | null
  model: string | null
  enabled: boolean
}

/** 从环境变量读取 AI 配置（生产环境由 Cloudflare Pages 注入） */
export async function getAIConfig(): Promise<AIConfigRecord> {
  const provider = (process.env.AI_PROVIDER || 'deepseek') as AIProvider
  const preset = AI_PROVIDERS[provider]
  const apiKey =
    process.env[preset.envKey] || process.env.AI_API_KEY || null
  return {
    provider,
    apiKey,
    endpoint: process.env.AI_ENDPOINT || null,
    model: process.env.AI_MODEL || null,
    enabled: !!apiKey,
  }
}

/**
 * 统一 AI 调用入口（OpenAI 兼容协议）
 * 未配置 Key 时抛出明确错误，提示到 Cloudflare 环境变量配置
 */
export async function aiComplete(messages: ChatMessage[]): Promise<AICompletionResult> {
  const cfg = await getAIConfig()
  const preset = AI_PROVIDERS[cfg.provider]

  if (!cfg.apiKey) {
    throw new Error(
      `未配置 AI API Key：请在环境变量中设置 ${preset.envKey}（或通用 AI_API_KEY），并在 Cloudflare Pages 控制台填入后重新部署。`,
    )
  }

  const endpoint = cfg.endpoint || preset.endpoint
  const model = cfg.model || preset.model

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`${preset.label} 接口错误（${res.status}）：${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  return {
    content: data?.choices?.[0]?.message?.content || `（${preset.label} 无响应）`,
    provider: cfg.provider,
    model,
  }
}

/** 测试连接 —— 验证环境变量中的 API Key / endpoint 是否可用 */
export async function testAIConnection(): Promise<{ ok: boolean; message: string }> {
  const cfg = await getAIConfig()
  const preset = AI_PROVIDERS[cfg.provider]

  if (!cfg.apiKey) {
    return { ok: false, message: `未配置 API Key：请设置环境变量 ${preset.envKey}` }
  }

  try {
    const endpoint = cfg.endpoint || preset.endpoint
    const model = cfg.model || preset.model
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '你好，请回复"连接成功"四个字' }],
        max_tokens: 20,
        stream: false,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { ok: false, message: `接口返回 ${res.status}：${errText.slice(0, 160)}` }
    }
    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || ''
    return { ok: true, message: `连接成功（${preset.label} · ${model}）：${String(reply).slice(0, 60)}` }
  } catch (e: any) {
    return { ok: false, message: `连接失败：${e?.message || e}` }
  }
}
