'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, BookOpen, Brain, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Props {
  type: 'bazi' | 'liuyao' | 'qimen' | 'tarot' | 'name'
  title: string
  question?: string
  calcResult: Record<string, unknown> | null
  /** 触发 key：变化时自动重新解读（如重新排盘）。null 时不展示 */
  trigger?: string | null
  accent?: string
}

interface AnalyzeResp {
  analysis: string
  knowledge: { docTitle: string; category: string }[]
  memoryCount: number
  provider: string
}

export default function AiInterpretation({
  type, title, question, calcResult, trigger, accent = '#c9a96a',
}: Props) {
  const [data, setData] = useState<AnalyzeResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRan, setAutoRan] = useState(false)

  const run = useCallback(async () => {
    if (!calcResult) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, question, calcResult }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '解读失败')
      setData(json)
    } catch (e: any) {
      setError(e.message || '未知错误')
    } finally {
      setLoading(false)
    }
  }, [type, title, question, calcResult])

  // trigger 变化时自动触发解读
  if (trigger && calcResult && !autoRan && !loading && !data) {
    setAutoRan(true)
    run()
  }

  if (!trigger) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="xj-panel p-5 sm:p-6 mt-6 relative overflow-hidden"
    >
      {/* 装饰光晕 */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18, transparent 70%)` }}
      />

      {/* 头部 */}
      <div className="flex items-center justify-between gap-3 mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{
                background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
                border: `1px solid ${accent}66`,
              }}
            >
              <Sparkles className="w-4.5 h-4.5" style={{ color: accent }} />
            </div>
            {loading && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: `${accent}22` }}
              />
            )}
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-semibold xj-gold-text leading-tight">
              天机AI · 深度解读
            </h3>
            <div className="text-[10px] text-cream/40 tracking-wider">
              {loading ? '推演中 · 结合典籍与记忆…' : data ? `已结合 ${data.memoryCount} 条记忆 · ${data.knowledge.length} 部典籍` : '待推演'}
            </div>
          </div>
        </div>
        {data && !loading && (
          <Button
            size="sm"
            variant="outline"
            onClick={run}
            className="border-[rgba(201,169,106,0.3)] text-cream/70 hover:bg-[rgba(201,169,106,0.1)] hover:text-cream"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> 重新解读
          </Button>
        )}
      </div>

      <div className="xj-divider mb-4" />

      {/* 内容 */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-8 justify-center"
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
            <span className="text-sm text-cream/60">天机推演中，循理参详…</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent, animation: `xj-twinkle 1s ease-in-out ${d * 0.2}s infinite` }}
                />
              ))}
            </span>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 p-3 rounded-lg border border-[rgba(155,58,58,0.4)] bg-[rgba(155,58,58,0.1)]"
          >
            <AlertCircle className="w-4 h-4 text-[#c98a8a] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#c98a8a]">
              <div className="font-medium">解读受阻</div>
              <div className="text-xs opacity-80 mt-0.5">{error}</div>
              <Button size="sm" variant="outline" onClick={run} className="mt-2 border-[rgba(201,169,106,0.3)] text-cream/70 h-7">
                <RefreshCw className="w-3 h-3 mr-1" /> 重试
              </Button>
            </div>
          </motion.div>
        )}

        {data && !loading && !error && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* 解读正文（markdown 简易渲染） */}
            <div className="text-sm text-cream/85 leading-relaxed whitespace-pre-wrap">
              {data.analysis}
            </div>

            {/* 引用典籍 + 记忆标记 */}
            {(data.knowledge.length > 0 || data.memoryCount > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[rgba(201,169,106,0.12)]">
                {data.memoryCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-[rgba(91,107,107,0.4)] text-[#7aa8a8] bg-[rgba(91,107,107,0.08)]"
                  >
                    <Brain className="w-2.5 h-2.5 mr-1" />
                    记忆 {data.memoryCount} 条
                  </Badge>
                )}
                {data.knowledge.map((k, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[10px] border-[rgba(201,169,106,0.3)] text-[#c9a96a]/80 bg-[rgba(201,169,106,0.05)]"
                  >
                    <BookOpen className="w-2.5 h-2.5 mr-1" />
                    {k.docTitle}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
