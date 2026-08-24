'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, BookOpen, Calculator, Trash2, Loader2, ScrollText, Lightbulb, Link2, X } from 'lucide-react'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  knowledge?: { docTitle: string; category: string }[]
  ts: number
}

const SUGGESTED = [
  { icon: '乾', text: '帮我分析这个八字：男命 1990年6月15日 10时', accent: '#c9a96a', ctx: '八字：1990年6月15日10时 男命，请排四柱并分析事业财运' },
  { icon: '坎', text: '今日事业趋势如何？', accent: '#5a9b9b', ctx: '' },
  { icon: '月', text: '抽了三张塔罗，帮我解读', accent: '#c98a8a', ctx: '' },
  { icon: '离', text: '这个名字数理如何？李明轩', accent: '#d9c08a', ctx: '姓名：李明轩，请分析五格数理与三才' },
  { icon: '星', text: '这个项目适合投资吗？', accent: '#9b7ec9', ctx: '' },
  { icon: '艮', text: '《滴天髓》如何论日主强弱？', accent: '#8aa86b', ctx: '' },
]

export default function AIPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: '善信安好。吾乃天机AI，研习东方术数有年，精通八字、六爻、梅花、奇门、姓名、塔罗诸法，并已通读阁下典籍库所藏之书。\n\n可询命理运势、卦象吉凶、姓名数理、典籍释义。请道来所问之事，吾当循理推演，以趋势参考相告，不作宿命定论。',
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function send(text?: string, ctx?: string) {
    const content = (text ?? input).trim()
    const useCtx = ctx ?? context
    if (!content || loading) return
    const userMsg: Msg = { role: 'user', content, ts: Date.now() }
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((p) => [...p, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, context: useCtx }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '推演失败')
      const aiMsg: Msg = {
        role: 'assistant',
        content: data.reply,
        knowledge: data.knowledge,
        ts: Date.now(),
      }
      setMessages((p) => [...p, aiMsg])
      setContext('')
    } catch (e: any) {
      toast({ title: '推演失败', description: e.message, variant: 'destructive' })
      setMessages((p) => [...p, { role: 'assistant', content: `（推演受阻：${e.message}。请稍候再试，或先至典籍库上传资料以丰富知识库。）`, ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: '对话已清空。请重新道来所问之事。',
      ts: Date.now(),
    }])
    setContext('')
    toast({ title: '已重置对话' })
  }

  return (
    <PageShell title="天机AI" subtitle="Tian Ji AI" trigram="震" accent="#c9a96a">
      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* 左栏：建议 + 上下文 */}
        <div className="space-y-4 order-2 lg:order-1">
          {/* 上下文 */}
          <div className="xj-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-[#c9a96a]" />
              <span className="font-serif text-sm xj-gold-text">推演上下文</span>
            </div>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="可粘贴命盘/卦象/姓名等数据，AI将据此推演…"
              className="bg-black/30 border-[rgba(201,169,106,0.2)] text-cream placeholder:text-cream/30 min-h-[90px] text-sm resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-[rgba(201,169,106,0.3)] text-cream/80 hover:bg-[rgba(201,169,106,0.1)] hover:text-cream"
                onClick={() => router.push('/bazi')}
              >
                <Calculator className="w-3.5 h-3.5 mr-1" /> 排八字
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-[rgba(201,169,106,0.3)] text-cream/80 hover:bg-[rgba(201,169,106,0.1)] hover:text-cream"
                onClick={() => router.push('/library')}
              >
                <BookOpen className="w-3.5 h-3.5 mr-1" /> 查典籍
              </Button>
            </div>
          </div>

          {/* 建议问法 */}
          <div className="xj-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#c9a96a]" />
              <span className="font-serif text-sm xj-gold-text">问法示例</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.text, s.ctx)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-lg xj-glass hover:xj-gold-border transition-all group disabled:opacity-50"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif"
                      style={{
                        background: `radial-gradient(circle, ${s.accent}22, transparent)`,
                        border: `1px solid ${s.accent}55`,
                        color: s.accent,
                      }}
                    >
                      {s.icon}
                    </span>
                    <span className="text-xs text-cream/75 group-hover:text-cream leading-snug">{s.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 清空 */}
          <Button
            variant="outline"
            className="w-full border-[rgba(155,58,58,0.4)] text-[#c98a8a] hover:bg-[rgba(155,58,58,0.15)]"
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-2" /> 重置对话
          </Button>
        </div>

        {/* 右栏：对话 */}
        <div className="xj-panel flex flex-col order-1 lg:order-2" style={{ minHeight: '70vh' }}>
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(201,169,106,0.15)]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-[#c9a96a]" />
                <div className="absolute inset-0 blur-md bg-[#c9a96a]/40 rounded-full" />
              </div>
              <div>
                <div className="font-serif text-sm xj-gold-text">天机推演</div>
                <div className="text-[10px] text-cream/40">{loading ? '推演中…' : '已通读典籍库'}</div>
              </div>
            </div>
            <Badge variant="outline" className="border-[rgba(201,169,106,0.3)] text-[#c9a96a] text-[10px]">
              知识库 · {messages.length} 则
            </Badge>
          </div>

          {/* 消息区 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4" style={{ maxHeight: 'calc(70vh - 130px)' }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* 头像 */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm"
                    style={{
                      background: m.role === 'user'
                        ? 'radial-gradient(circle, rgba(232,220,196,0.18), transparent)'
                        : 'radial-gradient(circle, rgba(201,169,106,0.25), transparent)',
                      border: m.role === 'user'
                        ? '1px solid rgba(232,220,196,0.3)'
                        : '1px solid rgba(201,169,106,0.5)',
                      color: m.role === 'user' ? '#e8dcc4' : '#c9a96a',
                    }}
                  >
                    {m.role === 'user' ? '问' : '道'}
                  </div>
                  {/* 气泡 */}
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: m.role === 'user'
                          ? 'linear-gradient(135deg, rgba(232,220,196,0.12), rgba(232,220,196,0.06))'
                          : 'linear-gradient(135deg, rgba(40,28,18,0.6), rgba(26,16,48,0.6))',
                        border: m.role === 'user'
                          ? '1px solid rgba(232,220,196,0.2)'
                          : '1px solid rgba(201,169,106,0.25)',
                        color: m.role === 'user' ? '#e8dcc4' : '#e8dcc4',
                        borderTopLeftRadius: m.role === 'assistant' ? 4 : undefined,
                        borderTopRightRadius: m.role === 'user' ? 4 : undefined,
                      }}
                    >
                      {m.content}
                    </div>
                    {/* 引用典籍 */}
                    {m.knowledge && m.knowledge.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.knowledge.map((k, j) => (
                          <Badge
                            key={j}
                            variant="outline"
                            className="text-[10px] border-[rgba(201,169,106,0.3)] text-[#c9a96a]/80 bg-[rgba(201,169,106,0.05)]"
                          >
                            <ScrollText className="w-2.5 h-2.5 mr-1" />
                            {k.docTitle}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-cream/30">
                      {new Date(m.ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm bg-[rgba(201,169,106,0.15)] border border-[rgba(201,169,106,0.5)] text-[#c9a96a]">
                  道
                </div>
                <div className="rounded-2xl px-4 py-3 bg-[rgba(40,28,18,0.5)] border border-[rgba(201,169,106,0.2)] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#c9a96a]" />
                  <span className="text-xs text-cream/60">天机推演中，循理参详…</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-[#c9a96a]"
                        style={{ animation: `xj-twinkle 1s ease-in-out ${d * 0.2}s infinite` }}
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 输入区 */}
          <div className="border-t border-[rgba(201,169,106,0.15)] p-3 sm:p-4">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="道来所问之事…（Enter 发送，Shift+Enter 换行）"
                className="bg-black/30 border-[rgba(201,169,106,0.2)] text-cream placeholder:text-cream/30 min-h-[44px] max-h-32 resize-none text-sm"
                rows={1}
              />
              <Button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 h-11 px-5 bg-gradient-to-br from-[#c9a96a] to-[#8a7544] hover:from-[#d9c08a] hover:to-[#c9a96a] text-[#07060a] font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-[10px] text-cream/30 mt-1.5 text-center">
              天机AI 结合典籍库 · 传统算法 · AI推理 · 仅供参考不作定论
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
