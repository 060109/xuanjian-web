'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Upload,
  Search,
  Trash2,
  FileText,
  FileType,
  FileImage,
  File,
  Eye,
  ScrollText,
  Library as LibraryIcon,
  Sparkles,
  X,
  Loader2,
  Hash,
  Calendar,
  FileType2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import PageShell from '../PageShell'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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

/* ============ 类型定义 ============ */
interface XJDocument {
  id: string
  title: string
  fileName: string
  fileType: string
  category: string | null
  summary: string | null
  keywords: string | null
  size: number
  createdAt: string
}

interface SearchHit extends XJDocument {
  content?: string
  score?: number
}

/* ============ 预置分类 ============ */
const CATEGORIES = [
  '滴天髓',
  '三命通会',
  '穷通宝鉴',
  '周易',
  '梅花易数',
  '奇门遁甲',
  '姓名',
  '塔罗',
  '其他',
] as const

/* ============ 工具函数 ============ */
function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function fileIcon(type: string) {
  const t = (type || '').toLowerCase()
  if (['pdf'].includes(t)) return <FileType className="w-4 h-4 text-cinnabar" />
  if (['txt', 'md', 'json'].includes(t)) return <FileText className="w-4 h-4 text-gold" />
  if (['png', 'jpg', 'jpeg', 'webp', 'image'].includes(t)) return <FileImage className="w-4 h-4 text-jade" />
  if (['docx'].includes(t)) return <File className="w-4 h-4 text-gold-soft" />
  return <File className="w-4 h-4 text-cream/60" />
}

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: zhCN })
  } catch {
    return iso
  }
}

