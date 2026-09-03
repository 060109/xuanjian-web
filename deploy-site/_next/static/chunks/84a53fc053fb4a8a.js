(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,86217,e=>{"use strict";var a=e.i(75305),t=e.i(50235);let i={deepseek:{provider:"deepseek",label:"DeepSeek 深度求索",apiUrl:"https://api.deepseek.com/v1/chat/completions",apiKey:"",modelName:"deepseek-chat",enabled:!0},openai:{provider:"openai",label:"OpenAI",apiUrl:"https://api.openai.com/v1/chat/completions",apiKey:"",modelName:"gpt-4o-mini",enabled:!0},claude:{provider:"claude",label:"Claude Anthropic",apiUrl:"https://api.anthropic.com/v1/messages",apiKey:"",modelName:"claude-3-5-sonnet-20241022",enabled:!0},gemini:{provider:"gemini",label:"Google Gemini",apiUrl:"https://generativelanguage.googleapis.com/v1beta/models",apiKey:"",modelName:"gemini-1.5-flash",enabled:!0},custom:{provider:"custom",label:"自定义接口 (Agnes 已预填)",apiUrl:"https://apihub.agnes-ai.com/v1/chat/completions",apiKey:"",modelName:"agnes-2.0-flash",enabled:!0}},o=`你是「天机子」——玄天智算的首席命理师，融合中国传统玄学、玄学算法与古籍知识库为一体。

【身份与口吻】
- 自称「吾」，称呼对方「道友」或「汝」，第一人称融入角色；
- 纵使被问"你是谁"，只答：天机子是也，玄天智算之首席命理师，今日与道友一会；
- 严禁提及"AI / 模型 / 语言模型 / Agnes / Sapiens / OpenAI / DeepSeek / Claude"等任何真实出处或底层身份。

【精通之术】
八字命理、紫微斗数、六爻纳甲、梅花易数、奇门遁甲、铁板神数、姓名学、阳宅风水、阴宅堪舆、塔罗牌、占星择日、相术。

【回答原则】
1. 优先基于用户上传的玄学典籍知识库内容进行解读；若库中无相关，需明言"藏经阁暂无此典，吾以理气推之"；
2. 结合玄学算法（八字排盘、紫微飞星、六爻装卦等）的推演数据，给出专业、有层次的剖析；
3. 回答需结构清晰，分维度阐述（命格、事业、财运、感情、健康、流年等），引经据典，言必有据；
4. 语言典雅凝练，可适当引用古籍原文（《滴天髓》《穷通宝鉴》《子平真诠》《三命通会》《周易》《渊海子平》《卜筮正宗》《梅花易数》《地理全书》等）；
5. 切勿敷衍或回避——道友问及运势，须给方向；问及凶吉，须指吉凶；问及调理，须言化解；
6. 答毕可顺势引导道友进一步参问（"道友若知生辰八字，可再问流年…"）。

【玄学之外的应对】
- 若所问与玄学无关（非命理、非占卜、非风水、非姓名、非择日），仍以东方雅士之姿作答：先以玄学视角略评一二（如"此事从气运观之…"），再回到本质回应道友所问；
- 绝不强行玄学化误导，也绝不拒绝回答。

【格式建议】
- 每次回答以一句简短的【天机开场】引题；
- 正文分维度（用 ◆ ❖ ◈ 等符号作小标）；
- 末尾以【师嘱】或【指引】收束，给出可操作建议；
- 全程中文，总长 200-600 字为佳。

今日道友临门，敢问欲参何机？`,s=(0,a.create)()((0,t.persist)((e,a)=>({activeProvider:"deepseek",models:i,systemPrompt:o,ragTopK:5,knowledgeEnabled:!0,animationsEnabled:!0,theme:"cosmic",setModelConfig:(a,t)=>e(e=>({models:{...e.models,[a]:{...e.models[a],...t}}})),setActiveProvider:a=>e({activeProvider:a}),setSystemPrompt:a=>e({systemPrompt:a}),setRagTopK:a=>e({ragTopK:Math.max(1,Math.min(20,a))}),setKnowledgeEnabled:a=>e({knowledgeEnabled:a}),setAnimationsEnabled:a=>e({animationsEnabled:a}),getActiveModel:()=>{let{models:e,activeProvider:t}=a();return e[t]||e.deepseek},resetSettings:()=>e({activeProvider:"deepseek",models:i,systemPrompt:o,ragTopK:5,knowledgeEnabled:!0})}),{name:"xuantian-settings"}));e.s(["DEFAULT_SYSTEM_PROMPT",0,o,"useSettingsStore",0,s])},3262,e=>{"use strict";let a=(0,e.i(65810).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",()=>a],3262)}]);