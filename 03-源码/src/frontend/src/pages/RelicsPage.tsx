import { useState, useEffect } from 'react'
import { Search, Gem } from 'lucide-react'
import { relicsApi } from '../services/api'

/**
 * 遗物数据库页面
 */

interface Relic {
  id: number
  game_version: string
  name_cn: string
  name_en: string
  rarity: string
  character: string | null
  effect: string
  flavor_text: string | null
}

const rarities = [
  { value: 'starter', label: '初始', color: 'text-gray-400' },
  { value: 'common', label: '普通', color: 'text-white' },
  { value: 'uncommon', label: '罕见', color: 'text-blue-400' },
  { value: 'rare', label: '稀有', color: 'text-yellow-400' },
  { value: 'boss', label: 'BOSS', color: 'text-red-400' },
  { value: 'shop', label: '商店', color: 'text-green-400' },
  { value: 'event', label: '事件', color: 'text-purple-400' },
]

export default function RelicsPage() {
  const [relics, setRelics] = useState<Relic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gameVersion, setGameVersion] = useState<'all' | 'sts1' | 'sts2'>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')

  useEffect(() => {
    loadRelics()
  }, [])

  const loadRelics = async () => {
    setLoading(true)
    try {
      const result = await relicsApi.list()
      setRelics(result.data)
    } catch (err: any) {
      console.error('加载遗物失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRelics = relics.filter((relic) => {
    if (gameVersion !== 'all' && relic.game_version !== gameVersion) return false
    if (selectedRarity !== 'all' && relic.rarity !== selectedRarity) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        relic.name_cn.toLowerCase().includes(q) ||
        relic.name_en.toLowerCase().includes(q) ||
        relic.effect.toLowerCase().includes(q)
      )
    }
    return true
  })

  const getRarityClass = (rarity: string) => {
    return rarities.find((r) => r.value === rarity)?.color || 'text-white'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">遗物数据库</h1>
        <p className="text-spire-muted mt-1">浏览全部遗物效果</p>
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-spire-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索遗物名称或效果..."
            className="w-full bg-spire-card border border-spire-border rounded-lg pl-10 pr-4 py-3 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none"
          />
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {[{ value: 'all', label: '全部' }, { value: 'sts1', label: 'StS1' }, { value: 'sts2', label: 'StS2' }].map((v) => (
            <button
              key={v.value}
              onClick={() => setGameVersion(v.value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameVersion === v.value
                  ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                  : 'bg-spire-card text-spire-muted border border-spire-border'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-spire-muted text-sm flex items-center">稀有度:</span>
          <button
            onClick={() => setSelectedRarity('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedRarity === 'all'
                ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                : 'bg-spire-card text-spire-muted border border-spire-border'
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
                  : 'bg-spire-card text-spire-muted border border-spire-border'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-spire-muted">共 {filteredRelics.length} 个遗物</p>

      {/* 遗物列表 */}
      {loading ? (
        <div className="text-center py-12 text-spire-muted">加载中...</div>
      ) : filteredRelics.length === 0 ? (
        <div className="text-center py-12 text-spire-muted">没有找到匹配的遗物</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRelics.map((relic) => (
            <div key={relic.id} className="bg-spire-card rounded-xl border border-spire-border p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getRarityClass(relic.rarity)}`}>
                  <Gem size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${getRarityClass(relic.rarity)}`}>{relic.name_cn}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-spire-bg text-spire-muted">
                      {rarities.find((r) => r.value === relic.rarity)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-spire-muted mb-2">{relic.name_en}</p>
                  <p className="text-sm text-spire-text">{relic.effect}</p>
                  {relic.flavor_text && (
                    <p className="text-xs text-spire-muted mt-2 italic">{relic.flavor_text}</p>
                  )}
                  {relic.character && (
                    <p className="text-xs text-spire-accent mt-2">角色专属: {relic.character}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
