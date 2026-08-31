/* ============================================================
 * 玄天智算 · 应用层 app.js
 * 登录守卫 / 顶栏导航 / 星盘生成 / 页面通用初始化
 * ============================================================ */
(function () {
  'use strict';

  /* —— 登录守卫：未登录跳转 login.html —— */
  function guard(redirect) {
    if (!XT.isLoggedIn()) {
      location.href = 'login.html' + (redirect ? '?next=' + encodeURIComponent(redirect) : '');
      return false;
    }
    return true;
  }

  /* —— 顶栏渲染 —— */
  const NAV = [
    ['index.html', '星盘'], ['ai.html', '问鉴'], ['knowledge.html', '藏经阁'],
    ['dashboard.html', '控制台'], ['settings.html', '设置']
  ];
  function topbar(active) {
    const el = document.getElementById('topbar');
    if (!el) return;
    const u = XT.session() || {};
    const nav = NAV.map(n =>
      `<a href="${n[0]}" class="${n[0] === active ? 'active' : ''}">${n[1]}</a>`).join('');
    el.innerHTML = `
      <a class="brand" href="index.html">
        <span class="mark">玄</span>
        <span><span class="title">玄天<b>智算</b></span><div class="sub">XUAN TIAN · AI</div></span>
      </a>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <nav class="topnav">${nav}</nav>
        <span class="user-chip"><span class="dot"></span>${XT.esc(u.displayName || u.username || '')}</span>
      </div>`;
    const out = document.getElementById('logoutBtn');
    if (out) out.addEventListener('click', () => { XT.logout(); location.href = 'login.html'; });
  }

  /* —— 星盘生成（首页） —— */
  const MODULES = [
    { id: 'bazi', glyph: '命', name: '八字命理' },
    { id: 'tarot', glyph: '牌', name: '塔罗占卜' },
    { id: 'liuyao', glyph: '爻', name: '六爻预测' },
    { id: 'meihua', glyph: '卦', name: '梅花易数' },
    { id: 'qimen', glyph: '遁', name: '奇门遁甲' },
    { id: 'fengshui', glyph: '宅', name: '风水分析' },
    { id: 'xingming', glyph: '名', name: '姓名学' },
    { id: 'ziwei', glyph: '紫', name: '紫微斗数' },
    { id: 'shengxiao', glyph: '肖', name: '生肖运势' },
    { id: 'shuzi', glyph: '数', name: '数字能量' },
    { id: 'meiri', glyph: '日', name: '每日运势' },
    { id: 'mianxiang', glyph: '相', name: '面相分析' },
  ];
  function starmap(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;
    const n = MODULES.length;
    const r = 46; // 半径百分比
    box.querySelectorAll('.node').forEach(x => x.remove());
    MODULES.forEach((m, i) => {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = 50 + r * Math.cos(ang);
      const y = 50 + r * Math.sin(ang);
      const node = document.createElement('div');
      node.className = 'node';
      node.style.left = x + '%';
      node.style.top = y + '%';
      node.style.transform = 'translate(-50%,-50%)';
      node.innerHTML = `<a href="${m.id}.html"><span class="glyph">${m.glyph}</span><span class="nm">${m.name}</span></a>`;
      node.querySelector('a').addEventListener('click', (e) => {
        XTAnim.burst(e.currentTarget);
        /* 延迟跳转让扩散动画可见 */
        e.preventDefault();
        setTimeout(() => location.href = m.id + '.html', 220);
      });
      box.appendChild(node);
    });
  }

  /* —— 页面初始化 —— */
  function init(opts = {}) {
    if (opts.guard !== false) guard(opts.active || location.pathname.split('/').pop());
    topbar(opts.active);
    if (opts.starmap) starmap(opts.starmap);
    if (opts.cosmos !== false) XTAnim.initCosmos('cosmos-canvas');
  }

  window.XTApp = { init, guard, topbar, starmap, MODULES };
})();
