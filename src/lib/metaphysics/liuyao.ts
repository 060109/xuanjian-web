// 玄鉴 AI · 六爻梅花易数引擎
// 支持时间起卦 / 数字起卦 / 自动起卦

import { TIAN_GAN, DI_ZHI, XIAN_TIAN_ORDER, BA_GUA, getGuaName, NA_JIA, LIU_SHEN, GAN_WX, ZHI_WX, WX_SHENG, WX_KE, WX_BEI_KE } from './constants'

// 数字 → 八卦（先天序：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8）
function numToGua(n: number): string {
  const m = ((n - 1) % 8 + 8) % 8
  return XIAN_TIAN_ORDER[m]
}

// 六爻：从下到上 6 爻，1阳0阴
export interface Yao {
  pos: number // 1-6 自下而上
  yin: boolean // true=阴 false=阳
  moving: boolean // 动爻
  liuShen: string // 六神
  liuQin: string // 六亲
  naGan: string // 纳甲干
  naZhi: string // 纳甲支
  desc: string
}

export interface GuaInfo {
  name: string
  upper: string
  lower: string
  binary: string // 自下而上 6位
  yao: Yao[]
  gong: string // 所属宫
  wx: string // 本宫五行
}

export interface LiuyaoResult {
  method: string
  benGua: GuaInfo
  bianGua: GuaInfo
  shiYao: number // 世爻位
  yingYao: number // 应爻位
  movingYao: number[]
  relation: string // 体用关系
  conclusion: string
}

// 八宫归属（用于世应与六亲）
const GUA_GONG: Record<string, string> = {
  乾: '乾', 夬: '乾', 大有: '乾', 大壮: '乾', 小畜: '乾', 需: '乾', 大畜: '乾', 泰: '坤',
  履: '兑', 兑: '兑', 睽: '兑', 归妹: '兑', 中孚: '兑', 节: '坎', 损: '艮', 临: '坤',
  同人: '离', 革: '离', 离: '离', 丰: '震', 家人: '巽', 既济: '坎', 贲: '艮', 明夷: '坤',
  无妄: '震', 随: '震', 噬嗑: '震', 震: '震', 益: '巽', 屯: '坎', 颐: '艮', 复: '坤',
  姤: '乾', 大过: '兑', 鼎: '离', 恒: '震', 巽: '巽', 井: '坎', 蛊: '艮', 升: '坤',
  讼: '乾', 困: '兑', 未济: '离', 解: '震', 涣: '巽', 坎: '坎', 蒙: '艮', 师: '坤',
  遁: '乾', 咸: '兑', 旅: '离', 小过: '震', 渐: '巽', 蹇: '坎', 艮: '艮', 谦: '坤',
  否: '乾', 萃: '兑', 晋: '离', 豫: '震', 观: '巽', 比: '坎', 剥: '艮', 坤: '坤',
}

// 各卦世爻位置（自下而上 1-6）
const SHI_POS: Record<string, number> = {
  乾: 6, 夬: 6, 大有: 6, 大壮: 6, 小畜: 6, 需: 6, 大畜: 6, 泰: 6,
  履: 5, 兑: 5, 睽: 5, 归妹: 5, 中孚: 5, 节: 5, 损: 5, 临: 5,
  同人: 4, 革: 4, 离: 4, 丰: 4, 家人: 4, 既济: 4, 贲: 4, 明夷: 4,
  无妄: 3, 随: 3, 噬嗑: 3, 震: 3, 益: 3, 屯: 3, 颐: 3, 复: 3,
  姤: 2, 大过: 2, 鼎: 2, 恒: 2, 巽: 2, 井: 2, 蛊: 2, 升: 2,
  讼: 1, 困: 1, 未济: 1, 解: 1, 涣: 1, 坎: 1, 蒙: 1, 师: 1,
  遁: 4, 咸: 4, 旅: 4, 小过: 4, 渐: 4, 蹇: 4, 艮: 4, 谦: 4,
  否: 3, 萃: 3, 晋: 3, 豫: 3, 观: 3, 比: 3, 剥: 3, 坤: 3,
}

