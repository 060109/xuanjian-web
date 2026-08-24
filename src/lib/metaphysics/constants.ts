// 玄鉴 AI · 术数常量库
// 天干 / 地支 / 五行 / 八卦 / 六十甲子 等基础数据

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const TIAN_GAN_PY = ['jiǎ', 'yǐ', 'bǐng', 'dīng', 'wù', 'jǐ', 'gēng', 'xīn', 'rén', 'guǐ'] as const

export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const DI_ZHI_PY = ['zǐ', 'chǒu', 'yín', 'mǎo', 'chén', 'sì', 'wǔ', 'wèi', 'shēn', 'yǒu', 'xū', 'hài'] as const

export const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const

export const WU_XING = ['金', '木', '水', '火', '土'] as const

export const GAN_WX: Record<string, string> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

export const GAN_YIN_YANG: Record<string, string> = {
  甲: '阳', 丙: '阳', 戊: '阳', 庚: '阳', 壬: '阳',
  乙: '阴', 丁: '阴', 己: '阴', 辛: '阴', 癸: '阴',
}

export const ZHI_WX: Record<string, string> = {
  子: '水', 亥: '水',
  寅: '木', 卯: '木',
  巳: '火', 午: '火',
  申: '金', 酉: '金',
  丑: '土', 辰: '土', 未: '土', 戌: '土',
}

export const ZHI_YIN_YANG: Record<string, string> = {
  子: '阳', 寅: '阳', 辰: '阳', 午: '阳', 申: '阳', 戌: '阳',
  丑: '阴', 卯: '阴', 巳: '阴', 未: '阴', 酉: '阴', 亥: '阴',
}

export const ZHI_CANG_GAN: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
}

export const WX_SHENG: Record<string, string> = {
  金: '水', 水: '木', 木: '火', 火: '土', 土: '金',
}
export const WX_KE: Record<string, string> = {
  金: '木', 木: '土', 土: '水', 水: '火', 火: '金',
}
export const WX_BEI_KE: Record<string, string> = {
  木: '金', 土: '木', 水: '土', 火: '水', 金: '火',
}

export interface TrigramInfo {
  name: string
  symbol: string
  binary: string
  nature: string
  wx: string
  direction: string
  family: string
}
export const BA_GUA: Record<string, TrigramInfo> = {
  乾: { name: '乾', symbol: '☰', binary: '111', nature: '天', wx: '金', direction: '西北', family: '父' },
  兑: { name: '兑', symbol: '☱', binary: '110', nature: '泽', wx: '金', direction: '西', family: '少女' },
  离: { name: '离', symbol: '☲', binary: '101', nature: '火', wx: '火', direction: '南', family: '中女' },
  震: { name: '震', symbol: '☳', binary: '100', nature: '雷', wx: '木', direction: '东', family: '长男' },
  巽: { name: '巽', symbol: '☴', binary: '011', nature: '风', wx: '木', direction: '东南', family: '长女' },
  坎: { name: '坎', symbol: '☵', binary: '010', nature: '水', wx: '水', direction: '北', family: '中男' },
  艮: { name: '艮', symbol: '☶', binary: '001', nature: '山', wx: '土', direction: '东北', family: '少男' },
  坤: { name: '坤', symbol: '☷', binary: '000', nature: '地', wx: '土', direction: '西南', family: '母' },
}

export const XIAN_TIAN_ORDER = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
export const HOU_TIAN_ORDER = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离']

const GUA_NAMES: string[][] = [
  ['乾', '夬', '大有', '大壮', '小畜', '需', '大畜', '泰'],
  ['履', '兑', '睽', '归妹', '中孚', '节', '损', '临'],
  ['同人', '革', '离', '丰', '家人', '既济', '贲', '明夷'],
  ['无妄', '随', '噬嗑', '震', '益', '屯', '颐', '复'],
  ['姤', '大过', '鼎', '恒', '巽', '井', '蛊', '升'],
  ['讼', '困', '未济', '解', '涣', '坎', '蒙', '师'],
  ['遁', '咸', '旅', '小过', '渐', '蹇', '艮', '谦'],
  ['否', '萃', '晋', '豫', '观', '比', '剥', '坤'],
]
export function getGuaName(upper: string, lower: string): string {
  const ui = XIAN_TIAN_ORDER.indexOf(upper)
  const li = XIAN_TIAN_ORDER.indexOf(lower)
  if (ui < 0 || li < 0) return '未知'
  return GUA_NAMES[ui][li]
}

