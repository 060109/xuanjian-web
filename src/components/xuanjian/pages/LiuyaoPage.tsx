'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Hourglass, Hash, Coins, ChevronRight,
  Repeat, BookOpen, Scale, ScrollText,
} from 'lucide-react'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { timeCast, numberCast, autoCast } from '@/lib/metaphysics/liuyao'
import type { LiuyaoResult, GuaInfo } from '@/lib/metaphysics/liuyao'
import { BA_GUA } from '@/lib/metaphysics/constants'
import AiInterpretation from '@/components/xuanjian/AiInterpretation'

/* ---------- helpers ---------- */
const HOUR_NAMES = [
  '子时 23–1', '丑时 1–3', '寅时 3–5', '卯时 5–7',
  '辰时 7–9', '巳时 9–11', '午时 11–13', '未时 13–15',
  '申时 15–17', '酉时 17–19', '戌时 19–21', '亥时 21–23',
]
function hourLabel(h: number) {
  const z = h === 23 || h === 0 ? 0 : Math.floor((h + 1) / 2)
  return `${String(h).padStart(2, '0')}时 · ${HOUR_NAMES[z]}`
}

const LIU_SHEN_COLORS: Record<string, string> = {
  青龙: '#8aa86b', 朱雀: '#c98a8a', 勾陈: '#c9a96a',
  螣蛇: '#9b7ec9', 白虎: '#e8dcc4', 玄武: '#5a5a6b',
}

function yaoPosName(pos: number, yin: boolean): string {
  // 初九/初六, 九二/六二, ..., 上九/上六
  if (pos === 1) return yin ? '初六' : '初九'
  if (pos === 6) return yin ? '上六' : '上九'
  const mid = ['二', '三', '四', '五'][pos - 2]
  return yin ? `六${mid}` : `九${mid}`
}

/* ---------- 卦名卡片 ---------- */
function GuaCard({ gua, isBen, moving }: { gua: GuaInfo; isBen: boolean; moving: number[] }) {
  const upper = BA_GUA[gua.upper]
  const lower = BA_GUA[gua.lower]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`xj-panel p-5 relative overflow-hidden ${isBen ? 'xj-gold-border' : ''}`}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(201,169,106,0.4), transparent 70%)' }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={isBen ? 'border-gold/50 text-gold' : 'border-cinnabar/50 text-cinnabar/90'}>
            {isBen ? '本卦 · BEN' : '变卦 · BIAN'}
          </Badge>
          {isBen && moving.length > 0 && (
            <span className="text-[10px] text-cinnabar/80">动爻 {moving.join('、')}</span>
          )}
        </div>
        <div className="text-center mb-3">
          <div
            className="font-serif text-4xl sm:text-5xl xj-gold-text font-bold"
            style={{ textShadow: '0 0 18px rgba(201,169,106,0.35)' }}
          >
            {gua.name}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="text-cream/40 text-[10px] tracking-widest">上卦</div>
            <div className="font-serif text-2xl text-cream">{upper.symbol} {gua.upper}</div>
            <div className="text-cream/50 text-[10px]">{upper.nature} · {upper.wx}</div>
          </div>
          <div className="text-gold/40 text-2xl font-serif">⇈</div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-cream/40 text-[10px] tracking-widest">下卦</div>
            <div className="font-serif text-2xl text-cream">{lower.symbol} {gua.lower}</div>
            <div className="text-cream/50 text-[10px]">{lower.nature} · {lower.wx}</div>
          </div>
        </div>
        <Separator className="my-3 bg-cream/10" />
        <div className="flex items-center justify-around text-xs">
          <div className="flex flex-col items-center">
            <span className="text-cream/40 text-[10px]">所属宫</span>
            <span className="font-serif text-base text-gold">{gua.gong}宫</span>
          </div>
          <div className="w-px h-6 bg-cream/10" />
          <div className="flex flex-col items-center">
            <span className="text-cream/40 text-[10px]">本宫五行</span>
            <span className="font-serif text-base text-cream">{gua.wx}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ---------- 六爻图 ---------- */
