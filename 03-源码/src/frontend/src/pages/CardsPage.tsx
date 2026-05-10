import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Swords,
  Shield,
  Zap,
  Heart,
  Star,
} from 'lucide-react'
import { cardsApi } from '../services/api'

/**
 * CardsPage.tsx — 卡牌数据库浏览页
 * 搜索 + 筛选 + 网格展示 + 分页
 */

const CHARACTERS = [
  { id: '', name: '全部角色' },
  { id: 'ironclad', name: '铁甲战士' },
  { id: 'silent', name: '静默猎手' },
  { id: 'defect', name: '故障机器人' },
  { id: 'watcher', name: '观察者' },
  { id: 'colorless', name: '无色' },
]

const TYPES = [
  { id: '', name: '全部类型' },
  { id: 'attack', name: '攻击' },
  { id: 'skill', name: '技能' },
  { id: 'power', name: '能力' },
  { id: 'curse', name: '诅咒' },
]

const RARITIES = [
  { id: '', name: '全部稀有度' },
  { id: 'common', name: '普通' },
  { id: 'uncommon', name: '罕见' },
  { id: 'rare', name: '稀有' },
  { id: 'special', name: '特殊' },
]

const COST_ICONS: Record<string, React.ElementType> = {
  attack: Swords,
  skill: Shield,
  power: Zap,
  curse: Heart,
  default: Star,
}

const PAGE_SIZE = 24

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 筛选状态
  const [searchText, setSearchText] = useState('')
  const [character, setCharacter] = useState('')
  const [type, setType] = useState('')
  const [rarity, setRarity] = useState('')
  const [page, setPage] = useState(1)

  // 加载数据
  const loadCards = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (character) params.character = character
      if (type) params.type = type
      if (rarity) params.rarity = rarity
      if (searchText.trim()) params.q = searchText.trim()

      const res = await cardsApi.list(params)
      setCards(res.data || [])
      setPage(1)
    } catch (err) {
      setError('加载卡牌失败：' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [character, type, rarity, searchText])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  // 分页数据
  const paginatedCards = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return cards.slice(start, start + PAGE_SIZE)
  }, [cards, page])

  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE))

  // 卡牌类型图标
  const getTypeIcon = (t: string) => {
    const Icon = COST_ICONS[t] || COST_ICONS.default
    return Icon
  }

  // 稀有度样式
  const getRarityClass = (r: string) => {
    switch (r) {
      case 'common': return 'rarity-common'
      case 'uncommon': return 'rarity-uncommon'
      case 'rare': return 'rarity-rare'
      default: return 'rarity-common'
    }
  }

  // 角色样式
  const getCharClass = (c: string) => {
    const map: Record<string, string> = {
      ironclad: 'ironclad',
      silent: 'silent',
      defect: 'defect',
      watcher: 'watcher',
      necrobinder: 'necrobinder',
      regent: 'regent',
    }
    return map[c] || ''
  }

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-spire-text">卡牌数据库</h1>
          <p className="text-sm text-spire-text-dim">
            共 <span className="text-spire-accent font-semibold">{cards.length}</span> 张卡牌
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
              placeholder="搜索卡牌名称..."
              className="spire-input pl-9"
            />
          </div>
          <button
            onClick={loadCards}
            disabled={loading}
            className="spire-btn"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            搜索
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={14} className="text-spire-text-dim" />

          <select
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="spire-input w-auto py-1.5 px-2 text-sm"
          >
            {CHARACTERS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="spire-input w-auto py-1.5 px-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="spire-input w-auto py-1.5 px-2 text-sm"
          >
            {RARITIES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {(character || type || rarity || searchText) && (
            <button
              onClick={() => {
                setCharacter('')
                setType('')
                setRarity('')
                setSearchText('')
              }}
              className="text-xs text-spire-text-dim hover:text-spire-text underline"
            >
              重置筛选
            </button>
          )}
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
          <span className="ml-2 text-spire-text-dim">加载卡牌数据中...</span>
        </div>
      )}

      {/* 卡牌网格 */}
      {!loading && cards.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginatedCards.map((card) => {
              const TypeIcon = getTypeIcon(card.type)
              return (
                <div key={card.id} className="game-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <TypeIcon
                        size={14}
                        className={
                          card.type === 'attack'
                            ? 'text-spire-red'
                            : card.type === 'skill'
                            ? 'text-spire-green'
                            : card.type === 'power'
                            ? 'text-spire-accent'
                            : 'text-spire-text-dim'
                        }
                      />
                      <span className="font-semibold text-spire-text text-sm">
                        {card.name_cn || card.name_en}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-spire-accent">
                      {card.cost === 'X' ? 'X' : card.cost}
                    </span>
                  </div>

                  <p className="text-xs text-spire-text-dim line-clamp-2 mb-2 min-h-[2rem]">
                    {card.effect_base || '暂无效果描述'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {card.character && (
                        <span className={`char-badge ${getCharClass(card.character)}`}>
                          {CHARACTERS.find((c) => c.id === card.character)?.name || card.character}
                        </span>
                      )}
                      <span className={`card-tag ${getRarityClass(card.rarity)}`}>
                        {RARITIES.find((r) => r.id === card.rarity)?.name || card.rarity}
                      </span>
                    </div>
                    <span className="text-[10px] text-spire-text-dim">
                      {card.type === 'attack' ? '攻击' : card.type === 'skill' ? '技能' : card.type === 'power' ? '能力' : card.type === 'curse' ? '诅咒' : card.type}
                    </span>
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
      {!loading && cards.length === 0 && !error && (
        <div className="text-center py-12 text-spire-text-dim">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配的卡牌</p>
          <p className="text-xs mt-1">尝试更换筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  )
}
