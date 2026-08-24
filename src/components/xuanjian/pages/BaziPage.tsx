'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, User2, MapPin, Brain, Briefcase, Coins, HeartPulse,
  CalendarDays, Clock3, Shuffle, TrendingUp, ChevronRight,
} from 'lucide-react'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { calcBazi } from '@/lib/metaphysics/bazi'
import type { BaziResult } from '@/lib/metaphysics/bazi'
import { GAN_WX, ZHI_WX } from '@/lib/metaphysics/constants'
import AiInterpretation from '@/components/xuanjian/AiInterpretation'

/* ---------- helpers ---------- */
const WX_COLORS: Record<string, string> = {
  金: '#d9c08a', 木: '#8aa86b', 水: '#5a9b9b', 火: '#c98a8a', 土: '#c9a96a',
}
const WX_LABEL: Record<string, string> = {
  金: '金', 木: '木', 水: '水', 火: '火', 土: '土',
}
const HOUR_NAMES = [
  '子时 23–1', '丑时 1–3', '寅时 3–5', '卯时 5–7',
  '辰时 7–9', '巳时 9–11', '午时 11–13', '未时 13–15',
  '申时 15–17', '酉时 17–19', '戌时 19–21', '亥时 21–23',
]
function hourToZhiIdx(h: number) {
  if (h === 23 || h === 0) return 0
  return Math.floor((h + 1) / 2)
}
function getHourLabel(h: number) {
  return `${String(h).padStart(2, '0')}时 · ${HOUR_NAMES[hourToZhiIdx(h)]}`
}

