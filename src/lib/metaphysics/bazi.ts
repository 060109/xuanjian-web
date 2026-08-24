// 玄鉴 AI · 八字命理引擎
// 基于公历日期 + 真太阳时近似，排四柱、五行、十神、大运、流年

import {
  TIAN_GAN, DI_ZHI, SHENG_XIAO,
  GAN_WX, GAN_YIN_YANG, ZHI_WX, ZHI_CANG_GAN,
  WX_SHENG, WX_KE, WX_BEI_KE,
} from './constants'

// ---- 公历转儒略日 ----
export function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

// ---- 节气近似日期（每月中气/节气，用于月柱界定）----
// 返回该年每个节气(节)的近似公历日（足够占星命理演示精度）
const SOLAR_TERMS_APPROX = [
  [2, 4],   // 立春 → 寅月
  [3, 6],   // 惊蛰 → 卯月
  [4, 5],   // 清明 → 辰月
  [5, 6],   // 立夏 → 巳月
  [6, 6],   // 芒种 → 午月
  [7, 7],   // 小暑 → 未月
  [8, 8],   // 立秋 → 申月
  [9, 8],   // 白露 → 酉月
  [10, 8],  // 寒露 → 戌月
  [11, 7],  // 立冬 → 亥月
  [12, 7],  // 大雪 → 子月
  [1, 6],   // 小寒 → 丑月
]
// 月支对应（寅卯辰巳午未申酉戌亥子丑）
const MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

// 获取某日所属的月支索引（0=寅 ... 11=丑）
function getMonthZhiIndex(year: number, month: number, day: number): number {
  // 按节气近似日判断
  for (let i = 0; i < 12; i++) {
    const [m, d] = SOLAR_TERMS_APPROX[i]
    const [m2, d2] = SOLAR_TERMS_APPROX[(i + 1) % 12]
    const startY = m === 1 ? year - 1 : year // 小寒属上一年丑月判定
    // 简化：判断当前日期是否在该节气之后、下一节气之前
    const termDate = new Date(year, m - 1, d).getTime()
    const cur = new Date(year, month - 1, day).getTime()
    const nextIdx = (i + 1) % 12
    const nextYear = SOLAR_TERMS_APPROX[nextIdx][0] === 1 && nextIdx === 11 ? year + 1 : year
    const nextDate = new Date(nextYear, SOLAR_TERMS_APPROX[nextIdx][0] - 1, SOLAR_TERMS_APPROX[nextIdx][1]).getTime()
    if (cur >= termDate && cur < nextDate) return i
  }
  return (month + 9) % 12 // 兜底
}

// ---- 年柱 ----
export function yearPillar(year: number, month: number, day: number): { gan: string; zhi: string } {
  // 以立春为年界
  const liChun = new Date(year, 1, 4).getTime()
  const cur = new Date(year, month - 1, day).getTime()
  const y = cur < liChun ? year - 1 : year
  const gi = ((y - 4) % 10 + 10) % 10
  const zi = ((y - 4) % 12 + 12) % 12
  return { gan: TIAN_GAN[gi], zhi: DI_ZHI[zi] }
}

// ---- 月柱 ----
export function monthPillar(year: number, month: number, day: number): { gan: string; zhi: string } {
  const y = yearPillar(year, month, day)
  const yi = TIAN_GAN.indexOf(y.gan)
  const mi = getMonthZhiIndex(year, month, day)
  // 五虎遁：寅月天干 = (年干序号*2 + 2) % 10
  const stemIdx = (yi * 2 + 2 + mi) % 10
  return { gan: TIAN_GAN[stemIdx], zhi: MONTH_ZHI[mi] }
}

// ---- 日柱 ----
export function dayPillar(year: number, month: number, day: number): { gan: string; zhi: string } {
  const jdn = toJDN(year, month, day)
  const gi = (jdn + 9) % 10
  const zi = (jdn + 1) % 12
  return { gan: TIAN_GAN[(gi + 10) % 10], zhi: DI_ZHI[(zi + 12) % 12] }
}

