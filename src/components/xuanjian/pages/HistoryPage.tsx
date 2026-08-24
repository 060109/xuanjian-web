'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  MessageSquare,
  Clock,
  Trash2,
  Eye,
  Loader2,
  ScrollText,
  Filter,
  User,
  Sparkles,
  Hash,
  Layers,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import PageShell from '../PageShell'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ============ 类型 ============ */
type CalcType = 'bazi' | 'liuyao' | 'qimen' | 'tarot' | 'name'

interface CalcRecord {
  id: string
  type: string
  title: string
  input: string
  result: string
  note: string | null
  createdAt: string
}

interface ChatRecord {
  id: string
  role: string
  content: string
  context: string | null
  createdAt: string
}

/* ============ 类型元信息 ============ */
interface TypeMeta {
  label: string
  icon: string
  color: string
  bg: string
  border: string
}

const TYPE_META: Record<string, TypeMeta> = {
  bazi: { label: '八字', icon: '乾', color: '#c9a96a', bg: 'rgba(201,169,106,0.12)', border: 'rgba(201,169,106,0.4)' },
  liuyao: { label: '六爻', icon: '坎', color: '#5a9b9b', bg: 'rgba(90,155,155,0.12)', border: 'rgba(90,155,155,0.4)' },
  qimen: { label: '奇门', icon: '星', color: '#9b7ec9', bg: 'rgba(155,126,201,0.12)', border: 'rgba(155,126,201,0.4)' },
  tarot: { label: '塔罗', icon: '月', color: '#c98a8a', bg: 'rgba(201,138,138,0.12)', border: 'rgba(201,138,138,0.4)' },
  name: { label: '姓名', icon: '离', color: '#d9c08a', bg: 'rgba(217,192,138,0.12)', border: 'rgba(217,192,138,0.4)' },
}

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'bazi', label: '八字' },
  { value: 'liuyao', label: '六爻' },
  { value: 'qimen', label: '奇门' },
  { value: 'tarot', label: '塔罗' },
  { value: 'name', label: '姓名' },
]

/* ============ 工具 ============ */
function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: zhCN })
  } catch {
    return iso
  }
}

