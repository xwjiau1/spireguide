import { useState, useEffect } from 'react'
import {
  Settings,
  KeyRound,
  Globe,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bot,
  Clock,
  Thermometer,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react'
import { configApi } from '../services/api'

/**
 * AI系统设置页面
 * 可视化配置AI开关、协议、密钥、模型参数
 */

interface AiConfig {
  enabled: boolean
  provider: string
  api_key?: string
  api_url?: string
  model?: string
  vision_model?: string
  timeout_ms?: number
  max_tokens?: number
  temperature?: number
  system_prompt?: string
  has_key?: boolean
}

const PROVIDERS = [
  { id: 'kimi', name: 'Kimi (月之暗面)', defaultUrl: 'https://api.moonshot.cn/v1', defaultModel: 'kimi-latest' },
  { id: 'openai', name: 'OpenAI', defaultUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { id: 'custom', name: '自定义', defaultUrl: '', defaultModel: '' },
]

export default function SettingsPage() {
  const [config, setConfig] = useState<AiConfig>({ enabled: false, provider: 'kimi' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dirty, setDirty] = useState(false)

  // 加载配置
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await configApi.getAi()
      setConfig(res.data)
      setDirty(false)
    } catch (err) {
      setMessage({ type: 'error', text: '加载配置失败：' + (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // 保存配置
  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const res = await configApi.updateAi({
        enabled: config.enabled,
        provider: config.provider,
        api_key: config.api_key,
        api_url: config.api_url,
        model: config.model,
        vision_model: config.vision_model,
        timeout_ms: config.timeout_ms,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        system_prompt: config.system_prompt,
      })
      setConfig(res.data)
      setDirty(false)
      setMessage({ type: 'success', text: '配置已保存' })
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败：' + (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  // 测试连接
  const handleTest = async () => {
    try {
      setTesting(true)
      setMessage(null)
      const res = await configApi.testAi({
        api_key: config.api_key,
        api_url: config.api_url,
        provider: config.provider,
        model: config.model,
      })
      setMessage({
        type: 'success',
        text: `连接成功 — 模型：${res.data.model}，响应：${res.data.response_sample || 'OK'}`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: '连接测试失败：' + (err as Error).message })
    } finally {
      setTesting(false)
    }
  }

  // 更新字段
  const updateField = (field: keyof AiConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
    setMessage(null)
  }

  // 切换提供商时重置默认值
  const handleProviderChange = (provider: string) => {
    const p = PROVIDERS.find((x) => x.id === provider)
    if (p) {
      setConfig((prev) => ({
        ...prev,
        provider,
        api_url: prev.api_url || p.defaultUrl,
        model: prev.model || p.defaultModel,
        vision_model: prev.vision_model || p.defaultModel,
      }))
      setDirty(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-spire-accent" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-spire-accent" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-spire-text">系统设置</h1>
          <p className="text-sm text-spire-muted">配置AI策略引擎参数</p>
        </div>
      </div>

      {/* AI开关 */}
      <section className="bg-spire-card border border-spire-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-spire-accent" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-spire-text">AI策略引擎</h2>
              <p className="text-sm text-spire-muted">开启后，截图识别和策略建议将调用真实AI API</p>
            </div>
          </div>
          <button
            onClick={() => updateField('enabled', !config.enabled)}
            className={`p-2 rounded-lg transition-colors ${
              config.enabled
                ? 'bg-spire-accent/20 text-spire-accent'
                : 'bg-spire-border/30 text-spire-muted'
            }`}
          >
            {config.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        {!config.enabled && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-yellow-400">
              AI当前处于关闭状态，所有策略建议使用模拟数据（启发式规则 + 数据库拼接）。
              开启后需要配置有效的API密钥。
            </p>
          </div>
        )}
      </section>

      {/* 提供商选择 */}
      <section className="bg-spire-card border border-spire-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-spire-text mb-4">AI提供商</h2>

        <div className="grid grid-cols-3 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                config.provider === p.id
                  ? 'border-spire-accent bg-spire-accent/10 text-spire-accent'
                  : 'border-spire-border bg-spire-bg text-spire-muted hover:border-spire-accent/50'
              }`}
            >
              <p className="font-medium">{p.name}</p>
              {config.provider === p.id && p.defaultUrl && (
                <p className="text-xs mt-1 opacity-70 truncate">{p.defaultUrl}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* API密钥 */}
      <section className="bg-spire-card border border-spire-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-spire-text mb-4">API配置</h2>

        {/* API密钥 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-spire-text">
            <KeyRound size={16} />
            API密钥
            {config.has_key && !config.api_key && (
              <span className="text-xs text-spire-muted ml-2">（已保存，输入新值可覆盖）</span>
            )}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.api_key || ''}
              onChange={(e) => updateField('api_key', e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 pr-12 text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-spire-muted hover:text-spire-text"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-spire-muted">
            密钥仅保存在本地数据库，不会上传到任何第三方服务器。
          </p>
        </div>

        {/* 自定义URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-spire-text">
            <Globe size={16} />
            API地址
            {config.provider !== 'custom' && (
              <span className="text-xs text-spire-muted ml-2">（使用默认值即可）</span>
            )}
          </label>
          <input
            type="text"
            value={config.api_url || ''}
            onChange={(e) => updateField('api_url', e.target.value)}
            placeholder={PROVIDERS.find((p) => p.id === config.provider)?.defaultUrl || 'https://api.example.com/v1'}
            className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent"
          />
        </div>

        {/* 模型 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-spire-text">策略模型</label>
            <input
              type="text"
              value={config.model || ''}
              onChange={(e) => updateField('model', e.target.value)}
              placeholder="kimi-latest"
              className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-spire-text">视觉模型</label>
            <input
              type="text"
              value={config.vision_model || ''}
              onChange={(e) => updateField('vision_model', e.target.value)}
              placeholder="kimi-latest"
              className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent"
            />
          </div>
        </div>
      </section>

      {/* 高级参数 */}
      <section className="bg-spire-card border border-spire-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-spire-text mb-4">高级参数</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-spire-text">
              <Clock size={16} /> 超时（毫秒）
            </label>
            <input
              type="number"
              value={config.timeout_ms || 30000}
              onChange={(e) => updateField('timeout_ms', parseInt(e.target.value))}
              min={5000}
              max={120000}
              step={1000}
              className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text focus:outline-none focus:border-spire-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-spire-text">
              <FileText size={16} /> 最大Token数
            </label>
            <input
              type="number"
              value={config.max_tokens || 4096}
              onChange={(e) => updateField('max_tokens', parseInt(e.target.value))}
              min={256}
              max={8192}
              step={256}
              className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text focus:outline-none focus:border-spire-accent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-spire-text">
            <Thermometer size={16} /> 温度（{config.temperature ?? 0.7}）
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={config.temperature ?? 0.7}
            onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
            className="w-full accent-spire-accent"
          />
          <p className="text-xs text-spire-muted">
            越低回答越确定，越高越有创意。策略建议推荐 0.3-0.7。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-spire-text">系统提示词</label>
          <textarea
            value={config.system_prompt || ''}
            onChange={(e) => updateField('system_prompt', e.target.value)}
            rows={4}
            placeholder="定义AI的角色和行为..."
            className="w-full bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent resize-none"
          />
        </div>
      </section>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          {message && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {message.text}
            </div>
          )}
          {dirty && !message && (
            <span className="text-sm text-spire-muted">有未保存的更改</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing || !config.api_key}
            className="px-4 py-2 rounded-lg border border-spire-border text-spire-text hover:bg-spire-border/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            测试连接
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-spire-accent text-white font-medium hover:bg-spire-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}
