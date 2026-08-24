// 玄鉴 AI · 系统提示词与记忆检索

import { db } from '@/lib/db'
import { AIProvider } from '@/lib/ai-config'

export interface KnowledgeChunk {
  docTitle: string
  category: string
  snippet: string
}

export const XJ_SYSTEM_PROMPT = `你是一名研究东方传统术数多年的老师，精通八字命理、六爻、梅花易数、奇门遁甲、姓名学、塔罗体系与传统典籍。

你的任务：结合用户上传资料、传统算法与AI推理能力，为用户提供系统化分析。

回答必须：
- 有理论依据，说明分析过程
- 引用相关知识来源（典籍、算法结果）
- 避免简单模板，给出有深度的推演
- 使用「趋势」「可能」「参考」「建议」等表达，不使用绝对预测
- 语气沉稳、专业、有东方学者的雅致

回答结构建议：
1. 简述所问之事与对应术数体系
2. 列出关键算法结果（如四柱、卦象、格局）
3. 结合五行生克、象数理占进行分析
4. 给出趋势性建议与注意事项

若用户提供命盘/卦象数据，请基于该数据推演。若知识库有相关典籍内容，请适当引用。
你拥有跨会话记忆：下方「历史记忆」中是过往推演与对话的精华，可参考以保持一致性与深化分析。`

/**
 * 各术数模块的解读指引 —— 用于 /api/analyze
 */
export const MODULE_GUIDES: Record<string, string> = {
  bazi: `【八字命理解读指引】
基于四柱八字算法结果，请深入分析：
1. 日主强弱与五行偏枯（引用算法给出的五行统计与身强/身弱判定）
2. 格局层次（正官/七杀/食神/伤官/财格/印格等）的成格成败
3. 十神配置与性格禀赋、六亲缘分
4. 大运流年走势：哪步大运为喜、哪步为忌，当前所处运势
5. 事业、财运、健康、感情的趋势性建议（结合用神）
引用《滴天髓》《穷通宝鉴》《三命通会》等典籍理论佐证。`,
  liuyao: `【六爻梅花解读指引】
基于起卦算法结果（本卦/变卦/世应/六亲/六神/动爻/体用），请深入分析：
1. 卦象总义：本卦所主、变卦所趋
2. 用神选取与旺衰：所问之事对应何六亲，旺相休囚如何
3. 动爻变化的核心信息（动而生克、变吉变凶）
4. 世应关系与人事对应
5. 体用生克（梅花）与吉凶趋势
6. 应期与结论：趋势性判断，宜进宜退
引用《周易》《梅花易数》《卜筮正宗》等典籍。`,
  qimen: `【奇门遁甲解读指引】
基于九宫排盘结果（局数/直符直使/八门/九星/八神/天地盘干/空亡），请深入分析：
1. 局象总势：阳遁/阴遁、顺逆、节气适配
2. 直符落宫与用神落宫的关系
3. 三吉门（生/开/景）与凶门（死/伤/惊）的方位吉凶
4. 九星旺相与八神吉凶对所问之事的影响
5. 天盘地盘干相生相克、伏吟反吟
6. 空亡与马星等特殊格局
7. 趋吉避凶的方位与时机建议
引用《奇门遁甲秘笈》《烟波钓叟歌》等典籍。`,
  tarot: `【塔罗占卜解读指引】
基于抽牌结果（牌阵/各牌位/正逆位/牌义），请深入分析：
1. 牌阵整体能量脉络（过去→现在→未来的流向）
2. 逐牌解读：每张牌在所属牌位的特定含义，正逆位的差异
3. 牌与牌之间的元素关系与故事线
4. 核心牌（中心位/关键位）的统领意义
5. 潜意识投射与心理提示
6. 综合趋势建议：可能的走向与需要注意的卡点
语气可稍带神秘感但保持专业，结合塔罗的象征体系。`,
  name: `【姓名数理解读指引】
基于五格剖象法计算结果（天格/人格/地格/外格/总格/三才/评分），请深入分析：
1. 人格（命主）与总格（晚年运）的数理吉凶与性格影响
2. 三才五行配置（天/人/地）的相生相克关系
3. 五格数理的整体格局优劣
4. 姓名对性格、事业、健康、人际的可能影响
5. 若有不足，给出调名/补运的温和建议（不必改名的替代方案）
引用姓名学理论，强调"数理为辅，心性为本"。`,
}