export const NA_JIA: Record<string, { gan: string; zhi: string[] }[]> = {
  乾: [{ gan: '壬', zhi: ['子', '寅', '辰'] }, { gan: '壬', zhi: ['午', '申', '戌'] }],
  坤: [{ gan: '癸', zhi: ['未', '巳', '卯'] }, { gan: '癸', zhi: ['丑', '亥', '酉'] }],
  坎: [{ gan: '戊', zhi: ['寅', '辰', '午'] }, { gan: '戊', zhi: ['申', '戌', '子'] }],
  离: [{ gan: '己', zhi: ['卯', '丑', '亥'] }, { gan: '己', zhi: ['酉', '未', '巳'] }],
  震: [{ gan: '庚', zhi: ['子', '寅', '辰'] }, { gan: '庚', zhi: ['午', '申', '戌'] }],
  巽: [{ gan: '辛', zhi: ['丑', '亥', '酉'] }, { gan: '辛', zhi: ['未', '巳', '卯'] }],
  艮: [{ gan: '丙', zhi: ['辰', '寅', '子'] }, { gan: '丙', zhi: ['戌', '申', '午'] }],
  兑: [{ gan: '丁', zhi: ['巳', '卯', '丑'] }, { gan: '丁', zhi: ['亥', '酉', '未'] }],
}

export const LIU_QIN: Record<string, string> = {
  self: '兄弟',
  sheng: '父母',
  sheng_out: '子孙',
  ke: '官鬼',
  ke_out: '妻财',
}

export const LIU_SHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'] as const

export const BA_MEN = ['休', '生', '伤', '杜', '景', '死', '惊', '开'] as const
export const BA_MEN_FULL: Record<string, { name: string; nature: string; direction: string }> = {
  休: { name: '休门', nature: '水·吉', direction: '北' },
  生: { name: '生门', nature: '土·吉', direction: '东北' },
  伤: { name: '伤门', nature: '木·凶', direction: '东' },
  杜: { name: '杜门', nature: '木·平', direction: '东南' },
  景: { name: '景门', nature: '火·平', direction: '南' },
  死: { name: '死门', nature: '土·凶', direction: '西南' },
  惊: { name: '惊门', nature: '金·凶', direction: '西' },
  开: { name: '开门', nature: '金·吉', direction: '西北' },
}

export const JIU_XING_FULL: Record<string, { name: string; nature: string }> = {
  天蓬: { name: '天蓬', nature: '水·凶' },
  天芮: { name: '天芮', nature: '土·凶' },
  天冲: { name: '天冲', nature: '木·平' },
  天辅: { name: '天辅', nature: '木·吉' },
  天禽: { name: '天禽', nature: '土·吉' },
  天心: { name: '天心', nature: '金·吉' },
  天柱: { name: '天柱', nature: '金·凶' },
  天任: { name: '天任', nature: '土·吉' },
  天英: { name: '天英', nature: '火·平' },
}

export const BA_SHEN_FULL: Record<string, { name: string; nature: string }> = {
  直符: { name: '直符', nature: '吉神·土' },
  螣蛇: { name: '螣蛇', nature: '凶神·火' },
  太阴: { name: '太阴', nature: '吉神·金' },
  六合: { name: '六合', nature: '吉神·木' },
  白虎: { name: '白虎', nature: '凶神·金' },
  玄武: { name: '玄武', nature: '凶神·水' },
  九地: { name: '九地', nature: '吉神·土' },
  九天: { name: '九天', nature: '吉神·金' },
}

