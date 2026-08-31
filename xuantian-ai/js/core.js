/* ============================================================
 * 玄天智算 · 核心模块 core.js
 * 登录系统 / 用户管理 / 数据存储 / 通用工具
 * ============================================================ */
(function (global) {
  'use strict';

  const STORE = {
    USERS: 'xt_users',        // 用户列表
    SESSION: 'xt_session',    // 当前会话
    SETTINGS: 'xt_settings',  // AI 模型配置
    DOCS: 'xt_docs',          // 知识库典籍
    USAGE: 'xt_usage',        // 调用统计
    CHAT: 'xt_chat',          // AI 聊天历史
    HISTORY: 'xt_history',    // 玄学计算历史
  };

  /* ---------- SHA-256（纯 JS，用于本地密码散列） ---------- */
  function sha256(text) {
    function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
    function toBytes(s) {
      const b = [];
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c < 128) b.push(c);
        else if (c < 2048) b.push(192 | (c >> 6), 128 | (c & 63));
        else b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
      }
      return b;
    }
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const msg = toBytes(text).concat([0x80]);
    while (msg.length % 64 !== 56) msg.push(0);
    const lenBits = toBytes(text).length * 8;
    for (let i = 7; i >= 0; i--) msg.push((lenBits >>> (i * 8)) & 0xff);
    for (let off = 0; off < msg.length; off += 64) {
      const w = new Array(64);
      for (let j = 0; j < 16; j++) w[j] = (msg[off + j * 4] << 24) | (msg[off + j * 4 + 1] << 16) | (msg[off + j * 4 + 2] << 8) | msg[off + j * 4 + 3];
      for (let j = 16; j < 64; j++) {
        const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let j = 0; j < 64; j++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[j] + w[j]) | 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    let out = '';
    for (let i = 0; i < 8; i++) for (let j = 3; j >= 0; j--) { const v = (H[i] >>> (j * 8)) & 0xff; out += (v < 16 ? '0' : '') + v.toString(16); }
    return out;
  }

  /* ---------- 存储 ---------- */
  function get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn('存储失败', e); } }

  /* ---------- 用户系统（首次使用本地初始账号，零异步失败） ---------- */
  const DEFAULT_ACCOUNTS = [
    { username: 'kurbanj', passHash: null, role: 'admin', displayName: '玄天掌印' },
    { username: 'guest', passHash: null, role: 'user', displayName: '玄境访客' }
  ];
  function loadUsers() {
    let stored = get(STORE.USERS, null);
    if (stored) return Promise.resolve(stored);
    /* 首次进入：用本地硬编码初始账号（users.json 的内容同步内嵌，确保 0 异步依赖） */
    const initial = [
      { username: 'kurbanj', passHash: sha256('060109'), role: 'admin', displayName: '玄天掌印' },
      { username: 'guest', passHash: sha256('xtai@2026'), role: 'user', displayName: '玄境访客' }
    ];
    set(STORE.USERS, initial);
    return Promise.resolve(initial);
  }

  const Core = {
    sha256,
    STORE,

    /* —— 会话 —— */
    session: () => get(STORE.SESSION, null),
    isLoggedIn: () => !!get(STORE.SESSION, null),
    currentUser: () => get(STORE.SESSION, null)?.username || '',

    /* —— 登录 / 登出 —— */
    async login(username, password) {
      const users = await loadUsers();
      const u = users.find(x => x.username === username);
      if (u && u.passHash === sha256(password)) {
        const s = { username: u.username, role: u.role, displayName: u.displayName || u.username, at: Date.now() };
        set(STORE.SESSION, s);
        this.bump('logins');
        return s;
      }
      return null;
    },
    logout() { localStorage.removeItem(STORE.SESSION); },

    /* —— 用户管理（管理员） —— */
    async listUsers() { return loadUsers(); },
    async addUser(username, password, role, displayName) {
      const users = await loadUsers();
      if (users.some(u => u.username === username)) return { ok: false, msg: '用户已存在' };
      users.push({ username, passHash: sha256(password), role, displayName });
      set(STORE.USERS, users);
      return { ok: true };
    },
    async removeUser(username) {
      const users = await loadUsers();
      if (username === 'kurbanj' || username === 'admin') return { ok: false, msg: '不可删除主管理员' };
      set(STORE.USERS, users.filter(u => u.username !== username));
      return { ok: true };
    },

    /* —— AI 配置 —— */
    getSettings: () => get(STORE.SETTINGS, {}),
    saveSettings(s) { set(STORE.SETTINGS, { ...this.getSettings(), ...s }); },

    /* —— 典籍（知识库） —— */
    getDocs: () => get(STORE.DOCS, []),
    setDocs(d) { set(STORE.DOCS, d); },
    addDoc(doc) {
      const docs = this.getDocs();
      doc.id = doc.id || 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      doc.createdAt = doc.createdAt || new Date().toISOString();
      docs.unshift(doc);
      this.setDocs(docs);
      return doc;
    },
    removeDoc(id) { this.setDocs(this.getDocs().filter(d => d.id !== id)); },

    /* —— 调用统计 —— */
    usage: () => get(STORE.USAGE, { logins: 0, calcs: 0, ai: 0, docs: 0 }),
    bump(key) { const u = this.usage(); u[key] = (u[key] || 0) + 1; set(STORE.USAGE, u); return u; },

    /* —— 历史 —— */
    getHistory: () => get(STORE.HISTORY, []),
    saveHistory(item) {
      const h = this.getHistory();
      h.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: Date.now(), ...item });
      set(STORE.HISTORY, h.slice(0, 300));
    },

    /* —— 聊天记录 —— */
    getChat: () => get(STORE.CHAT, []),
    saveChat(list) { set(STORE.CHAT, list.slice(-100)); },

    /* —— 工具 —— */
    esc(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); },
    show(el, on) { if (el) el.classList.toggle('show', on); },
    msg(el, text, type) { if (!el) return; el.textContent = text; el.className = 'msg show' + (type ? ' ' + type : ''); },
    hideMsg(el) { if (el) el.classList.remove('show'); },
    today() { return new Date().toISOString().slice(0, 10); },
    fmtTime(ts) { return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); },
    fmtDate(ts) { return new Date(ts).toLocaleDateString('zh-CN'); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  };

  global.XT = Core;
})(window);