/**
 * 将长文本切分为约 size 字符的段落块（按换行分段，保留语义连贯）
 */
function chunkText(text: string, size = 400): string[] {
  const paras = text
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const chunks: string[] = []
  let cur = ''
  for (const p of paras) {
    if (cur && cur.length + p.length > size) {
      chunks.push(cur)
      cur = ''
    }
    cur += (cur ? '\n' : '') + p
    if (cur.length >= size) {
      chunks.push(cur)
      cur = ''
    }
  }
  if (cur) chunks.push(cur)
  if (chunks.length === 0 && text.trim()) chunks.push(text.trim().slice(0, size))
  return chunks
}

/**
 * 文档检索（RAG）：把 query 拆成中文二元词组 + 单字，按段落块召回最相关片段。
 * 评分：二元词组命中(+2) > 关键词命中(+5) > 标题包含(+4) > 单字覆盖(+0.1)。
 */
export function retrieveKnowledge(
  docs: { title: string; category: string | null; content: string; keywords: string | null }[],
  query: string,
  topK = 3,
): KnowledgeChunk[] {
  if (!docs.length) return []
  const qChars = [...query].filter((c) => /[\u4e00-\u9fa5a-zA-Z]/.test(c))
  if (qChars.length === 0) return []

  // 中文二元词组 + 单字，用于短语级匹配
  const qTerms = new Set<string>()
  if (qChars.length === 1) {
    qTerms.add(qChars[0])
  } else {
    for (let i = 0; i < qChars.length - 1; i++) qTerms.add(qChars[i] + qChars[i + 1])
    qChars.forEach((c) => qTerms.add(c))
  }

  const results: { doc: (typeof docs)[number]; score: number; snippet: string }[] = []
  for (const d of docs) {
    const chunks = chunkText(d.content, 400)
    let bestScore = 0
    let bestSnippet = ''
    for (const ch of chunks) {
      let score = 0
      qTerms.forEach((t) => {
        if (ch.includes(t)) score += t.length > 1 ? 2 : 0.1
      })
      const kws = (d.keywords || '').split(',').filter(Boolean)
      kws.forEach((k) => {
        if (query.includes(k)) score += 5
      })
      if (d.title && query.includes(d.title)) score += 4
      if (score > bestScore) {
        bestScore = score
        bestSnippet = ch
      }
    }
    if (bestScore > 0) results.push({ doc: d, score: bestScore, snippet: bestSnippet })
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topK).map((r) => ({
    docTitle: r.doc.title,
    category: r.doc.category || '未分类',
    snippet: r.snippet.slice(0, 320),
  }))
}

/**
 * 记忆检索：召回与本次推演相关的历史计算记录与对话
 * - 同类型的历史计算（提供连贯性）
 * - 近期 AI 对话（提供风格一致性）
 */
export async function retrieveMemories(type: string, query: string) {
  const [relatedCalcs, recentChats] = await Promise.all([
    db.calculation.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, type: true, result: true, note: true, createdAt: true },
    }),
    db.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { role: true, content: true, createdAt: true },
    }),
  ])

  const calcMems = relatedCalcs.map((c, i) => {
    let summary = c.title
    try {
      const r = JSON.parse(c.result || '{}')
      const keys = Object.keys(r).slice(0, 4)
      summary += ' | ' + keys.map((k) => `${k}:${typeof r[k] === 'object' ? JSON.stringify(r[k]).slice(0, 40) : String(r[k]).slice(0, 40)}`).join(' ')
    } catch {
      /* ignore */
    }
    return `【历次${type}推演 ${i + 1}】${summary}`
  })

  const chatMems = recentChats
    .filter((m) => m.content && m.content.length < 500)
    .map((m, i) => `【往期对话 ${i + 1}·${m.role === 'user' ? '问' : '答'}】${m.content.slice(0, 150)}`)

  return { calcMems, chatMems, count: calcMems.length + chatMems.length }
}