/* ---------- Pillar card ---------- */
function PillarCard({
  label, gan, zhi, shengXiao, isDayMaster, accent,
}: {
  label: string
  gan: string
  zhi: string
  shengXiao?: string
  isDayMaster?: boolean
  accent: string
}) {
  const ganWX = GAN_WX[gan] || ''
  const zhiWX = ZHI_WX[zhi] || ''
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative xj-panel p-4 sm:p-5 flex flex-col items-center gap-2 ${
        isDayMaster ? 'xj-glow xj-gold-border' : ''
      }`}
      style={isDayMaster ? { boxShadow: '0 0 30px rgba(201,169,106,0.25)' } : undefined}
    >
      {/* 顶部五行色条 */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[10px] overflow-hidden flex">
        <div className="flex-1" style={{ background: WX_COLORS[ganWX] }} />
        <div className="flex-1" style={{ background: WX_COLORS[zhiWX] }} />
      </div>

      <div className="text-[11px] tracking-[0.3em] text-cream/55 uppercase mt-1">{label}</div>

      <div className="flex flex-col items-center gap-0.5 py-1">
        <div
          className="font-serif text-5xl sm:text-6xl font-bold leading-none xj-gold-text"
          style={{ textShadow: '0 0 20px rgba(201,169,106,0.3)' }}
        >
          {gan}
        </div>
        <div className="text-[10px] text-cream/40 tracking-widest">{ganWX}</div>
      </div>

      <Separator className="my-1 bg-cream/10" />

      <div className="flex flex-col items-center gap-0.5">
        <div
          className="font-serif text-5xl sm:text-6xl font-bold leading-none text-cream"
          style={{ textShadow: '0 0 18px rgba(232,220,196,0.18)' }}
        >
          {zhi}
        </div>
        <div className="text-[10px] text-cream/40 tracking-widest">{zhiWX}</div>
      </div>

      <div className="flex items-center gap-2 mt-1 min-h-[18px]">
        {shengXiao && (
          <Badge variant="outline" className="border-gold/40 text-gold/85 bg-gold/5">
            生肖 · {shengXiao}
          </Badge>
        )}
        {isDayMaster && (
          <Badge className="bg-gold/20 text-gold border border-gold/40">日主</Badge>
        )}
      </div>

      <div
        className="absolute -top-2 -right-2 w-2 h-2 rounded-full"
        style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
      />
    </motion.div>
  )
}

/* ---------- 五行分布 ---------- */
function WuxingPanel({ wuxing, dayGanWX }: { wuxing: Record<string, number>; dayGanWX: string }) {
  const total = useMemo(
    () => Object.values(wuxing).reduce((a, b) => a + b, 0) || 1,
    [wuxing],
  )
  const order = ['金', '木', '水', '火', '土']
  return (
    <div className="xj-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="font-serif text-base text-cream tracking-wider">五行分布</h3>
      </div>
      <div className="space-y-2.5">
        {order.map((wx) => {
          const v = wuxing[wx] || 0
          const pct = Math.round((v / total) * 100)
          const isDayMaster = wx === dayGanWX
          return (
            <div key={wx} className="flex items-center gap-3">
              <div
                className="w-6 text-center font-serif text-sm"
                style={{ color: WX_COLORS[wx] }}
              >
                {WX_LABEL[wx]}
              </div>
              <div className="flex-1 relative">
                <Progress
                  value={pct}
                  className="h-2.5 bg-cream/5"
                  style={{
                    // @ts-ignore inline style for progress fill
                    '--progress-foreground': WX_COLORS[wx],
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 h-2.5 rounded-full pointer-events-none"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${WX_COLORS[wx]}55, ${WX_COLORS[wx]})`,
                    boxShadow: isDayMaster ? `0 0 12px ${WX_COLORS[wx]}aa` : 'none',
                  }}
                />
              </div>
              <div className="w-12 text-right text-xs text-cream/70 tabular-nums">
                {v.toFixed(1)} · {pct}%
              </div>
              {isDayMaster && (
                <Badge variant="outline" className="border-gold/40 text-gold/80 text-[10px] py-0 h-4">
                  日主
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- 十神表 ---------- */
function TenGodTable({ result }: { result: BaziResult }) {
  const cols = [
    { label: '年柱', gan: result.tenGods.yearGan, zhi: result.tenGods.yearZhi, isDay: false },
    { label: '月柱', gan: result.tenGods.monthGan, zhi: result.tenGods.monthZhi, isDay: false },
    { label: '日柱', gan: '日主', zhi: result.tenGods.dayZhi, isDay: true },
    { label: '时柱', gan: result.tenGods.hourGan, zhi: result.tenGods.hourZhi, isDay: false },
  ]
  return (
    <div className="xj-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shuffle className="w-4 h-4 text-gold" />
        <h3 className="font-serif text-base text-cream tracking-wider">十神配置</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cols.map((c) => (
          <div
            key={c.label}
            className={`rounded-md p-3 text-center ${
              c.isDay ? 'xj-gold-border bg-gold/8' : 'bg-cream/5 border border-cream/8'
            }`}
          >
            <div className="text-[11px] text-cream/50 tracking-widest mb-2">{c.label}</div>
            <div className={`font-serif text-base ${c.isDay ? 'xj-gold-text' : 'text-cream'}`}>
              {c.gan}
            </div>
            <Separator className="my-2 bg-cream/10" />
            <div className="text-[10px] text-cream/40 mb-1">藏干十神</div>
            <div className="space-y-1">
              {c.zhi.length === 0 ? (
                <div className="text-cream/30 text-xs">—</div>
              ) : (
                c.zhi.map((cg, i) => (
                  <div key={i} className="text-[11px] text-cream/75 flex justify-center gap-1">
                    <span className="text-cream/45">{cg.gan}</span>
                    <span className="text-gold/80">{cg.god}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 大运时间线 ---------- */
function DayunTimeline({ result }: { result: BaziResult }) {
  const { direction, startAge, list } = result.dayun
  return (
    <div className="xj-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base text-cream tracking-wider">大运 · 八步</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-gold/40 text-gold/80">
            {direction}行
          </Badge>
          <span className="text-xs text-cream/55">起运 {startAge} 岁</span>
        </div>
      </div>
      <div className="relative overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          {/* 连接线 */}
          <div
            className="absolute top-[34px] left-3 right-3 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,106,0.4), rgba(201,169,106,0.4), transparent)' }}
          />
          {list.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative w-[88px] flex flex-col items-center pt-3"
            >
              <div className="text-xs text-cream/55">{d.startYear}年</div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm xj-gold-text bg-ink-deep xj-gold-border my-1.5"
                style={{ boxShadow: '0 0 16px rgba(201,169,106,0.25)' }}
              >
                {d.ageStart}
              </div>
              <div className="text-[11px] text-cream/45 mb-1">岁起</div>
              <div className="font-serif text-lg text-cream leading-tight">{d.ganZhi}</div>
              {i === 0 && (
                <Badge variant="outline" className="mt-1 border-jade/50 text-jade/90 text-[10px] py-0 h-4">
                  当前
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- 分析卡 ---------- */
function AnalysisCard({
  icon, title, text, delay,
}: {
  icon: React.ReactNode; title: string; text: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="xj-panel p-5 h-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gold/10 text-gold border border-gold/20">
          {icon}
        </div>
        <h4 className="font-serif text-sm text-cream tracking-wider">{title}</h4>
      </div>
      <p className="text-xs sm:text-[13px] leading-relaxed text-cream/75">{text}</p>
    </motion.div>
  )
}

/* ---------- Page ---------- */
export default function BaziPage() {
  const { toast } = useToast()
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hour, setHour] = useState(10)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [place, setPlace] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BaziResult | null>(null)

  const yearList = useMemo(() => {
    const arr: number[] = []
    for (let y = 1900; y <= 2030; y++) arr.push(y)
    return arr
  }, [])

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month])

  function handleCast() {
    setLoading(true)
    // 异步一拍，让 loading 可见
    setTimeout(() => {
      try {
        const r = calcBazi({ year, month, day, hour, gender, place: place || undefined })
        setResult(r)
        toast({
          title: '四柱排盘已完成',
          description: `${year}年${month}月${day}日 ${hour}时 · 日主 ${r.dayGan}（${r.dayGanWX}）`,
        })
        // 静默保存
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bazi',
            title: `${gender === 'male' ? '乾造' : '坤造'} ${r.pillars.year.gan}${r.pillars.year.zhi} · ${r.dayGan}${r.pillars.day.zhi}日主`,
            input: { year, month, day, hour, gender, place },
            result: r,
          }),
        }).catch(() => {})
      } catch (e) {
        toast({ title: '排盘失败', description: String(e), variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }, 220)
  }

  return (
    <PageShell title="八字命理" subtitle="Si Zhu Ming Li" trigram="乾" accent="#c9a96a">
      {/* 输入卡 */}
      <div className="xj-panel p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-gold" />
          <h3 className="font-serif text-base text-cream tracking-wider">生辰八字输入</h3>
          <Badge variant="outline" className="ml-auto border-gold/30 text-gold/70 text-[10px]">
            以立春分年 · 以节气分月
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 年 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> 年份
            </Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {yearList.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}年</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 月 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> 月份
            </Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>{m}月</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 日 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> 日期
            </Label>
            <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时 */}
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <Clock3 className="w-3 h-3" /> 时辰
            </Label>
            <Select value={String(hour)} onValueChange={(v) => setHour(Number(v))}>
              <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <SelectItem key={h} value={String(h)}>{getHourLabel(h)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 性别 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <User2 className="w-3 h-3" /> 性别
            </Label>
            <RadioGroup
              value={gender}
              onValueChange={(v) => setGender(v as 'male' | 'female')}
              className="flex items-center gap-4 h-9"
            >
              <Label htmlFor="g-m" className="flex items-center gap-1.5 cursor-pointer text-cream/80 text-sm hover:text-gold transition-colors">
                <RadioGroupItem id="g-m" value="male" /> 乾造
              </Label>
              <Label htmlFor="g-f" className="flex items-center gap-1.5 cursor-pointer text-cream/80 text-sm hover:text-gold transition-colors">
                <RadioGroupItem id="g-f" value="female" /> 坤造
              </Label>
            </RadioGroup>
          </div>

          {/* 出生地 */}
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <Label className="text-cream/60 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 出生地
            </Label>
            <Input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="可选 · 如 杭州"
              className="bg-ink-deep/60 border-gold/20 text-cream placeholder:text-cream/30"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <span className="text-[11px] text-cream/40 hidden sm:inline">
            公历 {year}年{month}月{day}日 {String(hour).padStart(2, '0')}:00 · {gender === 'male' ? '男命' : '女命'}
          </span>
          <Button
            onClick={handleCast}
            disabled={loading}
            className="bg-gradient-to-r from-gold-dim to-gold text-ink-deep hover:from-gold hover:to-gold-soft font-serif tracking-wider shadow-lg shadow-gold/20"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-1 animate-pulse" /> 推演中…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" /> 排盘推演
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 结果区 */}
      {result && (
        <div className="space-y-5">
          {/* 四柱 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base text-cream tracking-wider">四柱八字</h3>
              <span className="text-xs text-cream/40 ml-2">日主 · {result.dayGan}（{result.dayGanWX}）</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <PillarCard label="YEAR 年柱" gan={result.pillars.year.gan} zhi={result.pillars.year.zhi} shengXiao={result.pillars.year.shengXiao} accent="#c9a96a" />
              <PillarCard label="MONTH 月柱" gan={result.pillars.month.gan} zhi={result.pillars.month.zhi} accent="#9b7ec9" />
              <PillarCard label="DAY 日柱" gan={result.pillars.day.gan} zhi={result.pillars.day.zhi} isDayMaster accent="#c9a96a" />
              <PillarCard label="HOUR 时柱" gan={result.pillars.hour.gan} zhi={result.pillars.hour.zhi} accent="#3a6b6b" />
            </div>
          </section>

          {/* 五行 + 格局 */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WuxingPanel wuxing={result.wuxing} dayGanWX={result.dayGanWX} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="xj-panel p-5 flex flex-col justify-center items-center text-center xj-gold-border relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(201,169,106,0.4), transparent 70%)' }}
              />
              <div className="relative">
                <div className="text-[11px] tracking-[0.4em] text-cream/55 uppercase mb-2">PATTERN · 命局格局</div>
                <div className="font-serif text-3xl sm:text-4xl xj-gold-text leading-tight mb-3" style={{ textShadow: '0 0 20px rgba(201,169,106,0.35)' }}>
                  {result.pattern}
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    result.strength === '身强'
                      ? 'border-jade/50 text-jade/90'
                      : result.strength === '身弱'
                      ? 'border-cinnabar/50 text-cinnabar/90'
                      : 'border-gold/50 text-gold/90'
                  }`}
                >
                  {result.strength}
                </Badge>
                <div className="mt-3 text-[11px] text-cream/40">
                  日主 {result.dayGan}({result.dayGanWX}) · 生肖 {result.shengXiao}
                </div>
              </div>
            </motion.div>
          </section>

          {/* 十神 */}
          <section>
            <TenGodTable result={result} />
          </section>

          {/* 大运 */}
          <section>
            <DayunTimeline result={result} />
          </section>

          {/* 分析四块 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnalysisCard icon={<Brain className="w-4 h-4" />} title="心性禀赋" text={result.analysis.personality} delay={0.05} />
            <AnalysisCard icon={<Briefcase className="w-4 h-4" />} title="事业取向" text={result.analysis.career} delay={0.1} />
            <AnalysisCard icon={<Coins className="w-4 h-4" />} title="财源格局" text={result.analysis.wealth} delay={0.15} />
            <AnalysisCard icon={<HeartPulse className="w-4 h-4" />} title="健康调养" text={result.analysis.health} delay={0.2} />
          </section>

          {/* 天机AI深度解读 */}
          <AiInterpretation
            type="bazi"
            title={`${gender === 'male' ? '乾造' : '坤造'} ${result.pillars.year.gan}${result.pillars.year.zhi} · ${result.dayGan}${result.pillars.day.zhi}日主`}
            calcResult={result as unknown as Record<string, unknown>}
            trigger={result ? `${result.dayGan}-${result.dayGanWX}-${result.strength}` : null}
            accent="#c9a96a"
          />

          <div className="text-center text-[11px] text-cream/30 pt-2 pb-2">
            ※ 命理推演仅供参考，命运在人不在天。
          </div>
        </div>
      )}

      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="xj-panel p-10 text-center"
        >
          <div className="font-brush text-6xl xj-gold-text mb-4 xj-anim-float">命</div>
          <p className="text-cream/60 text-sm">
            输入生辰八字，推演四柱五行、十神格局、大运流年
          </p>
          <p className="text-cream/35 text-xs mt-1">默认示例：1990 年 6 月 15 日 10 时 · 乾造</p>
        </motion.div>
      )}
    </PageShell>
  )
}
