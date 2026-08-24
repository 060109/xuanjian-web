'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageShell from '../PageShell'
import AiInterpretation from '@/components/xuanjian/AiInterpretation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { analyzeName, type NameResult } from '@/lib/metaphysics/name'
import { numWX } from '@/lib/metaphysics/constants'
import {
  Calculator,
  Sparkles,
  Save,
  ScrollText,
  Palette,
  PenTool,
  TriangleAlert,
} from 'lucide-react'

// 五行色
const WX_COLOR: Record<string, string> = {
  金: '#d9c08a',
  木: '#8aa86b',
  水: '#5a9b9b',
  火: '#c98a8a',
  土: '#c9a96a',
}

// 吉凶 badge
function JiBadge({ ji }: { ji: string }) {
  const cfg =
    ji === '吉'
      ? { bg: 'rgba(138,168,107,0.15)', border: 'rgba(138,168,107,0.5)', color: '#a8c48a' }
      : ji === '半吉'
        ? { bg: 'rgba(201,169,106,0.15)', border: 'rgba(201,169,106,0.5)', color: '#d9c08a' }
        : { bg: 'rgba(155,58,58,0.15)', border: 'rgba(155,58,58,0.5)', color: '#e0a8a8' }
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-serif"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {ji}
    </span>
  )
}