export interface TarotCard {
  id: number
  name: string
  en: string
  keyword: string
  upright: string
  reversed: string
  element: string
}
export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: '愚者', en: 'The Fool', keyword: '开始·纯真', upright: '新的旅程·自由·潜力', reversed: '鲁莽·冒险·未做准备', element: '风' },
  { id: 1, name: '魔术师', en: 'The Magician', keyword: '创造·行动', upright: '掌控·专注·显化', reversed: '欺骗·未发挥才能', element: '风' },
  { id: 2, name: '女祭司', en: 'The High Priestess', keyword: '直觉·神秘', upright: '内在智慧·潜意识·静观', reversed: '忽略直觉·隐秘', element: '水' },
  { id: 3, name: '皇后', en: 'The Empress', keyword: '丰盛·母性', upright: '创造·丰饶·自然', reversed: '依赖·过度保护', element: '土' },
  { id: 4, name: '皇帝', en: 'The Emperor', keyword: '权威·结构', upright: '领导·秩序·稳定', reversed: '专制·僵化', element: '火' },
  { id: 5, name: '教皇', en: 'The Hierophant', keyword: '传统·信仰', upright: '传统·指导·精神', reversed: '反叛·自由思想', element: '土' },
  { id: 6, name: '恋人', en: 'The Lovers', keyword: '选择·结合', upright: '爱·和谐·抉择', reversed: '失衡·错误选择', element: '风' },
  { id: 7, name: '战车', en: 'The Chariot', keyword: '意志·胜利', upright: '前进·掌控·成功', reversed: '失控·方向不明', element: '水' },
  { id: 8, name: '力量', en: 'Strength', keyword: '勇气·柔韧', upright: '内在力量·耐心·驯服', reversed: '自我怀疑·软弱', element: '火' },
  { id: 9, name: '隐士', en: 'The Hermit', keyword: '内省·指引', upright: '独处·寻求·智慧', reversed: '孤立·退缩', element: '土' },
  { id: 10, name: '命运之轮', en: 'Wheel of Fortune', keyword: '循环·转折', upright: '转机·命运·机遇', reversed: '厄运·抗拒变化', element: '火' },
  { id: 11, name: '正义', en: 'Justice', keyword: '公正·因果', upright: '公平·真相·因果', reversed: '不公·偏颇', element: '风' },
  { id: 12, name: '倒吊人', en: 'The Hanged Man', keyword: '放下·视角', upright: '牺牲·新视角·等待', reversed: '停滞·无谓牺牲', element: '水' },
  { id: 13, name: '死神', en: 'Death', keyword: '终结·蜕变', upright: '结束·转变·重生', reversed: '抗拒改变·停滞', element: '水' },
  { id: 14, name: '节制', en: 'Temperance', keyword: '平衡·调和', upright: '调和·耐心·中庸', reversed: '失衡·过度', element: '火' },
  { id: 15, name: '魔鬼', en: 'The Devil', keyword: '束缚·欲望', upright: '束缚·物欲·执着', reversed: '挣脱·觉醒', element: '土' },
  { id: 16, name: '高塔', en: 'The Tower', keyword: '剧变·启示', upright: '突变·崩塌·觉醒', reversed: '延缓·逃避灾难', element: '火' },
  { id: 17, name: '星星', en: 'The Star', keyword: '希望·指引', upright: '希望·信念·宁静', reversed: '失望·悲观', element: '水' },
  { id: 18, name: '月亮', en: 'The Moon', keyword: '迷雾·潜意识', upright: '幻象·直觉·未知', reversed: '澄清·释放恐惧', element: '水' },
  { id: 19, name: '太阳', en: 'The Sun', keyword: '喜悦·成功', upright: '成功·活力·喜悦', reversed: '短暂阴霾·过度乐观', element: '火' },
  { id: 20, name: '审判', en: 'Judgement', keyword: '重生·召唤', upright: '觉醒·宽恕·重生', reversed: '自我怀疑·错失召唤', element: '火' },
  { id: 21, name: '世界', en: 'The World', keyword: '圆满·完成', upright: '完成·成就·圆满', reversed: '未完成·停滞', element: '土' },
]

