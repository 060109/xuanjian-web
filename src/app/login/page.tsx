'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react'
import StarField from '@/components/xuanjian/StarField'
import TaijiDiagram from '@/components/xuanjian/TaijiDiagram'

/**
 * 登录页 —— 暗色玄幻风
 * 深空星空粒子 + 旋转太极辉光 + 星轨装饰 + 表单辉光聚焦
 */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push(next.startsWith('/') && !next.startsWith('//') ? next : '/')
        router.refresh()
      } else {
        setError(data.error || '登录失败，请稍后再试')
      }
    } catch {
      setError('网络异常，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
      className="relative z-20 w-full max-w-md px-6"
    >
      {/* 表单卡片 */}
      <div
        className="xj-glass-strong rounded-2xl p-8 sm:p-10"
        style={{
          border: '1px solid rgba(201,169,106,0.28)',
          boxShadow:
            '0 0 40px rgba(201,169,106,0.08), 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          background: 'linear-gradient(160deg, rgba(18,10,31,0.92), rgba(7,6,10,0.94))',
        }}
      >
        {/* 品牌 */}
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto mb-4 relative flex items-center justify-center"
            style={{ width: 96, height: 96 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(201,169,106,0.5) 20%, transparent 40%, transparent 60%, rgba(201,169,106,0.3) 80%, transparent 100%)',
                animation: 'xj-spin-slow 6s linear infinite',
              }}
            />
            <TaijiDiagram size={72} full={false} />
          </motion.div>
          <h1
            className="font-brush text-4xl xj-gold-text tracking-[0.25em]"
            style={{ textShadow: '0 0 24px rgba(201,169,106,0.45)' }}
          >
            玄 鉴
          </h1>
          <p className="mt-2 text-[11px] tracking-[0.45em] text-cream/55 uppercase">
            Xuan Jian · 东方术数研究空间
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs text-cream/65 tracking-wide">
              用户名
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入授权用户名"
                className="xj-input"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(201,169,106,0.22)',
                  color: '#e8dcc4',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'box-shadow 0.25s, border-color 0.25s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,106,0.75)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,106,0.15), 0 0 18px rgba(201,169,106,0.25)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,106,0.22)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs text-cream/65 tracking-wide">
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="xj-input"
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(201,169,106,0.22)',
                  color: '#e8dcc4',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'box-shadow 0.25s, border-color 0.25s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,106,0.75)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,106,0.15), 0 0 18px rgba(201,169,106,0.25)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,106,0.22)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-[#c9a96a] transition-colors"
                aria-label={showPwd ? '隐藏密码' : '显示密码'}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg text-sm border border-[rgba(155,58,58,0.45)] bg-[rgba(155,58,58,0.12)] text-[#e0a8a8]"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c98a8a]" />
              <span className="leading-snug">{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-[#07060a] transition-all disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #d9c08a, #c9a96a 45%, #8a7544)',
              boxShadow: '0 4px 20px rgba(201,169,106,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,169,106,0.5), inset 0 1px 0 rgba(255,255,255,0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,106,0.3), inset 0 1px 0 rgba(255,255,255,0.35)')}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? '正在进入…' : '进入玄鉴'}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-cream/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8aa86b]" />
            仅授权账号可访问 · 会话加密保护
          </div>
        </form>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-6 text-center text-[11px] text-cream/35 tracking-widest"
      >
        天垂象，见吉凶 · 圣人象之
      </motion.p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 深空背景渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, #1a1230 0%, #120a1f 40%, #07060a 100%)',
        }}
      />

      {/* 星空粒子 */}
      <StarField />

      {/* 巨大太极辉光背景 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 720, height: 720, opacity: 0.16, filter: 'blur(6px)' }}
        aria-hidden
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(201,169,106,0.5) 0%, transparent 60%)',
            animation: 'xj-breathe 7s ease-in-out infinite',
          }}
        />
      </div>

      {/* 星轨装饰环 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(201,169,106,0.12)]"
          style={{ width: 560, height: 560, animation: 'xj-spin-slow 60s linear infinite' }}
        >
          <span
            className="absolute -top-1 left-1/2 w-2 h-2 rounded-full"
            style={{ background: '#c9a96a', boxShadow: '0 0 10px #c9a96a' }}
          />
        </div>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(201,169,106,0.07)]"
          style={{ width: 380, height: 380, animation: 'xj-spin-reverse 90s linear infinite' }}
        >
          <span
            className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: '#9b7ec9', boxShadow: '0 0 8px #9b7ec9' }}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
