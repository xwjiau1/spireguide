import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Swords,
  Shield,
  Zap,
  Eye,
  Star,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { archetypesApi } from '../services/api'

/**
 * ArchetypesPage.tsx — 流派列表页
 * 左侧角色筛选栏 + 右侧流派卡片网格
 * 支持搜索、筛选、难度/胜率标签展示
 */

// 角色配置（含图标与样式）
const CHARACTERS = [
  { id: '', name: '全部', icon: Swords, color: 'text-spire-text', badgeClass: '' },
  { id: 'ironclad', name: '铁甲战士', icon: Shield, color: 'text-spire-red', badgeClass: 'ironclad' },
  { id: 'silent', name: '静默猎手', icon: Zap, color: 'text-spire-green', badgeClass: 'silent' },
  { id: 'defect', name: '故障机器人', icon: Flame, color: 'text-spire-accent', badgeClass: 'defect' },
  { id: 'watcher', name: '观察者', icon: Eye, color: 'text-yellow-400', badgeClass: 'watcher' },
]

const PAGE_SIZE = 12

// 胜率标签颜色
function getWinRateColor(winRate: number): string {
  if (winRate >= 0.75) return 'text-green-400'
  if (winRate >= 0.40) return 'text-yellow-400'
  return 'text-red-400'
}

// 胜率标签文字
function getWinRateLabel(winRate: number): string {
  if (winRate >= 0.75) return '高胜率'
  if (winRate >= 0.40) return '中等'
  return '困难'
}

// 难度星级渲染
function DifficultyStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < (rating || 3) ? 'text-yellow-400 fill-yellow-400' : 'text-spire-text-dim'}
        />
      ))}
    </div>
  )
}

