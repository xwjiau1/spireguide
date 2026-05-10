import { useState, useEffect } from 'react'
import { Search, Shield, Skull } from 'lucide-react'
import { enemiesApi } from '../services/api'

/**
 * 敌人数据库页面
 */

interface Enemy {
  id: number
  game_version: string
  name_cn: string
  name_en: string
  act: number
  type: string
  hp_min: number | null
  hp_max: number | null
  strategy_general: string
}

export default function EnemiesPage() {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gameVersion, setGameVersion] = useState<'all' | 'sts1' | 'sts2'>('all')
  const [selectedAct, setSelectedAct] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [detailEnemy, setDetailEnemy] = useState<any>(null)

  useEffect(() => {
    loadEnemies()
  }, [])

  const loadEnemies = async () => {
    setLoading(true)
    try {
      const result = await enemiesApi.list()
      setEnemies(result.data)
    } catch (err: any) {
      console.error('加载敌人失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadEnemies()
      return
    }
    setLoading(true)
    try {
      const result = await enemiesApi.search(search)
      setEnemies(result.data)
    } catch (err: any) {
      console.error('搜索失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEnemies = enemies.filter((enemy) => {
    if (gameVersion !== 'all' && enemy.game_version !== gameVersion) return false
    if (selectedAct !== 'all' && enemy.act !== parseInt(selectedAct)) return false
    if (selectedType !== 'all' && enemy.type !== selectedType) return false
    return true
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boss': return 'text-red-400 border-red-500/30 bg-red-950/20'
      case 'elite': return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
      default: return 'text-spire-muted border-spire-border bg-spire-bg'
    }
  }

  const getTypeIcon = (type: string) => {
    if (type === 'boss') return <Skull size={16} />
    if (type === 'elite') return <Shield size={16} />
    return <Shield size={16} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">敌人数据库</h1>
        <p className="text-spire-muted mt-1">了解每个敌人的意图模式和应对策略</p>
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
            placeholder="搜索敌人名称..."
            className="w-full bg-spire-card border border-spire-border rounded-lg pl-10 pr-4 py-3 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-spire-accent text-white rounded-lg font-medium hover:bg-spire-accent/90"
        >
          搜索
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        {/* 版本 */}
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
        {/* 章节 */}
        <div className="flex gap-2">
          <span className="text-spire-muted text-sm flex items-center">章节:</span>
          {[{ value: 'all', label: '全部' }, { value: '1', label: 'Act 1' }, { value: '2', label: 'Act 2' }, { value: '3', label: 'Act 3' }, { value: '4', label: 'Act 4' }].map((v) => (
            <button
              key={v.value}
              onClick={() => setSelectedAct(v.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedAct === v.value
                  ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                  : 'bg-spire-card text-spire-muted border border-spire-border'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {/* 类型 */}
        <div className="flex gap-2">
          <span className="text-spire-muted text-sm flex items-center">类型:</span>
          {[{ value: 'all', label: '全部' }, { value: 'normal', label: '普通' }, { value: 'elite', label: '精英' }, { value: 'boss', label: 'BOSS' }].map((v) => (
            <button
              key={v.value}
              onClick={() => setSelectedType(v.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedType === v.value
                  ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
                  : 'bg-spire-card text-spire-muted border border-spire-border'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-spire-muted">共 {filteredEnemies.length} 个敌人</p>

      {/* 敌人列表 */}
      {loading ? (
        <div className="text-center py-12 text-spire-muted">加载中...</div>
      ) : filteredEnemies.length === 0 ? (
        <div className="text-center py-12 text-spire-muted">没有找到匹配的敌人</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnemies.map((enemy) => (
            <div
              key={enemy.id}
              onClick={async () => {
                try {
                  const result = await enemiesApi.getById(String(enemy.id))
                  setDetailEnemy(result.data)
                } catch (err) {
                  console.error(err)
                }
              }}
              className="bg-spire-card rounded-xl border border-spire-border p-4 cursor-pointer hover:border-spire-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-spire-text">{enemy.name_cn}</h3>
                  <p className="text-xs text-spire-muted">{enemy.name_en}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(enemy.type)} flex items-center gap-1`}>
                  {getTypeIcon(enemy.type)}
                  {enemy.type === 'boss' ? 'BOSS' : enemy.type === 'elite' ? '精英' : '普通'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-spire-muted mb-2">
                <span>Act {enemy.act}</span>
                {enemy.hp_min && enemy.hp_max && (
                  <span>HP: {enemy.hp_min}-{enemy.hp_max}</span>
                )}
              </div>
              {enemy.strategy_general && (
                <p className="text-sm text-spire-text/70 line-clamp-2">{enemy.strategy_general}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {detailEnemy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setDetailEnemy(null)}>
          <div className="bg-spire-card rounded-xl border border-spire-border max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-spire-text">{detailEnemy.name_cn}</h2>
                <p className="text-spire-muted">{detailEnemy.name_en}</p>
              </div>
              <button onClick={() => setDetailEnemy(null)} className="text-spire-muted hover:text-spire-text text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm border ${getTypeColor(detailEnemy.type)}`}>
                  {detailEnemy.type === 'boss' ? 'BOSS' : detailEnemy.type === 'elite' ? '精英' : '普通'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-spire-bg text-spire-muted">Act {detailEnemy.act}</span>
                {detailEnemy.hp_min && (
                  <span className="px-3 py-1 rounded-full text-sm bg-spire-bg text-spire-muted">HP: {detailEnemy.hp_min}-{detailEnemy.hp_max}</span>
                )}
              </div>

              <div className="bg-spire-bg rounded-lg p-4">
                <p className="text-sm text-spire-muted mb-2">意图模式</p>
                {detailEnemy.intents?.map((intent: any, i: number) => (
                  <div key={i} className="text-sm text-spire-text py-1">
                    • {intent.pattern}
                    {intent.damage && ` (${intent.damage}伤害)`}
                    {intent.block && ` (格挡${intent.block})`}
                    {intent.buff && ` [${intent.buff}]`}
                    {intent.condition && ` — ${intent.condition}`}
                  </div>
                ))}
              </div>

              {detailEnemy.strategy_general && (
                <div className="bg-spire-bg rounded-lg p-4">
                  <p className="text-sm text-spire-muted mb-1">通用对策</p>
                  <p className="text-spire-text">{detailEnemy.strategy_general}</p>
                </div>
              )}

              {detailEnemy.strategy_by_character && (
                <div className="bg-spire-bg rounded-lg p-4">
                  <p className="text-sm text-spire-muted mb-2">角色对策</p>
                  {Object.entries(detailEnemy.strategy_by_character).map(([char, strat]: [string, any]) => (
                    <div key={char} className="text-sm py-1">
                      <span className="text-spire-accent font-medium">{char}:</span> <span className="text-spire-text">{strat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
