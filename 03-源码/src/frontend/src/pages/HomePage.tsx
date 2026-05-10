import { useState, useEffect } from 'react'
import { Camera, Search, Shield, Zap, Trophy, BookOpen } from 'lucide-react'
import { sessionsApi, cardsApi } from '../services/api'

/**
 * 首页 — 按设计稿重构
 * 包含：欢迎Hero、快速卡片、问答历史、数据加载
 */

export default function HomePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [recentCards, setRecentCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [sessionsRes, cardsRes] = await Promise.all([
        sessionsApi.list(),
        cardsApi.search(''),
      ])
      const sessionsData = (sessionsRes as any).data || []
      const cardsData = (cardsRes as any).data || []
      setSessions(sessionsData)
      setRecentCards(cardsData.slice(0, 6))
    } catch (err) {
      console.error('首页数据加载失败:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 欢迎 Hero */}
      <div className="bg-spire-surface border border-spire-border rounded-xl p-6 lg:p-8 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-spire-accent/10 flex items-center justify-center flex-shrink-0 border border-spire-accent/20">
            <span className="text-2xl">🏰</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">欢迎回来</h2>
            <p className="text-spire-muted text-sm leading-relaxed">
              正在游玩 <span className="text-spire-accent font-medium">杀戮尖塔</span>
              {sessions.length > 0 && (
                <>
                  {' · '}
                  <span className="text-spire-accent font-medium">
                    {sessions[sessions.length - 1]?.character || '未选择角色'}
                  </span>
                </>
              )}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="bg-spire-accent text-spire-bg px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 hover:bg-spire-accent-hover transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-spire-accent/20">
                <Camera size={16} />
                截图提问
              </button>
              <a href="/cards" className="bg-transparent border border-spire-border text-spire-muted px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 hover:border-spire-accent hover:text-spire-accent transition-colors">
                <Search size={16} />
                查卡牌
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* BOSS卡片 */}
        <div className="bg-spire-surface border border-spire-border rounded-xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">当前BOSS</h3>
              <p className="text-xs text-spire-muted">数据库已就绪</p>
            </div>
          </div>
          <p className="text-xs text-spire-muted leading-relaxed">
            敌人数据库包含25个敌人/BOSS，含血量、意图、对策。战斗中可随时查询。
          </p>
          <a href="/enemies" className="mt-3 text-xs text-spire-accent hover:text-spire-accent-hover font-medium inline-block">
            查看敌人数据库 →
          </a>
        </div>

        {/* 流派卡片 */}
        <div className="bg-spire-surface border border-spire-border rounded-xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">卡牌数据库</h3>
              <p className="text-xs text-spire-muted">{recentCards.length > 0 ? `${recentCards.length}+ 张卡牌` : '加载中...'}</p>
            </div>
          </div>
          <p className="text-xs text-spire-muted leading-relaxed">
            完整收录 StS1/StS2 卡牌，支持搜索、筛选、对比。查询卡牌效果、升级前后变化、适用流派。
          </p>
          <a href="/cards" className="mt-3 text-xs text-spire-accent hover:text-spire-accent-hover font-medium inline-block">
            浏览卡牌 →
          </a>
        </div>

        {/* 版本卡片 */}
        <div className="bg-spire-surface border border-spire-border rounded-xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">遗物数据库</h3>
              <p className="text-xs text-spire-muted">42个遗物</p>
            </div>
          </div>
          <p className="text-xs text-spire-muted leading-relaxed">
            查询遗物效果、适用场景、配合卡牌。了解哪些遗物适合当前卡组。
          </p>
          <a href="/relics" className="mt-3 text-xs text-spire-accent hover:text-spire-accent-hover font-medium inline-block">
            查看遗物 →
          </a>
        </div>
      </div>

      {/* 对局记录区域 */}
      <div className="bg-spire-surface border border-spire-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-spire-border flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BookOpen size={16} className="text-spire-accent" />
            对局记录
          </h3>
          <a href="/sessions" className="text-xs text-spire-muted hover:text-spire-accent">
            查看全部
          </a>
        </div>

        {loading ? (
          <div className="p-8 text-center text-spire-muted text-sm">
            <div className="inline-block w-5 h-5 border-2 border-spire-accent border-t-transparent rounded-full animate-spin mb-2" />
            <p>加载数据中...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-spire-muted text-sm mb-2">暂无对局记录</p>
            <p className="text-xs text-spire-muted/60">
              在AI助手页面上传截图，系统会自动记录对局
            </p>
          </div>
        ) : (
          <div className="divide-y divide-spire-border/50">
            {sessions.slice(0, 5).map((session: any) => (
              <div key={session.id} className="px-5 py-4 hover:bg-spire-bg/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-spire-bg flex items-center justify-center text-sm flex-shrink-0 border border-spire-border">
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{session.character || '未知角色'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-spire-bg border border-spire-border text-spire-muted">
                        进阶 {session.ascension || 0}
                      </span>
                    </div>
                    <p className="text-xs text-spire-muted">
                      {session.act ? `第 ${session.act} 幕` : ''}
                      {session.floor ? ` · ${session.floor} 层` : ''}
                      {session.hp && session.maxHp ? ` · HP ${session.hp}/${session.maxHp}` : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-spire-muted">
                        {session.created_at ? new Date(session.created_at).toLocaleDateString('zh-CN') : ''}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        session.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : session.status === 'abandoned'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {session.status === 'completed' ? '已完成' : session.status === 'abandoned' ? '已放弃' : '进行中'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快捷提示 */}
      <div className="text-center">
        <p className="text-xs text-spire-muted/60">
          💡 提示：游戏时按 <kbd className="px-1.5 py-0.5 rounded bg-spire-surface border border-spire-border text-[10px] font-mono">Win+Shift+S</kbd> 截图，然后 <kbd className="px-1.5 py-0.5 rounded bg-spire-surface border border-spire-border text-[10px] font-mono">Ctrl+V</kbd> 粘贴到右侧AI面板提问
        </p>
      </div>
    </div>
  )
}