/* ============ 主组件 ============ */
export default function LibraryPage() {
  const { toast } = useToast()

  const [docs, setDocs] = useState<XJDocument[]>([])
  const [loading, setLoading] = useState(true)

  // 上传状态
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('其他')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 搜索状态
  const [query, setQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [searchHits, setSearchHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)

  // 详情对话框
  const [viewing, setViewing] = useState<SearchHit | null>(null)
  const [viewingContent, setViewingContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)

  // 删除确认
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 示例典籍
  const [showExample, setShowExample] = useState(false)

  /* ----- 拉取典籍列表 ----- */
  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents', { cache: 'no-store' })
      if (!res.ok) throw new Error('获取典籍失败')
      const data = await res.json()
      setDocs(data.docs || [])
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
    fetchDocs()
  }, [fetchDocs])

  /* ----- 统计 ----- */
  const stats = useMemo(() => {
    const total = docs.length
    const totalChars = docs.reduce((sum, d) => sum + (d.size || 0), 0)
    const cats = new Set(docs.map((d) => d.category).filter(Boolean))
    return { total, totalChars, catCount: cats.size }
  }, [docs])

  /* ----- 文件选择 ----- */
  const handleFile = useCallback(
    (f: File | null) => {
      if (!f) return
      const allowed = ['pdf', 'txt', 'md', 'docx', 'json', 'png', 'jpg', 'jpeg', 'webp']
      const ext = f.name.split('.').pop()?.toLowerCase() || ''
      if (!allowed.includes(ext)) {
        toast({
          title: '不支持的格式',
          description: `仅支持：${allowed.join(' / ')}`,
          variant: 'destructive',
        })
        return
      }
      setFile(f)
      if (!title) {
        const baseName = f.name.replace(/\.[^.]+$/, '')
        setTitle(baseName)
      }
    },
    [title, toast],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files?.[0]
      if (f) handleFile(f)
    },
    [handleFile],
  )

  /* ----- 上传 ----- */
  const upload = useCallback(async () => {
    if (!file) {
      toast({ title: '请先选择文件', variant: 'destructive' })
      return
    }
    setUploading(true)
    setUploadProgress(8)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title || file.name)
      fd.append('category', category)

      // 模拟进度推进
      const timer = setInterval(() => {
        setUploadProgress((p) => (p < 80 ? p + Math.random() * 12 : p))
      }, 500)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      clearInterval(timer)
      setUploadProgress(100)

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || '上传失败')
      }

      toast({
        title: '典籍已收入藏经阁',
        description: `《${data.title}》 · 切片 ${data.chunkCount} 段 · ${data.contentLength} 字`,
      })

      // 重置
      setFile(null)
      setTitle('')
      setCategory('其他')
      setUploadProgress(0)
      await fetchDocs()
    } catch (e) {
      toast({
        title: '上传失败',
        description: e instanceof Error ? e.message : '未知错误',
        variant: 'destructive',
      })
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }, [file, title, category, toast, fetchDocs])

  /* ----- 搜索 ----- */
  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) {
      setSearchActive(false)
      setSearchHits([])
      return
    }
    setSearching(true)
    setSearchActive(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('检索失败')
      const data = await res.json()
      setSearchHits(data.docs || [])
    } catch (e) {
      toast({
        title: '检索失败',
        description: e instanceof Error ? e.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }, [query, toast])

  const clearSearch = useCallback(() => {
    setQuery('')
    setSearchActive(false)
    setSearchHits([])
  }, [])

  /* ----- 查看详情：从搜索结果或列表 ----- */
  const viewDoc = useCallback(
    async (doc: SearchHit) => {
      setViewing(doc)
      setViewingContent('')
      setLoadingContent(true)
      try {
        // 搜索结果已带 content 片段，但仍尝试再拉一次以获取完整内容
        const res = await fetch(`/api/search?q=${encodeURIComponent(doc.title)}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const full = (data.docs || []).find((d: SearchHit) => d.id === doc.id)
          if (full && full.content) {
            setViewingContent(full.content)
            return
          }
        }
        setViewingContent(doc.content || '（暂无正文片段）')
      } catch {
        setViewingContent(doc.content || '（暂无正文片段）')
      } finally {
        setLoadingContent(false)
      }
    },
    [],
  )

  /* ----- 删除 ----- */
  const confirmDelete = useCallback(async () => {
    if (!deletingId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documents?id=${deletingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      toast({ title: '已移出藏经阁', description: '典籍已删除' })
      setDeletingId(null)
      await fetchDocs()
    } catch (e) {
      toast({
        title: '删除失败',
        description: e instanceof Error ? e.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }, [deletingId, toast, fetchDocs])

  /* ----- 当前展示的列表 ----- */
  const displayed: XJDocument[] = searchActive ? searchHits : docs

  /* ============ 渲染 ============ */
  return (
    <PageShell title="典籍库" subtitle="Classics Library" trigram="艮" accent="#8aa86b">
      {/* 顶部统计栏 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<LibraryIcon className="w-4 h-4" />}
          label="典籍总数"
          value={stats.total}
          unit="卷"
          accent="#8aa86b"
        />
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="总字节数"
          value={formatSize(stats.totalChars)}
          accent="#c9a96a"
        />
        <StatCard
          icon={<Hash className="w-4 h-4" />}
          label="分类数"
          value={stats.catCount}
          unit="类"
          accent="#9b7ec9"
        />
      </div>

      {/* 上传区 */}
      <section className="xj-panel p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-jade" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">收入藏经阁</h2>
          <span className="text-[11px] text-cream/40 tracking-widest ml-auto hidden sm:inline">
            UPLOAD · PARSE · INDEX
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative rounded-lg border-2 border-dashed transition-all p-6 sm:p-8 text-center cursor-pointer ${
            dragOver
              ? 'border-jade/70 bg-jade/10 xj-glow'
              : 'border-gold/30 hover:border-gold/55 hover:bg-gold/5'
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.docx,.json,.png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <motion.div
            animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <ScrollText className="w-8 h-8 text-gold/70 mb-1" />
            <div className="font-serif text-cream/85 text-sm sm:text-base">
              {file ? file.name : '拖拽典籍至此处，或点击选择文件'}
            </div>
            <div className="text-[11px] text-cream/45">
              支持 PDF / TXT / DOCX / MD / 图片 · 系统将自动文本解析、知识分类、建立索引
            </div>
          </motion.div>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                if (!title) setTitle('')
              }}
              className="absolute top-2 right-2 p-1 rounded hover:bg-cinnabar/30 text-cream/60 hover:text-cream transition-colors"
              aria-label="移除文件"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 元信息输入 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title" className="text-xs text-cream/60">
              典籍标题
            </Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：周易·乾卦"
              className="bg-input/40 border-gold/25 text-cream placeholder:text-cream/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-cream/60">所属分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-input/40 border-gold/25 text-cream w-full">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 上传按钮 + 进度 */}
        <div className="mt-4">
          {uploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-cream/70">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                  解析中 · AI 提取摘要与关键词…
                </span>
                <span className="font-mono text-gold">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5 bg-input/40" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={upload}
                disabled={!file || uploading}
                className="bg-gold/90 hover:bg-gold text-ink-deep font-medium"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                开始上传解析
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExample(true)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 hover:text-cream"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                载入示例典籍
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 搜索栏 */}
      <section className="xj-panel p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">典籍检索</h2>
          {searchActive && (
            <button
              onClick={clearSearch}
              className="ml-auto text-xs text-cream/50 hover:text-cream transition-colors"
            >
              清除检索 ✕
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch()
            }}
            placeholder="输入关键词、标题、卦象…"
            className="bg-input/40 border-gold/25 text-cream placeholder:text-cream/30"
          />
          <Button
            onClick={runSearch}
            disabled={searching}
            className="bg-gold/90 hover:bg-gold text-ink-deep"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-1.5 hidden sm:inline">检索</span>
          </Button>
        </div>
        {searchActive && (
          <div className="mt-2 text-xs text-cream/50">
            命中 <span className="text-gold font-medium">{searchHits.length}</span> 卷典籍
          </div>
        )}
      </section>

      {/* 典籍列表 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-gold" />
          <h2 className="font-serif text-base sm:text-lg xj-gold-text">
            {searchActive ? '检索结果' : '藏经阁目录'}
          </h2>
          <span className="text-xs text-cream/40 ml-auto">{displayed.length} 卷</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-cream/50">
            <Loader2 className="w-6 h-6 animate-spin text-gold mb-2" />
            <span className="text-sm">翻阅藏经阁…</span>
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState onExample={() => setShowExample(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayed.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onView={() => viewDoc(doc)}
                  onDelete={() => setDeletingId(doc.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 详情 Dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl bg-popover border-gold/30 max-h-[85vh] overflow-hidden flex flex-col">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 pr-6">
                  <div className="flex-shrink-0 mt-1">{fileIcon(viewing.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="font-serif text-lg xj-gold-text leading-snug">
                      {viewing.title}
                    </DialogTitle>
                    <DialogDescription className="text-cream/50 text-xs mt-1">
                      {viewing.fileName} · {formatSize(viewing.size)} · {timeAgo(viewing.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {viewing.category && (
                  <Badge
                    variant="outline"
                    className="bg-gold/10 text-gold border-gold/40"
                  >
                    {viewing.category}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-jade/10 text-jade border-jade/40 uppercase">
                  {viewing.fileType}
                </Badge>
              </div>

              {/* 摘要 */}
              {viewing.summary && (
                <div className="xj-glass rounded-md p-3 text-sm text-cream/85 leading-relaxed">
                  <div className="text-[11px] text-gold/70 mb-1 tracking-widest">摘要 · SUMMARY</div>
                  {viewing.summary}
                </div>
              )}

              {/* 关键词 */}
              {viewing.keywords && (
                <div className="flex flex-wrap gap-1.5">
                  {viewing.keywords
                    .split(',')
                    .map((k) => k.trim())
                    .filter(Boolean)
                    .map((k, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] rounded bg-jade/10 text-jade border border-jade/30"
                      >
                        # {k}
                      </span>
                    ))}
                </div>
              )}

              <div className="xj-divider" />

              {/* 正文 */}
              <ScrollArea className="flex-1 max-h-[55vh] -mx-1 px-1">
                <div className="pr-3">
                  <div className="text-[11px] text-gold/70 mb-2 tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    正文节选 · CONTENT
                  </div>
                  {loadingContent ? (
                    <div className="flex items-center gap-2 text-cream/50 text-sm py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      抽取正文…
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-cream/80 leading-relaxed">
                      {viewingContent || '（暂无正文）'}
                    </pre>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认 Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="sm:max-w-md bg-popover border-cinnabar/40">
          <DialogHeader>
            <DialogTitle className="font-serif text-base text-cinnabar flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              确认移出藏经阁
            </DialogTitle>
            <DialogDescription className="text-cream/60 text-sm">
              此操作不可恢复，典籍及其索引、摘要将一并移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gold/30 text-cream/80">
                留存
              </Button>
            </DialogClose>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-cinnabar hover:bg-cinnabar/85 text-cream"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span className="ml-1.5">移除</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 示例典籍 Dialog */}
      <Dialog open={showExample} onOpenChange={setShowExample}>
        <DialogContent className="sm:max-w-lg bg-popover border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-serif text-base xj-gold-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              示例典籍 · 周易·乾卦
            </DialogTitle>
            <DialogDescription className="text-cream/50 text-xs">
              以下为系统预置示例，仅作展示引导，未实际入库。
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[55vh] pr-2">
            <div className="text-sm text-cream/85 leading-relaxed space-y-3">
              <p className="font-serif text-gold">乾：元，亨，利，贞。</p>
              <p>
                初九：潜龙，勿用。
                <br />
                <span className="text-cream/60 text-xs">
                  龙潜于渊，阳德尚隐，时机未至，宜守静以待。
                </span>
              </p>
              <p>
                九二：见龙在田，利见大人。
                <br />
                <span className="text-cream/60 text-xs">
                  龙现于野，德施于物，宜见有德之人，进德修业。
                </span>
              </p>
              <p>
                九三：君子终日乾乾，夕惕若厉，无咎。
                <br />
                <span className="text-cream/60 text-xs">
                  居危思进，朝夕不懈，虽处险境亦可免咎。
                </span>
              </p>
              <p>
                九四：或跃在渊，无咎。
                <br />
                <span className="text-cream/60 text-xs">进退之机，审时度势，跃则腾飞，潜则守正。</span>
              </p>
              <p>
                九五：飞龙在天，利见大人。
                <br />
                <span className="text-cream/60 text-xs">大人造也，德位相配，功业鼎盛之时。</span>
              </p>
              <p>
                上九：亢龙，有悔。
                <br />
                <span className="text-cream/60 text-xs">盈不可久，阳极则衰，知进退者方能久长。</span>
              </p>
              <div className="xj-divider my-2" />
              <p className="text-xs text-cream/60">
                点击「开始上传解析」即可将真实典籍入库，系统将自动 AI 摘要、关键词抽取、文本切片与索引建立。
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="bg-gold/90 hover:bg-gold text-ink-deep">明白了</Button>
            </DialogClose>
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

function DocCard({
  doc,
  onView,
  onDelete,
}: {
  doc: XJDocument
  onView: () => void
  onDelete: () => void
}) {
  const kws = useMemo(
    () =>
      (doc.keywords || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 4),
    [doc.keywords],
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="xj-panel p-4 flex flex-col gap-2 group hover:xj-gold-border transition-all"
    >
      {/* 头部 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {fileIcon(doc.fileType)}
          <h3 className="font-serif text-sm sm:text-base text-cream/95 truncate" title={doc.title}>
            {doc.title}
          </h3>
        </div>
        {doc.category && (
          <Badge
            variant="outline"
            className="bg-gold/10 text-gold border-gold/40 text-[10px] flex-shrink-0"
          >
            {doc.category}
          </Badge>
        )}
      </div>

      {/* 摘要 */}
      <p className="text-xs text-cream/65 leading-relaxed line-clamp-2 min-h-[2.4em]">
        {doc.summary || '（暂无摘要）'}
      </p>

      {/* 关键词 */}
      {kws.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {kws.map((k, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 text-[10px] rounded bg-jade/10 text-jade border border-jade/25"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {/* 元信息 */}
      <div className="flex items-center gap-3 text-[10px] text-cream/45 mt-1">
        <span className="flex items-center gap-1">
          <FileType2 className="w-3 h-3" />
          {doc.fileType}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {formatSize(doc.size)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="w-3 h-3" />
          {timeAgo(doc.createdAt)}
        </span>
      </div>

      {/* 操作 */}
      <div className="flex gap-2 pt-1 mt-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onView}
          className="h-7 text-xs border-gold/30 text-cream/80 hover:bg-gold/10 hover:text-cream"
        >
          <Eye className="w-3 h-3 mr-1" />
          翻阅
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-7 text-xs text-cinnabar/70 hover:bg-cinnabar/15 hover:text-cinnabar"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          移除
        </Button>
      </div>
    </motion.div>
  )
}

function EmptyState({ onExample }: { onExample: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="xj-panel p-10 sm:p-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{
          background: 'radial-gradient(circle, rgba(138,168,107,0.18), transparent 70%)',
          border: '1px solid rgba(138,168,107,0.35)',
        }}
      >
        <ScrollText className="w-7 h-7 text-jade" />
      </motion.div>
      <h3 className="font-serif text-lg xj-gold-text mb-1">藏经阁尚虚</h3>
      <p className="text-sm text-cream/55 mb-4">
        尚无典籍入库，
        <br className="sm:hidden" />
        请上传以建立知识库。
      </p>
      <Button
        onClick={onExample}
        variant="outline"
        className="border-gold/30 text-cream/80 hover:bg-gold/10 hover:text-cream"
      >
        <Sparkles className="w-4 h-4 mr-1.5" />
        查看示例典籍
      </Button>
    </motion.div>
  )
}
