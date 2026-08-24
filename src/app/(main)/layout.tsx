'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User as UserIcon } from 'lucide-react'
import StarField from '@/components/xuanjian/StarField'
import MobileNav from '@/components/xuanjian/MobileNav'

/**
 * 主应用外壳（登录后可见）
 * - 星空动态背景 + 八卦纹理 + 暗角
 * - 顶部品牌栏：用户名 + 登出
 * - 页面切换过渡动画（framer-motion）
 * - 移动端底部导航
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => mounted && setUsername(d.username))
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 星空背景 */}
      <StarField />

      {/* 八卦纹理叠层 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22><text x=%2260%22 y=%2270%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22%23c9a96a%22>☰</text></svg>")',
          backgroundRepeat: 'repeat',
          zIndex: 1,
        }}
        aria-hidden
      />

      {/* 暗角 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
          zIndex: 2,
        }}
        aria-hidden
      />

      {/* 顶部品牌栏 */}
      <header
        className="sticky top-0 z-40 w-full border-b border-[rgba(201,169,106,0.15)]"
        style={{ background: 'rgba(7,6,10,0.72)', backdropFilter: 'blur(14px)' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 group"
            aria-label="返回首页"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-serif"
              style={{
                background: 'radial-gradient(circle, rgba(201,169,106,0.25), transparent 70%)',
                border: '1px solid rgba(201,169,106,0.5)',
                color: '#c9a96a',
                boxShadow: '0 0 12px rgba(201,169,106,0.25)',
              }}
            >
              玄
            </span>
            <span className="font-brush text-xl xj-gold-text tracking-widest group-hover:drop-shadow-[0_0_8px_rgba(201,169,106,0.6)] transition-all">
              玄鉴
            </span>
          </button>

          <div className="flex items-center gap-3">
            {username && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-cream/70">
                <UserIcon className="w-3.5 h-3.5 text-[#c9a96a]" />
                <span className="max-w-[120px] truncate">{username}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg xj-glass hover:xj-gold-border transition-all text-xs text-cream/75 hover:text-cream disabled:opacity-50"
              aria-label="退出登录"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative flex-1 flex flex-col" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 移动端底部导航 */}
      <MobileNav />
    </div>
  )
}
