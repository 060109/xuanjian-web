import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiComplete } from '@/lib/ai-config'
import { XJ_SYSTEM_PROMPT, MODULE_GUIDES, retrieveKnowledge, retrieveMemories } from '@/lib/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface AnalyzeBody {
  type: 'bazi' | 'liuyao' | 'qimen' | 'tarot' | 'name'
  title: string
  question?: string // 用户的问题（塔罗必填，其他可选）
  calcResult: Record<string, unknown> // 算法计算结果
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, question = '', calcResult } = (await req.json()) as AnalyzeBody
    if (!type || !calcResult) {
      return NextResponse.json({ error: 'type 与 calcResult 必填' }, { status: 400 })
    }

    const guide = MODULE_GUIDES[type] || MODULE_GUIDES.bazi

    // 1. RAG：检索典籍库
    const docs = await db.document.findMany({
      select: { title: true, category: true, content: true, keywords: true },
    })
    const queryText = `${title} ${question} ${type}`
    const knowledge = retrieveKnowledge(docs as any, queryText, 3)
    const knowledgeText = knowledge.length
      ? knowledge.map((k, i) => `【典籍${i + 1}】《${k.docTitle}》（${k.category}）：\n${k.snippet}`).join('\n\n')
      : '（知识库暂无相关典籍，可建议用户上传）'

    // 2. 记忆检索：相关历史计算 + 近期对话
    const { calcMems, chatMems, count: memCount } = await retrieveMemories(type, queryText)
    const memoryText =
      calcMems.length || chatMems.length
        ? [...calcMems, ...chatMems].join('\n')
        : '（暂无历史记忆，本次为首次推演）'

    // 3. 构建消息
    const calcJson = JSON.stringify(calcResult, null, 2).slice(0, 6000)
    const questionText = question ? `\n\n【用户所问】${question}` : ''

    const messages = [
      { role: 'system' as const, content: XJ_SYSTEM_PROMPT },
      {
        role: 'assistant' as const,
        content: `本次为「${type}」术数模块的算法推演解读任务。

${guide}

【算法计算结果（JSON）】
${calcJson}${questionText}

【玄鉴知识库 · 典籍检索】
${knowledgeText}

【历史记忆（跨会话，供参考保持一致）】
${memoryText}

请基于以上算法结果、典籍与记忆，给出有深度的解读。引用典籍时注明出处。`,
      },
      { role: 'user' as const, content: question || `请解读此${type}推演结果` },
    ]

    // 4. 调用 AI 大模型
    const result = await aiComplete(messages)

    // 5. 保存计算记录（含 AI 解读）到历史档案 —— 形成持久记忆
    try {
      await db.calculation.create({
        data: {
          type,
          title,
          input: JSON.stringify({ question }),
          result: JSON.stringify({ ...calcResult, __aiAnalysis: result.content }),
          note: `AI解读·引用典籍${knowledge.length}·记忆${memCount}条`,
        },
      })
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      analysis: result.content,
      knowledge: knowledge.map((k) => ({ docTitle: k.docTitle, category: k.category })),
      memoryCount: memCount,
      provider: result.provider,
      model: result.model,
    })
  } catch (e: any) {
    console.error('[/api/analyze] error:', e)
    return NextResponse.json(
      { error: 'AI解读失败：' + (e?.message || '未知错误') },
      { status: 500 },
    )
  }
}