export const NAME_STROKES: Record<string, number> = {
  王: 4, 李: 7, 张: 11, 刘: 15, 陈: 16, 杨: 13, 黄: 12, 赵: 14, 周: 8, 吴: 7,
  徐: 10, 孙: 10, 胡: 11, 朱: 6, 高: 10, 林: 8, 何: 7, 郭: 15, 马: 10, 罗: 20,
  梁: 11, 宋: 7, 郑: 19, 谢: 17, 韩: 17, 唐: 10, 冯: 12, 于: 3, 董: 15, 萧: 19,
  程: 12, 曹: 11, 袁: 10, 邓: 19, 许: 11, 傅: 12, 沈: 8, 曾: 12, 彭: 12, 吕: 7,
  苏: 22, 卢: 16, 蒋: 17, 蔡: 17, 贾: 13, 丁: 2, 魏: 18, 薛: 19, 叶: 15, 阎: 16,
  明: 8, 华: 14, 建: 9, 国: 11, 文: 4, 志: 7, 伟: 11, 强: 12, 军: 9, 平: 5,
  涛: 18, 勇: 9, 超: 12, 杰: 12, 辉: 15, 飞: 9, 鹏: 19, 龙: 16, 刚: 10, 海: 11,
  山: 3, 松: 8, 柏: 9, 梅: 11, 兰: 23, 竹: 6, 菊: 14, 莲: 17, 香: 9,
  玉: 5, 珍: 10, 珠: 11, 琴: 13, 雪: 11, 月: 4, 星: 9, 云: 12, 风: 9, 雨: 8,
  春: 9, 夏: 10, 秋: 9, 冬: 5, 晨: 11, 朝: 12, 夕: 3, 阳: 17, 阴: 16, 光: 6,
  心: 4, 思: 9, 慧: 15, 智: 12, 婷: 12, 娜: 10, 静: 16, 雅: 12, 丽: 19, 美: 9,
  健: 11, 康: 11, 安: 6, 宁: 14, 福: 14, 禄: 13, 寿: 14, 喜: 12, 庆: 15, 祥: 11,
  金: 8, 木: 4, 水: 4, 火: 4, 土: 3, 仁: 4, 义: 13, 礼: 18, 信: 9,
  天: 4, 地: 6, 人: 2, 一: 1, 二: 2, 三: 3, 四: 5, 五: 4, 六: 4, 七: 2, 八: 2, 九: 2, 十: 10,
  子: 3, 女: 3, 少: 4, 老: 6, 大: 3, 小: 3, 中: 4, 上: 3, 下: 3, 生: 5,
  宝: 20, 贵: 12, 富: 12, 荣: 14, 显: 23, 达: 16, 通: 14, 顺: 12, 利: 7, 吉: 6,
}

