/* ============================================================
 * 玄天智算 · 星空引擎 starfield.js
 * Canvas 全屏动态星空：粒子星尘 / 星云流动 / 流星轨迹 / 鼠标星光
 * ============================================================ */
(function () {
  'use strict';

  function initCosmos(canvasId) {
    const canvas = document.getElementById(canvasId || 'cosmos-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], nebulas = [], meteors = [], mouse = { x: -999, y: -999, trail: [] };

    function resize() {
      W = canvas.width = canvas.offsetWidth || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    /* 星星（含闪烁层） */
    function makeStars(n) {
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random() * 0.5 + 0.2,
          tw: Math.random() * 0.02 + 0.005,
          ph: Math.random() * Math.PI * 2,
          drift: Math.random() * 0.12 + 0.02,
        });
      }
      return arr;
    }
    stars = makeStars(Math.min(260, Math.floor(W * H / 5200)));

    /* 星云（慢速光斑） */
    function makeNebulas(n) {
      const arr = [];
      const colors = ['58,42,108', '30,60,110', '88,64,130', '40,70,120'];
      for (let i = 0; i < n; i++) {
        arr.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 160 + 90,
          c: colors[i % colors.length],
          a: Math.random() * 0.06 + 0.03,
          dx: (Math.random() - 0.5) * 0.05,
          dy: (Math.random() - 0.5) * 0.03,
        });
      }
      return arr;
    }
    nebulas = makeNebulas(4);

    /* 流星 */
    function spawnMeteor() {
      meteors.push({
        x: Math.random() * W * 0.8 + W * 0.1, y: Math.random() * H * 0.3,
        vx: -(Math.random() * 4 + 2), vy: Math.random() * 2 + 1.5,
        life: 1,
      });
    }
    setInterval(() => { if (meteors.length < 3) spawnMeteor(); }, 6000 + Math.random() * 5000);

    /* 鼠标星光 */
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.trail.push({ x: e.clientX, y: e.clientY, a: 0.6 });
      if (mouse.trail.length > 14) mouse.trail.shift();
    });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    const TAU = Math.PI * 2;
    function frame(t) {
      ctx.clearRect(0, 0, W, H);

      /* 星云 */
      for (const n of nebulas) {
        n.x += n.dx; n.y += n.dy;
        if (n.x < -n.r) n.x = W + n.r; if (n.x > W + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = H + n.r; if (n.y > H + n.r) n.y = -n.r;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.c},${n.a})`);
        g.addColorStop(1, `rgba(${n.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.fill();
      }

      /* 星星 */
      for (const s of stars) {
        const tw = Math.sin(t * s.tw + s.ph) * 0.5 + 0.5;
        ctx.globalAlpha = s.a * (0.5 + tw * 0.5);
        ctx.fillStyle = tw > 0.82 ? '#f6df9a' : (tw > 0.6 ? '#cfe4ff' : '#e8e6f2');
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
        s.x -= s.drift;
        if (s.x < -2) s.x = W + 2;
      }
      ctx.globalAlpha = 1;

      /* 流星 */
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy; m.life -= 0.012;
        if (m.life <= 0 || m.x < -60 || m.y > H + 20) { meteors.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        grad.addColorStop(0, `rgba(246,223,154,${0.7 * m.life})`);
        grad.addColorStop(1, 'rgba(246,223,154,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); ctx.stroke();
      }

      /* 鼠标星光 */
      for (let i = 0; i < mouse.trail.length; i++) {
        const p = mouse.trail[i];
        p.a *= 0.92;
        ctx.globalAlpha = Math.max(p.a, 0.05);
        ctx.fillStyle = '#f6df9a';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      /* 鼠标周围微光 */
      if (mouse.x > -500) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 46);
        g.addColorStop(0, 'rgba(232,200,116,0.10)'); g.addColorStop(1, 'rgba(232,200,116,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 46, 0, TAU); ctx.fill();
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* 星辰扩散动画（点击节点时） */
  function burst(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const ring = document.createElement('div');
    ring.className = 'ripple-ring';
    ring.style.left = rect.left + rect.width / 2 - 110 + 'px';
    ring.style.top = rect.top + rect.height / 2 - 110 + 'px';
    document.body.appendChild(ring);
    requestAnimationFrame(() => ring.classList.add('go'));
    setTimeout(() => ring.remove(), 950);
    /* 粒子迸发 */
    const N = 16;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;z-index:99;width:4px;height:4px;border-radius:50%;background:rgba(246,223,154,.9);
        box-shadow:0 0 8px rgba(232,200,116,.8);left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;
        pointer-events:none;transition:all .7s cubic-bezier(.15,.7,.3,1);`;
      const ang = (Math.PI * 2 * i) / N + Math.random() * 0.4;
      const dist = 40 + Math.random() * 70;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 750);
    }
  }

  window.XTAnim = { initCosmos, burst };
})();