function buildGua(upper: string, lower: string, movingBits: number[]): GuaInfo {
  const name = getGuaName(upper, lower)
  const upperBin = BA_GUA[upper].binary
  const lowerBin = BA_GUA[lower].binary
  const binary = lowerBin + upperBin // 自下而上
  const gong = GUA_GONG[name] || upper
  const gongWX = BA_GUA[gong].wx

  // 纳甲：上卦用 NA_JIA[upper][1]，下卦用 NA_JIA[lower][0]
  const lowerNJ = NA_JIA[lower][0]
  const upperNJ = NA_JIA[upper][1]
  const naGanZhi = [...lowerNJ.zhi, ...upperNJ.zhi] // 6 支自下而上
  const naGans = [...Array(3).fill(lowerNJ.gan), ...Array(3).fill(upperNJ.gan)]

  // 六亲（以本宫五行定）
  const liuQinOf = (zhi: string): string => {
    const zhiWX = ZHI_WX[zhi]
    if (zhiWX === gongWX) return '兄弟'
    if (WX_SHENG[gongWX] === zhiWX) return '子孙' // 我生
    if (WX_KE[gongWX] === zhiWX) return '妻财' // 我克
    if (WX_BEI_KE[gongWX] === zhiWX) return '官鬼' // 克我
    if (WX_SHENG[zhiWX] === gongWX) return '父母' // 生我
    return '兄弟'
  }

  const yao: Yao[] = []
  for (let i = 0; i < 6; i++) {
    const yin = binary[i] === '0'
    const zhi = naGanZhi[i]
    const gan = naGans[i]
    yao.push({
      pos: i + 1,
      yin,
      moving: movingBits.includes(i + 1),
      liuShen: '',
      liuQin: liuQinOf(zhi),
      naGan: gan,
      naZhi: zhi,
      desc: yin ? '阴爻' : '阳爻',
    })
  }
  return { name, upper, lower, binary, yao, gong, wx: gongWX }
}

function assignLiuShen(yao: Yao[], dayGanIndex: number): void {
  // 起神：甲乙日青龙起初爻，丙丁日朱雀起... 六神顺排
  const startIdx = Math.floor(dayGanIndex / 2) // 甲乙→0, 丙丁→1...
  for (let i = 0; i < 6; i++) {
    yao[i].liuShen = LIU_SHEN[(startIdx + i) % 6]
  }
}

// 时间起卦：上卦=年月日数之和%8，下卦=年月日时之和%8，动爻=总和%6
export function timeCast(year: number, month: number, day: number, hour: number): LiuyaoResult {
  const monthZhiIdx = ((month + 1) % 12) // 简化月序
  const num = year + monthZhiIdx + day
  const upper = numToGua(num % 8 || 8)
  const lower = numToGua((num + hour) % 8 || 8)
  const movingPos = (num + hour) % 6 || 6
  return assemble('时间起卦', upper, lower, [movingPos], year, month, day)
}

// 数字起卦
export function numberCast(nums: number[]): LiuyaoResult {
  let upper: string, lower: string, movingPos: number
  if (nums.length === 1) {
    const n = nums[0]
    upper = numToGua(Math.floor(n / 100) % 8 || 8)
    lower = numToGua(n % 100 % 8 || 8)
    movingPos = n % 6 || 6
  } else if (nums.length === 2) {
    upper = numToGua(nums[0] % 8 || 8)
    lower = numToGua(nums[1] % 8 || 8)
    movingPos = (nums[0] + nums[1]) % 6 || 6
  } else {
    upper = numToGua((nums[0] + nums[1]) % 8 || 8)
    lower = numToGua((nums[2] + (nums[3] || 0)) % 8 || 8)
    movingPos = nums.reduce((a, b) => a + b, 0) % 6 || 6
  }
  return assemble('数字起卦', upper, lower, [movingPos], 2024, 1, 1)
}

