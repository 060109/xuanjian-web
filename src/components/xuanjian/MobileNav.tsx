'use client'

import { Home, Calculator, Sparkles, BookOpen, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { MODULE_ROUTES, XJView } from '@/lib/store'

interface NavItem {
  id: XJView | 'home'
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'bazi', label: '算法', icon: Calculator },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'library', label: '资料', icon: BookOpen },
  { id: 'history', label: '我的', icon: User },
]

const CALC_ROUTES = ['/bazi', '/liuyao', '/qimen', '/tarot', '/name']

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname() || '/'

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 xj-glass-strong border-t border-[rgba(201,169,106,0.25)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="主导航"
    >
      <div className="grid grid-cols-5">
        {NAV.map((item) => {
          const active =
            pathname === MODULE_ROUTES[item.id] ||
            (item.id === 'bazi' && CALC_ROUTES.includes(pathname))
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => router.push(MODULE_ROUTES[item.id])}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
              style={{ color: active ? '#c9a96a' : 'rgba(232,220,196,0.55)' }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_rgba(201,169,106,0.6)]' : ''}`} />
              <span className="text-[10px] tracking-wider">{item.label}</span>
              <span
                className="h-0.5 w-5 rounded-full transition-all"
                style={{
                  background: active ? '#c9a96a' : 'transparent',
                  boxShadow: active ? '0 0 8px rgba(201,169,106,0.6)' : 'none',
                }}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