function YaoSymbol({ yin, moving }: { yin: boolean; moving: boolean }) {
  // 阳爻：一条长实线；阴爻：两段中间留空
  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: 64 }}>
        {yin ? (
          <div className="flex justify-between">
            <div
              className="h-2.5 rounded-sm"
              style={{
                width: 26,
                background: moving ? '#9b3a3a' : '#c9a96a',
                boxShadow: moving ? '0 0 10px rgba(155,58,58,0.6)' : 'none',
              }}
            />
            <div
              className="h-2.5 rounded-sm"
              style={{
                width: 26,
                background: moving ? '#9b3a3a' : '#c9a96a',
                boxShadow: moving ? '0 0 10px rgba(155,58,58,0.6)' : 'none',
              }}
            />
          </div>
        ) : (
          <div
            className="h-2.5 rounded-sm w-full"
            style={{
              background: moving ? '#9b3a3a' : '#c9a96a',
              boxShadow: moving ? '0 0 10px rgba(155,58,58,0.6)' : '0 0 6px rgba(201,169,106,0.4)',
            }}
          />
        )}
      </div>
      <span
        className="text-[10px] font-serif"
        style={{ color: moving ? '#c98a8a' : 'transparent', width: 12 }}
      >
        {yin ? '×' : '〇'}
      </span>
    </div>
  )
}

