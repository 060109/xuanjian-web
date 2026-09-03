/* ============================================================
 * 玄天智算 · AI 智能引擎 ai-engine.js
 * 多模型（DeepSeek/OpenAI/Claude/Gemini/自定义）
 * 玄学融合管线：算法结果 → 典籍检索 → AI 生成
 * ============================================================ */
(function () {
  'use strict';

  const PROVIDERS = [
    { id: 'deepseek', name: 'DeepSeek', base: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', fmt: 'openai' },
    { id: 'openai', name: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', fmt: 'openai' },
    { id: 'claude', name: 'Claude', base: 'https://api.anthropic.com/v1/messages', model: 'claude-3-5-sonnet-latest', fmt: 'anthropic' },
    { id: 'gemini', name: 'Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/models', model: 'gemini-1.5-flash', fmt: 'gemini' },
    { id: 'custom', name: '自定义', base: '', model: '', fmt: 'openai' },
  ];

  function getCfg() {
    const s = XT.getSettings();
    const p = PROVIDERS.find(x => x.id === s.provider) || PROVIDERS[0];
    return {
      provider: p.id,
      providerName: p.name,
      base: (s.base || p.base || '').trim(),
      key: (s.key || '').trim(),
      model: (s.model || p.model || '').trim(),
      fmt: p.fmt,
      temperature: s.temperature != null ? s.temperature : 0.7,
    };
  }
  function hasModel() {
    const c = getCfg();
    return !!c.key && !!c.base && !!c.model;
  }

  /* —— 调用（按协议格式） —— */
  async function call(messages, opts = {}) {
    const c = getCfg();
    if (!c.key) throw new Error('尚未配置 AI 模型：请前往「设置」填写 API Key');
    if (!c.base) throw new Error('API 地址为空：请前往「设置」检查配置');
    if (!c.model) throw new Error('模型名称为空：请前往「设置」填写模型');

    const timeout = AbortSignal.timeout ? AbortSignal.timeout(90000) : undefined;

    if (c.fmt === 'anthropic') {
      const sys = messages.find(m => m.role === 'system')?.content || '';
      const rest = messages.filter(m => m.role !== 'system');
      const res = await fetch(c.base, {
        method: 'POST', signal: timeout,
        headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: c.model, max_tokens: opts.maxTokens || 1800,
          temperature: c.temperature,
          system: sys, messages: rest,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('Claude 调用失败(' + res.status + ')：' + JSON.stringify(data).slice(0, 200));
      return data.content?.[0]?.text || '';
    }

    if (c.fmt === 'gemini') {
      const sys = messages.find(m => m.role === 'system')?.content || '';
      const rest = messages.filter(m => m.role !== 'system');
      const contents = rest.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: (sys && m.role === 'user' ? sys + '\n\n' : '') + m.content }] }));
      const res = await fetch(`${c.base.replace(/\/$/, '')}/${c.model}:generateContent?key=${encodeURIComponent(c.key)}`, {
        method: 'POST', signal: timeout,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: c.temperature, maxOutputTokens: opts.maxTokens || 1800 } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error('Gemini 调用失败(' + res.status + ')：' + JSON.stringify(data).slice(0, 200));
      return data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    }

    /* openai 兼容（DeepSeek / OpenAI / 自定义） */
    const res = await fetch(c.base, {
      method: 'POST', signal: timeout,
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + c.key },
      body: JSON.stringify({
        model: c.model, messages, stream: false,
        temperature: c.temperature, max_tokens: opts.maxTokens || 1800,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error('AI 调用失败(' + res.status + ')：' + JSON.stringify(data).slice(0, 200));
    return data.choices?.[0]?.message?.content || '';
  }

  /* —— 玄学融合 prompt —— */
  const MASTER_PROMPT = `你是「玄天智算」的玄学大师 AI，精通八字、六爻、梅花易数、奇门遁甲、风水、姓名学、塔罗、紫微斗数等东方术数，熟读古籍经典。
回答规则（务必遵守）：
1. 优先依据「典籍依据」中的经典原文与论断进行解释，做到有据可依。
2. 结合「推演数据」中的算法结果展开分析。
3. 若典籍依据为空或不足，先明确说明「当前典籍库暂无相关内容，将结合 AI 辅助分析」，再以专业知识补充。
4. 语言典雅克制，像一位严谨的玄学研究者，不用夸张的营销话术。
5. 结构清晰：先给结论，再分点论证，最后给建议。`;

  /* 融合分析：query + 算法上下文 + 可选知识库检索 + 玄天记忆 */
  async function analyze({ query, algorithm = '', docs = null, maxTokens }) {
    XT.bump('ai');
    const kbContext = docs ? window.Knowledge.buildContext(window.Memory ? window.Memory.weightedQuery(query) : query, docs, 1600) : '';
    const mem = window.Memory ? window.Memory.context() : '';
    const messages = [{ role: 'system', content: MASTER_PROMPT }];
    let user = '';
    if (mem) user += '【玄天记忆】' + mem.slice(0, 300) + '\n\n';
    if (algorithm) user += '【推演数据】\n' + algorithm + '\n\n';
    user += '【典籍依据】\n' + (kbContext || '（当前典籍库暂无相关内容，将结合 AI 辅助分析）') + '\n\n';
    user += '【用户提问】\n' + query;
    messages.push({ role: 'user', content: user });
    return call(messages, { maxTokens });
  }

  /* —— 普通对话（ai.html 终端） —— */
  async function chat(messages) {
    XT.bump('ai');
    return call(messages);
  }

  /* —— 典籍问答（限定知识库） —— */
  async function askKnowledge(query) {
    XT.bump('ai');
    const docs = await window.Knowledge.loadAll();
    const kbContext = window.Knowledge.buildContext(query, docs, 2000);
    const messages = [
      { role: 'system', content: MASTER_PROMPT },
      { role: 'user', content: '【典籍依据】\n' + (kbContext || '（当前典籍库暂无相关内容，将结合 AI 辅助分析）') + '\n\n【用户提问】\n' + query },
    ];
    return call(messages);
  }

  /* —— 内置解读兜底（无需大模型）：结合算法推演 + 典籍检索 —— */
  function fallback({ result, query, module }) {
    const lines = [];
    lines.push('【玄天内置详解】');
    lines.push('基于玄学算法推演与典籍知识库生成，无需依赖大模型。');
    if (result && result.text) {
      lines.push('────────────────');
      lines.push(result.text);
    }
    if (query) {
      lines.push('────────────────');
      lines.push('【你问】' + query);
      lines.push('【回答】' + (function () {
        const q = String(query);
        if (/(什么|如何|怎么|为什么|吉凶|好坏|行不行|可以|建议)/.test(q)) {
          return '可结合上方推演自行参详；如需更深入解读，请前往「设置」配置 AI 大模型。';
        }
        return '详看上节推演。如需结合天地时运深度剖析，请前往「设置」配置 AI 大模型。';
      })());
    }
    return lines.join('\n');
  }

  window.AIEngine = { PROVIDERS, getCfg, hasModel, call, analyze, chat, askKnowledge, fallback };
})();