// ---- 时柱 ----
// hour: 0-23
export function hourPillar(year: number, month: number, day: number, hour: number): { gan: string; zhi: string } {
  const dp = dayPillar(year, month, day)
  const di = TIAN_GAN.indexOf(dp.gan)
  // 时支：23时和0时为子时
  let zi: number
  if (hour === 23 || hour === 0) zi = 0
  else zi = Math.floor((hour + 1) / 2)
  // 五鼠遁：子时天干 = (日干序号*2) % 10
  const stemIdx = (di * 2 + zi) % 10
  return { gan: TIAN_GAN[stemIdx], zhi: DI_ZHI[zi] }
}

// ---- 十神 ----
// 以日干为我
export function tenGod(dayGan: string, otherGan: string): string {
  const me = GAN_WX[dayGan]
  const other = GAN_WX[otherGan]
  const sameYinYang = GAN_YIN_YANG[dayGan] === GAN_YIN_YANG[otherGan]
  if (otherGan === dayGan) return sameYinYang ? '比肩' : '劫财'
  if (WX_SHENG[me] === other) return sameYinYang ? '食神' : '伤官'
  if (WX_KE[me] === other) return sameYinYang ? '偏财' : '正财'
  if (WX_BEI_KE[me] === other) return sameYinYang ? '偏官(七杀)' : '正官'
  if (WX_SHENG[other] === me) return sameYinYang ? '偏印(枭神)' : '正印'
  return '?'
}

// ---- 地支藏干十神 ----
export function zhiCangTenGods(dayGan: string, zhi: string): { gan: string; god: string }[] {
  return (ZHI_CANG_GAN[zhi] || []).map((g) => ({ gan: g, god: tenGod(dayGan, g) }))
}

// ---- 大运 ----
export interface DaYun {
  ageStart: number
  ganZhi: string
  startYear: number
}
export function daYun(
  year: number, month: number, day: number,
  gender: 'male' | 'female',
  count = 8,
): { direction: '顺' | '逆'; startAge: number; list: DaYun[] } {
  const mp = monthPillar(year, month, day)
  const yp = yearPillar(year, month, day)
  const yearGanYang = GAN_YIN_YANG[yp.gan] === '阳'
  // 阳男阴女顺行，阴男阳女逆行
  const forward = (yearGanYang && gender === 'male') || (!yearGanYang && gender === 'female')
  // 起运岁数（近似）：以出生到下一/上一节气的天数 / 3
  const mi = MONTH_ZHI.indexOf(mp.zhi)
  const nextIdx = (mi + (forward ? 1 : -1) + 12) % 12
  const [nm, nd] = SOLAR_TERMS_APPROX[nextIdx]
  const targetYear = nm === 1 && nextIdx === 11 ? year + 1 : year
  const target = new Date(targetYear, nm - 1, nd).getTime()
  const birth = new Date(year, month - 1, day).getTime()
  const diffDays = Math.abs(target - birth) / (1000 * 60 * 60 * 24)
  const startAge = Math.max(1, Math.round(diffDays / 3))

  const mgi = TIAN_GAN.indexOf(mp.gan)
  const mzi = DI_ZHI.indexOf(mp.zhi)
  const list: DaYun[] = []
  for (let i = 1; i <= count; i++) {
    const step = forward ? i : -i
    const gi = (mgi + step + 10 * 10) % 10
    const zi = (mzi + step + 12 * 12) % 12
    list.push({
      ageStart: startAge + (i - 1) * 10,
      ganZhi: `${TIAN_GAN[gi]}${DI_ZHI[zi]}`,
      startYear: year + startAge + (i - 1) * 10,
    })
  }
  return { direction: forward ? '顺' : '逆', startAge, list }
}