export const SHU_LI: Record<number, { ji: '吉' | '凶' | '半吉'; desc: string }> = {
  1: { ji: '吉', desc: '繁荣发达·万事亨通' },
  2: { ji: '凶', desc: '动摇不安·一成一败' },
  3: { ji: '吉', desc: '进取如意·智勇双全' },
  4: { ji: '凶', desc: '万事休止·艰难不断' },
  5: { ji: '吉', desc: '福禄长寿·立身兴家' },
  6: { ji: '吉', desc: '安稳余庆·门庭兴旺' },
  7: { ji: '吉', desc: '刚毅果断·精力旺盛' },
  8: { ji: '吉', desc: '意志坚强·步步进取' },
  9: { ji: '凶', desc: '兴尽凶始·穷困潦倒' },
  10: { ji: '凶', desc: '万事终局·多灾多难' },
  11: { ji: '吉', desc: '稳健吉顺·繁荣昌盛' },
  12: { ji: '凶', desc: '薄弱无力·孤立无援' },
  13: { ji: '吉', desc: '智略超群·博得名利' },
  14: { ji: '凶', desc: '忍得苦难·家庭缘薄' },
  15: { ji: '吉', desc: '福寿双全·立身兴家' },
  16: { ji: '吉', desc: '贵人相助·事业大成' },
  17: { ji: '吉', desc: '排除万难·有贵人助' },
  18: { ji: '吉', desc: '有志竟成·名利双收' },
  19: { ji: '凶', desc: '多灾多难·艰难困苦' },
  20: { ji: '凶', desc: '破灭衰亡·家缘渐薄' },
  21: { ji: '吉', desc: '明月光照·独立权威' },
  22: { ji: '凶', desc: '秋草逢霜·百事不成' },
  23: { ji: '吉', desc: '旭日东升·名显四方' },
  24: { ji: '吉', desc: '金钱丰盈·家门余庆' },
  25: { ji: '吉', desc: '资性英敏·才能奇特' },
  26: { ji: '凶', desc: '波澜起伏·英雄气概' },
  27: { ji: '半吉', desc: '欲望难足·多生是非' },
  28: { ji: '凶', desc: '家亲缘薄·孤独遭难' },
  29: { ji: '吉', desc: '智谋优秀·财力归集' },
  30: { ji: '半吉', desc: '浮沉不定·绝处逢生' },
  31: { ji: '吉', desc: '智勇得志·心想事成' },
  32: { ji: '吉', desc: '宝马金鞍·侥幸多望' },
  33: { ji: '吉', desc: '旭日升天·家门隆昌' },
  34: { ji: '凶', desc: '破家破身·见识浅小' },
  35: { ji: '吉', desc: '温和平静·优雅发展' },
  36: { ji: '凶', desc: '波澜重叠·常陷穷困' },
  37: { ji: '吉', desc: '猛虎出林·权威显达' },
  38: { ji: '半吉', desc: '磨铁成针·技艺成功' },
  39: { ji: '吉', desc: '富贵荣华·福寿绵长' },
  40: { ji: '半吉', desc: '退安自在·谨慎安康' },
  41: { ji: '吉', desc: '德泽四方·纯阳独秀' },
  42: { ji: '凶', desc: '十事九空·多能薄相' },
  43: { ji: '凶', desc: '散财破产·破败艰辛' },
  44: { ji: '凶', desc: '破家亡身·愁苦不绝' },
  45: { ji: '吉', desc: '顺风扬帆·新生泰然' },
  46: { ji: '凶', desc: '载宝沉舟·破家破产' },
  47: { ji: '吉', desc: '花开结实·家门兴隆' },
  48: { ji: '吉', desc: '青松立鹤·智谋兼备' },
  49: { ji: '凶', desc: '吉凶难分·不断辛劳' },
  50: { ji: '凶', desc: '一成一败·吉凶参半' },
  51: { ji: '半吉', desc: '盛衰交加·浮沉不常' },
  52: { ji: '吉', desc: '先见之明·达眼成业' },
  53: { ji: '凶', desc: '忧愁困苦·内心忧惨' },
  54: { ji: '凶', desc: '多难回避·难望成功' },
  55: { ji: '凶', desc: '外美内苦·和顺艰难' },
  56: { ji: '凶', desc: '浪里行舟·万事难成' },
  57: { ji: '吉', desc: '寒雪青松·努力发达' },
  58: { ji: '半吉', desc: '晚行遇雨·多患多忧' },
  59: { ji: '凶', desc: '车辱人亡·事业不成' },
  60: { ji: '凶', desc: '黑黯无光·福禄自失' },
  61: { ji: '吉', desc: '名利双收·繁荣富贵' },
  62: { ji: '凶', desc: '衰败孤独·根基薄弱' },
  63: { ji: '吉', desc: '万物化育·繁荣之象' },
  64: { ji: '凶', desc: '骨肉分离·孤独悲愁' },
  65: { ji: '吉', desc: '富贵长寿·家道兴隆' },
  66: { ji: '凶', desc: '黑暗不长·千辛万苦' },
  67: { ji: '吉', desc: '通达舒畅·利路亨通' },
  68: { ji: '吉', desc: '兴家立业·智慧聪颖' },
  69: { ji: '凶', desc: '非业非运·穷困一生' },
  70: { ji: '凶', desc: '凄惨悲愁·家破人亡' },
  71: { ji: '半吉', desc: '损力劳神·勤勉奋斗' },
  72: { ji: '凶', desc: '利不及费·坐吃山空' },
  73: { ji: '半吉', desc: '志高力微·安分守己' },
  74: { ji: '凶', desc: '无用之辈·衰颓寂寞' },
  75: { ji: '半吉', desc: '退之则吉·进之则凶' },
  76: { ji: '凶', desc: '倾覆离散·破败不堪' },
  77: { ji: '半吉', desc: '先苦后甘·甘来苦去' },
  78: { ji: '凶', desc: '晚景凄凉·多患多难' },
  79: { ji: '凶', desc: '挽回无望·身败名裂' },
  80: { ji: '凶', desc: '辛苦不绝·最凶之数' },
  81: { ji: '吉', desc: '还原复始·安乐自来' },
}

export function numWX(n: number): string {
  const m = ((n - 1) % 10) + 1
  if ([1, 2].includes(m)) return '木'
  if ([3, 4].includes(m)) return '火'
  if ([5, 6].includes(m)) return '土'
  if ([7, 8].includes(m)) return '金'
  return '水'
}
