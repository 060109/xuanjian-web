import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiComplete } from '@/lib/ai-config'
import { XJ_SYSTEM_PROMPT, retrieveKnowledge } from '@/lib/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatBody {
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
  context?: string
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], context = '' } = (await req.json()) as ChatBody
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 })
    }

    // 1. RAG：从典籍库检索与本次对话相关的片段
    const docs = await db.document.findMany({
      select: { title: true, category: true, content: true, keywords: true },
    })
    const knowledge = retrieveKnowledge(docs as any, message, 4)
    const knowledgeText = knowledge.length
      ? knowledge
          .map((k, i) => `【典籍${i + 1}】《${k.docTitle}》（${k.category}）：\n${k.snippet}`)
          .join('\n\n')
      : '（知识库暂无相关典籍，可建议用户到「典籍库」上传 PDF/TXT/Word 资料以丰富推演依据）'

    const contextText = context
      ? `\n\n[用户提供的算法/命盘数据]\n${context}`
      : ''

    // 2. 构建消息：系统提示词 + 典籍检索结果 + 历史对话 + 当前提问
    const messages = [
      { role: 'system' as const, content: XJ_SYSTEM_PROMPT },
      {
        role: 'system' as const,
        content: `以下是玄鉴知识库中检索到的相关典籍内容，请结合引用，做到「基于用户上传文档 + AI 推演」结合回答：\n\n${knowledgeText}${contextText}`,
      },
      ...history.slice(-10).map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ]

    // 3. 调用用户配置的 AI 大模型（DeepSeek / 通义千问 / OpenAI / Ollama / 内置）
    const result = await aiComplete(messages)

    // 4. 持久化对话记录（形成跨会话记忆）
    try {
      await db.chatMessage.create({ data: { role: 'user', content: message, context } })
      await db.chatMessage.create({ data: { role: 'assistant', content: result.content, context } })
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      reply: result.content,
      provider: result.provider,
      model: result.model,
      knowledge: knowledge.map((k) => ({ docTitle: k.docTitle, category: k.category })),
    })
  } catch (e: any) {
    console.error('[/api/chat] error:', e)
    return NextResponse.json(
      { error: '推演失败：' + (e?.message || '未知错误') },
      { status: 500 },
    )
  }
}
