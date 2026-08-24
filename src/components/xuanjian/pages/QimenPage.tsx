'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, CalendarDays, Clock3, Compass, Star, DoorOpen,
  Wand2, Layers, BookOpen, Info, ChevronRight,
} from 'lucide-react'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { castQimen } from '@/lib/metaphysics/qimen'
import type { QimenResult, QimenPalace } from '@/lib/metaphysics/qimen'
import AiInterpretation from '@/components/xuanjian/AiInterpretation'

/* ---------- helpers ---------- */
const WX_COLORS: Record<string, string> = {
  金: '#d9c08a', 木: '#8aa86b', 水: '#5a9b9b', 火: '#c98a8a', 土: '#c9a96a',
}

const HOUR_NAMES = [
  '子时 23–1', '丑时 1–3', '寅时 3–5', '卯时 5–7',
  '辰时 7–9', '巳时 9–11', '午时 11–13', '未时 13–15',
  '申时 15–17', '酉时 17–19', '戌时 19–21', '亥时 21–23',
]
function hourLabel(h: number) {
  const z = h === 23 || h === 0 ? 0 : Math.floor((h + 1) / 2)
  return `${String(h).padStart(2, '0')}时 · ${HOUR_NAMES[z]}`
}

// 洛书九宫排列顺序（左上→右上→中→下）
const LUO_SHU_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6]

// 八门吉凶
const MEN_JI = new Set(['休', '生', '开'])
const MEN_XIONG = new Set(['死', '伤', '惊'])
// 九星吉凶
const STAR_JI = new Set(['天辅', '天禽', '天心', '天任'])
const STAR_XIONG = new Set(['天蓬', '天芮', '天柱'])
// 八神吉凶
const SHEN_JI = new Set(['直符', '太阴', '六合', '九地', '九天'])
const SHEN_XIONG = new Set(['螣蛇', '白虎', '玄武'])

function menChar(men: string) {
  // "休门" → "休"，"—" → ""
  if (!men || men === '—') return ''
  return men.charAt(0)
}
function menNature(men: string): '吉' | '凶' | '平' | null {
  const c = menChar(men)
  if (!c) return null
  if (MEN_JI.has(c)) return '吉'
  if (MEN_XIONG.has(c)) return '凶'
  return '平'
}
function starNature(star: string): '吉' | '凶' | '平' {
  if (STAR_JI.has(star)) return '吉'
  if (STAR_XIONG.has(star)) return '凶'
  return '平'
}
function shenNature(shen: string): '吉' | '凶' {
  if (SHEN_JI.has(shen)) return '吉'
  return '凶'
}

