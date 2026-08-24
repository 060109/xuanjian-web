'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Settings, Cpu } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  trigram?: string
  children: React.ReactNode
  accent?: string
}

/**
 * 功能页通用外壳
 * - 顶部：返回 + 标题 + 副标 + AI状态/设置入口
 */
export default function PageShell({ title, subtitle, trigram, children, accent = '#c9a96a' }: Props) {
  const router = useRouter()
  const [aiStatus, setAiStatus] = useState<{ enabled: boolean; provider: string } | null>(null)

  useEffect(() => {
    fetch('/api/ai-config')
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setAiStatus({ enabled: d.config.enabled, provider: d.config.provider })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:pb-12">
      {/* 顶部导航 */}
      <motion.div
        className="flex items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg xj-glass hover:xj-gold-border transition-all text-cream/80 hover:text-cream text-sm"
          aria-label="返回太极阵"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">太极阵</span>
        </button>

        <div className="flex items-center gap-3">
          {trigram && (
            <div
              className="flex items-center justify-center rounded-full w-10 h-10 text-xl font-serif"
              style={{
                background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
                border: `1px solid ${accent}55`,
                color: accent,
                textShadow: `0 0 10px ${accent}88`,
              }}
            >
              {trigram}
            </div>
          )}
          <div className="text-right">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold xj-gold-text leading-tight">
              {title}
            </h1>
            {subtitle && (
              <div className="text-[10px] sm:text-xs tracking-widest text-cream/50 uppercase">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI 状态指示 */}
          <button
            onClick={() => router.push('/settings')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-lg xj-glass hover:xj-gold-border transition-all text-xs"
            aria-label="AI 模型设置"
            title={aiStatus?.enabled ? `当前：${aiStatus.provider}` : '未启用自定义AI，点击配置'}
          >
            <Cpu className={`w-3.5 h-3.5 ${aiStatus?.enabled ? 'text-[#c9a96a]' : 'text-cream/40'}`} />
            <span className={aiStatus?.enabled ? 'text-[#c9a96a]' : 'text-cream/40'}>
              {aiStatus?.enabled ? aiStatus.provider.toUpperCase() : '内置'}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: aiStatus?.enabled ? '#8aa86b' : '#9a8d72', boxShadow: aiStatus?.enabled ? '0 0 6px #8aa86b' : 'none' }}
            />
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="sm:hidden p-2 rounded-lg xj-glass hover:xj-gold-border transition-all text-cream/80"
            aria-label="AI设置"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg xj-glass hover:xj-gold-border transition-all text-cream/80 hover:text-cream text-sm"
            aria-label="首页"
          >
            <Home className="w-4 h-4" />
            <span>首页</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        className="xj-divider mb-6"
        initial={{ opacity: 0, scaleX: 0.3 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
