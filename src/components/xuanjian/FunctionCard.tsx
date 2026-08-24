'use client'

import { motion } from 'framer-motion'
import { XJModule } from '@/lib/store'

interface Props {
  module: XJModule
  angle: number // 角度（度，0=顶部）
  radius: number // 圆周半径 px
  index: number
  isFocused: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}

/**
 * 围绕太极的功能卡片
 * - 默认：半透明黑色玻璃 + 暗金边框 + 米黄文字
 * - hover：仅当前卡片放大 + 浮起 + 边框增强 + 金色光晕；其他卡片保持原状不变
 */
export default function FunctionCard({
  module, angle, radius, index, isFocused, onEnter, onLeave, onClick,
}: Props) {
  const rad = (angle - 90) * (Math.PI / 180)
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius

  return (
    <motion.button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      onFocus={onEnter}
      onBlur={onLeave}
      className="absolute group pointer-events-auto outline-none focus:outline-none focus-visible:outline-none"
      style={{
        left: '50%',
        top: '50%',
        width: 168,
        height: 168,
        marginLeft: -84,
        marginTop: -84,
        x, y,
        zIndex: isFocused ? 30 : 10,
        outline: 'none',
        boxShadow: 'none',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: isFocused ? 1.12 : 1,
        y: isFocused ? y - 8 : y,
      }}
      transition={{
        // 入场：opacity 保持错峰延迟（美观）
        opacity: { duration: 0.5, delay: index * 0.06 },
        // hover 状态变化：近乎瞬间响应
        scale: { duration: 0.06, ease: 'easeOut' },
        y: { duration: 0.06, ease: 'easeOut' },
      }}
      aria-label={module.title}
    >
      <div
        className="relative w-full h-full rounded-full flex flex-col items-center justify-center gap-1.5 p-4 text-center overflow-hidden"
        style={{
          background: isFocused
            ? 'radial-gradient(circle at center, rgba(40,28,18,0.95), rgba(20,14,28,0.92))'
            : 'radial-gradient(circle at center, rgba(26,16,48,0.6), rgba(12,9,16,0.75))',
          border: `1.5px solid ${isFocused ? 'rgba(201,169,106,0.9)' : 'rgba(201,169,106,0.3)'}`,
          boxShadow: isFocused
            ? `0 0 0 1px rgba(201,169,106,0.3) inset, 0 0 50px ${module.accent}66, 0 0 90px rgba(201,169,106,0.25)`
            : '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
        }}
      >
        {/* 图标卦象 —— 圆心 */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 52, height: 52,
            background: `radial-gradient(circle, ${module.accent}44, transparent 70%)`,
            border: `1px solid ${module.accent}77`,
          }}
        >
          <span
            className="text-2xl font-serif"
            style={{ color: module.accent, textShadow: `0 0 14px ${module.accent}aa` }}
          >
            {module.icon}
          </span>
        </div>

        {/* 标题 */}
        <div className="font-serif text-base sm:text-lg font-semibold xj-gold-text leading-tight">
          {module.title}
        </div>
        {/* 描述（圆形内精简） */}
        <div className="text-[10px] sm:text-[11px] text-cream/60 leading-tight px-2">
          {module.desc}
        </div>
      </div>
    </motion.button>
  )
}
