import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Routes,
  Route,
  NavLink,
} from 'react-router-dom'
import {
  Swords,
  Database,
  ShieldAlert,
  Settings,
  Gem,
  ScrollText,
  Send,
  Loader2,
  MessageSquare,
  Image,
  PanelLeft,
} from 'lucide-react'

import HomePage from './pages/HomePage'
import CardsPage from './pages/CardsPage'
import EnemiesPage from './pages/EnemiesPage'
import RelicsPage from './pages/RelicsPage'
import SessionsPage from './pages/SessionsPage'
import SettingsPage from './pages/SettingsPage'
import { aiApi, qaHistoryApi } from './services/api'

/**
 * App.tsx — 三栏布局主框架
 * 左侧导航栏（固定，lg以上显示）+ 中央内容区（可滚动）+ 右侧AI助手面板（固定，xl以上显示）
 */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'image' | 'text'
  imageData?: string
}

const NAV_CORE = [
  { path: '/', label: '首页', icon: Swords },
  { path: '/cards', label: '卡牌数据库', icon: Database },
  { path: '/enemies', label: '敌人 / BOSS', icon: ShieldAlert },
  { path: '/sessions', label: '我的记录', icon: ScrollText },
  { path: '/relics', label: '遗物收藏', icon: Gem },
]