// ---- 五行统计 ----
export function wuxingCount(pillars: { gan: string; zhi: string }[]): Record<string, number> {
  const cnt: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  pillars.forEach((p) => {
    cnt[GAN_WX[p.gan]] = (cnt[GAN_WX[p.gan]] || 0) + 1
    cnt[ZHI_WX[p.zhi]] = (cnt[ZHI_WX[p.zhi]] || 0) + 1
    // 藏干加权
    const cang = ZHI_CANG_GAN[p.zhi] || []
    cang.forEach((g, idx) => {
      cnt[GAN_WX[g]] = (cnt[GAN_WX[g]] || 0) + idx === 0 ? 0.5 : 0.2
    })
  })
  return cnt
}

// ---- 日主强弱判定（简化）----
export function dayMasterStrength(dayGan: string, cnt: Record<string, number>): '身强' | '身弱' | '中和' {
  const me = GAN_WX[dayGan]
  const shengMe = Object.keys(WX_SHENG).find((k) => WX_SHENG[k] === me) || ''
  const same = (cnt[me] || 0) + (cnt[shengMe] || 0)
  const total = Object.values(cnt).reduce((a, b) => a + b, 0)
  const ratio = same / total
  if (ratio > 0.5) return '身强'
  if (ratio < 0.35) return '身弱'
  return '中和'
}

// ---- 格局判定（简化）----
export function pattern(dayGan: string, monthZhi: string): string {
  const cang = ZHI_CANG_GAN[monthZhi] || []
  if (cang.length === 0) return '未知格'
  const main = cang[0]
  const god = tenGod(dayGan, main)
  // 月令本气透干定格
  const map: Record<string, string> = {
    比肩: '建禄格（月劫）',
    劫财: '月刃格（羊刃）',
    食神: '食神格',
    伤官: '伤官格',
    偏财: '偏财格',
    正财: '正财格',
    '偏官(七杀)': '七杀格',
    正官: '正官格',
    '偏印(枭神)': '偏印格',
    正印: '正印格',
  }
  return map[god] || `${god}格`
}

// ---- 完整排盘 ----
export interface BaziResult {
  input: { year: number; month: number; day: number; hour: number; gender: string; place?: string }
  pillars: {
    year: { gan: string; zhi: string; shengXiao: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string }
  }
  dayGan: string
  dayGanWX: string
  shengXiao: string
  wuxing: Record<string, number>
  strength: '身强' | '身弱' | '中和'
  pattern: string
  tenGods: {
    yearGan: string; yearZhi: { gan: string; god: string }[]
    monthGan: string; monthZhi: { gan: string; god: string }[]
    dayZhi: { gan: string; god: string }[]
    hourGan: string; hourZhi: { gan: string; god: string }[]
  }
  dayun: { direction: '顺' | '逆'; startAge: number; list: DaYun[] }
  analysis: { personality: string; career: string; wealth: string; health: string }
}

export function calcBazi(input: {
  year: number; month: number; day: number; hour: number
  gender: 'male' | 'female'; place?: string
}): BaziResult {
  const { year, month, day, hour, gender, place } = input
  const yp = yearPillar(year, month, day)
  const mp = monthPillar(year, month, day)
  const dp = dayPillar(year, month, day)
  const hp = hourPillar(year, month, day, hour)
  const pillars = [yp, mp, dp, hp]
  const sx = SHENG_XIAO[DI_ZHI.indexOf(yp.zhi)]
  const wx = wuxingCount(pillars)
  const strength = dayMasterStrength(dp.gan, wx)
  const pat = pattern(dp.gan, mp.zhi)
  const dy = daYun(year, month, day, gender)

  const dayGan = dp.gan
  const dayGanWX = GAN_WX[dayGan]

  const analysis = generateAnalysis(dayGan, dayGanWX, wx, strength, pat)

  return {
    input: { year, month, day, hour, gender, place },
    pillars: {
      year: { ...yp, shengXiao: sx },
      month: { ...mp },
      day: { ...dp },
      hour: { ...hp },
    },
    dayGan,
    dayGanWX,
    shengXiao: sx,
    wuxing: wx,
    strength,
    pattern: pat,
    tenGods: {
      yearGan: tenGod(dayGan, yp.gan),
      yearZhi: zhiCangTenGods(dayGan, yp.zhi),
      monthGan: tenGod(dayGan, mp.gan),
      monthZhi: zhiCangTenGods(dayGan, mp.zhi),
      dayZhi: zhiCangTenGods(dayGan, dp.zhi),
      hourGan: tenGod(dayGan, hp.gan),
      hourZhi: zhiCangTenGods(dayGan, hp.zhi),
    },
    dayun: dy,
    analysis,
  }
}

