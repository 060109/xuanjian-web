'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Plug, CheckCircle2, AlertCircle, Loader2, Cpu, BookOpen, KeyRound, ShieldCheck, FileCode2 } from 'lucide-react'
import PageShell from '../PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface ConfigStatus {
  provider: string
  label: string
  hasKey: boolean
  endpoint: string
  model: string
  enabled: boolean
  envKey: string
}

const ENV_VARS = [
  {
    key: 'DEEPSEEK_API_KEY',
    desc: 'DeepSeek API Key（AI 推演必填；OpenAI 兼容格式）',
    secret: true,
  },
  { key: 'AI_PROVIDER', desc: 'AI 服务商：deepseek（默认）/ openai / qwen', secret: false },
  { key: 'AI_MODEL', desc: '模型名，如 deepseek-chat / deepseek-reasoner', secret: false },
  { key: 'AI_ENDPOINT', desc: '接口地址（可选，默认官方端点）', secret: false },
  { key: 'AUTH_USERS', desc: '账号密码 JSON 数组，密码为 bcrypt 哈希', secret: true },
  { key: 'JWT_SECRET', desc: '会话签名密钥（随机长字符串）', secret: true },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [config, setConfig] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/ai-config')
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig(d.config)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })
      const data = await res.json()
      setTestResult(data)
      toast({
        title: data.ok ? '连接成功' : '连接失败',
        description: data.message,
        variant: data.ok ? 'default' : 'destructive',
      })
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <PageShell title="系统设置" subtitle="System Settings" trigram="⚙" accent="#c9a96a">
      {/* 顶部状态卡 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="xj-panel p-5 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[rgba(201,169,106,0.15)] border border-[rgba(201,169,106,0.4)] flex-shrink-0">
            <Cpu className="w-5 h-5 text-[#c9a96a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base sm:text-lg xj-gold-text mb-1">当前 AI 引擎</h3>
            {loading ? (
              <div className="text-cream/50 text-sm">加载中…</div>
            ) : config?.enabled ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-[rgba(201,169,106,0.2)] text-[#c9a96a] border-[rgba(201,169,106,0.4)]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> 已启用
                  </Badge>
                  <span className="text-cream font-medium">{config.label}</span>
                  {config.model && <span className="text-cream/50 text-xs">· {config.model}</span>}
                </div>
                <div className="text-[11px] text-cream/40">
                  API Key 已配置（{config.envKey}）· 所有术数推演与天机AI对话均基于此模型 + 您的典籍库
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Badge variant="outline" className="border-[rgba(155,58,58,0.4)] text-[#c98a8a]">
                  <AlertCircle className="w-3 h-3 mr-1" /> AI 未配置
                </Badge>
                <div className="text-[11px] text-cream/40">
                  尚未在环境变量中配置 API Key，AI 深度解析暂不可用。配置方法见下方说明。
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={handleTest}
              disabled={testing || !config?.enabled}
              variant="outline"
              className="border-[rgba(201,169,106,0.35)] text-cream/80 hover:bg-[rgba(201,169,106,0.1)] hover:text-cream"
            >
              {testing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plug className="w-4 h-4 mr-1.5" />}
              测试连接
            </Button>
          </div>
        </div>
        {testResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 flex items-start gap-2 p-3 rounded-lg border text-sm ${
              testResult.ok
                ? 'border-[rgba(138,168,107,0.4)] bg-[rgba(138,168,107,0.08)] text-[#9bc97b]'
                : 'border-[rgba(155,58,58,0.4)] bg-[rgba(155,58,58,0.1)] text-[#c98a8a]'
            }`}
          >
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span className="leading-snug">{testResult.message}</span>
          </motion.div>
        )}
      </motion.div>

      {/* 提示：基于文档 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="xj-glass p-4 mb-6 flex items-start gap-3"
      >
        <BookOpen className="w-4 h-4 text-[#8aa86b] flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-cream/70 leading-relaxed">
          <span className="text-cream font-medium">知识库 RAG：</span>
          无论选用哪个 AI 模型，系统都会先从您在
          <button onClick={() => router.push('/library')} className="text-[#c9a96a] underline mx-1 hover:text-[#d9c08a]">典籍库</button>
          上传的文档（PDF/TXT/Word）中检索相关内容，连同算法结果一起交给 AI 推演。上传的典籍越多，回答越精准。
        </div>
      </motion.div>

      {/* 环境变量配置说明 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="xj-panel p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-[#c9a96a]" />
          <h3 className="font-serif text-base xj-gold-text">环境变量配置（生产环境）</h3>
        </div>
        <div className="text-xs text-cream/60 leading-relaxed mb-4">
          本项目所有敏感配置均通过环境变量注入，不写入数据库与代码仓库。
          请在 <span className="text-[#c9a96a]">Cloudflare Pages → 项目 → Settings → Environment variables</span> 中配置：
        </div>
        <div className="space-y-2">
          {ENV_VARS.map((v) => (
            <div
              key={v.key}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[rgba(201,169,106,0.15)] bg-black/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode2 className="w-4 h-4 text-[#8aa86b] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm text-cream">{v.key}</div>
                  <div className="text-[11px] text-cream/50 truncate">{v.desc}</div>
                </div>
              </div>
              {v.secret ? (
                <Badge variant="outline" className="flex-shrink-0 border-[rgba(155,58,58,0.4)] text-[#c98a8a] text-[9px]">
                  <ShieldCheck className="w-3 h-3 mr-1" /> 敏感
                </Badge>
              ) : (
                <Badge variant="outline" className="flex-shrink-0 border-[rgba(138,168,107,0.4)] text-[#8aa86b] text-[9px]">可选</Badge>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-cream/45 leading-relaxed">
          提示：<span className="font-mono">AUTH_USERS</span> 格式为 JSON 数组，密码存 bcrypt 哈希：
          <span className="font-mono text-[10px] block mt-1 text-cream/55 break-all">
            [{"{\"username\":\"admin\",\"password\":\"$2b$10$...\"}"}]
          </span>
          修改环境变量后需重新部署（Deployments → Retry deployment）才生效。
        </div>
      </motion.div>

      {/* 底部说明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 xj-glass p-4 text-xs text-cream/50 leading-relaxed"
      >
        <div className="flex items-start gap-2">
          <Settings className="w-3.5 h-3.5 text-[#c9a96a] flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-cream/70 font-medium">功能说明：</span>
            <span className="text-[#c9a96a]">八字命理、六爻梅花、奇门遁甲、塔罗占卜、姓名数理</span>五大模块的计算解读，以及
            <span className="text-[#c9a96a]">天机AI</span>对话，将调用环境变量中配置的 AI 模型。
            系统会结合内置术数算法结果 + 典籍库 RAG 检索 + 历史记忆，交给 AI 生成深度推演。
          </div>
        </div>
      </motion.div>
    </PageShell>
  )
}
