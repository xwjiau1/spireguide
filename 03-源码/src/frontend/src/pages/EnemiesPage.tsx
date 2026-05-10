import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Skull,
  Sword,
  Heart,
  Eye,
} from 'lucide-react'
import { enemiesApi } from '../services/api'

/**
 * EnemiesPage.tsx — 敌人 / BOSS 数据库
 * 搜索 + 筛选 + 列表展示 + 分页
 */

const ACTS = [
  { id: '', name: '全部幕' },
  { id: '1', name: '第1幕' },
  { id: '2', name: '第2幕' },
  { id: '3', name: '第3幕' },
]

const TYPES = [
  { id: '', name: '全部类型' },
  { id: 'normal', name: '普通' },
  { id: 'elite', name: '精英' },
  { id: 'boss', name: 'BOSS' },
]

const PAGE_SIZE = 12

export default function EnemiesPage() {
  const [enemies, setEnemies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [act, setAct] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const loadEnemies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (act) params.act = act
      if (type) params.type = type
      if (searchText.trim()) params.q = searchText.trim()
      const res = await enemiesApi.list(params)
      setEnemies(res.data || [])
      setPage(1)
    } catch (err) {
      setError('加载敌人数据失败：' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [act, type, searchText])

  useEffect(() => {
    loadEnemies()
  }, [loadEnemies])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return enemies.slice(start, start + PAGE_SIZE)
  }, [enemies, page])

  const totalPages = Math.max(1, Math.ceil(enemies.length / PAGE_SIZE))

  const getTypeIcon = (t: string) => {
    if (t === 'boss') return Skull
    if (t === 'elite') return Sword
    return Eye
  }

  const getTypeLabel = (t: string) => {
    if (t === 'boss') return 'BOSS'
    if (t === 'elite') return '精英'
    return '普通'
  }

  const getTypeColor = (t: string) => {
    if (t === 'boss') return 'text-spire-red'
    if (t === 'elite') return 'text-spire-accent'
    return 'text-spire-text-dim'
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-spire-text">敌人 / BOSS</h1>
          <p className="text-sm text-spire-text-dim">
            共 <span className="text-spire-accent font-semibold">{enemies.length}</span> 个敌人
            {searchText && ` · 搜索「${searchText}」`}
          </p>
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div className="spire-panel space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-spire-text-dim" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索敌人名称..."
              className="spire-input pl-9"
            />
          </div>
          <button onClick={loadEnemies} disabled={loading} className="spire-btn">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            搜索
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <ShieldAlert size={14} className="text-spire-text-dim" />
          <select value={act} onChange={(e) => setAct(e.target.value)} className="spire-input w-auto py-1.5 px-2 text-sm">
            {ACTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="spire-input w-auto py-1.5 px-2 text-sm">
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {(act || type || searchText) && (
            <button
              onClick={() => { setAct(''); setType(''); setSearchText('') }}
              className="text-xs text-spire-text-dim hover:text-spire-text underline"
            >
              重置筛选
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-spire-red/10 border border-spire-red/30 text-spire-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-spire-accent" size={28} />
          <span className="ml-2 text-spire-text-dim">加载敌人数据中...</span>
        </div>
      )}

      {/* 敌人列表 */}
      {!loading && enemies.length > 0 && (
        <>
          <div className="space-y-2">
            {paginated.map((enemy) => {
              const TypeIcon = getTypeIcon(enemy.type)
              return (
                <div key={enemy.id} className="game-card flex items-start gap-3">
                  <div className={`mt-0.5 ${getTypeColor(enemy.type)}`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-spire-text">{enemy.name_cn || enemy.name_en}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeColor(enemy.type)} bg-spire-bg border border-spire-border`}>
                        {getTypeLabel(enemy.type)}
                      </span>
                      <span className="text-[10px] text-spire-text-dim">第{enemy.act}幕</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-spire-text-dim mb-1.5">
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {enemy.hp_min || '?'} ~ {enemy.hp_max || '?'}
                      </span>
                    </div>
                    <p className="text-xs text-spire-text-dim line-clamp-2">
                      {enemy.strategy_general || '暂无策略信息'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="spire-btn-secondary px-2 py-1"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-spire-text-dim">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="spire-btn-secondary px-2 py-1"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {!loading && enemies.length === 0 && !error && (
        <div className="text-center py-12 text-spire-text-dim">
          <ShieldAlert size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配的敌人</p>
          <p className="text-xs mt-1">尝试更换筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  )
}
