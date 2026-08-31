/* ============================================================
 * 玄天智算 · 高级太极组件 taiji.js
 * 核心阴阳（☯）+ 八卦环 + 十二地支环 + 星轨粒子 + 呼吸光晕
 * 用法：renderTaiji(el, size) 或自动替换 .taiji-el 元素
 * ============================================================ */
(function () {
  'use strict';

  /* 八卦：卦名 + 卦爻（3爻，1阳0阴，从下到上）+ 方位五行 */
  const BAGUA = [
    { name: '乾', trigram: '☰', wx: '金', lines: [1, 1, 1], pos: 0 },  // 南
    { name: '兑', trigram: '☱', wx: '金', lines: [1, 1, 0], pos: 1 },
    { name: '离', trigram: '☲', wx: '火', lines: [1, 0, 1], pos: 2 },
    { name: '震', trigram: '☳', wx: '木', lines: [1, 0, 0], pos: 3 },
    { name: '巽', trigram: '☴', wx: '木', lines: [0, 1, 1], pos: 4 },
    { name: '坎', trigram: '☵', wx: '水', lines: [0, 1, 0], pos: 5 },
    { name: '艮', trigram: '☶', wx: '土', lines: [0, 0, 1], pos: 6 },
    { name: '坤', trigram: '☷', wx: '土', lines: [0, 0, 0], pos: 7 },
  ];
  const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const WX_COLOR = { 金: '#f6df9a', 木: '#9fe8bc', 水: '#7fd4e8', 火: '#f2a08a', 土: '#d8c9a3' };

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function svg(w, h, inner) {
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="display:block;">${inner}</svg>`;
  }

  /* 生成核心组件 HTML */
  function build(size) {
    const c = size / 2;
    const rCore = size * 0.165;      // ☯ 字号基准
    const rBa = size * 0.335;        // 八卦环半径
    const rDz = size * 0.415;        // 地支环半径
    const rOrbit = size * 0.475;     // 星轨半径

    /* 八卦环（SVG 文本沿圆布置） */
    let ba = BAGUA.map((g, i) => {
      const p = polar(c, c, rBa, i * 45);
      return `<g class="bq" data-i="${i}" style="transform-origin:${p.x}px ${p.y}px;">
        <text x="${p.x}" y="${p.y}" font-size="${size * 0.075}" text-anchor="middle" dominant-baseline="central"
          fill="${WX_COLOR[g.wx]}" opacity="0.85" class="bq-glyph" style="filter:drop-shadow(0 0 6px ${WX_COLOR[g.wx]});">${g.trigram}</text>
        <text x="${p.x}" y="${p.y + size * 0.038}" font-size="${size * 0.022}" text-anchor="middle" fill="rgba(233,230,242,.5)">${g.name}</text>
      </g>`;
    }).join('');

    /* 地支环 */
    const dz = DIZHI.map((z, i) => {
      const p = polar(c, c, rDz, i * 30);
      return `<text class="dz" x="${p.x}" y="${p.y}" font-size="${size * 0.028}" text-anchor="middle"
        dominant-baseline="central" fill="rgba(233,230,242,.55)" style="letter-spacing:0;">${z}</text>`;
    }).join('');

    /* 星轨粒子（8 颗流动光点 + 轨道线） */
    let orbit = '';
    for (let i = 0; i < 8; i++) {
      const p = polar(c, c, rOrbit, i * 45);
      orbit += `<circle class="sp" cx="${p.x}" cy="${p.y}" r="${size * 0.008}" fill="#f6df9a"
        style="filter:drop-shadow(0 0 5px rgba(232,200,116,.9));animation-delay:${-i * 1.25}s;"/>`;
    }
    orbit += `<circle cx="${c}" cy="${c}" r="${rOrbit}" fill="none" stroke="rgba(232,200,116,.14)" stroke-width="1" stroke-dasharray="4 6"/>
              <circle cx="${c}" cy="${c}" r="${rBa}" fill="none" stroke="rgba(232,200,116,.12)" stroke-width="1"/>
              <circle cx="${c}" cy="${c}" r="${rDz}" fill="none" stroke="rgba(232,200,116,.1)" stroke-width="1" stroke-dasharray="2 5"/>`;

    return `
    <div class="taiji-stage" style="--ts:${size}px;width:${size}px;height:${size}px;">
      <!-- 呼吸光晕 -->
      <div class="tj-aura"></div><div class="tj-aura a2"></div>
      <!-- 星轨层（旋转） -->
      <div class="tj-orbit">${svg(size, size, orbit)}</div>
      <!-- 八卦地支层（反向旋转） -->
      <div class="tj-ring">${svg(size, size, ba + dz)}</div>
      <!-- 核心阴阳 -->
      <div class="tj-core">
        <div class="tj-taiji">☯</div>
      </div>
    </div>`;
  }

  function styleTag() {
    if (document.getElementById('taiji-style')) return;
    const st = document.createElement('style');
    st.id = 'taiji-style';
    st.textContent = `
      .taiji-stage { position: relative; border-radius: 50%; }
      .tj-core { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .tj-taiji {
        font-size: var(--ts, 120px); line-height: 1; user-select: none;
        color: #e9e6f2;
        text-shadow: 0 0 22px rgba(232,200,116,.55), 0 0 60px rgba(232,200,116,.25);
        animation: tjSpin 30s linear infinite;
        transform-origin: 50% 50%;
      }
      .tj-label {
        margin-top: calc(var(--ts,120px) * .06);
        font-family: var(--font-serif); font-size: calc(var(--ts,120px) * .095);
        letter-spacing: .3em; color: var(--gold-bright);
        text-shadow: 0 0 14px rgba(232,200,116,.6);
        white-space: nowrap;
      }
      .tj-ring, .tj-orbit { position: absolute; inset: 0; animation: tjSpin 90s linear infinite; }
      .tj-ring { animation-direction: reverse; animation-duration: 120s; }
      .tj-orbit { animation-duration: 60s; }
      .tj-ring .bq { transition: opacity .6s; }
      .tj-ring .bq.lit { opacity: 1 !important; }
      .tj-aura { position: absolute; inset: -7%; border-radius: 50%; border: 1px solid rgba(232,200,116,.3);
        animation: tjAura 5s ease-in-out infinite; pointer-events: none; }
      .tj-aura.a2 { inset: -14%; border-color: rgba(232,200,116,.12); border-style: dashed; animation-delay: -2.5s; }
      @keyframes tjSpin { to { transform: rotate(360deg); } }
      @keyframes tjAura { 0%,100% { opacity:.4; transform: scale(1); } 50% { opacity:1; transform: scale(1.035); } }
      .sp { opacity: 0; animation: tjSpark 10s linear infinite; }
      @keyframes tjSpark {
        0% { opacity: 0; } 3% { opacity: 1; } 8% { opacity: 0; }
        30% { opacity: 0; } 33% { opacity: 1; } 38% { opacity: 0; }
        60% { opacity: 0; } 63% { opacity: 1; } 68% { opacity: 0; }
        90% { opacity: 0; } 93% { opacity: 1; } 98% { opacity: 0; }
      }`;
    document.head.appendChild(st);
  }

  /* 卦爻随机点亮 */
  function lightLoop() {
    const glyphs = document.querySelectorAll('.taiji-stage .bq');
    if (!glyphs.length) return;
    setInterval(() => {
      const k = Math.floor(Math.random() * glyphs.length);
      glyphs.forEach((g, i) => g.classList.toggle('lit', i === k));
    }, 2600);
  }

  function renderTaiji(el, size) {
    if (!el) return;
    styleTag();
    el.classList.add('taiji-mounted');
    el.innerHTML = build(size || 260);
    lightLoop();
  }

  /* 自动替换所有 .taiji-el（指定 data-size） */
  function autoMount() {
    document.querySelectorAll('.taiji-el').forEach(el => {
      renderTaiji(el, parseInt(el.getAttribute('data-size') || '260', 10));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();

  window.Taiji = { renderTaiji, autoMount };
})();