/* ---------- 九宫格 ---------- */
function PalaceCell({ p, index }: { p: QimenPalace; index: number }) {
  const isCenter = p.palace === 5
  const mn = menNature(p.men)
  const sn = starNature(p.star)
  const shn = shenNature(p.shen)
  const wx = p.wx || '土'
  const wxColor = WX_COLORS[wx] || '#c9a96a'

  // 边框色：吉门金、凶门朱砂、平门默认
  const borderColor = isCenter
    ? 'rgba(201,169,106,0.55)'
    : mn === '吉'
    ? 'rgba(201,169,106,0.55)'
    : mn === '凶'
    ? 'rgba(155,58,58,0.55)'
    : 'rgba(201,169,106,0.18)'

  const bgStyle = isCenter
    ? { background: 'radial-gradient(circle at center, rgba(201,169,106,0.18), rgba(20,14,28,0.85) 70%)' }
    : p.isKong
    ? { background: 'linear-gradient(135deg, rgba(40,30,30,0.4), rgba(12,9,16,0.85))' }
    : { background: 'linear-gradient(135deg, rgba(26,16,48,0.55), rgba(12,9,16,0.7))' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative rounded-lg p-2.5 sm:p-3 min-h-[140px] sm:min-h-[180px] flex flex-col ${
        isCenter ? 'xj-glow' : ''
      } ${p.isKong ? 'grayscale-[0.6]' : ''}`}
      style={{
        ...bgStyle,
        border: `1px solid ${borderColor}`,
        boxShadow: isCenter
          ? '0 0 30px rgba(201,169,106,0.25)'
          : mn === '吉'
          ? '0 0 16px rgba(201,169,106,0.15)'
          : mn === '凶'
          ? '0 0 16px rgba(155,58,58,0.18)'
          : 'none',
      }}
    >
      {/* 头部：宫位名+方位 / 宫数 */}
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-base sm:text-lg text-cream leading-none">
              {p.name}
            </span>
            <span className="text-[10px] text-cream/45 tracking-wider">{p.direction}</span>
          </div>
          {/* 五行色点 */}
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: wxColor, boxShadow: `0 0 6px ${wxColor}` }}
            />
            <span className="text-[9px] text-cream/40">{wx}</span>
          </div>
        </div>
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center font-serif text-xs"
          style={{
            background: isCenter ? 'rgba(201,169,106,0.2)' : 'rgba(232,220,196,0.06)',
            color: isCenter ? '#c9a96a' : 'rgba(232,220,196,0.55)',
            border: `1px solid ${isCenter ? 'rgba(201,169,106,0.4)' : 'rgba(232,220,196,0.12)'}`,
          }}
        >
          {p.palace}
        </div>
      </div>

      <Separator className="mb-1.5 bg-cream/8" />

      {/* 主体：九星 / 八门 / 八神 */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-1.5">
          <Star
            className="w-3 h-3"
            style={{ color: sn === '吉' ? '#c9a96a' : sn === '凶' ? '#9b3a3a' : '#9a8d72' }}
          />
          <span
            className="font-serif text-sm sm:text-base"
            style={{ color: sn === '吉' ? '#d9c08a' : sn === '凶' ? '#c98a8a' : '#e8dcc4' }}
          >
            {p.star}
          </span>
          <span className="text-[9px] text-cream/30">{sn}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DoorOpen
            className="w-3 h-3"
            style={{ color: mn === '吉' ? '#c9a96a' : mn === '凶' ? '#9b3a3a' : '#9a8d72' }}
          />
          <span
            className="font-serif text-sm sm:text-base"
            style={{ color: mn === '吉' ? '#d9c08a' : mn === '凶' ? '#c98a8a' : '#e8dcc4' }}
          >
            {p.men}
          </span>
          {mn && <span className="text-[9px] text-cream/30">{mn}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Wand2
            className="w-3 h-3"
            style={{ color: shn === '吉' ? '#c9a96a' : '#9b3a3a' }}
          />
          <span
            className="font-serif text-sm"
            style={{ color: shn === '吉' ? '#d9c08a' : '#c98a8a' }}
          >
            {p.shen}
          </span>
          <span className="text-[9px] text-cream/30">{shn}</span>
        </div>
      </div>

      <Separator className="my-1.5 bg-cream/8" />

      {/* 天盘干 → 地盘干 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-cream/40">天盘</span>
          <span
            className="font-serif text-base"
            style={{
              color: p.tianGan ? WX_COLORS[WX_OF_GAN(p.tianGan)] || '#e8dcc4' : 'rgba(232,220,196,0.3)',
            }}
          >
            {p.tianGan || '—'}
          </span>
        </div>
        <span className="text-cream/30 text-xs">↕</span>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-cream/40">地盘</span>
          <span
            className="font-serif text-base"
            style={{
              color: p.diGan ? WX_COLORS[WX_OF_GAN(p.diGan)] || '#e8dcc4' : 'rgba(232,220,196,0.3)',
            }}
          >
            {p.diGan || (isCenter ? '寄' : '—')}
          </span>
        </div>
      </div>

      {/* 空亡标注 */}
      {p.isKong && (
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="border-cinnabar/60 text-cinnabar/85 text-[9px] py-0 h-4 bg-cinnabar/10">
            空
          </Badge>
        </div>
      )}

      {/* 中宫标志 */}
      {isCenter && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-gold/60 tracking-widest">
          中宫·天禽
        </div>
      )}
    </motion.div>
  )
}

function WX_OF_GAN(g: string): string {
  const map: Record<string, string> = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
  }
  return map[g] || '土'
}

/* ---------- 图例 ---------- */
function LegendRow({
  title, items,
}: {
  title: string
  items: { label: string; nature: '吉' | '凶' | '平' }[]
}) {
  return (
    <div className="xj-panel p-3">
      <div className="text-[11px] text-cream/55 tracking-widest mb-2 px-1">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <Badge
            key={i}
            variant="outline"
            className={`text-[10px] py-0 h-5 ${
              it.nature === '吉'
                ? 'border-gold/50 text-gold/90 bg-gold/5'
                : it.nature === '凶'
                ? 'border-cinnabar/50 text-cinnabar/90 bg-cinnabar/5'
                : 'border-cream/20 text-cream/60'
            }`}
          >
            {it.label}
            <span className="ml-1 text-[8px] opacity-60">{it.nature}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
export default function QimenPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QimenResult | null>(null)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [day, setDay] = useState(now.getDate())
  const [hour, setHour] = useState(now.getHours())

  const yearList: number[] = []
  for (let y = 1900; y <= 2050; y++) yearList.push(y)
  const daysInMonth = new Date(year, month, 0).getDate()

  function handleCast() {
    setLoading(true)
    setTimeout(() => {
      try {
        const r = castQimen(year, month, day, hour)
        setResult(r)
        toast({
          title: '奇门排盘已完成',
          description: `${r.ju} · ${r.zhiFushi}`,
        })
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'qimen',
            title: `${r.ju} · ${year}.${month}.${day} ${String(hour).padStart(2, '0')}时`,
            input: { year, month, day, hour },
            result: r,
          }),
        }).catch(() => {})
      } catch (e) {
        toast({ title: '排盘失败', description: String(e), variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }, 260)
  }

  return (
    <PageShell title="奇门遁甲" subtitle="Qi Men Dun Jia" trigram="巽" accent="#9b7ec9">
      {/* 输入卡 */}
      <div className="xj-panel p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base text-cream tracking-wider">时家奇门起局</h3>
          <Badge variant="outline" className="ml-auto border-gold/30 text-gold/70 text-[10px]">
            时家奇门 · 飞盘简化
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> 年份</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {yearList.map((y) => (<SelectItem key={y} value={String(y)}>{y}年</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> 月份</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{m}月</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> 日期</Label>
            <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (<SelectItem key={d} value={String(d)}>{d}日</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1"><Clock3 className="w-3 h-3" /> 时辰</Label>
            <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (<SelectItem key={h} value={String(h)}>{hourLabel(h)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <span className="text-[11px] text-cream/40 hidden sm:inline">
            公历 {year}年{month}月{day}日 {String(hour).padStart(2, '0')}:00
          </span>
          <Button
            onClick={handleCast}
            disabled={loading}
            className="bg-gradient-to-r from-purple-deep to-gold text-cream hover:from-gold hover:to-gold-soft hover:text-ink-deep font-serif tracking-wider shadow-lg shadow-purple-deep/30"
          >
            {loading ? (
              <><Sparkles className="w-4 h-4 mr-1 animate-pulse" /> 排盘中…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1" /> 排盘布局</>
            )}
          </Button>
        </div>
      </div>

      {/* 结果区 */}
      {result ? (
        <div className="space-y-5">
          {/* 局信息 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="xj-panel p-5 xj-gold-border relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at right, rgba(155,126,201,0.4), transparent 70%)' }}
            />
            <div className="relative grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-[10px] tracking-[0.3em] text-cream/55 uppercase mb-1">JU · 局数</div>
                <div className="font-serif text-2xl sm:text-3xl xj-gold-text" style={{ textShadow: '0 0 18px rgba(201,169,106,0.35)' }}>
                  {result.ju}
                </div>
              </div>
              <div className="text-center border-x border-cream/10">
                <div className="text-[10px] tracking-[0.3em] text-cream/55 uppercase mb-1">ZHI FU SHI · 直符使</div>
                <div className="font-serif text-sm sm:text-base text-cream pt-1.5">{result.zhiFushi}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] tracking-[0.3em] text-cream/55 uppercase mb-1">METHOD · 方法</div>
                <div className="font-serif text-sm sm:text-base text-cream pt-1.5">{result.method}</div>
              </div>
            </div>
          </motion.section>

          {/* 九宫盘 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base text-cream tracking-wider">九宫盘 · 洛书飞布</h3>
              <span className="text-[11px] text-cream/40 ml-auto">
                上巽离坤 · 中震中兑 · 下艮坎乾
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {LUO_SHU_ORDER.map((n, i) => {
                const p = result.palaces.find((x) => x.palace === n)
                if (!p) return <div key={n} />
                return <PalaceCell key={n} p={p} index={i} />
              })}
            </div>
          </section>

          {/* 分析 */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="xj-panel p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base text-cream tracking-wider">局象分析</h3>
            </div>
            <p className="text-sm sm:text-[15px] leading-loose text-cream/85 font-serif">
              {result.analysis}
            </p>
          </motion.section>

          {/* 图例 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base text-cream tracking-wider">星门神吉凶图例</h3>
            </div>
            <div className="space-y-2.5">
              <LegendRow title="八门" items={[
                { label: '休门', nature: '吉' }, { label: '生门', nature: '吉' }, { label: '开门', nature: '吉' },
                { label: '杜门', nature: '平' }, { label: '景门', nature: '平' },
                { label: '伤门', nature: '凶' }, { label: '死门', nature: '凶' }, { label: '惊门', nature: '凶' },
              ]} />
              <LegendRow title="九星" items={[
                { label: '天辅', nature: '吉' }, { label: '天禽', nature: '吉' },
                { label: '天心', nature: '吉' }, { label: '天任', nature: '吉' },
                { label: '天冲', nature: '平' }, { label: '天英', nature: '平' },
                { label: '天蓬', nature: '凶' }, { label: '天芮', nature: '凶' }, { label: '天柱', nature: '凶' },
              ]} />
              <LegendRow title="八神" items={[
                { label: '直符', nature: '吉' }, { label: '太阴', nature: '吉' },
                { label: '六合', nature: '吉' }, { label: '九地', nature: '吉' }, { label: '九天', nature: '吉' },
                { label: '螣蛇', nature: '凶' }, { label: '白虎', nature: '凶' }, { label: '玄武', nature: '凶' },
              ]} />
            </div>
          </section>

          {/* 天机AI深度解读 */}
          <AiInterpretation
            type="qimen"
            title={`${result.ju}·${result.time.year}-${result.time.month}-${result.time.day} ${result.time.hour}时`}
            calcResult={result as unknown as Record<string, unknown>}
            trigger={result ? `${result.ju}-${result.time.month}-${result.time.day}-${result.time.hour}` : null}
            accent="#9b7ec9"
          />

          <div className="text-center text-[11px] text-cream/30 pt-2 pb-2 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            奇门遁甲为古代兵家秘术，今作研究之用，吉凶趋避在人。
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="xj-panel p-10 text-center"
        >
          <div className="font-brush text-6xl xj-gold-text mb-4 xj-anim-float">遁</div>
          <p className="text-cream/60 text-sm">
            时家奇门 · 洛书九宫 · 天地人神四盘齐布
          </p>
          <p className="text-cream/35 text-xs mt-1">默认当前时辰 · 排九宫飞布之盘</p>
        </motion.div>
      )}
    </PageShell>
  )
}