function generateAnalysis(
  dayGan: string, wx: string, cnt: Record<string, number>,
  strength: string, pat: string,
): { personality: string; career: string; wealth: string; health: string } {
  const traits: Record<string, string> = {
    甲: '如参天大树，刚直不阿，具领导力与上进心，心性仁慈而略带固执。',
    乙: '如藤蔓花草，柔韧灵活，善借势而生，心思细腻，富艺术天赋。',
    丙: '如烈日当空，热情开朗，慷慨大方，光明磊落，易急躁冲动。',
    丁: '如烛火星光，温文尔雅，内心炽热，洞察力强，重情感与礼仪。',
    戊: '如崇山厚土，沉稳可靠，重信义，包容力强，行事稳健而略显保守。',
    己: '如田园沃土，谦和包容，勤劳务实，心思细密，善于栽培与成全。',
    庚: '如刀剑顽铁，刚毅果决，重义气，具开拓精神，行事雷厉风行。',
    辛: '如珠玉首饰，温润精致，重审美与体面，外柔内刚，自尊心强。',
    壬: '如江河大海，智谋深远，适应力强，富冒险精神，喜自由不羁。',
    癸: '如雨露溪泉，温柔聪慧，直觉敏锐，善体贴，具灵性与慈悲心。',
  }
  const career: Record<string, string> = {
    木: '宜从事教育、文化、出版、设计、园林、宗教、慈善等生发助长之行。',
    火: '宜从事能源、传媒、餐饮、演艺、光学、电子、礼仪等光明显扬之行。',
    土: '宜从事房地产、建筑、农业、仓储、保险、中介、殡葬等承载厚实之行。',
    金: '宜从事金融、机械、法律、军警、五金、医疗器械等决断肃杀之行。',
    水: '宜从事航运、物流、旅游、贸易、传播、智慧科技等流动通达之行。',
  }
  const wealth: Record<string, string> = {
    木: '财源多来自文化、教育、人际网络，宜以仁取财，忌贪多嚼不烂。',
    火: '财源多来自名声、表演、口才，宜以礼立财，热情可生财。',
    土: '财源稳健，多来自地产、固定产业，宜守成积聚，忌投机。',
    金: '财源多来自果断决策与专业能力，宜以义得财，忌刻薄。',
    水: '财源流动不居，多来自贸易、信息、智慧，宜灵活机动。',
  }
  const health: Record<string, string> = {
    木: '注意肝胆、筋骨、神经系统，忌过劳伤肝，宜舒展情志。',
    火: '注意心脏、小肠、血脉、眼目，忌过燥上火，宜清心寡欲。',
    土: '注意脾胃、消化、皮肤，忌饮食失节，宜规律作息。',
    金: '注意肺、大肠、呼吸道，忌悲忧伤肺，宜润养呼吸。',
    水: '注意肾、膀胱、泌尿、耳，忌恐伤肾，宜温补固本。',
  }
  const strengthHint =
    strength === '身强'
      ? '日主偏强，宜以财官食泄秀制衡，忌再行印比之运。'
      : strength === '身弱'
      ? '日主偏弱，宜以印比帮扶，忌财官克泄太过。'
      : '日主中和，五行流通，宜顺势而为，平稳发展。'

  return {
    personality: `${traits[dayGan]} 日主属${wx}，${strengthHint} 命局呈${pat}，性情之中正与偏锋由此可观。`,
    career: career[wx] + ' 结合命局格局与十神配置，可于相关领域深耕。',
    wealth: wealth[wx] + ' 财星与日主关系决定积财之难易。',
    health: health[wx] + ' 五行偏枯之处，即需调养之所。',
  }
}
