'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import TaijiDiagram from './TaijiDiagram'
import FunctionCard from './FunctionCard'
import { MODULE_ROUTES, XJ_MODULES, useXJStore } from '@/lib/store'

/**
 * 太极天机阵 —— 首页
 * 中心太极 + 八方术数入口（圆周360°均布）
 */
export default function HomePage() {
  const router = useRouter()
  const focusedCard = useXJStore((s) => s.focusedCard)
  const setFocusedCard = useXJStore((s) => s.setFocusedCard)
  const [radius, setRadius] = useState(300)

  const [taijiSize, setTaijiSize] = useState(360)

  // 响应式半径
  useEffect(() => {
    function calc() {
      const w = window.innerWidth
      const h = window.innerHeight
      const minDim = Math.min(w, h)
      if (w < 640) {
        setTaijiSize(180)
        setRadius(minDim * 0.34)
      } else if (w < 1024) {
        setTaijiSize(260)
        setRadius(minDim * 0.36)
      } else {
        setTaijiSize(360)
        setRadius(Math.min(minDim * 0.36, 340))
      }
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 90px)' }}>
      {/* 标题 */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="font-brush text-3xl sm:text-4xl md:text-5xl xj-gold-text tracking-wider" style={{ textShadow: '0 0 20px rgba(201,169,106,0.4)' }}>
          玄 鉴
        </div>
        <div className="text-[11px] sm:text-xs tracking-[0.4em] text-cream/60 mt-1 uppercase">
          Xuan Jian · 东方术数研究空间
        </div>
      </motion.div>

      {/* 太极阵 */}
      <motion.div
        className="relative"
        style={{ width: taijiSize * 2.2, height: taijiSize * 2.2, marginTop: 40 }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        {/* 中心太极 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <TaijiDiagram size={taijiSize} full />
        </div>

        {/* 八方卡片 */}
        <div className="absolute inset-0 pointer-events-none">
          {XJ_MODULES.map((m, i) => {
            const angle = (i / 8) * 360 // 0=顶部
            return (
              <FunctionCard
                key={m.id}
                module={m}
                angle={angle}
                radius={radius}
                index={i}
                isFocused={focusedCard === m.id}
                onEnter={() => setFocusedCard(m.id)}
                onLeave={() => setFocusedCard(null)}
                onClick={() => router.push(MODULE_ROUTES[m.id])}
              />
            )
          })}
        </div>

        {/* 连接线（太极到各卡片）—— 装饰 */}
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {XJ_MODULES.map((m, i) => {
            const angle = (i / 8) * 360 - 90
            const rad = angle * (Math.PI / 180)
            const r = (radius / (taijiSize * 2.2)) * 100
            // 取整避免 SSR/CSR 浮点末位差异导致水合不匹配
            const R = (v: number) => Math.round(v * 1000) / 1000
            const x = R(50 + Math.cos(rad) * r)
            const y = R(50 + Math.sin(rad) * r)
            return (
              <line
                key={m.id}
                x1="50" y1="50" x2={x} y2={y}
                stroke={focusedCard === m.id ? 'rgba(201,169,106,0.5)' : 'rgba(201,169,106,0.08)'}
                strokeWidth={focusedCard === m.id ? '0.3' : '0.12'}
                strokeDasharray="0.6 0.8"
              />
            )
          })}
        </svg>
      </motion.div>

      {/* 底部说明 */}
      <motion.div
        className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 text-center z-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="text-cream/50 text-xs sm:text-sm tracking-widest">
          ☯ 中央太极 · 八方术数 · 推演天机
        </div>
        <div className="text-cream/30 text-[10px] mt-1">
          悬停以观其象 · 点击以入其阵
        </div>
      </motion.div>
    </div>
  )
}