export default function ArchetypesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [archetypes, setArchetypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 筛选状态
  const [searchText, setSearchText] = useState('')
  const [character, setCharacter] = useState(searchParams.get('character') || '')
  const [page, setPage] = useState(1)

  // 加载流派数据
  const loadArchetypes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = { game_version: 'sts1' }
      if (character) params.character = character

      const res = await archetypesApi.list(params)
      setArchetypes(res.data || [])
      setPage(1)
    } catch (err) {
      setError('加载流派数据失败：' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [character])

  useEffect(() => {
    loadArchetypes()
  }, [loadArchetypes])

  // 筛选后的数据（支持按名称/描述搜索）
  const filteredArchetypes = useMemo(() => {
    if (!searchText.trim()) return archetypes
    const q = searchText.trim().toLowerCase()
    return archetypes.filter((a) =>
      (a.name_cn || '').toLowerCase().includes(q) ||
      (a.name_en || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q)
    )
  }, [archetypes, searchText])

  // 分页数据
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredArchetypes.slice(start, start + PAGE_SIZE)
  }, [filteredArchetypes, page])

  const totalPages = Math.max(1, Math.ceil(filteredArchetypes.length / PAGE_SIZE))

  // 切换角色筛选
  const handleCharacterChange = (charId: string) => {
    setCharacter(charId)
    setPage(1)
    if (charId) {
      setSearchParams({ character: charId })
    } else {
      setSearchParams({})
    }
  }

  // 获取角色信息
  const getCharInfo = (charId: string) =>
    CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0]

  return (
    <div className="flex gap-4 h-full min-h-[600px]">
      {/* 左侧角色筛选栏 */}
      <aside className="shrink-0 w-16 lg:w-20 flex flex-col gap-2 py-2">
        {CHARACTERS.map((char) => {
          const Icon = char.icon
          const isActive = character === char.id
          return (
            <button
              key={char.id}
              onClick={() => handleCharacterChange(char.id)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                ${isActive
                  ? 'bg-spire-accent/15 border border-spire-accent/40'
                  : 'bg-spire-surface border border-spire-border hover:border-spire-accent/30'
                }
              `}
              title={char.name}
            >
              <Icon
                size={20}
                className={isActive ? 'text-spire-accent' : char.color}
              />
              <span className="text-[10px] text-spire-text-dim leading-tight text-center hidden lg:block">
                {char.name.slice(0, 2)}
              </span>
            </button>
          )
        })}
      </aside>

      {/* 右侧内容区 */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-spire-text">流派指南</h1>
            <p className="text-sm text-spire-text-dim">
              共 <span className="text-spire-accent font-semibold">{filteredArchetypes.length}</span> 个流派
              {character && ` · ${getCharInfo(character).name}`}
              {searchText && ` · 搜索「${searchText}」`}
            </p>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="spire-panel space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-spire-text-dim" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
                placeholder="搜索流派名称或描述..."
                className="spire-input pl-9"
              />
            </div>
            <button
              onClick={loadArchetypes}
              disabled={loading}
              className="spire-btn"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              搜索
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-spire-red/10 border border-spire-red/30 text-spire-red rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* 加载中 */}
        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-spire-accent" size={28} />
            <span className="ml-2 text-spire-text-dim">加载流派数据中...</span>
          </div>
        )}

        {/* 流派卡片网格 */}
        {!loading && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {paginated.map((a) => {
                const charInfo = getCharInfo(a.character)
                const CharIcon = charInfo.icon
                const winRate = a.win_rate ?? 0.5
                const winRateColor = getWinRateColor(winRate)
                const winRateLabel = getWinRateLabel(winRate)
                const tags: string[] = Array.isArray(a.playstyle_tags) ? a.playstyle_tags : []

                return (
                  <div
                    key={a.id}
                    className="game-card cursor-pointer group"
                    onClick={() => navigate(`/archetypes/${a.id}`)}
                  >
                    {/* 顶部信息 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CharIcon size={16} className={charInfo.color} />
                        <h3 className="font-semibold text-spire-text text-sm truncate">
                          {a.name_cn || a.name_en}
                        </h3>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-spire-text-dim group-hover:text-spire-accent transition-colors shrink-0"
                      />
                    </div>

                    {/* 描述 */}
                    <p className="text-xs text-spire-text-dim line-clamp-2 mb-3 min-h-[2rem]">
                      {a.description || '暂无描述'}
                    </p>

                    {/* 标签行 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-spire-text-dim">难度</span>
                        <DifficultyStars rating={a.difficulty_rating || 3} />
                      </div>
                      <div className="flex items-center gap-1">
                        {winRate >= 0.75 ? <TrendingUp size={12} className="text-green-400" /> :
                          winRate < 0.40 ? <TrendingDown size={12} className="text-red-400" /> :
                            <Minus size={12} className="text-yellow-400" />}
                        <span className={`text-xs font-medium ${winRateColor}`}>
                          {Math.round(winRate * 100)}%
                        </span>
                        <span className="text-[10px] text-spire-text-dim">{winRateLabel}</span>
                      </div>
                    </div>

                    {/* 玩法标签 */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-spire-bg border border-spire-border text-spire-text-dim"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 核心卡牌预览 */}
                    {Array.isArray(a.core_cards) && a.core_cards.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-spire-border">
                        <p className="text-[10px] text-spire-text-dim mb-1">核心卡牌</p>
                        <p className="text-xs text-spire-text line-clamp-1">
                          {a.core_cards.slice(0, 3).join('、')}
                          {a.core_cards.length > 3 && ` 等${a.core_cards.length}张`}
                        </p>
                      </div>
                    )}
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
                <span className="text-sm text-spire-text-dim">
                  {page} / {totalPages}
                </span>
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

        {/* 空状态 */}
        {!loading && paginated.length === 0 && !error && (
          <div className="text-center py-12 text-spire-text-dim">
            <Flame size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">未找到匹配的流派</p>
            <p className="text-xs mt-1">尝试更换筛选条件或搜索关键词</p>
          </div>
        )}
      </div>
    </div>
  )
}