const NAV_EXTRA = [
  { path: '/settings', label: '系统设置', icon: Settings },
]

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // AI面板状态
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // 加载历史QA
  useEffect(() => {
    qaHistoryApi.list({ limit: 10 })
      .then((res) => {
        const history = (res.data || []).map((h: any) => ({
          id: String(h.id || Math.random()),
          role: 'assistant' as const,
          content: h.ai_response || '',
          timestamp: h.created_at || new Date().toISOString(),
          type: 'text' as const,
        }))
        setMessages((prev) => {
          // 如果已有消息，保留；否则用历史填充
          return prev.length > 0 ? prev : history.reverse()
        })
      })
      .catch(() => {
        // QA历史API可能不可用，静默失败
      })
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理截图识别
  const handleRecognize = useCallback(async (imageData: string) => {
    setIsAiLoading(true)
    try {
      const res = await aiApi.recognize(imageData)
      const rec = res.data?.recognized_elements
      if (rec) {
        const info = `🎮 识别结果：\n角色：${rec.character || '未知'} | 回合：${rec.turn || '?'} | 能量：${rec.energy || '?'}\n敌人：${rec.enemyName || '未知'} ${rec.enemyHp || ''}\n手牌：${(rec.handCards || []).map((c: any) => `${c.name}(费${c.cost})`).join('、') || '无'}`
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + '-img',
            role: 'user',
            content: '[截图上传]',
            timestamp: new Date().toISOString(),
            type: 'image',
            imageData,
          },
          {
            id: Date.now() + '-rec',
            role: 'assistant',
            content: info,
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        ])
        setPendingImage(imageData)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-err',
          role: 'assistant',
          content: '❌ 截图识别失败：' + (err as Error).message,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ])
    } finally {
      setIsAiLoading(false)
    }
  }, [])

  // 发送策略请求
  const handleStrategy = useCallback(async (question: string) => {
    if (!question.trim()) return
    setIsAiLoading(true)

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: Date.now() + '-q',
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      type: 'text',
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')

    try {
      const res = await aiApi.strategy({
        question,
        confirmed: true,
        confirmed_elements: pendingImage
          ? undefined
          : {
              character: 'ironclad',
              turn: 1,
              energy: '?/?',
              handCards: [],
              enemyName: '未知敌人',
              enemyHp: '?/?',
              hp: '?/?',
              gold: 0,
            },
      })
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-a',
          role: 'assistant',
          content: res.data?.strategy_text || res.data?.answer || '无策略返回',
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-err',
          role: 'assistant',
          content: '❌ 策略请求失败：' + (err as Error).message,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ])
    } finally {
      setIsAiLoading(false)
    }
  }, [pendingImage])

  // 文件上传处理
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (data) handleRecognize(data)
      }
      reader.readAsDataURL(file)
    },
    [handleRecognize]
  )

  // 拖拽事件
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // Ctrl+V 粘贴截图
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
  }, [handleFileSelect])

  // 快速问题
  const quickQuestions = [
    { label: '出牌建议', icon: Swords, q: '当前手牌应该如何出牌？' },
    { label: '选牌建议', icon: Database, q: '这三张奖励牌该选哪张？' },
  ]

  // 导航渲染
  const renderNavItem = (item: typeof NAV_CORE[0]) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileNavOpen(false)}
        className={({ isActive }) =>
          'nav-item ' + (isActive ? 'active' : '')
        }
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-spire-bg text-spire-text overflow-hidden">
      {/* 顶部标题栏（移动端显示） */}
      <div className="lg:hidden h-12 bg-spire-surface border-b border-spire-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Swords className="text-spire-accent" size={20} />
          <span className="font-bold text-spire-accent">尖塔智囊</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-spire-text-dim hover:text-spire-text"
        >
          <PanelLeft size={20} />
        </button>
      </div>

      {/* 主体三栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧导航栏 — lg以上显示，移动端抽屉 */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-spire-bg border-r border-spire-border flex flex-col
            transform transition-transform duration-200
            lg:static lg:transform-none lg:shrink-0
            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-spire-border shrink-0">
            <Swords className="text-spire-accent" size={24} />
            <div>
              <h1 className="font-bold text-spire-accent leading-tight">尖塔智囊</h1>
              <p className="text-[10px] text-spire-text-dim -mt-0.5">SpireGuide v0.1.1</p>
            </div>
          </div>

          {/* 导航列表 */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            <div className="px-2 mb-2 text-[10px] font-semibold text-spire-text-dim uppercase tracking-wider">
              核心功能
            </div>
            {NAV_CORE.map(renderNavItem)}

            <div className="px-2 mt-4 mb-2 text-[10px] font-semibold text-spire-text-dim uppercase tracking-wider">
              系统
            </div>
            {NAV_EXTRA.map(renderNavItem)}
          </nav>

          {/* 底部 */}
          <div className="shrink-0 p-3 border-t border-spire-border text-[10px] text-spire-text-dim text-center">
            数据版本：v2.2.12
          </div>
        </aside>

        {/* 移动端遮罩 */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* 中央内容区 */}
        <main className="flex-1 overflow-y-auto bg-spire-bg">
          <div className="max-w-6xl mx-auto p-4 lg:p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<CardsPage />} />
              <Route path="/enemies" element={<EnemiesPage />} />
              <Route path="/relics" element={<RelicsPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>

        {/* 右侧AI助手面板 — xl以上显示 */}
        <aside className="hidden xl:flex w-80 min-w-[320px] bg-spire-surface border-l border-spire-border flex-col shrink-0">
          {/* AI面板标题 */}
          <div className="h-14 flex items-center gap-2 px-4 border-b border-spire-border shrink-0">
            <MessageSquare className="text-spire-accent" size={20} />
            <span className="font-semibold text-spire-text">AI策略助手</span>
            {isAiLoading && <Loader2 size={14} className="animate-spin text-spire-accent ml-auto" />}
          </div>

          {/* 截图上传区 */}
          <div className="shrink-0 p-3 border-b border-spire-border">
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            >
              <Image size={24} className="mx-auto mb-1 text-spire-text-dim" />
              <p className="text-xs text-spire-text-dim">
                点击上传 / 拖拽 / Ctrl+V 粘贴截图
              </p>
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
            </div>

            {/* 快速操作 */}
            <div className="flex gap-2 mt-2">
              {quickQuestions.map((qq) => {
                const Icon = qq.icon
                return (
                  <button
                    key={qq.label}
                    onClick={() => handleStrategy(qq.q)}
                    disabled={isAiLoading}
                    className="flex-1 spire-btn-secondary text-xs py-1.5 justify-center"
                  >
                    <Icon size={14} />
                    {qq.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 聊天历史 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-spire-text-dim text-sm py-8">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p>暂无对话记录</p>
                <p className="text-xs mt-1">上传截图或输入问题开始</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${
                  msg.role === 'user'
                    ? 'ml-auto bg-spire-accent/10 border border-spire-accent/20'
                    : 'mr-auto bg-spire-bg border border-spire-border'
                } rounded-lg p-2.5 max-w-[90%] text-sm`}
              >
                {msg.type === 'image' && msg.imageData ? (
                  <img
                    src={msg.imageData}
                    alt="截图"
                    className="max-w-full rounded border border-spire-border"
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-spire-text leading-relaxed">
                    {msg.content}
                  </div>
                )}
                <div className="text-[10px] text-spire-text-dim mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="shrink-0 p-3 border-t border-spire-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleStrategy(inputText)
                  }
                }}
                placeholder="输入问题或粘贴截图..."
                className="spire-input flex-1"
                disabled={isAiLoading}
              />
              <button
                onClick={() => handleStrategy(inputText)}
                disabled={isAiLoading || !inputText.trim()}
                className="spire-btn px-3"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