function YaoChart({ result }: { result: LiuyaoResult }) {
  const { benGua, shiYao, yingYao, movingYao } = result
  // 从上到下：pos 6 → 1
  const yaoTopDown = [...benGua.yao].reverse()
  return (
    <div className="xj-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-gold" />
        <h3 className="font-serif text-base text-cream tracking-wider">六爻图</h3>
        <span className="text-[11px] text-cream/40 ml-2">自下而上 · 初爻在底</span>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-[64px_1fr_72px_56px_56px_44px] sm:grid-cols-[80px_1fr_96px_72px_72px_52px] gap-2 items-center text-[10px] sm:text-[11px] text-cream/45 tracking-widest px-2 pb-2 border-b border-cream/10">
        <div className="text-center">爻位</div>
        <div className="text-center">阴阳</div>
        <div className="text-center">纳甲干支</div>
        <div className="text-center">六亲</div>
        <div className="text-center">六神</div>
        <div className="text-center">世应</div>
      </div>

      <div className="space-y-1 mt-2">
        {yaoTopDown.map((y) => {
          const isMoving = movingYao.includes(y.pos)
          const isShi = y.pos === shiYao
          const isYing = y.pos === yingYao
          return (
            <motion.div
              key={y.pos}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: y.pos * 0.04 }}
              className={`grid grid-cols-[64px_1fr_72px_56px_56px_44px] sm:grid-cols-[80px_1fr_96px_72px_72px_52px] gap-2 items-center px-2 py-2 rounded-md transition-colors ${
                isMoving
                  ? 'bg-gold/10 xj-gold-border'
                  : 'hover:bg-cream/5'
              }`}
            >
              <div className="text-center font-serif text-sm text-cream">
                {yaoPosName(y.pos, y.yin)}
              </div>
              <div className="flex justify-center">
                <YaoSymbol yin={y.yin} moving={isMoving} />
              </div>
              <div className="text-center font-serif text-sm text-gold/85">
                {y.naGan}{y.naZhi}
              </div>
              <div className="text-center text-xs text-cream/75">{y.liuQin}</div>
              <div
                className="text-center text-xs font-serif"
                style={{ color: LIU_SHEN_COLORS[y.liuShen] || '#e8dcc4' }}
              >
                {y.liuShen}
              </div>
              <div className="text-center">
                {isShi && (
                  <Badge className="bg-gold/20 text-gold border border-gold/40 text-[10px] py-0 h-5">世</Badge>
                )}
                {isYing && (
                  <Badge variant="outline" className="border-jade/50 text-jade/90 text-[10px] py-0 h-5">应</Badge>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
type Method = 'time' | 'number' | 'auto'

export default function LiuyaoPage() {
  const { toast } = useToast()
  const [method, setMethod] = useState<Method>('time')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LiuyaoResult | null>(null)

  // time inputs
  const now = new Date()
  const [tYear, setTYear] = useState(now.getFullYear())
  const [tMonth, setTMonth] = useState(now.getMonth() + 1)
  const [tDay, setTDay] = useState(now.getDate())
  const [tHour, setTHour] = useState(now.getHours())

  // number inputs
  const [n1, setN1] = useState<string>('')
  const [n2, setN2] = useState<string>('')
  const [n3, setN3] = useState<string>('')

  const yearList: number[] = []
  for (let y = 1900; y <= 2050; y++) yearList.push(y)
  const daysInMonth = new Date(tYear, tMonth, 0).getDate()

  function handleCast() {
    setLoading(true)
    setTimeout(() => {
      try {
        let r: LiuyaoResult
        if (method === 'time') {
          r = timeCast(tYear, tMonth, tDay, tHour)
        } else if (method === 'number') {
          const nums: number[] = []
          if (n1.trim() !== '') nums.push(parseInt(n1, 10) || 0)
          if (n2.trim() !== '') nums.push(parseInt(n2, 10) || 0)
          if (n3.trim() !== '') nums.push(parseInt(n3, 10) || 0)
          if (nums.length < 1) {
            toast({ title: '请输入数字', description: '至少输入一个数字', variant: 'destructive' })
            setLoading(false)
            return
          }
          r = numberCast(nums)
        } else {
          r = autoCast()
        }
        setResult(r)
        toast({
          title: '起卦断卦已完成',
          description: `${r.method} · 本卦《${r.benGua.name}》→ 变卦《${r.bianGua.name}》`,
        })
        // 保存
        const title =
          method === 'time'
            ? `时间起卦 · 《${r.benGua.name}》${r.movingYao.length ? '→《' + r.bianGua.name + '》' : ''}`
            : method === 'number'
            ? `数字起卦 · 《${r.benGua.name}》`
            : `铜钱起卦 · 《${r.benGua.name}》`
        const input =
          method === 'time'
            ? { year: tYear, month: tMonth, day: tDay, hour: tHour }
            : method === 'number'
            ? { nums: [n1, n2, n3].filter((x) => x !== '').map((x) => parseInt(x, 10)) }
            : { auto: true, ts: Date.now() }
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'liuyao', title, input, result: r }),
        }).catch(() => {})
      } catch (e) {
        toast({ title: '起卦失败', description: String(e), variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }, 240)
  }

  return (
    <PageShell title="六爻梅花" subtitle="Liu Yao Mei Hua" trigram="坎" accent="#5a9b9b">
      {/* 输入卡 */}
      <div className="xj-panel p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-jade" />
          <h3 className="font-serif text-base text-cream tracking-wider">起卦方式</h3>
        </div>

        <Tabs value={method} onValueChange={(v) => setMethod(v as Method)}>
          <TabsList className="bg-ink-deep/60 border border-gold/20 p-1 h-auto">
            <TabsTrigger
              value="time"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-cream/70 px-4 py-1.5 text-sm"
            >
              <Hourglass className="w-3.5 h-3.5 mr-1.5" /> 时间起卦
            </TabsTrigger>
            <TabsTrigger
              value="number"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-cream/70 px-4 py-1.5 text-sm"
            >
              <Hash className="w-3.5 h-3.5 mr-1.5" /> 数字起卦
            </TabsTrigger>
            <TabsTrigger
              value="auto"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-cream/70 px-4 py-1.5 text-sm"
            >
              <Coins className="w-3.5 h-3.5 mr-1.5" /> 铜钱自动
            </TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-cream/60 text-xs">年份</Label>
                <Select value={String(tYear)} onValueChange={(v) => setTYear(Number(v))}>
                  <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                    {yearList.map((y) => (<SelectItem key={y} value={String(y)}>{y}年</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-cream/60 text-xs">月份</Label>
                <Select value={String(tMonth)} onValueChange={(v) => setTMonth(Number(v))}>
                  <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<SelectItem key={m} value={String(m)}>{m}月</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-cream/60 text-xs">日期</Label>
                <Select value={String(tDay)} onValueChange={(v) => setTDay(Number(v))}>
                  <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (<SelectItem key={d} value={String(d)}>{d}日</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-cream/60 text-xs">时辰</Label>
                <Select value={String(tHour)} onValueChange={(v) => setTHour(Number(v))}>
                  <SelectTrigger className="w-full bg-ink-deep/60 border-gold/20 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72 bg-ink/95 border-gold/25">
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (<SelectItem key={h} value={String(h)}>{hourLabel(h)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="number" className="mt-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: '第一数', val: n1, set: setN1, ph: '如 3' },
                { label: '第二数', val: n2, set: setN2, ph: '如 8' },
                { label: '第三数 (可选)', val: n3, set: setN3, ph: '如 5' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Label className="text-cream/60 text-xs">{f.label}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="bg-ink-deep/60 border-gold/20 text-cream placeholder:text-cream/30 text-center font-serif text-lg"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-cream/40 mt-3">
              ※ 一数取上下卦；两数上卦下卦，和求动爻；三数合成上卦与下卦。
            </p>
          </TabsContent>

          <TabsContent value="auto" className="mt-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <motion.div
                  animate={loading ? { rotateY: 360 } : {}}
                  transition={{ duration: 0.6, repeat: loading ? Infinity : 0 }}
                  className="text-6xl mb-3 xj-gold-text font-brush"
                >
                  道
                </motion.div>
                <p className="text-cream/60 text-sm">
                  三枚铜钱，六摇成卦，模拟传统金钱课。
                </p>
                <p className="text-cream/35 text-xs mt-1">
                  点击下方「起卦断卦」开始摇卦
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-5 flex items-center justify-end gap-3">
          <span className="text-[11px] text-cream/40 hidden sm:inline">
            {method === 'time' && `公历 ${tYear}年${tMonth}月${tDay}日 ${String(tHour).padStart(2, '0')}:00`}
            {method === 'number' && `数字 ${[n1, n2, n3].filter(Boolean).join(' · ')}`}
            {method === 'auto' && '铜钱三枚'}
          </span>
          <Button
            onClick={handleCast}
            disabled={loading}
            className="bg-gradient-to-r from-jade to-gold text-ink-deep hover:from-gold hover:to-gold-soft font-serif tracking-wider shadow-lg shadow-jade/20"
          >
            {loading ? (
              <><Sparkles className="w-4 h-4 mr-1 animate-pulse" /> 起卦中…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1" /> 起卦断卦</>
            )}
          </Button>
        </div>
      </div>

      {/* 结果区 */}
      {result ? (
        <div className="space-y-5">
          {/* 本卦 vs 变卦 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base text-cream tracking-wider">卦象</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <GuaCard gua={result.benGua} isBen moving={result.movingYao} />
              <GuaCard gua={result.bianGua} isBen={false} moving={[]} />
            </div>
          </section>

          {/* 六爻图 */}
          <section>
            <YaoChart result={result} />
          </section>

          {/* 体用关系 + 断语 */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="xj-panel p-5 lg:col-span-1 xj-gold-border relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(90,155,155,0.4), transparent 70%)' }}
              />
              <div className="relative flex flex-col items-center text-center h-full justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="w-4 h-4 text-jade" />
                  <div className="text-[11px] tracking-[0.3em] text-cream/55 uppercase">体用关系</div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-cream/40">体</span>
                    <span className="font-serif text-2xl xj-gold-text">{result.benGua.lower}</span>
                  </div>
                  <Repeat className="w-4 h-4 text-cream/40" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-cream/40">用</span>
                    <span className="font-serif text-2xl text-cream">{result.benGua.upper}</span>
                  </div>
                </div>
                <div className="font-serif text-lg xj-gold-text leading-relaxed">
                  {result.relation}
                </div>
                <div className="mt-3 text-[11px] text-cream/45">
                  内卦为体 · 外卦为用
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="xj-panel p-5 lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-4 h-4 text-gold" />
                <h4 className="font-serif text-base text-cream tracking-wider">断语</h4>
              </div>
              <p className="text-sm sm:text-[15px] leading-loose text-cream/85 font-serif">
                {result.conclusion}
              </p>
              <Separator className="my-3 bg-cream/10" />
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-cream/55">
                <Badge variant="outline" className="border-gold/40 text-gold/80">{result.method}</Badge>
                <span>世爻 {result.shiYao} 位 · 应爻 {result.yingYao} 位</span>
                <span>·</span>
                <span>动爻 {result.movingYao.length} 个 {result.movingYao.length ? `(${result.movingYao.join('、')})` : ''}</span>
              </div>
            </motion.div>
          </section>

          {/* 天机AI深度解读 */}
          <AiInterpretation
            type="liuyao"
            title={`本卦${result.benGua.name}·变卦${result.bianGua.name}·${result.method}`}
            calcResult={result as unknown as Record<string, unknown>}
            trigger={result ? `${result.benGua.name}-${result.bianGua.name}-${result.movingYao.join(',')}` : null}
            accent="#5a9b9b"
          />

          <div className="text-center text-[11px] text-cream/30 pt-2 pb-2">
            ※ 易道深广，吉凶在人；心诚则灵，断者审之。
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="xj-panel p-10 text-center"
        >
          <div className="font-brush text-6xl xj-gold-text mb-4 xj-anim-float">易</div>
          <p className="text-cream/60 text-sm">
            时间起卦 · 数字起卦 · 铜钱自动，三法任选，演卦断吉凶
          </p>
          <p className="text-cream/35 text-xs mt-1">默认当前时辰 · 可切换方式</p>
        </motion.div>
      )}
    </PageShell>
  )
}
