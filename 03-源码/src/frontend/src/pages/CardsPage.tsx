import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { cardsApi } from '../services/api'

/**
 * 卡牌数据库页面
 * 支持浏览、搜索、筛选、详情查看
 */

interface Card {
  id: number
  game_version: string
  character: string
  name_cn: string
  name_en: string
  cost: number
  type: string
  rarity: string
  effect_base: string
  effect_upgraded: string
  keywords: string[]
}

const characters = [
  { value: 'ironclad', label: '铁甲战士', color: 'text-spire-ironclad' },
  { value: 'silent', label: '静默猎手', color: 'text-spire-silent' },
  { value: 'defect', label: '故障机器人', color: 'text-spire-defect' },
  { value: 'watcher', label: '观察者', color: 'text-spire-watcher' },
  { value: 'necrobinder', label: '缚魂者', color: 'text-spire-necrobinder' },
  { value: 'regent', label: '摄政王', color: 'text-spire-regent' },
  { value: 'colorless', label: '无色', color: 'text-gray-400' },
  { value: 'curse', label: '诅咒', color: 'text-purple-400' },
]

const types = [
  { value: 'attack', label: '攻击', color: 'border-red-500/50 bg-red-950/30' },
  { value: 'skill', label: '技能', color: 'border-blue-500/50 bg-blue-950/30' },
  { value: 'power', label: '能力', color: 'border-green-500/50 bg-green-950/30' },
  { value: 'curse', label: '诅咒', color: 'border-purple-500/50 bg-purple-950/30' },
  { value: 'status', label: '状态', color: 'border-gray-500/50 bg-gray-950/30' },
]

