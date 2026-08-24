// 玄鉴 AI · 姓名数理引擎
// 五格剖象法：天格/人格/地格/外格/总格 + 三才 + 五行 + 81数理

import { NAME_STROKES, SHU_LI, numWX, GAN_WX, WX_SHENG, WX_KE, WX_BEI_KE } from './constants'

// 取字笔画（未知字默认 8 画）
function strokes(ch: string): number {
  return NAME_STROKES[ch] ?? 8
}

export interface NameResult {
  name: string
  surname: string
  given: string
  charStrokes: number[]
  grids: {
    tian: number  // 天格 = 姓笔画 + 1
    ren: number   // 人格 = 姓末字 + 名首字
    di: number    // 地格 = 名笔画和（单名+1）
    wai: number   // 外格 = 总格 - 人格 + 1
    zong: number  // 总格 = 姓名总笔画
  }
  sanCai: { tian: string; ren: string; di: string; relation: string }
  gridAnalysis: { name: string; num: number; ji: string; desc: string }[]
  wxRelation: string
  score: number
  suggestion: string
}

export function analyzeName(fullName: string): NameResult {
  const chars = [...fullName].filter((c) => c.trim() !== '')
  const surname = chars[0] || ''
  const given = chars.slice(1).join('')
  const charStrokes = chars.map(strokes)

  const surnameStrokes = charStrokes[0] || 1
  const givenStrokes = charStrokes.slice(1)
  const givenSum = givenStrokes.reduce((a, b) => a + b, 0)

  // 单姓 vs 复姓简化：此处按单姓处理
  const tian = surnameStrokes + 1
  const ren = surnameStrokes + (givenStrokes[0] || 1)
  const di = givenStrokes.length === 0 ? 1 : givenStrokes.length === 1 ? givenStrokes[0] + 1 : givenSum
  const zong = charStrokes.reduce((a, b) => a + b, 0)
  const wai = zong - ren + 1

  const grids = { tian, ren, di, wai, zong }

  const tianWX = numWX(tian)
  const renWX = numWX(ren)
  const diWX = numWX(di)
  const sanCai = {
    tian: tianWX,
    ren: renWX,
    di: diWX,
    relation: sanCaiRelation(tianWX, renWX, diWX),
  }

  const gridAnalysis = [
    { name: '天格', num: tian, ...getShuLi(tian) },
    { name: '人格', num: ren, ...getShuLi(ren) },
    { name: '地格', num: di, ...getShuLi(di) },
    { name: '外格', num: wai, ...getShuLi(wai) },
    { name: '总格', num: zong, ...getShuLi(zong) },
  ]

  // 评分：人格占比最高，总格次之
  let score = 60
  score += scoreOf(ren) * 1.5
  score += scoreOf(zong) * 1.2
  score += scoreOf(di) * 0.8
  score += scoreOf(tian) * 0.3
  score += scoreOf(wai) * 0.5
  // 三才加分
  if (sanCai.relation.includes('相生')) score += 8
  if (sanCai.relation.includes('相克')) score -= 10
  score = Math.max(35, Math.min(98, Math.round(score)))

  const wxRelation = `人格${renWX}为命主，三才${tianWX}${renWX}${diWX}，${sanCai.relation}。`
  const suggestion = makeSuggestion(score, sanCai.relation, gridAnalysis)

  return {
    name: fullName,
    surname,
    given,
    charStrokes,
    grids,
    sanCai,
    gridAnalysis,
    wxRelation,
    score,
    suggestion,
  }
}

function getShuLi(n: number): { ji: string; desc: string } {
  const m = ((n - 1) % 80) + 1
  const item = SHU_LI[m] || SHU_LI[1]
  return { ji: item.ji, desc: item.desc }
}

function scoreOf(n: number): number {
  const { ji } = getShuLi(n)
  if (ji === '吉') return 12
  if (ji === '半吉') return 4
  return -8
}

function sanCaiRelation(t: string, r: string, d: string): string {
  const upper = WX_SHENG[t] === r ? '天生人' : WX_SHENG[r] === t ? '人生天' : WX_KE[t] === r ? '天克人' : WX_BEI_KE[t] === r ? '人克天' : '比和'
  const lower = WX_SHENG[r] === d ? '人生地' : WX_SHENG[d] === r ? '地生人' : WX_KE[r] === d ? '人克地' : WX_BEI_KE[r] === d ? '地克人' : '比和'
  const all = (upper.includes('生') && lower.includes('生'))
    ? '三才相生，流通有情'
    : (upper.includes('克') || lower.includes('克'))
    ? '三才有克，需调和'
    : '三才平和'
  return `${upper}·${lower}，${all}`
}

function makeSuggestion(score: number, relation: string, grids: { name: string; ji: string }[]): string {
  const good = grids.filter((g) => g.ji === '吉').map((g) => g.name).join('、')
  const bad = grids.filter((g) => g.ji === '凶').map((g) => g.name).join('、')
  let base = ''
  if (score >= 85) base = '此名格局优良，数理吉祥'
  else if (score >= 70) base = '此名格局尚可，中规中矩'
  else base = '此名格局偏弱，数理欠佳'
  let detail = ''
  if (good) detail += `；吉格：${good}`
  if (bad) detail += `；需注意：${bad}`
  if (relation.includes('相生')) detail += '；三才相生为美'
  if (relation.includes('相克')) detail += '；三才有克宜调'
  return base + detail + '。命名一事，数理为辅，心性为本，宜综合考量。'
}
