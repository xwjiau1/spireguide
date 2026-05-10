import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  Home, Sword, Shield, Gem, Camera, Menu, X, Settings,
  Sparkles, Zap
} from 'lucide-react'
import { useState } from 'react'

import HomePage from './pages/HomePage'
import CardsPage from './pages/CardsPage'
import EnemiesPage from './pages/EnemiesPage'
import RelicsPage from './pages/RelicsPage'
import SessionsPage from './pages/SessionsPage'
import SettingsPage from './pages/SettingsPage'

/**
 * 应用根组件 — 三栏布局
 * 左栏：导航 | 中栏：内容 | 右栏：AI助手面板
 */

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const navItems = [
    { to: '/', icon: Home, label: 'AI助手' },
    { to: '/cards', icon: Sword, label: '卡牌数据库' },
    { to: '/enemies', icon: Shield, label: '敌人/BOSS' },
    { to: '/relics', icon: Gem, label: '遗物数据库' },
    { to: '/sessions', icon: Camera, label: '我的记录' },
    { to: '/settings', icon: Settings, label: '系统设置' },
  ]

  return (
    <div className="flex h-screen bg-spire-bg text-spire-text overflow-hidden font-sans">
      {/* 移动端菜单按钮 */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-spire-surface rounded-lg border border-spire-border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 左侧导航栏 */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static z-40 w-64 h-full bg-spire-surface/50 border-r border-spire-border flex flex-col transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-spire-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-spire-accent flex items-center justify-center font-bold text-spire-bg text-sm">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">
                尖塔<span className="text-spire-accent">智囊</span>
              </h1>
              <p className="text-xs text-spire-muted hidden sm:inline">杀戮尖塔 AI 攻略助手</p>
            </div>
          </div>
        </div>

        {/* 核心功能导航 */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-spire-muted uppercase tracking-wider font-semibold mb-3 px-2">核心功能</p>
          <nav className="space-y-1">
            {navItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-spire-accent/12 text-spire-accent'
                      : 'text-spire-muted hover:bg-spire-accent/8 hover:text-spire-text'
                  }`
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 系统 */}
          <div className="mt-6">
            <p className="text-xs text-spire-muted uppercase tracking-wider font-semibold mb-3 px-2">系统</p>
            <nav className="space-y-1">
              <NavLink
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-spire-accent/12 text-spire-accent'
                      : 'text-spire-muted hover:bg-spire-accent/8 hover:text-spire-text'
                  }`
                }
              >
                <Settings size={18} className="flex-shrink-0" />
                <span>设置</span>
              </NavLink>
            </nav>
          </div>

          {/* 快速统计 */}
          <div className="mt-6 p-3 rounded-lg bg-spire-bg border border-spire-border">
            <p className="text-xs text-spire-muted mb-2">今日使用</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-spire-accent">0</span>
              <span className="text-xs text-spire-muted">次问答</span>
            </div>
            <div className="mt-2 h-1.5 bg-spire-surface rounded-full overflow-hidden">
              <div className="h-full bg-spire-accent rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-[10px] text-spire-muted mt-1">匿名用户</p>
          </div>
        </div>
      </aside>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 中央内容区 */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
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

      {/* 右侧AI助手面板（仅首页显示，xl屏幕） */}
      {isHome && (
        <aside className="w-80 border-l border-spire-border bg-spire-surface/30 flex-shrink-0 flex flex-col hidden xl:flex">
          {/* AI Header */}
          <div className="px-4 py-3 border-b border-spire-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-spire-accent/10 flex items-center justify-center">
                <Sparkles size={16} className="text-spire-accent" />
              </div>
              <h3 className="font-semibold text-sm">AI 攻略助手</h3>
            </div>
            <p className="text-[10px] text-spire-muted">支持 StS1 / StS2 两代游戏</p>
          </div>

          {/* 截图上传区 */}
          <div className="px-4 py-3 border-b border-spire-border">
            <div
              className="border-2 border-dashed border-spire-border rounded-lg p-4 text-center cursor-pointer transition-all hover:border-spire-accent hover:bg-spire-accent/5"
              onClick={() => document.getElementById('aiFileInput')?.click()}
            >
              <input type="file" id="aiFileInput" className="hidden" accept="image/*" />
              <div className="w-10 h-10 rounded-full bg-spire-accent/10 flex items-center justify-center mx-auto mb-2">
                <Camera size={20} className="text-spire-accent" />
              </div>
              <p className="text-xs text-spire-muted mb-1">点击或拖拽上传截图</p>
              <p className="text-[10px] text-spire-muted/60">支持 PNG/JPG，最大 10MB</p>
              <p className="text-[10px] text-spire-accent mt-1">也可直接 Ctrl+V 粘贴</p>
            </div>

            {/* 快速操作 */}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 px-2 rounded-md bg-spire-bg border border-spire-border text-[10px] text-spire-muted hover:border-spire-accent/50 hover:text-spire-accent transition-colors text-center">
                ⚔️ 出牌建议
              </button>
              <button className="flex-1 py-1.5 px-2 rounded-md bg-spire-bg border border-spire-border text-[10px] text-spire-muted hover:border-spire-accent/50 hover:text-spire-accent transition-colors text-center">
                🃏 选牌建议
              </button>
            </div>
          </div>

          {/* 聊天历史 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* AI欢迎 */}
            <div className="bg-gradient-to-br from-spire-surface-light to-spire-card rounded-lg p-3 text-sm border-l-3 border-spire-accent">
              <p className="leading-relaxed">你好！我是尖塔智囊，可以帮你：</p>
              <ul className="mt-1 space-y-0.5 text-xs text-spire-muted list-disc list-inside">
                <li>分析截图给出出牌建议</li>
                <li>查询卡牌、遗物的详细效果</li>
                <li>推荐路线和流派构建</li>
              </ul>
            </div>
          </div>

          {/* 输入区 */}
          <div className="px-4 py-3 border-t border-spire-border">
            <div className="relative">
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 text-sm resize-none pr-10 bg-spire-bg border border-spire-border rounded-lg text-spire-text placeholder-spire-muted focus:outline-none focus:border-spire-accent focus:ring-2 focus:ring-spire-accent/15 transition-all"
                placeholder="输入问题，或粘贴截图..."
              />
              <button className="absolute right-2 bottom-2 w-7 h-7 rounded-md bg-spire-accent flex items-center justify-center hover:bg-spire-accent-hover transition-colors">
                <Zap size={14} className="text-spire-bg" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-spire-muted/60">Enter 发送 · Shift+Enter 换行</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default App