const rarities = [
  { value: 'basic', label: '基础', color: 'text-gray-400' },
  { value: 'common', label: '普通', color: 'text-white' },
  { value: 'uncommon', label: '罕见', color: 'text-blue-400' },
  { value: 'rare', label: '稀有', color: 'text-yellow-400' },
  { value: 'special', label: '特殊', color: 'text-purple-400' },
]

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gameVersion, setGameVersion] = useState<'all' | 'sts1' | 'sts2'>('all')
  const [selectedCharacter, setSelectedCharacter] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [detailCard, setDetailCard] = useState<Card | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setLoading(true)
    try {
      const result = await cardsApi.list()
      setCards(result.data)
    } catch (err: any) {
      console.error('加载卡牌失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadCards()
      return
    }
    setLoading(true)
    try {
      const result = await cardsApi.search(search)
      setCards(result.data)
    } catch (err: any) {
      console.error('搜索失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (gameVersion !== 'all' && card.game_version !== gameVersion) return false
      if (selectedCharacter !== 'all' && card.character !== selectedCharacter) return false
      if (selectedType !== 'all' && card.type !== selectedType) return false
      if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false
      return true
    })
  }, [cards, gameVersion, selectedCharacter, selectedType, selectedRarity])

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity}`
  }

  const getTypeClass = (type: string) => {
    return `card-type-${type}`
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold">卡牌数据库</h1>
        <p className="text-spire-muted mt-1">浏览、搜索、筛选杀戮尖塔全部卡牌</p>
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-spire-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索卡牌名称（支持中英文）..."
            className="w-full bg-spire-card border border-spire-border rounded-lg pl-10 pr-4 py-3 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-spire-accent text-white rounded-lg font-medium hover:bg-spire-accent/90"
        >
          搜索
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg font-medium border transition-colors flex items-center gap-2 ${
            showFilters
              ? 'bg-spire-accent/20 text-spire-accent border-spire-accent/30'
              : 'bg-spire-card text-spire-muted border-spire-border hover:text-spire-text'
          }`}
        >
          <Filter size={18} />
          筛选
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 筛选器 */}
      {showFilters && (
        <div className="bg-spire-card rounded-xl border border-spire-border p-4 space-y-4">
          {/* 游戏版本 */}
          <div>
            <p className="text-sm text-spire-muted mb-2">游戏版本</p>
            <div className="flex gap-2">
              {[{ value: 'all', label: '全部' }, { value: 'sts1', label: 'StS1' }, { value: 'sts2', label: 'StS2' }].map((v) => (
                <button
                  key={v.value}
                  onClick={() => setGameVersion(v.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    gameVersion === v.value
                      ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                      : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* 角色 */}
          <div>
            <p className="text-sm text-spire-muted mb-2">角色</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCharacter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCharacter === 'all'
                    ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                    : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                }`}
              >
                全部
              </button>
              {characters.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCharacter(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCharacter === c.value
                      ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                      : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 类型 */}
          <div>
            <p className="text-sm text-spire-muted mb-2">类型</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                    : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                }`}
              >
                全部
              </button>
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === t.value
                      ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                      : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 稀有度 */}
          <div>
            <p className="text-sm text-spire-muted mb-2">稀有度</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRarity === 'all'
                    ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                    : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                }`}
              >
                全部
              </button>
              {rarities.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRarity(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRarity === r.value
                      ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                      : 'bg-spire-bg text-spire-muted border border-spire-border hover:text-spire-text'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 统计 */}
      <div className="flex items-center gap-4 text-sm text-spire-muted">
        <span>共 {filteredCards.length} 张卡牌</span>
        {gameVersion !== 'all' && <span>· {gameVersion.toUpperCase()}</span>}
        {selectedCharacter !== 'all' && (
          <span>· {characters.find((c) => c.value === selectedCharacter)?.label}</span>
        )}
      </div>

      {/* 卡牌列表 */}
      {loading ? (
        <div className="text-center py-12 text-spire-muted">加载中...</div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 text-spire-muted">没有找到匹配的卡牌</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setDetailCard(card)}
              className={`rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${getTypeClass(card.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-bold ${getRarityClass(card.rarity)}`}>{card.name_cn}</h3>
                <span className="text-sm font-mono bg-spire-bg/80 px-2 py-0.5 rounded">{card.cost >= 0 ? card.cost : 'X'}</span>
              </div>
              <p className="text-xs text-spire-muted mb-1">{card.name_en}</p>
              <p className="text-xs text-spire-muted mb-2">
                {characters.find((c) => c.value === card.character)?.label || card.character}
              </p>
              <p className="text-sm text-spire-text/80 line-clamp-2">{card.effect_base}</p>
              {card.effect_upgraded && (
                <p className="text-sm text-spire-success mt-1 line-clamp-2">↑ {card.effect_upgraded}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 卡牌详情弹窗 */}
      {detailCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setDetailCard(null)}>
          <div
            className={`bg-spire-card rounded-xl border-2 max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 ${getTypeClass(detailCard.type)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${getRarityClass(detailCard.rarity)}`}>{detailCard.name_cn}</h2>
                <p className="text-spire-muted">{detailCard.name_en}</p>
              </div>
              <button onClick={() => setDetailCard(null)} className="text-spire-muted hover:text-spire-text">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <span className="bg-spire-bg px-3 py-1 rounded-full">{detailCard.cost >= 0 ? `${detailCard.cost}费` : 'X费'}</span>
                <span className="bg-spire-bg px-3 py-1 rounded-full">{types.find((t) => t.value === detailCard.type)?.label}</span>
                <span className="bg-spire-bg px-3 py-1 rounded-full">{rarities.find((r) => r.value === detailCard.rarity)?.label}</span>
              </div>

              <div className="bg-spire-bg rounded-lg p-4">
                <p className="text-sm text-spire-muted mb-1">基础效果</p>
                <p className="text-spire-text">{detailCard.effect_base}</p>
              </div>

              {detailCard.effect_upgraded && (
                <div className="bg-spire-success/10 rounded-lg p-4 border border-spire-success/20">
                  <p className="text-sm text-spire-success mb-1">升级后</p>
                  <p className="text-spire-text">{detailCard.effect_upgraded}</p>
                </div>
              )}

              {detailCard.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detailCard.keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-spire-bg px-2 py-1 rounded text-spire-muted">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-spire-muted">
                <p>版本: {detailCard.game_version.toUpperCase()}</p>
                <p>角色: {characters.find((c) => c.value === detailCard.character)?.label || detailCard.character}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
