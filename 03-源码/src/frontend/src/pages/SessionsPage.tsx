import { useState, useEffect } from 'react'
import {
  ScrollText,
  Loader2,
  Clock,
  Trophy,
  Skull,
  Play,
  Swords,
  ChevronRight,
} from 'lucide-react'
import { sessionsApi } from '../services/api'

/**
 * SessionsPage.tsx — 我的对局记录
 * 列表展示所有对局记录
 */

const OUTCOME_LABELS: Record<string, { text: string; icon: React.ElementType; color: string }> = {
  victory: { text: '通关', icon: Trophy, color: 'text-spire-green' },
  defeat: { text: '失败', icon: Skull, color: 'text-spire-red' },
  in_progress: { text: '进行中', icon: Play, color: 'text-spire-accent' },
  abandoned: { text: '放弃', icon: Clock, color: 'text-spire-text-dim' },
}

const CHAR_NAMES: Record<string, string> = {
  ironclad: '铁甲战士',
  silent: '静默猎手',
  defect: '故障机器人',
  watcher: '观察者',
  necrobinder: '死灵法师',
  regent: '摄政王',
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await sessionsApi.list()
        setSessions(res.data || [])
      } catch (err) {
        setError('加载对局记录失败：' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-spire-accent" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div>
        <h1 className="text-xl font-bold text-spire-text">我的记录</h1>
        <p className="text-sm text-spire-text-dim">
          共 <span className="text-spire-accent font-semibold">{sessions.length}</span> 场对局
        </p>
      </div>

      {error && (
        <div className="bg-spire-red/10 border border-spire-red/30 text-spire-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* 对局列表 */}
      {sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map((session) => {
            const outcome = OUTCOME_LABELS[session.outcome] || OUTCOME_LABELS.in_progress
            const OutcomeIcon = outcome.icon
            return (
              <div key={session.id} className="game-card flex items-center gap-3">
                <div className={`shrink-0 ${outcome.color}`}>
                  <OutcomeIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-spire-text text-sm">
                      {CHAR_NAMES[session.character] || session.character || '未知角色'}
                    </span>
                    <span className="text-[10px] text-spire-text-dim">
                      进阶 {session.ascension || 0}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${outcome.color} bg-spire-bg border border-spire-border`}>
                      {outcome.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-spire-text-dim">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {session.created_at
                        ? new Date(session.created_at).toLocaleDateString('zh-CN')
                        : '未知时间'}
                    </span>
                    {session.final_floor && (
                      <span className="flex items-center gap-1">
                        <Swords size={12} />
                        到达第 {session.final_floor} 层
                      </span>
                    )}
                    {session.seed && (
                      <span>种子: {session.seed}</span>
                    )}
                  </div>
                  {session.notes && (
                    <p className="text-xs text-spire-text-dim mt-1 line-clamp-1">
                      {session.notes}
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="text-spire-text-dim shrink-0" />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-spire-text-dim">
          <ScrollText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">暂无对局记录</p>
          <p className="text-xs mt-1">开始一场新对局后自动记录</p>
        </div>
      )}
    </div>
  )
}