function fullTime(iso: string): string {
  try {
    return format(new Date(iso), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return iso
  }
}

function safeParse(s: string): Record<string, unknown> | string {
  if (!s) return {}
  try {
    const obj = JSON.parse(s)
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return obj as Record<string, unknown>
    }
    return obj
  } catch {
    return s
  }
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

/* ============ 主组件 ============ */
export default function HistoryPage() {
  const { toast } = useToast()

  const [calcs, setCalcs] = useState<CalcRecord[]>([])
  const [chats, setChats] = useState<ChatRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<string>('all')

  const [viewingCalc, setViewingCalc] = useState<CalcRecord | null>(null)
  const [viewingChat, setViewingChat] = useState<ChatRecord | null>(null)
  const [expandedChatIds, setExpandedChatIds] = useState<Set<string>>(new Set())

  const [clearScope, setClearScope] = useState<'calc' | 'chat' | 'all' | null>(null)
  const [clearing, setClearing] = useState(false)

  /* ----- 拉取 ----- */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/history', { cache: 'no-store' })
      if (!res.ok) throw new Error('档案载入失败')
      const data = await res.json()
      setCalcs(data.calcs || [])
      setChats(data.chats || [])
    } catch (e) {
      toast({
        title: '载入失败',
        description: e instanceof Error ? e.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  /* ----- 统计 ----- */
  const stats = useMemo(() => {
    const total = calcs.length + chats.length
    const typeDist: Record<string, number> = { bazi: 0, liuyao: 0, qimen: 0, tarot: 0, name: 0 }
    calcs.forEach((c) => {
      if (typeDist[c.type] !== undefined) typeDist[c.type] += 1
    })
    return {
      total,
      calcCount: calcs.length,
      chatCount: chats.length,
      typeDist,
    }
  }, [calcs, chats])

  const filteredCalcs = useMemo(() => {
    if (filter === 'all') return calcs
    return calcs.filter((c) => c.type === filter)
  }, [calcs, filter])

  /* ----- 切换聊天展开 ----- */
  const toggleChat = useCallback((id: string) => {
    setViewingChat(null)
    setExpandedChatIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  /* ----- 清空 ----- */
  const confirmClear = useCallback(async () => {
    if (!clearScope) return
    setClearing(true)
    try {
      const res = await fetch(`/api/history?scope=${clearScope}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('清空失败')
      const msg =
        clearScope === 'all'
          ? '所有历史档案已封存归零'
          : clearScope === 'calc'
            ? '推演记录已清空'
            : '对话记录已清空'
      toast({ title: '已清空', description: msg })
      setClearScope(null)
      await fetchAll()
    } catch (e) {
      toast({
        title: '清空失败',
        description: e instanceof Error ? e.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setClearing(false)
    }
  }, [clearScope, toast, fetchAll])

  /* ============ 渲染 ============ */
  return (
    <PageShell title="历史档案" subtitle="Archive of Divinations" trigram="坤" accent="#9a8d72">
      {/* 统计栏 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<Layers className="w-4 h-4" />}
          label="总记录"
          value={stats.total}
          unit="条"
          accent="#9a8d72"
        />
        <StatCard
          icon={<Calculator className="w-4 h-4" />}
          label="推演记录"
          value={stats.calcCount}
          unit="次"
          accent="#c9a96a"
        />
        <StatCard
          icon={<MessageSquare className="w-4 h-4" />}
          label="对话记录"
          value={stats.chatCount}
          unit="则"
          accent="#5a9b9b"
        />
        <StatCard
          icon={<Hash className="w-4 h-4" />}
          label="涉及术类"
          value={Object.values(stats.typeDist).filter((n) => n > 0).length}
          unit="类"
          accent="#9b7ec9"
        />
      </div>

      {/* 类型分布迷你条 */}
      {stats.calcCount > 0 && (
        <div className="xj-panel p-4 mb-6">
          <div className="text-xs text-cream/55 mb-2 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-gold" />
            推演记录类型分布
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-input/30">
            {Object.entries(stats.typeDist).map(([k, n]) => {
              if (n === 0) return null
              const meta = TYPE_META[k]
              const pct = (n / stats.calcCount) * 100
              return (
                <motion.div
                  key={k}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ background: meta.color }}
                  title={`${meta.label} ${n} 次 (${pct.toFixed(0)}%)`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px]">
            {Object.entries(stats.typeDist).map(([k, n]) => {
              if (n === 0) return null
              const meta = TYPE_META[k]
              return (
                <span key={k} className="flex items-center gap-1 text-cream/65">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: meta.color }}
                  />
                  {meta.label}
                  <span className="text-cream/40">{n}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* 主体 Tabs */}
      <Tabs defaultValue="calc" className="w-full">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <TabsList className="bg-input/30 border border-gold/20">
            <TabsTrigger
              value="calc"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-cream/65"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="ml-1.5">推演记录</span>
              <span className="ml-1.5 text-[10px] opacity-70">({stats.calcCount})</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-cream/65"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="ml-1.5">对话记录</span>
              <span className="ml-1.5 text-[10px] opacity-70">({stats.chatCount})</span>
            </TabsTrigger>
          </TabsList>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearScope('all')}
              disabled={stats.total === 0}
              className="border-cinnabar/40 text-cinnabar/80 hover:bg-cinnabar/15 hover:text-cinnabar h-8"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              全部清空
            </Button>
          </div>
        </div>

        {/* ===== 推演记录 ===== */}
        <TabsContent value="calc">
          {loading ? (
            <LoadingState text="翻阅推演档案…" />
          ) : calcs.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="w-7 h-7 text-gold" />}
              title="推演档案尚虚"
              desc="尚无推演记录，归返主阵开启第一次推演吧。"
            />
          ) : (
            <>
              {/* 类型过滤 */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-cream/55 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" />
                  按术类筛选：
                </span>
                {FILTERS.map((f) => {
                  const active = filter === f.value
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                        active
                          ? 'bg-gold/20 border-gold/55 text-gold'
                          : 'border-gold/20 text-cream/65 hover:border-gold/40 hover:text-cream'
                      }`}
                    >
                      {f.label}
                      {f.value !== 'all' && stats.typeDist[f.value] !== undefined && (
                        <span className="ml-1 opacity-60">{stats.typeDist[f.value]}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {filteredCalcs.length === 0 ? (
                <div className="xj-panel p-8 text-center text-sm text-cream/55">
                  该术类下暂无记录
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredCalcs.map((rec) => (
                      <CalcCard
                        key={rec.id}
                        rec={rec}
                        onView={() => setViewingCalc(rec)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== 对话记录 ===== */}
        <TabsContent value="chat">
          {loading ? (
            <LoadingState text="翻阅对话档案…" />
          ) : chats.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-7 h-7 text-jade" />}
              title="对话档案尚虚"
              desc="尚未与天机 AI 对谈，开启一次问询吧。"
            />
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {chats.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    msg={msg}
                    expanded={expandedChatIds.has(msg.id)}
                    onToggle={() => toggleChat(msg.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 推演记录详情 Dialog */}
      <Dialog open={!!viewingCalc} onOpenChange={(o) => !o && setViewingCalc(null)}>
        <DialogContent className="sm:max-w-2xl bg-popover border-gold/30 max-h-[85vh] overflow-hidden flex flex-col">
          {viewingCalc && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 pr-6">
                  <TypeBadge type={viewingCalc.type} size="lg" />
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="font-serif text-lg xj-gold-text leading-snug">
                      {viewingCalc.title}
                    </DialogTitle>
                    <DialogDescription className="text-cream/50 text-xs mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {fullTime(viewingCalc.createdAt)} · {timeAgo(viewingCalc.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {viewingCalc.note && (
                <div className="xj-glass rounded-md p-3 text-sm text-cream/85 leading-relaxed">
                  <div className="text-[11px] text-gold/70 mb-1 tracking-widest">批注 · NOTE</div>
                  {viewingCalc.note}
                </div>
              )}

              <div className="xj-divider" />

              <ScrollArea className="flex-1 max-h-[55vh] -mx-1 px-1">
                <div className="pr-3 space-y-4">
                  {/* 输入 */}
                  <div>
                    <div className="text-[11px] text-gold/70 mb-2 tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      推演输入 · INPUT
                    </div>
                    <KeyValueView data={safeParse(viewingCalc.input)} />
                  </div>

                  <div className="xj-divider" />

                  {/* 输出 */}
                  <div>
                    <div className="text-[11px] text-gold/70 mb-2 tracking-widest flex items-center gap-1.5">
                      <Calculator className="w-3 h-3" />
                      推演结果 · RESULT
                    </div>
                    <KeyValueView data={safeParse(viewingCalc.result)} />
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 对话详情 Dialog */}
      <Dialog open={!!viewingChat} onOpenChange={(o) => !o && setViewingChat(null)}>
        <DialogContent className="sm:max-w-lg bg-popover border-gold/30 max-h-[85vh] overflow-hidden flex flex-col">
          {viewingChat && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-base xj-gold-text flex items-center gap-2">
                  {viewingChat.role === 'user' ? (
                    <User className="w-4 h-4 text-cream/70" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-gold" />
                  )}
                  {viewingChat.role === 'user' ? '问询者' : '天机 AI'}
                </DialogTitle>
                <DialogDescription className="text-cream/50 text-xs flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {fullTime(viewingChat.createdAt)} · {timeAgo(viewingChat.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {viewingChat.context && (
                <div className="text-[11px] text-cream/55 xj-glass rounded-md p-2">
                  <span className="text-gold/70 mr-1">关联上下文：</span>
                  {viewingChat.context}
                </div>
              )}

              <div className="xj-divider" />

              <ScrollArea className="flex-1 max-h-[55vh] -mx-1 px-1">
                <pre className="whitespace-pre-wrap font-sans text-sm text-cream/85 leading-relaxed pr-3">
                  {viewingChat.content}
                </pre>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 清空确认 Dialog */}
      <Dialog open={!!clearScope} onOpenChange={(o) => !o && setClearScope(null)}>
        <DialogContent className="sm:max-w-md bg-popover border-cinnabar/40">
          <DialogHeader>
            <DialogTitle className="font-serif text-base text-cinnabar flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {clearScope === 'all'
                ? '清空所有历史档案'
                : clearScope === 'calc'
                  ? '清空推演记录'
                  : '清空对话记录'}
            </DialogTitle>
            <DialogDescription className="text-cream/60 text-sm">
              此操作不可恢复，相关记录将被永久封存归零。
              {clearScope === 'all' && ' 包含推演记录与对话记录。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gold/30 text-cream/80">
                保留
              </Button>
            </DialogClose>
            <Button
              onClick={confirmClear}
              disabled={clearing}
              className="bg-cinnabar hover:bg-cinnabar/85 text-cream"
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span className="ml-1.5">确认清空</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

/* ============ 子组件 ============ */
function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  unit?: string
  accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="xj-glass rounded-lg p-3 sm:p-4 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20 blur-xl"
        style={{ background: accent }}
      />
      <div className="flex items-center gap-1.5 text-[11px] text-cream/60 mb-1.5 relative z-10">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="font-serif text-lg sm:text-2xl font-semibold xj-gold-text relative z-10">
        {value}
        {unit && <span className="text-xs text-cream/40 ml-1 font-sans font-normal">{unit}</span>}
      </div>
    </motion.div>
  )
}

function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'lg' }) {
  const meta = TYPE_META[type] || {
    label: type,
    icon: '?',
    color: '#9a8d72',
    bg: 'rgba(154,141,114,0.12)',
    border: 'rgba(154,141,114,0.4)',
  }
  const dim = size === 'lg' ? 'w-10 h-10 text-lg' : 'w-7 h-7 text-sm'
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-full font-serif ${dim}`}
      style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        textShadow: `0 0 8px ${meta.color}55`,
      }}
      title={meta.label}
    >
      {meta.icon}
    </div>
  )
}

function CalcCard({ rec, onView }: { rec: CalcRecord; onView: () => void }) {
  const meta = TYPE_META[rec.type] || TYPE_META.name
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="xj-panel p-4 flex items-start gap-3 group hover:xj-gold-border transition-all"
    >
      <TypeBadge type={rec.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className="text-[10px] flex-shrink-0"
            style={{
              background: meta.bg,
              color: meta.color,
              borderColor: meta.border,
            }}
          >
            {meta.label}
          </Badge>
          <h3
            className="font-serif text-sm text-cream/95 truncate"
            title={rec.title}
          >
            {rec.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-cream/45">
          <Clock className="w-3 h-3" />
          {timeAgo(rec.createdAt)}
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onView}
        className="flex-shrink-0 h-7 text-xs border-gold/30 text-cream/80 hover:bg-gold/10 hover:text-cream"
      >
        <Eye className="w-3 h-3" />
        <span className="ml-1 hidden sm:inline">详情</span>
      </Button>
    </motion.div>
  )
}

function ChatBubble({
  msg,
  expanded,
  onToggle,
}: {
  msg: ChatRecord
  expanded: boolean
  onToggle: () => void
}) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`flex gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-serif"
        style={{
          background: isUser ? 'rgba(232,220,196,0.08)' : 'rgba(201,169,106,0.12)',
          border: `1px solid ${isUser ? 'rgba(232,220,196,0.25)' : 'rgba(201,169,106,0.4)'}`,
          color: isUser ? '#e8dcc4' : '#c9a96a',
        }}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div
        className={`flex-1 min-w-0 ${isUser ? 'items-start' : 'items-end'} flex flex-col`}
      >
        <div
          onClick={onToggle}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm leading-relaxed transition-all hover:brightness-110 ${
            isUser
              ? 'bg-cream/8 border border-cream/15 text-cream/85'
              : 'bg-gold/10 border border-gold/30 text-cream/90'
          }`}
        >
          <div className={expanded ? '' : 'line-clamp-3'}>
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          </div>
          {!expanded && msg.content.length > 120 && (
            <div className={`text-[11px] mt-1 ${isUser ? 'text-cream/45' : 'text-gold/60'}`}>
              点击展开 ↓
            </div>
          )}
        </div>
        <div className={`text-[10px] text-cream/40 mt-1 flex items-center gap-1.5 ${isUser ? '' : 'flex-row-reverse'}`}>
          <Clock className="w-2.5 h-2.5" />
          {timeAgo(msg.createdAt)}
          {msg.context && <span className="ml-1 opacity-70">· {msg.context}</span>}
        </div>
      </div>
    </motion.div>
  )
}

function KeyValueView({ data }: { data: Record<string, unknown> | string }) {
  if (typeof data === 'string') {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm text-cream/80 leading-relaxed xj-glass rounded-md p-3">
        {data || '（空）'}
      </pre>
    )
  }

  const entries = Object.entries(data)
  if (entries.length === 0) {
    return <div className="text-sm text-cream/40 xj-glass rounded-md p-3">（无数据）</div>
  }

  return (
    <div className="space-y-1.5">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 xj-glass rounded-md p-2.5"
        >
          <div className="text-xs text-gold/80 font-medium sm:w-28 flex-shrink-0 leading-relaxed">
            {k}
          </div>
          <div className="text-sm text-cream/85 flex-1 break-words leading-relaxed">
            {fmtValue(v)}
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-cream/55">
      <Loader2 className="w-6 h-6 animate-spin text-gold mb-2" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="xj-panel p-10 sm:p-16 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,106,0.15), transparent 70%)',
          border: '1px solid rgba(201,169,106,0.35)',
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      </motion.div>
      <h3 className="font-serif text-lg xj-gold-text mb-1">{title}</h3>
      <p className="text-sm text-cream/55">{desc}</p>
    </motion.div>
  )
}
