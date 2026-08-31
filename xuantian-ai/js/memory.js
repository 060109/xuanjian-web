/* ============================================================
 * 玄天智算 · 学习记忆系统 memory.js
 * 行为学习（使用频率/主题偏好）+ 事实记忆（生辰/姓名/生肖等）
 * + 记忆注入（表单预填 / AI 上下文 / 检索加权）
 * 全部本地存储，零后端
 * ============================================================ */
(function () {
  'use strict';

  const KEY = 'xt_profile';
  const MODULE_NAMES = {
    bazi: '八字', tarot: '塔罗', liuyao: '六爻', meihua: '梅花', qimen: '奇门',
    fengshui: '风水', xingming: '姓名', ziwei: '紫微', shengxiao: '生肖', shuzi: '数字', meiri: '每日', mianxiang: '面相',
  };

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || empty(); } catch (e) { return empty(); }
  }
  function empty() {
    return { usage: {}, topics: {}, facts: {}, last: {} };
  }
  function set(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  /* 提取输入中的"事实记忆" */
  function extractFacts(module, input) {
    const f = {};
    if (input) {
      if (input.gender) f.gender = input.gender === 'male' ? '乾造（男）' : '坤造（女）';
      if (input.year && input.month && input.day) f.birth = `${input.year}年${input.month}月${input.day}日${input.hour != null ? ' ' + input.hour + '时' : ''}`;
      if (input.name) f.name = input.name;
      if (input.shengxiao) f.shengxiao = input.shengxiao;
      if (input.direction) f.direction = input.direction;
      if (input.question) f.topic = input.question;
    }
    return f;
  }

  /* 学习：记录一次使用 */
  function record(module, input) {
    const p = get();
    p.usage[module] = (p.usage[module] || 0) + 1;
    /* 事实记忆（保留最近一次） */
    const facts = extractFacts(module, input);
    Object.entries(facts).forEach(([k, v]) => {
      if (v && String(v).trim()) p.facts[k] = String(v).trim();
    });
    /* 主题偏好（问题关键词加权） */
    if (input && input.question) {
      const toks = String(input.question).split(/[\s,，。;；、？?]+/).filter(t => t.length >= 2);
      toks.forEach(t => { p.topics[t] = (p.topics[t] || 0) + 1; });
    }
    p.last = { module, at: Date.now() };
    set(p);
    return p;
  }

  /* 高频使用模块 */
  function topModules(n = 3) {
    return Object.entries(get().usage).sort((a, b) => b[1] - a[1]).slice(0, n);
  }
  /* 高频主题词 */
  function topTopics(n = 5) {
    return Object.entries(get().topics).sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  /* 供 AI 的记忆上下文 */
  function context() {
    const p = get();
    const parts = [];
    const f = p.facts;
    if (f.birth) parts.push('此君生辰：' + f.birth + (f.gender ? '（' + f.gender + '）' : ''));
    if (f.name) parts.push('此君曾询姓名：' + f.name);
    if (f.shengxiao) parts.push('此君生肖：' + f.shengxiao);
    const tops = topTopics(3);
    if (tops.length) parts.push('此君近期关注：' + tops.map(t => t[0]).join('、'));
    const mods = topModules(2);
    if (mods.length) parts.push('常用模块：' + mods.map(m => MODULE_NAMES[m[0]] || m[0]).join('、'));
    return parts.length ? '【玄天记忆·用户画像】' + parts.join('；') + '。' : '';
  }

  /* 表单预填（返回事实值） */
  function fact(key) { return get().facts[key] || ''; }
  function prefill(module, fieldMap) {
    const f = get().facts;
    Object.entries(fieldMap).forEach(([factKey, id]) => {
      const el = document.getElementById(id);
      if (el && f[factKey]) {
        if (el.tagName === 'SELECT') {
          const val = f[factKey];
          const opts = Array.from(el.options).map(o => o.value);
          if (opts.includes(val)) el.value = val;
        } else if (el.type === 'checkbox') { el.checked = true; }
        else el.value = f[factKey];
      }
    });
  }

  /* 检索加权：把记忆主题加入查询 */
  function weightedQuery(base) {
    const topics = topTopics(3).map(t => t[0]);
    const extra = topics.filter(t => t.length >= 2 && !base.includes(t)).slice(0, 2);
    return extra.length ? (base + ' ' + extra.join(' ')).trim() : base;
  }

  window.Memory = { get, record, context, fact, prefill, topModules, topTopics, weightedQuery, KEY };
})();
