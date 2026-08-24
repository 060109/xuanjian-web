'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import AiInterpretation from '@/components/xuanjian/AiInterpretation'
import {
  drawSpread,
  cardMeaning,
  spreadConclusion,
  SPREADS,
  type DrawnCard,
} from '@/lib/metaphysics/tarot'
import {
  Shuffle,
  Sparkles,
  RotateCcw,
  Moon,
  Stars,
  Cloud,
  Save,
  Sun,
  Wind,
  Droplets,
  Flame,
  Mountain,
  HelpCircle,
} from 'lucide-react'

// 元素 → 图标 + 颜色
const ELEMENT_META: Record<string, { icon: typeof Moon; color: string; label: string }> = {
  风: { icon: Wind, color: '#9bbf9b', label: '风' },
  水: { icon: Droplets, color: '#5a9b9b', label: '水' },
  火: { icon: Flame, color: '#c97a5a', label: '火' },
  土: { icon: Mountain, color: '#8a7544', label: '土' },
}

function ElementIcon({ el, className }: { el: string; className?: string }) {
  const meta = ELEMENT_META[el] || ELEMENT_META['土']
  const Icon = meta.icon
  return <Icon className={className} style={{ color: meta.color }} aria-label={`${el}元素`} />
}

// 3D 翻转单张牌
function TarotCardView({
  drawn,
  index,
  flipDelay,
}: {
  drawn: DrawnCard
  index: number
  flipDelay: number
}) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), flipDelay)
    return () => clearTimeout(t)
  }, [flipDelay])

  const { card, position, reversed } = drawn
  const meaning = cardMeaning(drawn)
  const isReversed = reversed

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.12 }}
    >
      {/* 牌位标签 */}
      <div className="flex items-center justify-center mb-2">
        <span
          className="text-xs tracking-widest font-serif px-3 py-1 rounded-full xj-glass text-cream/85"
          style={{ border: '1px solid rgba(201,169,106,0.35)' }}
        >
          {position}
        </span>
      </div>

      {/* 翻转容器 */}
      <div
        className="relative w-full mx-auto"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative w-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.85, ease: [0.22, 0.85, 0.32, 1] }}
        >
          {/* 背面 */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div
              className="aspect-[2/3] relative flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, #1a1030 0%, #2a1a45 45%, #120a1f 100%)',
                border: '1px solid rgba(201,169,106,0.45)',
                boxShadow:
                  'inset 0 0 30px rgba(107,74,138,0.4), 0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {/* 背面装饰 */}
              <div className="absolute inset-3 rounded-lg border border-gold/30" />
              <div className="absolute inset-5 rounded-md border border-gold/15" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <div className="text-7xl font-brush text-gold/35 select-none">玄</div>
              </motion.div>
              <div className="absolute top-2 left-2 text-gold/40">
                <Stars className="w-4 h-4" />
              </div>
              <div className="absolute top-2 right-2 text-gold/40">
                <Moon className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2 left-2 text-gold/40">
                <Moon className="w-4 h-4" />
              </div>
              <div className="absolute bottom-2 right-2 text-gold/40">
                <Stars className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 正面 */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div
              className="aspect-[2/3] relative flex flex-col p-3 sm:p-4"
              style={{
                background: isReversed
                  ? 'linear-gradient(135deg, #2a1418 0%, #3a1a1a 45%, #1a0a0e 100%)'
                  : 'linear-gradient(135deg, #2a1a45 0%, #1a1030 45%, #120a1f 100%)',
                border: isReversed
                  ? '1px solid rgba(155,58,58,0.55)'
                  : '1px solid rgba(201,169,106,0.55)',
                boxShadow: isReversed
                  ? 'inset 0 0 24px rgba(155,58,58,0.25), 0 8px 24px rgba(0,0,0,0.5)'
                  : 'inset 0 0 24px rgba(201,169,106,0.18), 0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {/* 装饰角标 */}
              <div className="absolute top-1.5 left-1.5 text-gold/40">
                <Stars className="w-3 h-3" />
              </div>
              <div className="absolute top-1.5 right-1.5 text-gold/40">
                <Moon className="w-3 h-3" />
              </div>
              <div className="absolute bottom-1.5 left-1.5 text-gold/40">
                <Moon className="w-3 h-3" />
              </div>
              <div className="absolute bottom-1.5 right-1.5 text-gold/40">
                <Stars className="w-3 h-3" />
              </div>

              {/* 顶部：编号 + 元素 + 正逆 */}
              <div className="flex items-center justify-between px-1 mt-1 mb-1">
                <span className="text-[10px] tracking-widest text-gold/70 font-serif">
                  {String(card.id).padStart(2, '0')}
                </span>
                <ElementIcon el={card.element} className="w-3.5 h-3.5" />
                <Badge
                  variant="outline"
                  className={
                    isReversed
                      ? 'text-[10px] px-1.5 py-0 h-5 border-cinnabar/60 text-cinnabar bg-cinnabar/10'
                      : 'text-[10px] px-1.5 py-0 h-5 border-gold/50 text-gold-soft bg-gold/10'
                  }
                >
                  {isReversed ? '逆位' : '正位'}
                </Badge>
              </div>

              {/* 牌名 */}
              <div className="flex flex-col items-center justify-center mt-1 mb-2">
                <motion.div
                  className="font-brush text-2xl sm:text-3xl text-center xj-gold-text"
                  style={{ textShadow: '0 0 12px rgba(201,169,106,0.4)' }}
                  animate={isReversed ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {card.name}
                </motion.div>
                <div className="text-[10px] tracking-[0.18em] text-cream/50 uppercase mt-1">
                  {card.en}
                </div>
              </div>

              {/* 关键词 */}
              <div className="text-center text-[11px] text-cream/70 mb-2 px-1">
                <span className="font-serif">{card.keyword}</span>
              </div>

              {/* 含义 */}
              <div
                className="mt-auto px-1.5 py-1.5 rounded-md text-[10.5px] leading-relaxed"
                style={{
                  background: isReversed
                    ? 'rgba(155,58,58,0.12)'
                    : 'rgba(201,169,106,0.1)',
                  border: `1px solid ${isReversed ? 'rgba(155,58,58,0.25)' : 'rgba(201,169,106,0.2)'}`,
                  color: isReversed ? '#e0a8a8' : '#d9c08a',
                }}
              >
                {meaning}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TarotPage() {
  const { toast } = useToast()
  const [selectedSpread, setSelectedSpread] = useState<string>('three')
  const [drawn, setDrawn] = useState<DrawnCard[] | null>(null)
  const [shuffling, setShuffling] = useState(false)
  const [saved, setSaved] = useState(false)
  const [question, setQuestion] = useState('')

  const spread = useMemo(
    () => SPREADS.find((s) => s.id === selectedSpread) || SPREADS[1],
    [selectedSpread],
  )

  const conclusion = useMemo(
    () => (drawn ? spreadConclusion(drawn, spread.name) : ''),
    [drawn, spread.name],
  )

  const handleShuffle = async () => {
    setShuffling(true)
    setDrawn(null)
    setSaved(false)
    // 模拟洗牌延时
    await new Promise((r) => setTimeout(r, 1100))
    const result = drawSpread(selectedSpread)
    setDrawn(result)
    setShuffling(false)

    toast({
      title: '牌阵已展开',
      description: `${spread.name} · ${result.length} 张牌已落定`,
    })

    // 保存到历史
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot',
          title: `${spread.name} · ${result.map((d) => d.card.name).join('·')}`,
          input: { spread: selectedSpread, spreadName: spread.name, question },
          result: {
            cards: result.map((d) => ({
              position: d.position,
              card: d.card.name,
              en: d.card.en,
              reversed: d.reversed,
              keyword: d.card.keyword,
              meaning: cardMeaning(d),
              element: d.card.element,
            })),
            conclusion: spreadConclusion(result, spread.name),
          },
        }),
      })
      setSaved(true)
    } catch {
      /* 静默 */
    }
  }

  return (
    <PageShell title="塔罗占卜" subtitle="Tarot Divination" trigram="坤" accent="#c98a8a">
      {/* 装饰：月亮/星辰 */}
      <DecorLayer />

      {/* 1. 牌阵选择 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">选择牌阵</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SPREADS.map((s, i) => {
            const active = s.id === selectedSpread
            return (
              <motion.button
                key={s.id}
                onClick={() => {
                  setSelectedSpread(s.id)
                  setDrawn(null)
                  setSaved(false)
                }}
                className="text-left p-3 rounded-xl transition-all relative overflow-hidden group"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(201,169,106,0.18), rgba(107,74,138,0.15))'
                    : 'linear-gradient(135deg, rgba(26,16,48,0.55), rgba(12,9,16,0.65))',
                  border: active
                    ? '1px solid rgba(201,169,106,0.55)'
                    : '1px solid rgba(201,169,106,0.18)',
                  boxShadow: active ? '0 0 24px rgba(201,169,106,0.18)' : 'none',
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -2 }}
                aria-pressed={active}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-serif text-sm xj-gold-text">{s.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 h-4 border-gold/40 text-gold-soft"
                  >
                    {s.positions.length}张
                  </Badge>
                </div>
                <p className="text-[11px] text-cream/55 leading-snug">{s.desc}</p>
                {active && (
                  <motion.div
                    layoutId="spread-active-dot"
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold"
                    style={{ boxShadow: '0 0 8px #c9a96a' }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* 1.5 所问之事 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">所问之事</h2>
        </div>
        <div className="xj-panel p-4 sm:p-5 relative overflow-hidden">
          {/* 月光装饰 */}
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none xj-anim-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(201,138,138,0.18), transparent 70%)' }}
          />
          <Label
            htmlFor="tarot-question"
            className="text-xs text-cream/55 mb-2 block tracking-wider relative"
          >
            道来所问 · 字字皆引天机
          </Label>
          <Textarea
            id="tarot-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="道来所问之事… 如：近期事业可有转机？"
            rows={2}
            maxLength={120}
            className="bg-ink-deep/60 border-gold/20 text-cream placeholder:text-cream/30 resize-none font-serif focus-visible:border-gold/50 relative"
          />
          <div className="flex justify-end mt-1.5 relative">
            <span className="text-[10px] text-cream/35 tracking-wider">
              {question.length}/120
            </span>
          </div>
        </div>
      </section>

      {/* 2. 抽牌按钮 */}
      <section className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={handleShuffle}
          disabled={shuffling}
          size="lg"
          className="w-full sm:w-auto h-11 px-8 rounded-full font-serif tracking-wider text-base"
          style={{
            background: shuffling
              ? 'linear-gradient(135deg, #6b4a8a, #1a1030)'
              : 'linear-gradient(135deg, #c9a96a, #8a7544)',
            color: '#07060a',
            border: '1px solid rgba(201,169,106,0.6)',
            boxShadow: '0 0 24px rgba(201,169,106,0.35)',
          }}
        >
          <motion.span
            animate={shuffling ? { rotate: 360 } : { rotate: 0 }}
            transition={shuffling ? { duration: 0.6, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
            className="inline-flex"
          >
            <Shuffle className="w-4 h-4" />
          </motion.span>
          {shuffling ? '洗牌中…' : drawn ? '重新洗牌抽牌' : '洗牌抽牌'}
        </Button>
      </section>

      {/* 3. 牌阵展示 */}
      <AnimatePresence mode="wait">
        {drawn && (
          <motion.section
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            {/* 牌阵标题 */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="font-serif text-sm tracking-widest text-gold/80">
                {spread.name}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            {/* 牌位网格 */}
            <div
              className={
                drawn.length === 1
                  ? 'grid grid-cols-1 max-w-xs mx-auto gap-4'
                  : drawn.length === 3
                    ? 'grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5'
                    : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5'
              }
            >
              {drawn.map((d, i) => (
                <TarotCardView
                  key={`${d.card.id}-${i}`}
                  drawn={d}
                  index={i}
                  flipDelay={300 + i * 380}
                />
              ))}
            </div>

            {/* 综合断语 */}
            <motion.div
              className="mt-7 xj-panel p-5 sm:p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + drawn.length * 0.15 }}
            >
              {/* 月光装饰 */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full xj-anim-pulse-glow"
                style={{ background: 'radial-gradient(circle, rgba(201,169,106,0.25), transparent 70%)' }}
              />
              <div className="flex items-center gap-2 mb-3 relative">
                <Moon className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-base xj-gold-text">综合断语</h3>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[10px] text-cream/50">已归档</span>
                  <Save className="w-3 h-3 text-jade" />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-cream/85 relative font-serif">
                {conclusion}
              </p>
            </motion.div>

            {/* 天机AI · 深度解读 */}
            <AiInterpretation
              type="tarot"
              title={`${spread.name} · ${drawn.map((d) => d.card.name).join('·')}`}
              question={question}
              calcResult={
                drawn
                  ? {
                      spread: spread.name,
                      spreadId: selectedSpread,
                      question,
                      cards: drawn.map((d) => ({
                        position: d.position,
                        name: d.card.name,
                        en: d.card.en,
                        keyword: d.card.keyword,
                        reversed: d.reversed,
                        upright: d.card.upright,
                        reversed_meaning: d.card.reversed,
                        element: d.card.element,
                        meaning: cardMeaning(d),
                      })),
                      conclusion,
                    }
                  : null
              }
              trigger={
                drawn
                  ? `${selectedSpread}-${drawn.map((d) => d.card.id).join(',')}-${question}`
                  : null
              }
              accent="#c98a8a"
            />

            {/* 重新抽牌 */}
            <div className="mt-5 flex justify-center">
              <Button
                onClick={handleShuffle}
                variant="outline"
                className="rounded-full border-gold/40 text-gold-soft hover:bg-gold/10 hover:text-gold-soft"
              >
                <RotateCcw className="w-4 h-4" />
                再抽一卦
              </Button>
            </div>
          </motion.section>
        )}

        {/* 空态 */}
        {!drawn && !shuffling && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex flex-col items-center"
            >
              <div className="relative">
                <Moon className="w-16 h-16 text-gold/60" />
                <Stars className="w-5 h-5 text-gold/40 absolute -top-2 -right-2" />
              </div>
              <p className="mt-4 text-sm text-cream/55 font-serif">
                凝神静气 · 默念所问 · 洗牌抽牌
              </p>
              <p className="mt-1 text-[11px] text-cream/35 tracking-widest">
                Clear Your Mind, Shuffle & Reveal
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* 洗牌中 */}
        {shuffling && (
          <motion.div
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="relative inline-block">
              <motion.div
                className="flex gap-2 justify-center"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-20 rounded-md"
                    style={{
                      background:
                        'linear-gradient(135deg, #1a1030, #2a1a45, #120a1f)',
                      border: '1px solid rgba(201,169,106,0.4)',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="flex items-center justify-center h-full text-gold/30 font-brush text-2xl">
                      玄
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <p className="mt-6 text-sm text-gold/70 font-serif tracking-widest">
              洗牌中 · 调和能量 ·
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 元素图例 */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-cream/40">
        {Object.entries(ELEMENT_META).map(([k, m]) => {
          const Icon = m.icon
          return (
            <span key={k} className="inline-flex items-center gap-1">
              <Icon className="w-3 h-3" style={{ color: m.color }} />
              <span>{k}</span>
            </span>
          )
        })}
        <span className="inline-flex items-center gap-1">
          <Sun className="w-3 h-3 text-gold" />
          <span>正位</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Cloud className="w-3 h-3 text-cinnabar" />
          <span>逆位</span>
        </span>
      </div>
    </PageShell>
  )
}

/** 月亮 / 星辰 装饰层 */
function DecorLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,106,0.12), transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -left-16 w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(107,74,138,0.18), transparent 70%)',
          filter: 'blur(24px)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      {/* 小星辰 */}
      <svg className="absolute top-12 left-10 w-4 h-4 text-gold/40 xj-anim-twinkle" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.5 7.5L21 12l-7.5 1.5L12 21l-1.5-7.5L3 12l7.5-1.5z" />
      </svg>
      <svg className="absolute bottom-20 right-12 w-3 h-3 text-gold/30 xj-anim-twinkle" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '1s' }}>
        <path d="M12 2l1.5 7.5L21 12l-7.5 1.5L12 21l-1.5-7.5L3 12l7.5-1.5z" />
      </svg>
    </div>
  )
}
