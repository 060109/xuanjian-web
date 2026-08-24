// 玄鉴 AI · 奇门遁甲引擎
// 九宫飞星排盘：天盘九星 / 八门 / 八神 / 天盘地盘干

import { DI_ZHI, JIU_XING_FULL, BA_MEN_FULL, BA_SHEN_FULL, GAN_WX, TIAN_GAN } from './constants'

// 后天八卦九宫（洛书）位置：1坎 2坤 3震 4巽 5中 6乾 7兑 8艮 9离
const PALACE_NAMES = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离']
const PALACE_DIRS = ['北', '西南', '东', '东南', '中', '西北', '西', '东北', '南']

// 九星顺序（按天蓬星为首，顺排）
const STAR_ORDER = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英']
// 八门顺序
const MEN_ORDER = ['休', '生', '伤', '杜', '景', '死', '惊', '开']
// 八神顺序
const SHEN_ORDER = ['直符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

export interface QimenPalace {
  palace: number // 1-9
  name: string
  direction: string
  star: string
  men: string
  shen: string
  tianGan: string // 天盘干
  diGan: string // 地盘干
  wx: string
  isKong: boolean // 空亡
}

export interface QimenResult {
  method: string
  time: { year: number; month: number; day: number; hour: number }
  ju: string // 局数 阴遁/阳遁 X局
  zhiFushi: string // 直符使
  palaces: QimenPalace[]
  analysis: string
}

// 时家奇门简化排盘
export function castQimen(year: number, month: number, day: number, hour: number): QimenResult {
  // 简化：以时辰干支推局数
  const jdn = year * 365 + month * 30 + day + hour / 24
  // 阳遁/阴遁：冬至到夏至为阳遁，夏至到冬至为阴遁（简化按月份）
  const isYang = month >= 11 || month <= 4 // 11-4月阳遁
  const ju = ((Math.floor(jdn) % 9) + 9) % 9 + 1
  const juName = `${isYang ? '阳遁' : '阴遁'}${ju}局`

  // 地盘干：按局数戊己庚辛壬癸丁丙乙排于九宫
  const diGanOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']
  // 中宫无干，寄二宫
  const palaceGan: string[] = []
  for (let i = 0; i < 9; i++) {
    if (i === 4) palaceGan.push('') // 中宫
    else palaceGan.push(diGanOrder[i < 4 ? i : i - 1])
  }

  // 天盘星：以直符落宫起，顺飞九宫
  const starStart = ju % 9 || 9
  const menStart = (ju + 1) % 9 || 9
  const shenStart = (ju + 2) % 9 || 9
  const tianGanStart = ju

  // 飞星顺序（洛书 1→2→3→4→5→6→7→8→9）
  const flyOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 宫位索引

  const palaces: QimenPalace[] = []
  // 空亡简化：以日辰推
  const dayGanIdx = (Math.floor(jdn) + 9) % 10
  const kongPos = [(dayGanIdx % 6) + 0, (dayGanIdx % 6) + 1]

  for (let i = 0; i < 9; i++) {
    const pIdx = i // 宫位
    const starIdx = (starStart - 1 + i) % 9
    const menIdx = (menStart - 1 + i) % 8
    const shenIdx = (shenStart - 1 + i) % 8
    const tgIdx = (tianGanStart + i) % 9
    const palaceName = PALACE_NAMES[pIdx]
    const isCenter = pIdx === 4

    palaces.push({
      palace: pIdx + 1,
      name: palaceName,
      direction: PALACE_DIRS[pIdx],
      star: isCenter ? '天禽' : STAR_ORDER[starIdx],
      men: isCenter ? '—' : BA_MEN_FULL[MEN_ORDER[menIdx]]?.name || MEN_ORDER[menIdx],
      shen: BA_SHEN_FULL[SHEN_ORDER[shenIdx]]?.name || SHEN_ORDER[shenIdx],
      tianGan: isCenter ? '' : TIAN_GAN[tgIdx % 10],
      diGan: palaceGan[pIdx],
      wx: GAN_WX[palaceGan[pIdx]] || '土',
      isKong: kongPos.includes(pIdx),
    })
  }

  const analysis = generateQimenAnalysis(palaces, isYang, ju)
  return {
    method: '时家奇门（飞盘简化）',
    time: { year, month, day, hour },
    ju: juName,
    zhiFushi: `直符天${STAR_ORDER[starStart - 1]}·直使${MEN_ORDER[(menStart - 1) % 8]}门`,
    palaces,
    analysis,
  }
}

function generateQimenAnalysis(palaces: QimenPalace[], isYang: boolean, ju: number): string {
  // 找直符宫与生门宫
  const zhiFu = palaces.find((p) => p.star.includes('天禽') || p.palace === 5) || palaces[0]
  const shengMen = palaces.find((p) => p.men === '生门')
  const kaiMen = palaces.find((p) => p.men === '开门')
  const jingMen = palaces.find((p) => p.men === '景门')

  let good = ''
  let bad = ''
  if (shengMen) good += `生门落${shengMen.direction}方，主生发求财；`
  if (kaiMen) good += `开门落${kaiMen.direction}方，主开业远行；`
  if (jingMen) good += `景门落${jingMen.direction}方，主文书考试。`
  const siMen = palaces.find((p) => p.men === '死门')
  const shangMen = palaces.find((p) => p.men === '伤门')
  const jingM = palaces.find((p) => p.men === '惊门')
  if (siMen) bad += `死门落${siMen.direction}方，忌丧葬出行；`
  if (shangMen) bad += `伤门落${shangMen.direction}方，主争斗伤灾；`
  if (jingM) bad += `惊门落${jingM.direction}方，主惊扰官非。`

  return `${isYang ? '阳遁' : '阴遁'}${ju}局，天盘大势${isYang ? '顺行显发' : '逆行收敛'}。${good} ${bad} 综合而言，吉方宜趋，凶方宜避，宜用生开景三吉门方位行事。`
}
