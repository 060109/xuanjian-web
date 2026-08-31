# 玄天智算 · XuanTian AI

**东方玄学宇宙智能系统** —— 融合传统玄学算法、古籍知识库（RAG）与大模型 AI 的未来玄学智能平台。

> 不是普通网页，不是 AI 模板 —— 用户打开网站的第一感觉：神秘、高级、震撼，像进入一个东方宇宙智能系统。

---

## 功能总览

| 模块 | 说明 |
|------|------|
| 星盘首页 | 巨型太极核心 + 十二功能环绕星盘布局，星辰扩散点击动画 |
| 登录系统 | 玄学宇宙入口式登录页（无边框光线输入），管理员/普通用户（LocalStorage） |
| 八字命理 | 四柱排盘 · 五行十神 · 大运流年 · 命理参详 |
| 塔罗占卜 | 五大牌阵 · 3D 翻牌动画 · 正逆位解义 |
| 六爻预测 | 时间 / 数字 / 铜钱起卦 · 本卦变卦 · 世应动爻 |
| 梅花易数 | 数字起卦 · 先天八卦 · 体用生克断吉凶 |
| 奇门遁甲 | 时家奇门 · 九宫盘局 · 八门九星八神 |
| 风水分析 | 方位五行 · 布局建议 · 阳宅要点 |
| 姓名学 | 五格剖象 · 三才五行 · 综合数理 |
| 紫微斗数 | 预留接口（规划中） |
| 生肖运势 | 生肖五行 · 当日运势 |
| 数字能量 | 数字五行 · 能量解析 |
| 每日运势 | 当日干支 · 黄历宜忌 |
| 面相分析 | AI 视觉规划中 |
| 藏经阁（知识库） | 上传 PDF/TXT/MD/DOC 典籍，自动分类、索引、标签，全站 RAG 检索依据 |
| 问鉴 AI | 未来 AI 终端 · 打字效果 · 典籍问答模式 · 历史保存 |
| 控制台 | 用户数/典籍数/AI 状态/调用次数 · 管理员用户管理 |
| 设置 | DeepSeek / OpenAI / Claude / Gemini / 自定义 大模型配置 |

## 核心架构：算法 x 典籍 x AI 三合一体

所有玄学功能统一走「玄天知识引擎」管线：

```
用户输入 -> 玄学算法计算 -> 生成基础结果
        -> 检索典籍知识库 -> 提取相关片段
        -> AI 大模型融合解读 -> 生成最终解释
```

- 算法负责计算（八字/塔罗/六爻/梅花/奇门/风水/姓名 传统术数算法）
- 典籍负责依据（上传的 PDF/TXT/MD/DOC 自动分类索引）
- AI 负责融合（多模型接入，优先依据典籍作答）
- 知识库无相关内容时，AI 会明确提示「当前典籍库暂无相关内容，将结合 AI 辅助分析」

## 技术栈

纯前端静态站点：HTML5 + CSS3 + JavaScript（零依赖、零构建、零后端）

- Canvas 星空粒子 / 星云 / 流星 / 鼠标星光
- 太极旋转 · 金色光环呼吸 · 玻璃拟态 · 星辰扩散动画
- 术数算法引擎（esbuild 编译，支持八字/塔罗/六爻/奇门/姓名）
- 知识库 RAG（关键词检索 + 分块索引）
- PDF 解析经 pdf.js（CDN，仅上传 PDF 时按需加载）

```
xuantian-ai/
├── index.html          # 星盘首页
├── login.html          # 登录入口
├── dashboard.html      # 控制台
├── ai.html             # 问鉴 AI 终端
├── settings.html       # 大模型配置
├── knowledge.html      # 藏经阁知识库
├── bazi.html           # 八字命理
├── tarot.html          # 塔罗占卜
├── liuyao.html         # 六爻预测
├── meihua.html         # 梅花易数
├── qimen.html          # 奇门遁甲
├── fengshui.html       # 风水分析
├── xingming.html       # 姓名学
├── ziwei.html          # 紫微斗数（预留）
├── shengxiao.html      # 生肖运势
├── shuzi.html          # 数字能量
├── meiri.html          # 每日运势
├── mianxiang.html      # 面相分析（预留）
├── css/main.css        # 设计系统
├── js/                 # 核心引擎
├── assets/             # 静态资源
└── data/               # 初始数据（users.json / classics.json）
```

## 部署指南

### 方式一：GitHub -> Cloudflare Pages（推荐）

1. 上传 GitHub

```bash
git init
git add .
git commit -m "feat: 玄天智算 v1.0"
git branch -M main
git remote add origin https://github.com/<你的用户名>/xuantian-ai.git
git push -u origin main
```

2. 连接 Cloudflare Pages
   - 打开 dash.cloudflare.com -> Workers 和 Pages -> 创建 -> Pages -> 连接到 Git
   - 选择 `xuantian-ai` 仓库
   - 框架预设：无（纯静态）
   - 构建命令：留空（无需构建）
   - 构建输出目录：留空（站点在仓库根目录）
   - 保存并部署

3. 绑定自定义域名
   - 项目 -> 自定义域 -> 设置自定义域 -> 输入域名
   - 按提示添加 CNAME 记录 -> 等待验证（几分钟）

### 方式二：Wrangler CLI 直传（免 GitHub）

```bash
npm i -g wrangler
wrangler login
cd xuantian-ai
wrangler pages deploy . --project-name xuantian-ai
```

### 方式三：任意静态托管

把 `xuantian-ai/` 目录整体上传到任意静态托管（Vercel / Netlify / 对象存储 + CDN）即可。

## 初始账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `kurbanj` | `060109` |
| 普通用户 | `guest` | `060109` |

> 首次打开自动从 data/users.json 初始化。密码以 SHA-256 散列存于浏览器 LocalStorage，管理员可在控制台新增/移除用户。未来可平滑接入后端数据库。

## AI 模型配置

「设置」页填写：
- DeepSeek：默认地址 https://api.deepseek.com/chat/completions，模型 deepseek-chat
- OpenAI：默认地址 https://api.openai.com/v1/chat/completions，模型 gpt-4o-mini
- Claude：默认地址 https://api.anthropic.com/v1/messages，模型 claude-3-5-sonnet-latest
- Gemini：默认地址 https://generativelanguage.googleapis.com/v1beta/models，模型 gemini-1.5-flash
- 自定义：任意 OpenAI 兼容接口

配置仅保存在浏览器 LocalStorage。

## 未来规划

- AI 面相分析 / AI 手相分析 / AI 视频解盘
- 真人大师模式 / 会员系统 / 私人命盘
- 紫微斗数完整排盘、流年流月推演
- 后端数据库接入（用户体系云端化）

## 免责声明

玄学推演与文化研究内容，仅供娱乐与传统文化学习参考，请理性看待。

---

玄天智算 · XuanTian AI v1.0
