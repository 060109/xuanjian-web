'use client'

import { useEffect, useRef } from 'react'

/**
 * 星空粒子 + 云雾 背景
 * Canvas 绘制：缓慢漂移的星点 + 偶发流星 + 鼠标视差
 */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let raf = 0

    const STAR_COUNT = Math.min(220, Math.floor((w * h) / 9000))
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      tw: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.6 + 0.4, // 视差深度
      hue: Math.random() < 0.15 ? 'gold' : Math.random() < 0.1 ? 'red' : 'white',
    }))

    // 云雾 blobs
    const clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 200 + 150,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      hue: Math.random() < 0.5 ? '40, 30, 70' : '60, 30, 30',
    }))

    // 流星
    const meteors: { x: number; y: number; len: number; vx: number; vy: number; life: number; max: number }[] = []
    function spawnMeteor() {
      const startX = Math.random() * w
      const startY = Math.random() * h * 0.4
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3
      meteors.push({
        x: startX, y: startY,
        len: 80 + Math.random() * 80,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        life: 0, max: 60 + Math.random() * 30,
      })
    }

    let frame = 0
    function draw() {
      ctx.clearRect(0, 0, w, h)

      // 云雾
      clouds.forEach((c) => {
        c.x += c.vx
        c.y += c.vy
        if (c.x < -c.r) c.x = w + c.r
        if (c.x > w + c.r) c.x = -c.r
        if (c.y < -c.r) c.y = h + c.r
        if (c.y > h + c.r) c.y = -c.r
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r)
        grad.addColorStop(0, `rgba(${c.hue}, 0.18)`)
        grad.addColorStop(1, `rgba(${c.hue}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // 星星
      const mx = (mouseRef.current.x - w / 2) * 0.02
      const my = (mouseRef.current.y - h / 2) * 0.02
      stars.forEach((s) => {
        s.phase += s.tw
        const alpha = s.a * (0.5 + 0.5 * Math.sin(s.phase))
        const px = s.x + mx * s.depth
        const py = s.y + my * s.depth
        let color = `rgba(232, 220, 196, ${alpha})`
        if (s.hue === 'gold') color = `rgba(201, 169, 106, ${alpha})`
        else if (s.hue === 'red') color = `rgba(180, 90, 90, ${alpha * 0.7})`
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
        // 大星加光晕
        if (s.r > 1.1) {
          ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha * 0.15})`)
          ctx.beginPath()
          ctx.arc(px, py, s.r * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 流星
      if (frame % 220 === 0 && Math.random() < 0.6) spawnMeteor()
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx
        m.y += m.vy
        m.life++
        const lifeRatio = m.life / m.max
        const a = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1 - (lifeRatio - 0.3) / 0.7
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.len / 8, m.y - m.vy * m.len / 8)
        grad.addColorStop(0, `rgba(232, 220, 196, ${a})`)
        grad.addColorStop(1, 'rgba(232, 220, 196, 0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * m.len / 8, m.y - m.vy * m.len / 8)
        ctx.stroke()
        if (m.life >= m.max || m.x > w || m.y > h) meteors.splice(i, 1)
      }

      frame++
      raf = requestAnimationFrame(draw)
    }
    draw()

    function onResize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  )
}
