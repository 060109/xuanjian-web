// 玄鉴 AI · 塔罗占卜引擎

import { MAJOR_ARCANA, TarotCard } from './constants'

export interface DrawnCard {
  card: TarotCard
  position: string // 牌位含义
  reversed: boolean
}

export interface TarotSpread {
  id: string
  name: string
  desc: string
  positions: string[]
}

export const SPREADS: TarotSpread[] = [
  { id: 'single', name: '单牌占卜', desc: '一事一问，洞察当下核心能量', positions: ['当下指引'] },
  { id: 'three', name: '三牌牌阵', desc: '过去·现在·未来 三段时序', positions: ['过去', '现在', '未来'] },
  { id: 'timeflow', name: '时间流牌阵', desc: '五牌推演事情发展脉络', positions: ['起因', '近期', '当下', '近未来', '远未来'] },
  { id: 'career', name: '事业牌阵', desc: '洞察职业发展与抉择', positions: ['现状', '挑战', '优势', '建议', '前景'] },
  { id: 'love', name: '感情牌阵', desc: '关系中的彼此与走向', positions: ['自我', '对方', '关系现状', '阻碍', '未来'] },
]

export function drawSpread(spreadId: string): DrawnCard[] {
  const spread = SPREADS.find((s) => s.id === spreadId) || SPREADS[0]
  const used = new Set<number>()
  const cards: DrawnCard[] = []
  for (let i = 0; i < spread.positions.length; i++) {
    let idx: number
    do {
      idx = Math.floor(Math.random() * MAJOR_ARCANA.length)
    } while (used.has(idx))
    used.add(idx)
    cards.push({
      card: MAJOR_ARCANA[idx],
      position: spread.positions[i],
      reversed: Math.random() < 0.4,
    })
  }
  return cards
}

export function cardMeaning(d: DrawnCard): string {
  return d.reversed ? d.card.reversed : d.card.upright
}

export function spreadConclusion(cards: DrawnCard[], spreadName: string): string {
  const positive = cards.filter((c) => !c.reversed).length
  const total = cards.length
  const ratio = positive / total
  let tone = ''
  if (ratio >= 0.7) tone = '整体能量明朗，事态向积极方向发展。'
  else if (ratio >= 0.4) tone = '能量交织，吉凶参半，需以觉察转化阻碍。'
  else tone = '当下能量偏沉，宜内省沉淀，等待转机。'
  const keyCard = cards[Math.floor(total / 2)]
  return `${spreadName}：核心能量集中于《${keyCard.card.name}》（${keyCard.reversed ? '逆位' : '正位'}），${keyCard.reversed ? keyCard.card.reversed : keyCard.card.upright}。${tone}`
}
