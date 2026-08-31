/* ============================================================
 * 玄天智算 · 知识库系统 knowledge.js
 * 上传解析（TXT/MD/DOC 直读，PDF 经 pdf.js）/ 自动分类 / 索引 / 检索
 * ============================================================ */
(function () {
  'use strict';

  /* 分类关键词表 */
  const CATEGORY_RULES = [
    { cat: '八字命理', kw: ['滴天髓', '三命通会', '渊海子平', '穷通宝鉴', '子平', '十神', '格局', '日主', '大运', '命理', '八字'] },
    { cat: '六爻梅花', kw: ['梅花易数', '六爻', '卦象', '爻辞', '体用', '起卦', '装卦', '世应'] },
    { cat: '奇门遁甲', kw: ['奇门', '遁甲', '八门', '九星', '八神', '九宫', '值符'] },
    { cat: '周易经传', kw: ['周易', '易经', '乾卦', '坤卦', '爻辞', '系辞', '彖'] },
    { cat: '风水堪舆', kw: ['风水', '阳宅', '阴宅', '堪舆', '坐向', '龙脉', '明堂', '宅经'] },
    { cat: '塔罗占卜', kw: ['塔罗', '大阿卡纳', '小阿卡纳', '牌阵', '权杖', '圣杯', '星币', '宝剑'] },
    { cat: '紫微斗数', kw: ['紫微', '斗数', '星曜', '命宫', '身宫', '天府', '十四主星'] },
    { cat: '姓名学', kw: ['姓名', '五格', '三才', '数理', '笔画', '姓名学'] },
  ];
  const DEFAULT_CAT = '术数综合';

  function classify(title, content) {
    const blob = (title + ' ' + (content || '')).slice(0, 4000);
    let best = null, bestScore = 0;
    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const k of rule.kw) if (blob.includes(k)) score += 1;
      if (score > bestScore) { bestScore = score; best = rule.cat; }
    }
    return bestScore > 0 ? best : DEFAULT_CAT;
  }

  /* 简单标签提取：命中分类词 + 高频双字词 */
  function extractTags(title, content) {
    const tags = new Set();
    const blob = title + ' ' + content;
    for (const rule of CATEGORY_RULES) {
      for (const k of rule.kw) if (blob.includes(k)) { tags.add(k); break; }
    }
    const re = /[\u4e00-\u9fa5]{2}/g;
    const freq = {};
    let m;
    while ((m = re.exec(content || '')) && Object.keys(freq).length < 400) {
      freq[m[0]] = (freq[m[0]] || 0) + 1;
    }
    Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([w]) => {
      if (!/的|了|是|在|与|和|也|而|之/.test(w)) tags.add(w);
    });
    return Array.from(tags).slice(0, 10);
  }

  /* 内容分块（供检索用） */
  function chunk(content, size = 400) {
    const cleaned = (content || '').replace(/\r/g, '').trim();
    if (!cleaned) return [];
    const paras = cleaned.split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean);
    const chunks = [];
    let buf = '';
    for (const p of paras) {
      if ((buf + p).length > size && buf) { chunks.push(buf); buf = p; }
      else buf = buf ? buf + '\n' + p : p;
    }
    if (buf) chunks.push(buf);
    return chunks;
  }

  /* —— 文件解析 —— */
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('读取文件失败'));
      r.readAsText(file, 'utf-8');
    });
  }
  function readPdf(file) {
    return new Promise((resolve, reject) => {
      const loadPdfJs = () => {
        if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
        return new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); };
          s.onerror = () => rej(new Error('PDF 解析库加载失败（需联网）'));
          document.head.appendChild(s);
        });
      };
      loadPdfJs().then(async (pdfjs) => {
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        let text = '';
        for (let i = 1; i <= Math.min(doc.numPages, 120); i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          text += tc.items.map(it => it.str).join('') + '\n';
        }
        resolve(text.trim());
      }).catch(reject);
    });
  }

  async function parseFile(file) {
    const name = file.name || '未命名典籍';
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) {
      const content = await readPdf(file);
      return { title: name.replace(/\.pdf$/i, ''), content };
    }
    if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.doc')) {
      const content = await readFileAsText(file);
      if (lower.endsWith('.doc') && !content && lower.endsWith('.doc')) {
        // .doc 二进制：提示转存
        throw new Error('旧版 .doc 为二进制格式，请另存为 .txt 或 .docx 后上传');
      }
      return { title: name.replace(/\.(txt|md|markdown|doc)$/i, ''), content };
    }
    throw new Error('暂不支持该文件类型，支持：PDF / TXT / MD / DOC');
  }

  /* —— 知识库集合（内置 + 用户上传） —— */
  async function loadAll() {
    let builtin = [];
    try {
      const r = await fetch('data/classics.json');
      builtin = (await r.json()).classics || [];
    } catch (e) { /* 内置缺失时忽略 */ }
    const user = XT.getDocs();
    return builtin.map(d => ({ ...d, builtin: true })).concat(user.map(d => ({ ...d, builtin: false })));
  }

  /* —— 检索：关键词打分 —— */
  function search(query, docs, limit = 5) {
    const q = (query || '').trim();
    if (!q) return [];
    const tokens = q.split(/[\s,，。;；、]+/).filter(t => t.length >= 2);
    const results = [];
    for (const doc of docs) {
      const titleHit = tokens.filter(t => (doc.title || '').includes(t)).length;
      const bodyHit = tokens.filter(t => (doc.content || '').includes(t)).length;
      const tagHit = (doc.tags || []).filter(t => tokens.some(qt => t.includes(qt) || qt.includes(t))).length;
      const score = titleHit * 4 + tagHit * 3 + bodyHit * 2;
      if (score > 0) {
        results.push({ doc, score, chunks: chunk(doc.content || '') });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /* 取最相关片段（拼给 AI） */
  function buildContext(query, docs, maxLen = 1400) {
    const hits = search(query, docs, 3);
    if (!hits.length) return '';
    const parts = [];
    for (const h of hits) {
      let used = false;
      for (const c of h.chunks) {
        if (tokensMatch(query, c)) { parts.push(`【${h.doc.title}】${c}`); used = true; break; }
      }
      if (!used && h.chunks[0]) parts.push(`【${h.doc.title}】${h.chunks[0]}`);
    }
    let out = parts.join('\n\n');
    return out.slice(0, maxLen);
  }
  function tokensMatch(q, text) {
    const toks = q.split(/[\s,，。;；、]+/).filter(t => t.length >= 2);
    return toks.some(t => text.includes(t));
  }

  window.Knowledge = { classify, extractTags, chunk, parseFile, loadAll, search, buildContext };
})();
