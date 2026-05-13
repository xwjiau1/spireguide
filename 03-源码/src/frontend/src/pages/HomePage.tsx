import { useState, useEffect, useRef } from 'react'
import {
  Database,
  ShieldAlert,
  ChevronRight,
  Zap,
  TrendingUp,
  AlertCircle,
  Loader2,
  ScrollText,
  Image,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { enemiesApi, qaHistoryApi, aiApi } from '../services/api'

/**
 * HomePage.tsx — 首页
 * 欢迎Hero + 快速统计卡片 + 最近问答记录
 */

interface QuickCard {
  title: string
  subtitle: string
  icon: React.ElementType
  action: string
  path: string
  color: string
}

interface QAItem {
  id: number
  question_type: string
  question_text: string
  ai_response: string
  created_at: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredEnemy, setFeaturedEnemy] = useState<any>(null)
  const [qaHistory, setQaHistory] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognizeResult, setRecognizeResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [enemyRes, qaRes] = await Promise.all([
          enemiesApi.list().catch(() => ({ data: [] })),
          qaHistoryApi.list({ limit: 5 }).catch(() => ({ data: [] })),
        ])
        const enemies = enemyRes.data || []
        // 取第一个BOSS类型敌人或第一个敌人作为"当前关注"
        const boss = enemies.find((e: any) => e.type === 'boss') || enemies[0]
        setFeaturedEnemy(boss)
        setQaHistory(qaRes.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 处理文件选择和截图识别
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setIsRecognizing(true)
    setRecognizeResult(null)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      if (!imageData) return
      try {
        const res = await aiApi.recognize(imageData)
        const rec = res.data?.recognized_elements
        if (rec) {
          const info = `🎮 识别结果：\n角色：${rec.character || '未知'} | 回合：${rec.turn || '?'} | 能量：${rec.energy || '?'}
敌人：${rec.enemyName || '未知'} ${rec.enemyHp || ''}
手牌：${(rec.handCards || []).map((c: any) => `${c.name}(费${c.cost})`).join('、') || '无'}`
          setRecognizeResult(info)
        }
      } catch (err) {
        setRecognizeResult('❌ 截图识别失败：' + (err as Error).message)
      } finally {
        setIsRecognizing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleScreenshotAsk = () => {
    fileInputRef.current?.click()
  }

  // Ctrl+V 粘贴截图支持
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (file) handleFileSelect(file)
          break
        }
      }
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [])

  const quickCards: QuickCard[] = [
    {
      title: featuredEnemy?.name_cn || '未知首领',
      subtitle: featuredEnemy?.act ? `第${featuredEnemy.act}幕 · ${featuredEnemy.type === 'boss' ? 'BOSS' : '精英'}` : '加载中...',
      icon: ShieldAlert,
      action: '查看详情',
      path: '/enemies',
      color: 'text-spire-red',
    },
    {
      title: '力量战',
      subtitle: '铁甲战士 · 高进阶推荐',
      icon: TrendingUp,
      action: '浏览卡牌',
      path: '/cards',
      color: 'text-spire-accent',
    },
    {
      title: 'v2.2.12',
      subtitle: '数据库已更新 · 295张卡牌',
      icon: Zap,
      action: '更新日志',
      path: '/cards',
      color: 'text-spire-green',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-spire-accent" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero 欢迎区 */}
      <div className="spire-panel">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-spire-text mb-1">
              欢迎回来，尖塔挑战者
            </h1>
            <p className="text-sm text-spire-text-dim">
              当前角色：<span className="text-spire-accent font-medium">铁甲战士</span> ·
              进阶 <span className="text-spire-accent font-medium">7</span> ·
              第 <span className="text-spire-accent font-medium">3</span> 幕进行中
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => navigate('/cards')}
              className="spire-btn-secondary"
            >
              <Database size={16} />
              查卡牌
            </button>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={handleScreenshotAsk}
            disabled={isRecognizing}
            className="spire-btn"
          >
            {isRecognizing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Image size={16} />
            )}
            {isRecognizing ? '识别中...' : '截图提问'}
          </button>
          <button
            onClick={() => navigate('/cards')}
            className="spire-btn-secondary"
          >
            <Database size={16} />
            卡牌数据库
          </button>
          <button
            onClick={() => navigate('/enemies')}
            className="spire-btn-secondary"
          >
            <ShieldAlert size={16} />
            敌人图鉴
          </button>
        </div>

        {/* 识别结果展示 */}
        {recognizeResult && (
          <div className="mt-3 bg-spire-surface border border-spire-accent/30 rounded-lg p-3 text-sm text-spire-text whitespace-pre-wrap">
            {recognizeResult}
          </div>
        )}
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="spire-panel cursor-pointer hover:border-spire-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <Icon className={card.color} size={24} />
                <ChevronRight size={16} className="text-spire-text-dim" />
              </div>
              <h3 className="font-semibold text-spire-text">{card.title}</h3>
              <p className="text-xs text-spire-text-dim mt-1">{card.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* 最近问答记录 */}
      <div className="spire-panel">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText size={18} className="text-spire-accent" />
          <h2 className="font-semibold text-spire-text">最近问答记录</h2>
          <span className="text-xs text-spire-text-dim ml-auto">
            共 {qaHistory.length} 条
          </span>
        </div>

        {qaHistory.length === 0 ? (
          <div className="text-center py-6 text-spire-text-dim text-sm">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-40" />
            <p>暂无问答记录</p>
            <p className="text-xs mt-1">在右侧AI面板发送问题即可记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {qaHistory.map((qa) => (
              <div
                key={qa.id}
                className="bg-spire-bg border border-spire-border rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-spire-accent">
                    {qa.question_type === 'combat_advice' ? '战斗建议' : qa.question_type}
                  </span>
                  <span className="text-[10px] text-spire-text-dim">
                    {new Date(qa.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-spire-text line-clamp-2">
                  {qa.ai_response}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
