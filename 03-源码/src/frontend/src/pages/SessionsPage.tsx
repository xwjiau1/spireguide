import { useState, useEffect } from 'react'
import { Camera, Plus } from 'lucide-react'
import { sessionsApi } from '../services/api'

/**
 * 对局记录页面
 * 创建对局、添加截图、管理时间线
 */

interface Session {
  id: number
  game_version: string
  character: string
  ascension: number
  seed: string | null
  outcome: string | null
  created_at: string
  notes: string | null
}

const characters = ['ironclad', 'silent', 'defect', 'watcher', 'necrobinder', 'regent']

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newSession, setNewSession] = useState({
    game_version: 'sts1' as 'sts1' | 'sts2',
    character: 'ironclad',
    ascension: 0,
    seed: '',
    notes: '',
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const result = await sessionsApi.list()
      setSessions(result.data)
    } catch (err: any) {
      console.error('加载对局失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async () => {
    try {
      await sessionsApi.create(newSession)
      setShowCreate(false)
      loadSessions()
    } catch (err: any) {
      alert('创建失败: ' + err.message)
    }
  }

  const getCharacterLabel = (char: string) => {
    const map: Record<string, string> = {
      ironclad: '铁甲战士',
      silent: '静默猎手',
      defect: '故障机器人',
      watcher: '观察者',
      necrobinder: '缚魂者',
      regent: '摄政王',
    }
    return map[char] || char
  }

  const getOutcomeLabel = (outcome: string | null) => {
    if (!outcome) return { text: '进行中', color: 'text-blue-400' }
    const map: Record<string, { text: string; color: string }> = {
      win: { text: '胜利', color: 'text-green-400' },
      lose: { text: '失败', color: 'text-red-400' },
      abandoned: { text: '放弃', color: 'text-gray-400' },
      in_progress: { text: '进行中', color: 'text-blue-400' },
    }
    return map[outcome] || { text: outcome, color: 'text-spire-text' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">对局记录</h1>
          <p className="text-spire-muted mt-1">记录你的对局关键节点和截图</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-spire-accent text-white rounded-lg font-medium hover:bg-spire-accent/90 flex items-center gap-2"
        >
          <Plus size={18} />
          新建对局
        </button>
      </div>

      {/* 新建对局弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-spire-card rounded-xl border border-spire-border max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">新建对局</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-spire-muted mb-1">游戏版本</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSession({ ...newSession, game_version: 'sts1' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newSession.game_version === 'sts1'
                        ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                        : 'bg-spire-bg text-spire-muted border border-spire-border'
                    }`}
                  >
                    StS1
                  </button>
                  <button
                    onClick={() => setNewSession({ ...newSession, game_version: 'sts2' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newSession.game_version === 'sts2'
                        ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                        : 'bg-spire-bg text-spire-muted border border-spire-border'
                    }`}
                  >
                    StS2
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-spire-muted mb-1">角色</label>
                <div className="grid grid-cols-3 gap-2">
                  {characters.map((char) => (
                    <button
                      key={char}
                      onClick={() => setNewSession({ ...newSession, character: char })}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        newSession.character === char
                          ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                          : 'bg-spire-bg text-spire-muted border border-spire-border'
                      }`}
                    >
                      {getCharacterLabel(char)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-spire-muted mb-1">进阶等级</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={newSession.ascension}
                  onChange={(e) => setNewSession({ ...newSession, ascension: parseInt(e.target.value) || 0 })}
                  className="w-full bg-spire-bg border border-spire-border rounded-lg px-3 py-2 text-spire-text focus:border-spire-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-spire-muted mb-1">种子（可选）</label>
                <input
                  type="text"
                  value={newSession.seed}
                  onChange={(e) => setNewSession({ ...newSession, seed: e.target.value })}
                  placeholder="输入游戏种子"
                  className="w-full bg-spire-bg border border-spire-border rounded-lg px-3 py-2 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-spire-muted mb-1">备注（可选）</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="对局备注..."
                  rows={3}
                  className="w-full bg-spire-bg border border-spire-border rounded-lg px-3 py-2 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 bg-spire-bg text-spire-muted rounded-lg font-medium border border-spire-border hover:text-spire-text"
              >
                取消
              </button>
              <button
                onClick={createSession}
                className="flex-1 py-2 bg-spire-accent text-white rounded-lg font-medium hover:bg-spire-accent/90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 对局列表 */}
      {loading ? (
        <div className="text-center py-12 text-spire-muted">加载中...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-spire-muted">
          <Camera className="mx-auto mb-4 text-spire-border" size={48} />
          <p>还没有对局记录</p>
          <p className="text-sm mt-1">点击"新建对局"开始记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const outcome = getOutcomeLabel(session.outcome)
            return (
              <div key={session.id} className="bg-spire-card rounded-xl border border-spire-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium px-3 py-1 rounded bg-spire-bg text-spire-text">
                      {session.game_version.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium">{getCharacterLabel(session.character)} · 进阶{session.ascension}</p>
                      <p className="text-xs text-spire-muted">{new Date(session.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                    {session.seed && <span className="text-xs text-spire-muted">种子: {session.seed}</span>}
                  </div>
                  <span className={`font-medium ${outcome.color}`}>{outcome.text}</span>
                </div>
                {session.notes && (
                  <p className="text-sm text-spire-muted mt-2">{session.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
