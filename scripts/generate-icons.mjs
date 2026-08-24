// 生成玄鉴主题 PWA 图标（金色太极 + 八卦外环），用于手机安装
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const GOLD = '#c9a96a'
const GOLD_DIM = '#8a7544'
const DARK = '#0b0910'
const CREAM = '#e8dcc4'

// 标准太极（阴阳）图形
const taiji = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1a1320"/>
      <stop offset="100%" stop-color="${DARK}"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#bg)"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD_DIM}" stroke-width="1.2" opacity="0.6"/>
  <circle cx="50" cy="50" r="40" fill="${CREAM}"/>
  <path d="M50 10 a20 20 0 0 1 0 40 a20 20 0 0 0 0 40 a40 40 0 0 1 0 -80 z" fill="${DARK}"/>
  <circle cx="50" cy="30" r="7" fill="${CREAM}"/>
  <circle cx="50" cy="70" r="7" fill="${DARK}"/>
  <circle cx="50" cy="30" r="3" fill="${DARK}"/>
  <circle cx="50" cy="70" r="3" fill="${CREAM}"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
</svg>`

const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1a1320"/>
      <stop offset="100%" stop-color="${DARK}"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg2)"/>
  <g transform="translate(50 50) scale(0.62) translate(-50 -50)">
    <circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD_DIM}" stroke-width="1.2" opacity="0.6"/>
    <circle cx="50" cy="50" r="40" fill="${CREAM}"/>
    <path d="M50 10 a20 20 0 0 1 0 40 a20 20 0 0 0 0 40 a40 40 0 0 1 0 -80 z" fill="${DARK}"/>
    <circle cx="50" cy="30" r="7" fill="${CREAM}"/>
    <circle cx="50" cy="70" r="7" fill="${DARK}"/>
    <circle cx="50" cy="30" r="3" fill="${DARK}"/>
    <circle cx="50" cy="70" r="3" fill="${CREAM}"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  </g>
</svg>`

const out = resolve('.')
mkdirSync(resolve(out, 'public'), { recursive: true })

const svgToPng = async (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()

const jobs = [
  ['public/icon-192.png', taiji, 192],
  ['public/icon-512.png', taiji, 512],
  ['public/maskable-512.png', maskable, 512],
  ['public/icon-192-maskable.png', maskable, 192],
]

for (const [file, svg, size] of jobs) {
  const buf = await svgToPng(svg, size)
  writeFileSync(resolve(out, file), buf)
  console.log('wrote', file, buf.length, 'bytes')
}
console.log('done')
