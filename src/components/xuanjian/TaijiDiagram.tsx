'use client'

import { useId } from 'react'

interface Props {
  size?: number
  /** 是否显示外围环（首页用 true） */
  full?: boolean
}

/**
 * 中央太极图
 * - 持续逆时针缓慢旋转
 * - 暗金纹理 + 阴阳符号 + 微弱光晕 + 能量流动
 * - 外围三圈：金环 / 八卦阵纹 / 星辰轨迹
 */
export default function TaijiDiagram({ size = 360, full = true }: Props) {
  // useId 保证 SSR/CSR 一致，避免水合不匹配
  const rawId = useId()
  const id = `taiji${rawId.replace(/[:]/g, '')}`

  // 浮点取整至 3 位小数 —— 避免 Node(SSR) 与浏览器(CSR) 的 Math.cos/sin
  // 末位精度差异导致 React 水合不匹配（hydration mismatch）
  const R = (v: number) => Math.round(v * 1000) / 1000

  return (
    <div
      className="relative pointer-events-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label="太极天机阵"
    >
      {/* 外围光晕 */}
      <div
        className="absolute inset-0 rounded-full xj-anim-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,106,0.25), transparent 65%)',
          transform: 'scale(1.4)',
        }}
      />

      {full && (
        <>
          {/* 第三圈：星辰轨迹 */}
          <svg
            className="absolute inset-0 xj-anim-spin-rev"
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <radialGradient id={`${id}-star`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(201,169,106,0)" />
                <stop offset="85%" stopColor="rgba(201,169,106,0.15)" />
                <stop offset="100%" stopColor="rgba(201,169,106,0)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(201,169,106,0.18)" strokeWidth="0.15" strokeDasharray="0.4 1.2" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(201,169,106,0.1)" strokeWidth="0.08" />
            {/* 星点 */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2
              const r = 48
              return (
                <circle
                  key={i}
                  cx={R(50 + Math.cos(a) * r)}
                  cy={R(50 + Math.sin(a) * r)}
                  r={i % 5 === 0 ? 0.45 : 0.22}
                  fill={i % 7 === 0 ? '#d9c08a' : 'rgba(232,220,196,0.7)'}
                />
              )
            })}
          </svg>

          {/* 第二圈：八卦阵纹 */}
          <svg
            className="absolute inset-0 xj-anim-spin-slow"
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%', padding: '6%' }}
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(201,169,106,0.3)" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,169,106,0.15)" strokeWidth="0.15" strokeDasharray="0.8 0.4" />
            {/* 八卦符号 —— 先天序 乾兑离震巽坎艮坤 */}
            {['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((sym, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2
              const r = 42
              return (
                <text
                  key={i}
                  x={R(50 + Math.cos(a) * r)}
                  y={R(50 + Math.sin(a) * r)}
                  fill="rgba(201,169,106,0.85)"
                  fontSize="4.2"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontFamily: 'serif' }}
                >
                  {sym}
                </text>
              )
            })}
            {/* 连线 */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2
              const a2 = ((i + 3) / 8) * Math.PI * 2 - Math.PI / 2
              return (
                <line
                  key={i}
                  x1={R(50 + Math.cos(a1) * 40)}
                  y1={R(50 + Math.sin(a1) * 40)}
                  x2={R(50 + Math.cos(a2) * 40)}
                  y2={R(50 + Math.sin(a2) * 40)}
                  stroke="rgba(201,169,106,0.08)"
                  strokeWidth="0.12"
                />
              )
            })}
          </svg>

          {/* 第一圈：金色圆环 */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%', padding: '12%' }}
          >
            <defs>
              <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8a7544" />
                <stop offset="40%" stopColor="#d9c08a" />
                <stop offset="60%" stopColor="#c9a96a" />
                <stop offset="100%" stopColor="#6b5933" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(201,169,106,0.4)" strokeWidth="0.3" />
            {/* 环上符文点 */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2
              return (
                <circle
                  key={i}
                  cx={R(50 + Math.cos(a) * 46.5)}
                  cy={R(50 + Math.sin(a) * 46.5)}
                  r={i % 3 === 0 ? 0.6 : 0.3}
                  fill="#d9c08a"
                />
              )
            })}
          </svg>
        </>
      )}

      {/* 太极本体 —— 逆时针旋转 */}
      <div
        className="absolute"
        style={{
          inset: full ? '22%' : '0',
          animation: 'xj-spin-slow 80s linear infinite',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id={`${id}-yang`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f4ead4" />
              <stop offset="70%" stopColor="#d9c08a" />
              <stop offset="100%" stopColor="#8a7544" />
            </radialGradient>
            <radialGradient id={`${id}-yin`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1030" />
              <stop offset="70%" stopColor="#0c0916" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <filter id={`${id}-glow`}>
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 太极阴阳鱼 */}
          <g filter={`url(#${id}-glow)`}>
            {/* 外圆 */}
            <circle cx="50" cy="50" r="48" fill={`url(#${id}-yin)`} stroke="#c9a96a" strokeWidth="0.6" />
            {/* 阳鱼（白）—— 右半 + 上半圆 + 下半圆 */}
            <path
              d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2 Z"
              fill={`url(#${id}-yang)`}
            />
            {/* 阳中阴点 */}
            <circle cx="50" cy="26" r="7" fill={`url(#${id}-yin)`} />
            {/* 阴中阳点 */}
            <circle cx="50" cy="74" r="7" fill={`url(#${id}-yang)`} />
          </g>

          {/* 金色边纹 */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(201,169,106,0.5)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(201,169,106,0.2)" strokeWidth="0.15" strokeDasharray="0.5 1.5" />
        </svg>
      </div>

      {/* 中心能量核 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: full ? '46%' : '42%',
          background: 'radial-gradient(circle, rgba(201,169,106,0.7), transparent 70%)',
          filter: 'blur(4px)',
          animation: 'xj-pulse-glow 3s ease-in-out infinite',
        }}
      />
    </div>
  )
}
