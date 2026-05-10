import { Routes, Route, NavLink } from 'react-router-dom'
import {
  Home,
  Sword,
  Shield,
  Gem,
  Camera,
  BookOpen,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

import HomePage from './pages/HomePage'
import CardsPage from './pages/CardsPage'
import EnemiesPage from './pages/EnemiesPage'
import RelicsPage from './pages/RelicsPage'
import SessionsPage from './pages/SessionsPage'

/**
 * 应用根组件
 * 包含侧边栏导航和路由
 */

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { to: '/', icon: Home, label: 'AI助手' },
    { to: '/cards', icon: Sword, label: '卡牌数据库' },
    { to: '/enemies', icon: Shield, label: '敌人数据库' },
    { to: '/relics', icon: Gem, label: '遗物数据库' },
    { to: '/sessions', icon: Camera, label: '对局记录' },
  ]

  return (
    <div className="flex h-screen bg-spire-bg text-spire-text overflow-hidden">
      {/* 移动端菜单按钮 */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-spire-card rounded-lg border border-spire-border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static z-40 w-64 h-full bg-spire-card border-r border-spire-border flex flex-col transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-spire-border">
          <div className="flex items-center gap-3">
            <BookOpen className="text-spire-accent" size={28} />
            <div>
              <h1 className="text-lg font-bold text-spire-text">尖塔智囊</h1>
              <p className="text-xs text-spire-muted">SpireGuide v0.1</p>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                    : 'text-spire-muted hover:bg-spire-border/30 hover:text-spire-text'
                }`
              }
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t border-spire-border text-xs text-spire-muted">
          <p>支持 StS1 / StS2</p>
          <p className="mt-1">策略仅供参考</p>
        </div>
      </aside>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/enemies" element={<EnemiesPage />} />
            <Route path="/relics" element={<RelicsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
