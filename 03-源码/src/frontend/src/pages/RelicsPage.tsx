import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Gem,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  Circle,
} from 'lucide-react'
import { relicsApi } from '../services/api'

/**
 * RelicsPage.tsx — 遗物收藏数据库
 * 搜索 + 筛选 + 网格展示 + 分页
 */

const RARITIES = [
  { id: '', name: '全部稀有度' },
  { id: 'starter', name: '初始' },
  { id: 'common', name: '普通' },
  { id: 'uncommon', name: '罕见' },
  { id: 'rare', name: '稀有' },
  { id: 'boss', name: 'BOSS' },
  { id: 'event', name: '事件' },
  { id: 'shop', name: '商店' },
]

const PAGE_SIZE = 20

export default function RelicsPage() {
  const [relics, setRelics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [rarity, setRarity] = useState('')
  const [page, setPage] = useState(1)

  const loadRelics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (rarity) params.rarity = rarity
      if (searchText.trim()) params.q = searchText.trim()
      const res = await relicsApi.list(params)
      setRelics(res.data || [])
      setPage(1)
    } catch (err) {
      setError('加载遗物数据失败：' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [rarity, searchText])

  useEffect(() => {
    loadRelics()
  }, [loadRelics])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return relics.slice(start, start + PAGE_SIZE)
  }, [relics, page])

  const totalPages = Math.max(1, Math.ceil(relics.length / PAGE_SIZE))

  const getRarityIcon = (r: string) => {
    if (r === 'boss' || r === 'rare') return Crown
    if (r === 'uncommon') return Star
    return Circle
  }

  const getRarityClass = (r: string) => {
    switch (r) {
      case 'boss': return 'rarity-rare'
      case 'rare': return 'rarity-rare'
      case 'uncommon': return 'rarity-uncommon'
      case 'common': return 'rarity-common'
      default: return 'rarity-common'
    }
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-spire-text">遗物收藏</h1>
          <p className="text-sm text-spire-text-dim">
            共 <span className="text-spire-accent font-semibold">{relics.length}</span> 件遗物
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
              placeholder="搜索遗物名称..."
              className="spire-input pl-9"
            />
          </div>
          <button onClick={loadRelics} disabled={loading} className="spire-btn">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            搜索
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Gem size={14} className="text-spire-text-dim" />
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="spire-input w-auto py-1.5 px-2 text-sm">
            {RARITIES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {(rarity || searchText) && (
            <button
              onClick={() => { setRarity(''); setSearchText('') }}
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
          <span className="ml-2 text-spire-text-dim">加载遗物数据中...</span>
        </div>
      )}

      {/* 遗物网格 */}
      {!loading && relics.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map((relic) => {
              const RarityIcon = getRarityIcon(relic.rarity)
              return (
                <div key={relic.id} className="game-card">
                  <div className="flex items-start gap-2 mb-2">
                    <RarityIcon size={18} className="text-spire-accent shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-spire-text text-sm">{relic.name_cn || relic.name_en}</h3>
                      <span className={`card-tag ${getRarityClass(relic.rarity)} mt-1`}>
                        {RARITIES.find((r) => r.id === relic.rarity)?.name || relic.rarity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-spire-text-dim line-clamp-3 min-h-[3rem]">
                    {relic.effect || '暂无效果描述'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="spire-btn-secondary px-2 py-1">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-spire-text-dim">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="spire-btn-secondary px-2 py-1">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {!loading && relics.length === 0 && !error && (
        <div className="text-center py-12 text-spire-text-dim">
          <Gem size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配的遗物</p>
          <p className="text-xs mt-1">尝试更换筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  )
}