// 自动起卦（三枚铜钱法模拟）
export function autoCast(): LiuyaoResult {
  const moving: number[] = []
  let bin = ''
  for (let i = 0; i < 6; i++) {
    // 三枚铜钱：字为阴(2)，背为阳(3)
    const r1 = Math.random() < 0.5 ? 2 : 3
    const r2 = Math.random() < 0.5 ? 2 : 3
    const r3 = Math.random() < 0.5 ? 2 : 3
    const sum = r1 + r2 + r3
    // 6=老阴(动) 7=少阳 8=少阴 9=老阳(动)
    if (sum === 6) { bin += '0'; moving.push(i + 1) }
    else if (sum === 9) { bin += '1'; moving.push(i + 1) }
    else if (sum === 7) bin += '1'
    else bin += '0'
  }
  const lower = Object.values(BA_GUA).find((g) => g.binary === bin.slice(0, 3))?.name || '坤'
  const upper = Object.values(BA_GUA).find((g) => g.binary === bin.slice(3, 6))?.name || '坤'
  return assemble('铜钱自动起卦', upper, lower, moving, 2024, 1, 1)
}

function assemble(
  method: string, upper: string, lower: string, moving: number[],
  year: number, month: number, day: number,
): LiuyaoResult {
  const benGua = buildGua(upper, lower, moving)
  // 变卦：动爻阴阳互换
  const bianBin = benGua.binary.split('').map((b, i) => (moving.includes(i + 1) ? (b === '1' ? '0' : '1') : b)).join('')
  const bianLower = Object.values(BA_GUA).find((g) => g.binary === bianBin.slice(0, 3))?.name || '坤'
  const bianUpper = Object.values(BA_GUA).find((g) => g.binary === bianBin.slice(3, 6))?.name || '坤'
  const bianGua = buildGua(bianUpper, bianLower, [])

  // 世应
  const shi = SHI_POS[benGua.name] || 6
  const ying = ((shi - 1 + 3) % 6) + 1

  // 起六神（用日干，简化用日）
  const jdn = year * 365 + month * 30 + day
  const dayGanIdx = (jdn + 9) % 10
  assignLiuShen(benGua.yao, dayGanIdx)
  assignLiuShen(bianGua.yao, dayGanIdx)

  // 体用关系（梅花）：内卦为体，外卦为用（简化）
  const tiWX = BA_GUA[lower].wx
  const yongWX = BA_GUA[upper].wx
  let relation = ''
  if (tiWX === yongWX) relation = '体用比和，事可成'
  else if (WX_SHENG[tiWX] === yongWX) relation = '体生用，泄气耗损'
  else if (WX_SHENG[yongWX] === tiWX) relation = '用生体，得助兴旺'
  else if (WX_KE[tiWX] === yongWX) relation = '体克用，费力可成'
  else if (WX_BEI_KE[tiWX] === yongWX) relation = '用克体，受阻宜慎'

  const conclusion = generateConclusion(benGua, bianGua, relation, moving.length)

  return {
    method,
    benGua,
    bianGua,
    shiYao: shi,
    yingYao: ying,
    movingYao: moving,
    relation,
    conclusion,
  }
}

function generateConclusion(ben: GuaInfo, bian: GuaInfo, rel: string, movingCnt: number): string {
  const moveDesc =
    movingCnt === 0
      ? '无动爻，静卦之象，事态平稳，宜守不宜进。'
      : movingCnt === 1
      ? '一爻动，事有初机，变数已生，可断吉凶。'
      : movingCnt === 2
      ? '二爻动，阴阳交争，事有反复，需审时度势。'
      : movingCnt === 3
      ? '三爻动，变革之象，事有大变，宜审慎应对。'
      : `${movingCnt}爻动，动荡之象，变数繁多，宜静观其变。`
  return `本卦《${ben.name}》，变卦《${bian.name}》。${rel}。${moveDesc} 综合卦象与体用生克，此事需结合时令与所问之事细断，初判为：${
    rel.includes('兴旺') || rel.includes('比和')
      ? '吉兆可期，顺势而为。'
      : rel.includes('受阻') || rel.includes('耗损')
      ? '阻力可见，宜缓不宜急。'
      : '吉凶参半，需人事配合。'
  }`
}
