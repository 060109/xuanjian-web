/* ============================================================
 * 玄天智算 · 玄学算法引擎（增强版） engine-functions.js
 * 十二模块内置深度推演：算法 + 典籍知识 + 结构化详析
 * 不依赖大模型时，输出同样丰富、分点、有依据
 * ============================================================ */
(function () {
  'use strict';
  const A = window.ALGO;

  /* ---------- 通用工具 ---------- */
  const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const WX_ATTR = {
    木: { t: '仁德生发', s: '宜进取、学习、拓展，木性向上，生机蓬勃。', c: '忌过度消耗元气，宜养肝护目。' },
    火: { t: '礼明通达', s: '宜展现才华、热忱待人，火性明亮，声名可立。', c: '忌急躁冲动，宜静心守神。' },
    土: { t: '信厚承载', s: '宜稳中求进、脚踏实地，土性厚重，基业可固。', c: '忌固步自封，宜广纳良言。' },
    金: { t: '义断刚决', s: '宜定夺大事、锐意革新，金性肃杀，主掌权威。', c: '忌过刚易折，宜以柔济刚。' },
    水: { t: '智润周流', s: '宜出行交际、谋略规划，水性灵动，财路可通。', c: '忌泛滥无归，宜定志守一。' },
  };
  function stars(n, max = 7) { return '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n)); }
  function sections(list) { return list.filter(Boolean).map(s => '· ' + s).join('\n'); }

  /* ---------- 1. 八字命理（增强） ---------- */
  function runBazi(input) {
    const r = A.calcBazi(input);
    const dy = r.dayun || {};
    const a = r.analysis || {};
    // 喜用神：取最少的两行五行（身弱扶身、身强泄克）
    const wxs = r.wuxing || {};
    const sorted = Object.entries(wxs).sort((x, y) => x[1] - y[1]);
    const weakest = sorted.slice(0, 2).map(x => x[0]);
    const strongest = sorted.slice(-1)[0] ? sorted[sorted.length - 1][0] : '土';
    const xi = r.strength === '身弱' ? weakest : (r.strength === '身强' ? [strongest, Object.keys(wxs).find(k => k !== strongest) || '土'] : weakest);
    // 流年简推（起运后每 10 年一柱）
    const liunian = (dy.list || []).slice(0, 3).map((x, i) => `${x.startYear}–${(x.startYear || 0) + 9} 行 ${x.ganzhi || (x.gan + x.zhi)}${i === 0 ? '（当下）' : ''}`).join('；');
    const text = [
      `【四柱】${['年', '月', '日', '时'].map((k, i) => k + r.pillars[['year', 'month', 'day', 'hour'][i]].gan + r.pillars[['year', 'month', 'day', 'hour'][i]].zhi).join(' ')}（生肖${r.shengXiao}）`,
      `【日主】${r.dayGan}${r.dayGanWX} · ${r.strength} · 格局 ${r.pattern}`,
      `【五行】${Object.entries(wxs).map(([k, v]) => `${k}${v}`).join(' ')}`,
      `【喜用】五行喜 ${xi.join('、')}，宜补其气，以助平衡。`,
      `【性情】${a.personality || ''}`,
      `【事业】${a.career || ''}`,
      `【财运】${a.wealth || ''}`,
      `【健康】${a.health || ''}`,
      `【大运】${dy.direction || ''}行 · ${dy.startAge != null ? dy.startAge + '岁起运' : ''}${liunian ? '；近期：' + liunian : ''}`,
    ].join('\n');
    return wrap('bazi', r, text, `【八字排盘】${input.year}年${input.month}月${input.day}日${input.hour}时${input.gender === 'male' ? '乾造' : '坤造'}。四柱：${['年', '月', '日', '时'].map((k, i) => r.pillars[['year', 'month', 'day', 'hour'][i]].gan + r.pillars[['year', 'month', 'day', 'hour'][i]].zhi).join('，')}；日主${r.dayGan}${r.dayGanWX}${r.strength}，格局${r.pattern}；五行${Object.entries(wxs).map(([k, v]) => `${k}${v}`).join(' ')}；喜${xi.join('、')}；${dy.direction}行大运${dy.startAge != null ? dy.startAge + '岁起' : ''}。`);
  }

  /* ---------- 2. 塔罗占卜（增强） ---------- */
  function runTarot(input) {
    const cards = A.drawSpread(input.spread);
    const spread = (A.SPREADS || []).find(s => s.id === input.spread) || { name: input.spread, positions: [] };
    const rev = cards.filter(c => c.reversed).length;
    const energy = rev === 0 ? '牌面全正，能量顺畅，事态明朗。' : rev === cards.length ? '牌面全逆，时局阻滞，宜内省转圜。' : `正位${cards.length - rev} / 逆位${rev}，吉凶交织，宜权衡而行。`;
    const lines = cards.map((c, i) => `${spread.positions[i] || '位置' + (i + 1)}：${c.name || c.card}（${c.reversed ? '逆位' : '正位'}）\n　　${A.cardMeaning(c) || ''}`);
    const text = [
      `【牌阵】${spread.name}${input.question ? ' · 问：「' + input.question + '」' : ''}`,
      ...lines,
      `【整体】${energy}`,
      `【建议】${rev >= cards.length / 2 ? '当下宜缓：暂停决策，回望初心，先理内因。' : '当下宜行：把握时机，果断推进，顺势而为。'}`,
    ].join('\n');
    return wrap('tarot', { cards, spread }, text, `【塔罗抽牌】牌阵${spread.name}。${cards.map((c, i) => `${spread.positions[i] || '位' + (i + 1)}位${c.name || c.card}${c.reversed ? '逆位' : '正位'}`).join('，')}。${energy}`);
  }

  /* ---------- 3. 六爻预测（增强） ---------- */
  function runLiuyao(input) {
    let r;
    if (input.method === 'time') r = A.timeCast(input.year, input.month, input.day, input.hour);
    else if (input.method === 'number') r = A.numberCast([input.n1, input.n2, input.n3]);
    else r = A.autoCast();
    const moving = (r.movingYao || []).length;
    const guaText = [
      `【起卦】${r.method}${input.question ? ' · 问：「' + input.question + '」' : ''}`,
      `【卦象】本卦 ${r.benGua?.name || ''}${r.bianGua ? ' → 变卦 ' + r.bianGua.name : ''}`,
      r.shiYao ? `【世应】世爻${r.shiYao}（我），应爻${r.yingYao}（他/事）` : '',
      `【动爻】${moving ? '动爻第 ' + (r.movingYao || []).join('、') + ' 爻，事有变动之机。' : '六爻安静，事态平稳，暂无大变。'}`,
      r.relation ? `【体用】${r.relation}` : '',
      `【断语】${r.conclusion || ''}`,
      `【行止】${moving === 0 ? '静守其位，谋定后动。' : moving >= 3 ? '多爻发动，变化迭起，宜守不宜攻。' : '一爻独动，专事专应，宜把握关键。'}`,
    ];
    const text = guaText.filter(Boolean).join('\n');
    return wrap('liuyao', r, text, `【六爻排盘】${r.method}起卦。本卦${r.benGua?.name || ''}${r.bianGua ? '，变卦' + r.bianGua.name : ''}；世爻${r.shiYao || '—'}应爻${r.yingYao || '—'}；动爻：${(r.movingYao || []).join('、') || '无'}；体用${r.relation || '—'}；卦断：${r.conclusion || ''}`);
  }

  /* ---------- 4. 梅花易数（增强） ---------- */
  const XIAN_TIAN = { 1: ['乾', '金', '天'], 2: ['兑', '金', '泽'], 3: ['离', '火', '火'], 4: ['震', '木', '雷'], 5: ['巽', '木', '风'], 6: ['坎', '水', '水'], 7: ['艮', '土', '山'], 8: ['坤', '土', '地'] };
  const GUA_MEANING = { 乾: '刚健进取，自强不息', 兑: '喜悦沟通，和悦相处', 离: '光明附丽，洞察显达', 震: '震动奋发，雷厉风行', 巽: '顺入渗透，谦逊渐进', 坎: '险陷流动，慎行守正', 艮: '止静安守，厚积薄发', 坤: '柔顺包容，厚德载物' };
  function runMeihua(input) {
    const n1 = ((input.n1 % 8) + 8) % 8 || 8;
    const n2 = ((input.n2 % 8) + 8) % 8 || 8;
    const dong = ((input.n3 % 6) + 6) % 6 || 6;
    const up = XIAN_TIAN[n1], down = XIAN_TIAN[n2];
    const tiNum = dong <= 3 ? n1 : n2, yongNum = dong <= 3 ? n2 : n1;
    const tiWx = XIAN_TIAN[tiNum][1], yongWx = XIAN_TIAN[yongNum][1];
    let guanxi, verdict;
    if (SHENG[yongWx] === tiWx) { guanxi = '用生体'; verdict = '大吉：事有外助，顺水行舟，贵人将至。'; }
    else if (SHENG[tiWx] === yongWx) { guanxi = '体生用'; verdict = '平中带耗：己方付出较多，宜量力而行，莫要强求。'; }
    else if (KE[tiWx] === yongWx) { guanxi = '体克用'; verdict = '小吉：事在掌握，可化被动为主动，宜果断出击。'; }
    else if (KE[yongWx] === tiWx) { guanxi = '用克体'; verdict = '凶中藏机：外阻内忧，宜静不宜动，先避锋芒。'; }
    else { guanxi = '比和'; verdict = '吉：和顺同气，事态平稳，谋为有成。'; }
    const text = [
      `【起卦】${input.n1}、${input.n2}、${input.n3} → 上卦${up[0]}（${up[2]}）· 下卦${down[0]}（${down[2]}）· 动爻第${dong}爻`,
      `【本象】${up[0]}为${GUA_MEANING[up[0]]}；${down[0]}为${GUA_MEANING[down[0]]}。`,
      `【体用】体卦${XIAN_TIAN[tiNum][0]}（${tiWx}） · 用卦${XIAN_TIAN[yongNum][0]}（${yongWx}） · ${guanxi}`,
      `【断语】${verdict}`,
      `【行止】${tiWx === '火' || tiWx === '木' ? '体旺于用，主动进取可成。' : tiWx === '水' ? '宜谋定后动，以智取胜。' : '宜稳守根基，伺机而动。'}`,
    ].join('\n');
    const data = { up: up[0], down: down[0], dong, ti: XIAN_TIAN[tiNum][0], yong: XIAN_TIAN[yongNum][0], tiWx, yongWx, guanxi };
    return wrap('meihua', data, text, `【梅花易数】${input.n1}、${input.n2}、${input.n3}起卦：上${up[0]}下${down[0]}动爻${dong}。体卦${XIAN_TIAN[tiNum][0]}${tiWx}，用卦${XIAN_TIAN[yongNum][0]}${yongWx}，${guanxi}。${verdict}`);
  }

  /* ---------- 5. 奇门遁甲（增强） ---------- */
  const MEN_LUCK = { 休: '吉门，宜休养谋略', 生: '吉门，宜生财进取', 开: '吉门，宜开创远行', 杜: '凶门，宜守不宜进', 景: '平门，宜文书宣传', 死: '凶门，宜止不宜动', 惊: '凶门，宜慎防口舌', 伤: '凶门，宜防损耗争执' };
  function runQimen(input) {
    const r = A.castQimen(input.year, input.month, input.day, input.hour);
    const palaces = r.palaces || r.pan || [];
    const doors = (palaces || []).map(p => p.door || p.men || '').filter(Boolean);
    const jime = doors.filter(d => ['休', '生', '开'].includes(d)).length;
    const xiong = doors.filter(d => ['死', '惊', '伤', '杜'].includes(d)).length;
    const menTips = doors.slice(0, 4).map(d => (MEN_LUCK[d] ? `${d}门：${MEN_LUCK[d]}` : '')).filter(Boolean);
    const text = [
      `【局盘】${input.year}年${input.month}月${input.day}日${input.hour}时${r.ganzhi ? ' · ' + r.ganzhi : ''}`,
      `【八门】${doors.join('、') || '—'}`,
      `【门断】${jime >= 2 ? '吉门居多，时运向顺，宜趁势而为。' : xiong >= 3 ? '凶门偏多，诸事宜缓，择吉再动。' : '吉凶参半，谋事在人和，宜审慎择机。'}`,
      ...menTips,
      r.summary || r.conclusion ? `【总断】${r.summary || r.conclusion}` : '',
      `【用神】${jime >= 2 ? '宜选休/生/开三门方向行事，事半功倍。' : '宜待凶门退转，或择日再起一局。'}`,
    ].filter(Boolean).join('\n');
    return wrap('qimen', r, text, `【奇门遁甲】${input.year}年${input.month}月${input.day}日${input.hour}时${r.ganzhi ? '，' + r.ganzhi : ''}。八门：${doors.join('、') || '—'}。${jime >= 2 ? '吉门居多' : xiong >= 3 ? '凶门偏多' : '吉凶参半'}。${r.summary || r.conclusion || ''}`);
  }

  /* ---------- 6. 风水分析（增强） ---------- */
  const FENG = {
    east: { wx: '木', tip: '东震位木旺文昌：宜书房、绿植、青碧之色；忌金属重器压东方。', good: ['书房设东，文昌利考学', '东侧开窗纳晨气', '置绿植旺生机'], bad: ['忌金属刀剑正对东方', '忌东墙阴暗潮湿'] },
    south: { wx: '火', tip: '南离位火明财名：宜采光、红色点缀；忌水火相冲（厨房对厕所）。', good: ['南向采光保持明亮', '客厅朝南聚人气', '红暖色点缀旺名望'], bad: ['忌厨房与卫浴相对', '忌南窗被高楼直冲'] },
    west: { wx: '金', tip: '西兑位金锐主武：宜储物、金属摆件；忌杂乱堆积。', good: ['西侧设储物收纳', '金属器皿置西旺权', '西墙宜实不宜虚'], bad: ['忌西面堆放杂物', '忌西窗对尖角'] },
    north: { wx: '水', tip: '北坎位水润主智：宜静思、水景鱼缸；忌堵塞淤滞。', good: ['北侧设书房静思', '鱼缸置北旺财智', '北窗通风利气'], bad: ['忌北面杂物堵塞', '忌厕所压北方'] },
    center: { wx: '土', tip: '中宫为土：宜宽敞明亮，忌重压拥堵（如大梁、大柜压中）。', good: ['中宫保持空阔', '置灯明亮旺家运', '地面平整利气行'], bad: ['忌大件重物压中', '忌中宫脏乱'] },
  };
  function runFengshui(input) {
    const d = FENG[input.direction] || FENG.center;
    const text = [
      `【宅向】${input.directionName || input.direction}（五行属${d.wx}）${input.address ? ' · ' + input.address : ''}`,
      `【要领】${d.tip}`,
      `【宜】${d.good.map(x => '√ ' + x).join('\n　　')}`,
      `【忌】${d.bad.map(x => '× ' + x).join('\n　　')}`,
      '【通论】门为气口宜通、厨为养命之源宜净、卧房宜静宜藏、明堂宜阔宜亮。路冲、反弓、尖角皆为凶形，宜以屏风、绿植化解。',
    ].join('\n');
    return wrap('fengshui', { ...d, direction: input.direction, address: input.address || '' }, text, `【风水分析】方位${input.directionName || input.direction}五行${d.wx}。${d.tip}${d.good.join('。')}。${d.bad.join('。')}`);
  }

  /* ---------- 7. 姓名学（增强） ---------- */
  function runXingming(input) {
    const r = A.analyzeName(input.name);
    const wg = r.wuge || r.fiveGrids || {};
    const wgLine = [['天格', 'tian'], ['人格', 'ren'], ['地格', 'di'], ['外格', 'wai'], ['总格', 'zong']]
      .map(([cn, k]) => `${cn}${wg[k] != null ? (wg[k].num ?? wg[k].value ?? wg[k]) : wg[cn] != null ? wg[cn] : '—'}`).join(' ');
    const sc = r.score != null ? r.score : 60;
    const text = [
      `【姓名】${input.name}`,
      `【五格】${wgLine}`,
      `【数理】综合 ${sc} 分${sc >= 90 ? '：数理上佳，格局清正。' : sc >= 75 ? '：数理中上，平稳可用。' : sc >= 60 ? '：数理平正，尚需斟酌。' : '：数理欠佳，可参考建议改名。'}`,
      r.sancai ? `【三才】${typeof r.sancai === 'string' ? r.sancai : JSON.stringify(r.sancai)}` : '',
      `【建议】${r.suggestion || r.advice || '数理为辅，心性为本，宜综合考量。'}`,
    ].filter(Boolean).join('\n');
    return wrap('xingming', r, text, `【姓名学】「${input.name}」五格${wgLine}，评分${sc}分。${r.suggestion || r.advice || ''}`);
  }

  /* ---------- 8. 紫微斗数（预留） ---------- */
  function runZiwei(input) {
    return wrap('ziwei', { status: 'preview' }, '紫微斗数排盘引擎建设中。当前可先行体验八字、六爻、奇门等模块。', '【紫微斗数】预留接口：功能建设中，请告知用户并建议体验其他模块。');
  }

  /* ---------- 9. 生肖运势（大幅增强） ---------- */
  const SX_INFO = {
    鼠: { wx: '水', t: '聪慧机敏', c: '宜交际谋略，忌锋芒过露', j: ['事业：贵人暗助，宜主动联络', '财运：正财平稳，偏财慎取', '感情：温和沟通，忌多疑', '健康：注意作息，护腰肾'] },
    牛: { wx: '土', t: '勤恳笃实', c: '宜稳扎稳打，忌固执己见', j: ['事业：耕耘有获，宜深耕本职', '财运：积少成多，宜储蓄理财', '感情：细水长流，宜坦诚相待', '健康：劳逸结合，护脾胃'] },
    虎: { wx: '木', t: '果敢开拓', c: '宜展现魄力，忌冲动冒险', j: ['事业：敢于担当，宜抓大放小', '财运：进账可期，忌贪多求快', '感情：主动热情，忌强势压人', '健康：情绪平稳，护肝胆'] },
    兔: { wx: '木', t: '温婉机巧', c: '宜以柔克刚，忌优柔寡断', j: ['事业：贵人提携，宜借势而上', '财运：细水长流，宜稳妥打理', '感情：温柔以待，宜多些表达', '健康：情绪调达，护肝目'] },
    龙: { wx: '土', t: '气度恢弘', c: '宜胸怀大局，忌好高骛远', j: ['事业：威望渐立，宜立目标', '财运：财源广进，宜开源节流', '感情：热情真挚，忌大男子气', '健康：张弛有度，护心脏'] },
    蛇: { wx: '火', t: '深谋远虑', c: '宜运筹帷幄，忌多疑封闭', j: ['事业：谋定后动，宜蓄势而发', '财运：偏财有缘，宜见好就收', '感情：深情内敛，宜多沟通', '健康：心火宜平，护心脉'] },
    马: { wx: '火', t: '奔放进取', c: '宜一往无前，忌急躁冒进', j: ['事业：进展神速，宜专注一事', '财运：动中求财，宜见机行事', '感情：热烈真诚，忌三心二意', '健康：充沛之余，护心神'] },
    羊: { wx: '土', t: '温良亲和', c: '宜以和为贵，忌随波逐流', j: ['事业：稳步上升，宜发挥所长', '财运：平稳有余，宜规划长远', '感情：温柔体贴，忌优柔', '健康：脾胃调和，宜规律饮食'] },
    猴: { wx: '金', t: '灵动多智', c: '宜随机应变，忌锋芒毕露', j: ['事业：点子频出，宜落实行动', '财运：机遇颇多，宜稳中求进', '感情：风趣幽默，忌玩世不恭', '健康：精神旺盛，护肺气'] },
    鸡: { wx: '金', t: '精明干练', c: '宜恪守本分，忌苛求于人', j: ['事业：表现亮眼，宜谦逊待人', '财运：正财兴旺，宜精打细算', '感情：直率真诚，忌口舌之争', '健康：注意咽喉，宜润肺'] },
    狗: { wx: '土', t: '忠义守信', c: '宜肝胆相照，忌钻牛角尖', j: ['事业：口碑日隆，宜借力团队', '财运：稳定向吉，宜守成拓新', '感情：忠诚可靠，宜多些浪漫', '健康：情绪舒畅，护肠胃'] },
    猪: { wx: '水', t: '豁达宽厚', c: '宜随遇而安，忌安于现状', j: ['事业：贵人环绕，宜主动求变', '财运：财来有方，宜合理支配', '感情：温柔包容，忌懒于经营', '健康：体态丰润，宜适度运动'] },
  };
  function runShengxiao(input) {
    const sx = input.shengxiao || ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'][(input.year - 4) % 12];
    const info = SX_INFO[sx] || SX_INFO.鼠;
    const luck = 3 + Math.floor(Math.random() * 5);
    const text = [
      `【生肖】${sx} · 五行${info.wx} · ${info.t}`,
      `【运势】${stars(luck)}（${luck}/7）`,
      ...info.j,
      `【指引】${info.c}。${WX_ATTR[info.wx] ? WX_ATTR[info.wx].s : ''}`,
    ].join('\n');
    return wrap('shengxiao', { shengxiao: sx, wuxing: info.wx, luck }, text, `【生肖运势】生肖${sx}五行${info.wx}，${info.t}。今日运势${luck}/7。${info.j.join('；')}。${info.c}。`);
  }

  /* ---------- 10. 数字能量（增强） ---------- */
  const NUM_WX = { 1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火', 0: '土' };
  function runShuzi(input) {
    const n = String(input.number || '');
    const digits = n.split('').filter(d => d !== '');
    const wxs = digits.map(d => NUM_WX[d] || '土');
    const count = {};
    wxs.forEach(w => { count[w] = (count[w] || 0) + 1; });
    const dom = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    const attr = WX_ATTR[dom ? dom[0] : '土'] || WX_ATTR.土;
    const text = [
      `【数字】${n}（${digits.map((d, i) => `${d}${wxs[i]}`).join(' ')}）`,
      `【五行分布】${Object.entries(count).map(([k, v]) => `${k}×${v}`).join(' ')}`,
      `【主导能量】${dom ? dom[0] + ' · ' + attr.t : '—'}`,
      `【性格倾向】${attr.s}`,
      `【使用建议】${attr.c}；${dom && dom[0] === '金' ? '适合用作号码尾数、决策数字。' : dom && dom[0] === '木' ? '适合用作学号、增长类数字。' : dom && dom[0] === '水' ? '适合用作财位、流通类数字。' : dom && dom[0] === '火' ? '适合用作名望、展示类数字。' : '适合用作稳固、存储类数字。'}`,
    ].join('\n');
    return wrap('shuzi', { number: n, wuxing: wxs, count, dominant: dom && dom[0] }, text, `【数字能量】「${n}」五行${wxs.join('、')}，主导${dom ? dom[0] : '无'}（${attr.t}）。`);
  }

  /* ---------- 11. 每日运势（增强） ---------- */
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  function dayGanzhi(ts) {
    const d = ts ? new Date(ts) : new Date();
    const jdn = Math.floor(d.getTime() / 86400000) + 2440587.5;
    const off = Math.floor(jdn + 49) % 60;
    return GAN[off % 10] + ZHI[off % 12];
  }
  const YI = ['祈福', '出行', '会友', '修造', '入学', '纳财', '安床', '订盟', '栽种', '开市', '祭祀', '沐浴'];
  const JI = ['动土', '破土', '开仓', '远行', '诉讼', '行丧', '探病', '合账'];
  function runMeiri(input) {
    const gz = dayGanzhi(input.date);
    const wx = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' }[gz[0]];
    const luck = 3 + Math.floor(Math.random() * 5);
    const yi = YI.slice(0, 3 + Math.floor(Math.random() * 2)).join('、');
    const ji = JI.slice(0, 2 + Math.floor(Math.random() * 2)).join('、');
    const goodHour = Math.floor(Math.random() * 3) + 1;
    const luckyColor = { 木: '青绿', 火: '朱红', 土: '土黄', 金: '银白', 水: '玄黑' }[wx];
    const text = [
      `【日柱】今日干支 ${gz}（${wx}日）`,
      `【运势】${stars(luck)}（${luck}/7）`,
      `【宜】${yi}`,
      `【忌】${ji}`,
      `【吉时】${goodHour}、${goodHour + 5}、${goodHour + 10} 时`,
      `【开运】幸运色 ${luckyColor}，幸运方向 ${['东', '南', '西', '北'][Math.floor(Math.random() * 4)]}`,
      `【指引】${WX_ATTR[wx] ? WX_ATTR[wx].s + WX_ATTR[wx].c : ''}`,
    ].join('\n');
    return wrap('meiri', { ganzhi: gz, wuxing: wx, luck }, text, `【每日运势】今日干支${gz}（${wx}日），运势${luck}/7。宜${yi}，忌${ji}。`);
  }

  /* ---------- 12. 面相分析（预留） ---------- */
  function runMianxiang() {
    return wrap('mianxiang', { status: 'preview' }, '面相分析模块规划中：将支持上传照片，由 AI 视觉解析三停五岳、气色神采。当前可体验八字、塔罗等模块。', '【面相分析】预留接口：功能建设中，请告知用户。');
  }

  function wrap(module, data, text, aiContext) {
    return { module, data, text, aiContext };
  }

  window.Engine = {
    bazi: runBazi, tarot: runTarot, liuyao: runLiuyao, meihua: runMeihua, qimen: runQimen,
    fengshui: runFengshui, xingming: runXingming, ziwei: runZiwei, shengxiao: runShengxiao,
    shuzi: runShuzi, meiri: runMeiri, mianxiang: runMianxiang,
    run(module, input) { return this[module] ? this[module](input) : null; },
  };
})();