// 五行色点
function WxDot({ wx, size = 14 }: { wx: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${WX_COLOR[wx] || '#c9a96a'}, ${WX_COLOR[wx] || '#c9a96a'}88)`,
        boxShadow: `0 0 6px ${WX_COLOR[wx] || '#c9a96a'}66`,
      }}
    />
  )
}

// 评分等级
function scoreLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: '优', color: '#a8c48a', bg: 'rgba(138,168,107,0.15)' }
  if (score >= 70) return { label: '良', color: '#d9c08a', bg: 'rgba(201,169,106,0.15)' }
  if (score >= 60) return { label: '中', color: '#c9a96a', bg: 'rgba(201,169,106,0.1)' }
  return { label: '弱', color: '#e0a8a8', bg: 'rgba(155,58,58,0.15)' }
}

// 评分圆环（带数字增长动画）
function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number>(0)
  const level = scoreLevel(score)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const from = 0
    const to = score
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setDisplay(Math.round(from + (to - from) * ease))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [score])

  const pct = Math.max(0, Math.min(100, (display / 100) * 100))
  // 圆环参数
  const size = 168
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  const color = level.color

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(201,169,106,0.12)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            filter="url(#scoreGlow)"
            strokeDasharray={c}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="font-serif font-bold leading-none"
            style={{
              fontSize: 44,
              color,
              textShadow: `0 0 18px ${color}55`,
            }}
          >
            {display}
          </motion.div>
          <div className="text-[10px] tracking-widest text-cream/45 mt-1">SCORE</div>
        </div>
        {/* 等级徽章 */}
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-serif text-sm"
          style={{
            background: level.bg,
            border: `1px solid ${color}66`,
            color,
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {level.label}
        </motion.div>
      </div>
    </div>
  )
}

// 五格卡片
function GridCard({
  name,
  num,
  ji,
  desc,
  wx,
  highlight,
  delay,
}: {
  name: string
  num: number
  ji: string
  desc: string
  wx: string
  highlight?: boolean
  delay: number
}) {
  const wxColor = WX_COLOR[wx] || '#c9a96a'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative p-4 rounded-xl overflow-hidden"
      style={{
        background: highlight
          ? `linear-gradient(135deg, ${wxColor}18, rgba(12,9,16,0.7))`
          : 'linear-gradient(135deg, rgba(26,16,48,0.55), rgba(12,9,16,0.65))',
        border: highlight ? `1px solid ${wxColor}55` : '1px solid rgba(201,169,106,0.2)',
        boxShadow: highlight ? `0 0 20px ${wxColor}22` : 'none',
      }}
    >
      {highlight && (
        <span
          className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0 rounded font-serif"
          style={{ background: `${wxColor}22`, color: wxColor, border: `1px solid ${wxColor}55` }}
        >
          重
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        <WxDot wx={wx} size={12} />
        <span className="font-serif text-sm xj-gold-text">{name}</span>
        <span className="text-[10px] text-cream/45">{wx}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className="font-serif font-bold text-3xl"
          style={{ color: wxColor, textShadow: `0 0 10px ${wxColor}44` }}
        >
          {num}
        </span>
        <JiBadge ji={ji} />
      </div>
      <p className="text-[11px] text-cream/65 leading-relaxed font-serif">{desc}</p>
    </motion.div>
  )
}

export default function NamePage() {
  const { toast } = useToast()
  const [name, setName] = useState('李明轩')
  const [result, setResult] = useState<NameResult | null>(() => analyzeName('李明轩'))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAnalyze = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ title: '请输入姓名', description: '支持中文全名，如「李明轩」' })
      return
    }
    if ([...trimmed].length < 2) {
      toast({ title: '姓名至少两字', description: '请输入完整姓名' })
      return
    }

    setLoading(true)
    setSaved(false)
    await new Promise((r) => setTimeout(r, 600)) // 计算很快，加点节奏感
    const r = analyzeName(trimmed)
    setResult(r)
    setLoading(false)

    toast({
      title: '数理分析完成',
      description: `${r.name} · 评分 ${r.score} · 三才${r.sanCai.relation.includes('相生') ? '相生' : r.sanCai.relation.includes('相克') ? '有克' : '平和'}`,
    })

    // 保存到历史
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'name',
          title: `${r.name} · ${r.score}分`,
          input: { name: r.name, surname: r.surname, given: r.given },
          result: {
            grids: r.grids,
            sanCai: r.sanCai,
            gridAnalysis: r.gridAnalysis,
            wxRelation: r.wxRelation,
            score: r.score,
            suggestion: r.suggestion,
          },
        }),
      })
      setSaved(true)
    } catch {
      /* 静默 */
    }
  }

  const sanCai = result?.sanCai

  return (
    <PageShell title="姓名数理" subtitle="Name Numerology" trigram="离" accent="#d9c08a">
      {/* 1. 输入区 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 xj-panel p-5 sm:p-6 relative overflow-hidden"
      >
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full xj-anim-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(217,192,138,0.18), transparent 70%)' }}
        />
        <div className="flex items-center gap-2 mb-3 relative">
          <PenTool className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">输入姓名</h2>
          <span className="ml-auto text-[10px] text-cream/45 tracking-widest">五格剖象法</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 relative">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="请输入中文姓名，如「李明轩」"
            className="h-11 flex-1 bg-purple-deep/40 border-gold/30 text-cream font-serif text-base focus:border-gold/60"
            maxLength={8}
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="lg"
            className="h-11 px-6 rounded-md font-serif tracking-wider"
            style={{
              background: loading
                ? 'linear-gradient(135deg, #6b4a8a, #1a1030)'
                : 'linear-gradient(135deg, #c9a96a, #8a7544)',
              color: '#07060a',
              border: '1px solid rgba(201,169,106,0.55)',
              boxShadow: '0 0 18px rgba(201,169,106,0.28)',
            }}
          >
            <Calculator className="w-4 h-4" />
            {loading ? '推演中…' : '分析数理'}
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-cream/40">
          采用康熙笔画·五格剖象法。示例：「李明轩」「欧阳娜娜」
        </p>
      </motion.section>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 2. 评分仪表盘 */}
            <section className="mb-6 xj-panel p-5 sm:p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-gold" />
                <h2 className="font-serif text-base sm:text-lg xj-gold-text">综合评分</h2>
                {saved && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-jade">
                    <Save className="w-3 h-3" />
                    已归档
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                <ScoreRing score={result.score} />
                <div className="flex-1 w-full">
                  <div className="mb-3">
                    <div className="text-[11px] text-cream/50 tracking-widest mb-1">姓名</div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-brush text-3xl xj-gold-text">{result.name}</span>
                      <span className="text-xs text-cream/45">
                        姓「{result.surname}」 · 名「{result.given || '—'}」
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/55">三才</span>
                      <span className="text-cream/85 font-serif">{result.sanCai.tian}·{result.sanCai.ren}·{result.sanCai.di}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/55">三才关系</span>
                      <span className="text-gold-soft font-serif">{result.sanCai.relation}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cream/55">五行关系</span>
                      <span className="text-cream/85 font-serif text-right">{result.wxRelation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. 字笔画 */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-4 h-4 text-gold" />
                <h2 className="font-serif text-base sm:text-lg xj-gold-text">字·康熙笔画</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {result.charStrokes.map((s, i) => {
                  const ch = [...result.name][i] || '?'
                  const wx = numWX(s)
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="px-4 py-3 rounded-lg xj-glass flex flex-col items-center min-w-[80px]"
                    >
                      <span className="font-brush text-2xl xj-gold-text mb-1">{ch}</span>
                      <div className="flex items-center gap-1.5">
                        <WxDot wx={wx} size={10} />
                        <span className="text-lg font-serif font-bold" style={{ color: WX_COLOR[wx] }}>{s}</span>
                        <span className="text-[10px] text-cream/45">画</span>
                      </div>
                      <span className="text-[10px] text-cream/45 mt-0.5">{wx}</span>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            {/* 4. 五格数理表 */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-gold" />
                <h2 className="font-serif text-base sm:text-lg xj-gold-text">五格数理</h2>
                <span className="ml-auto text-[10px] text-cream/45">人格·总格为重</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {result.gridAnalysis.map((g, i) => {
                  const num = result.grids[
                    g.name === '天格' ? 'tian'
                      : g.name === '人格' ? 'ren'
                        : g.name === '地格' ? 'di'
                          : g.name === '外格' ? 'wai' : 'zong'
                  ]
                  const wx = numWX(num)
                  return (
                    <GridCard
                      key={g.name}
                      name={g.name}
                      num={num}
                      ji={g.ji}
                      desc={g.desc}
                      wx={wx}
                      highlight={g.name === '人格' || g.name === '总格'}
                      delay={i * 0.08}
                    />
                  )
                })}
              </div>
            </section>

            {/* 5. 三才五行 */}
            {sanCai && (
              <section className="mb-6 xj-panel p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-4 h-4 text-gold" />
                  <h2 className="font-serif text-base sm:text-lg xj-gold-text">三才五行</h2>
                </div>
                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                  {(['tian', 'ren', 'di'] as const).map((k, i) => {
                    const wx = sanCai[k]
                    const label = k === 'tian' ? '天' : k === 'ren' ? '人' : '地'
                    return (
                      <div key={k} className="flex flex-col items-center relative">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 120 }}
                            className="w-14 h-14 rounded-full flex items-center justify-center font-brush text-2xl"
                            style={{
                              background: `radial-gradient(circle, ${WX_COLOR[wx]}33, transparent 70%)`,
                              border: `2px solid ${WX_COLOR[wx]}`,
                              color: WX_COLOR[wx],
                              boxShadow: `0 0 18px ${WX_COLOR[wx]}44`,
                            }}
                          >
                            {wx}
                          </motion.div>
                          <span className="mt-2 text-xs text-cream/55 font-serif">{label}才</span>
                        </div>
                        {i < 2 && (
                          <div className="absolute top-7 -right-4 sm:-right-8 text-gold/40 text-lg">→</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="text-center text-sm text-gold-soft font-serif px-2 leading-relaxed">
                  {sanCai.relation}
                </div>
              </section>
            )}

            {/* 6. 综合建议（卷轴风） */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-4 h-4 text-gold" />
                <h2 className="font-serif text-base sm:text-lg xj-gold-text">综合建议</h2>
              </div>
              <div
                className="relative p-5 sm:p-7 rounded-xl overflow-hidden"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(40,28,16,0.55) 0%, rgba(26,16,48,0.5) 50%, rgba(40,28,16,0.55) 100%)',
                  border: '1px solid rgba(201,169,106,0.3)',
                  boxShadow: 'inset 0 0 30px rgba(201,169,106,0.08)',
                }}
              >
                {/* 卷轴上下装饰 */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #8a7544, #c9a96a, #8a7544)' }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #8a7544, #c9a96a, #8a7544)' }}
                />
                {/* 卷轴左右卷边 */}
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-gold/30 to-transparent" />
                <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-gold/30 to-transparent" />

                <p className="text-sm sm:text-base leading-loose text-cream/90 font-serif px-2 sm:px-4">
                  {result.suggestion}
                </p>
              </div>
            </motion.section>

            {/* 天机AI深度解读 */}
            <AiInterpretation
              type="name"
              title={`姓名·${result.name}·评分${result.score}`}
              calcResult={result as unknown as Record<string, unknown>}
              trigger={result ? `${result.name}-${result.score}` : null}
              accent="#d9c08a"
            />

            {/* 提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-2 p-3 rounded-lg xj-glass text-[11px] text-cream/55"
            >
              <TriangleAlert className="w-3.5 h-3.5 text-gold/70 shrink-0 mt-0.5" />
              <p>
                姓名学为参考，<span className="text-gold-soft">心性为本</span>。命名一事，数理为辅，先天命格与后天修养更为重要。本工具采用康熙笔画与五格剖象法，仅供研究参考。
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
