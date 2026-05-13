import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  ArrowLeft,
  Star,
  Swords,
  Shield,
  Zap,
  Eye,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Crosshair,
  Gem,
  Map,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Clock,
  Trophy,
  Skull,
  AlertCircle,
  Send,
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { archetypesApi, attemptsApi, aiApi } from '../services/api'

/**
 * ArchetypeDetailPage.tsx — 流派详情页
 * 顶部信息栏 + 左侧标签导航 + 右侧内容面板
 * 5个标签页：流派攻略 / 核心卡牌 / 关键遗物 / 路线偏好 / 我的尝试
 */

// 角色配置
const CHARACTERS: Record<string, { name: string; icon: any; color: string; badgeClass: string }> = {
  ironclad: { name: '铁甲战士', icon: Shield, color: 'text-spire-red', badgeClass: 'ironclad' },
  silent: { name: '静默猎手', icon: Zap, color: 'text-spire-green', badgeClass: 'silent' },
  defect: { name: '故障机器人', icon: Flame, color: 'text-spire-accent', badgeClass: 'defect' },
  watcher: { name: '观察者', icon: Eye, color: 'text-yellow-400', badgeClass: 'watcher' },
}

// 标签页配置
const TABS = [
  { id: 'guide', label: '流派攻略', icon: BookOpen },
  { id: 'cards', label: '核心卡牌', icon: Crosshair },
  { id: 'relics', label: '关键遗物', icon: Gem },
  { id: 'route', label: '路线偏好', icon: Map },
  { id: 'attempts', label: '我的尝试', icon: ClipboardList },
]

// 难度星级
function DifficultyStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < (rating || 3) ? 'text-yellow-400 fill-yellow-400' : 'text-spire-text-dim'}
        />
      ))}
    </div>
  )
}

// 胜率颜色
function getWinRateColor(winRate: number): string {
  if (winRate >= 0.75) return 'text-green-400'
  if (winRate >= 0.40) return 'text-yellow-400'
  return 'text-red-400'
}

// 结果图标
function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === 'win') return <Trophy size={14} className="text-green-400" />
  if (outcome === 'lose') return <Skull size={14} className="text-red-400" />
  if (outcome === 'abandoned') return <AlertCircle size={14} className="text-yellow-400" />
  return <Clock size={14} className="text-spire-text-dim" />
}

// 结果文字
function OutcomeLabel({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    win: '通关',
    lose: '失败',
    abandoned: '放弃',
    in_progress: '进行中',
  }
  return <span>{map[outcome] || outcome}</span>
}

// 卡牌类型图标映射
const TYPE_ICONS: Record<string, { color: string; label: string }> = {
  attack: { color: 'text-red-400', label: '攻击' },
  skill: { color: 'text-blue-400', label: '技能' },
  power: { color: 'text-purple-400', label: '能力' },
  curse: { color: 'text-gray-400', label: '诅咒' },
}

export default function ArchetypeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [archetype, setArchetype] = useState<any>(null)
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('guide')

  // 尝试记录弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<any>(null)
  const [attemptForm, setAttemptForm] = useState({
    character: '',
    seed: '',
    ascension: 0,
    outcome: 'in_progress',
    final_floor: undefined as number | undefined,
    duration_minutes: undefined as number | undefined,
    notes: '',
    rating: 3,
    is_favorite: false,
  })

  // AI面板状态
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnswer, setAiAnswer] = useState('')

  // 加载流派详情和尝试记录
  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [archetypeRes, attemptsRes] = await Promise.all([
        archetypesApi.getById(id),
        archetypesApi.getAttempts(id, (window as any).device_id || 'unknown'),
      ])
      setArchetype(archetypeRes.data)
      setAttempts(attemptsRes.data || [])
    } catch (err) {
      setError('加载流派详情失败：' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 打开新增弹窗
  const openAddModal = () => {
    setEditingAttempt(null)
    setAttemptForm({
      character: archetype?.character || 'ironclad',
      seed: '',
      ascension: 0,
      outcome: 'in_progress',
      final_floor: undefined,
      duration_minutes: undefined,
      notes: '',
      rating: 3,
      is_favorite: false,
    })
    setModalOpen(true)
  }

  // 打开编辑弹窗
  const openEditModal = (attempt: any) => {
    setEditingAttempt(attempt)
    setAttemptForm({
      character: attempt.character,
      seed: attempt.seed || '',
      ascension: attempt.ascension || 0,
      outcome: attempt.outcome || 'in_progress',
      final_floor: attempt.final_floor,
      duration_minutes: attempt.duration_minutes,
      notes: attempt.notes || '',
      rating: attempt.rating || 3,
      is_favorite: !!attempt.is_favorite,
    })
    setModalOpen(true)
  }

  // 保存尝试记录
  const saveAttempt = async () => {
    if (!id) return
    try {
      const payload = {
        ...attemptForm,
        archetype_id: parseInt(id),
        device_id: (window as any).device_id || 'unknown',
      }
      if (editingAttempt) {
        await attemptsApi.update(String(editingAttempt.id), {
          notes: payload.notes,
          outcome: payload.outcome,
          final_floor: payload.final_floor,
          rating: payload.rating,
          is_favorite: payload.is_favorite,
        })
      } else {
        await attemptsApi.create(payload)
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      alert('保存失败：' + (err as Error).message)
    }
  }

  // 删除尝试记录
  const deleteAttempt = async (attemptId: number) => {
    if (!confirm('确定要删除这条尝试记录吗？')) return
    try {
      await attemptsApi.delete(String(attemptId))
      loadData()
    } catch (err) {
      alert('删除失败：' + (err as Error).message)
    }
  }

  // AI提问
  const askAi = async () => {
    if (!aiQuestion.trim() || !id) return
    setAiLoading(true)
    try {
      const res = await aiApi.strategy({
        question: aiQuestion,
        confirmed: true,
        archetype_id: parseInt(id),
      })
      setAiAnswer(res.data?.strategy_text || res.data?.answer || '无策略返回')
    } catch (err) {
      setAiAnswer('❌ AI请求失败：' + (err as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-spire-accent" size={32} />
        <span className="ml-2 text-spire-text-dim">加载流派详情中...</span>
      </div>
    )
  }

  if (error || !archetype) {
    return (
      <div className="text-center py-12 text-spire-text-dim">
        <AlertCircle size={32} className="mx-auto mb-3 text-spire-red" />
        <p className="text-sm">{error || '流派不存在'}</p>
        <button onClick={() => navigate('/archetypes')} className="spire-btn mt-4">
          <ArrowLeft size={16} />
          返回列表
        </button>
      </div>
    )
  }

  const charInfo = CHARACTERS[archetype.character] || { name: archetype.character, icon: Swords, color: 'text-spire-text', badgeClass: '' }
  const CharIcon = charInfo.icon
  const winRate = archetype.win_rate ?? 0.5
  const tags: string[] = Array.isArray(archetype.playstyle_tags) ? archetype.playstyle_tags : []

  return (
    <div className="space-y-4">
      {/* 顶部信息栏 */}
      <div className="spire-panel">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/archetypes')}
              className="p-1.5 rounded-lg hover:bg-spire-bg text-spire-text-dim hover:text-spire-text transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CharIcon size={18} className={charInfo.color} />
                <h1 className="text-lg font-bold text-spire-text">{archetype.name_cn || archetype.name_en}</h1>
                <span className={`char-badge ${charInfo.badgeClass}`}>{charInfo.name}</span>
              </div>
              <p className="text-xs text-spire-text-dim">{archetype.description || '暂无描述'}</p>
            </div>
          </div>
        </div>

        {/* 元信息行 */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-spire-text-dim">难度</span>
            <DifficultyStars rating={archetype.difficulty_rating || 3} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-spire-text-dim">胜率</span>
            {winRate >= 0.75 ? <TrendingUp size={12} className="text-green-400" /> :
              winRate < 0.40 ? <TrendingDown size={12} className="text-red-400" /> :
                <Minus size={12} className="text-yellow-400" />}
            <span className={getWinRateColor(winRate)}>{Math.round(winRate * 100)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-spire-text-dim">推荐进阶</span>
            <span className="text-spire-accent">{archetype.recommended_ascension || 0}+</span>
          </div>
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-spire-text-dim">标签</span>
              <div className="flex gap-1">
                {tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-spire-bg border border-spire-border text-spire-text-dim">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主体：左侧标签 + 右侧内容 */}
      <div className="flex gap-3 min-h-[400px]">
        {/* 左侧标签导航 */}
        <aside className="shrink-0 w-32 lg:w-40 flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left
                  ${isActive
                    ? 'bg-spire-accent/15 text-spire-accent font-medium border border-spire-accent/30'
                    : 'text-spire-text-dim hover:text-spire-text hover:bg-spire-surface border border-transparent'
                  }
                `}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            )
          })}
        </aside>

        {/* 右侧内容面板 */}
        <div className="flex-1 min-w-0">
          {/* ====== 标签1：流派攻略 ====== */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              {archetype.early_game && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-2 flex items-center gap-2">
                    <Swords size={16} className="text-spire-accent" />
                    前期思路
                  </h3>
                  <p className="text-sm text-spire-text-dim whitespace-pre-wrap leading-relaxed">
                    {archetype.early_game}
                  </p>
                </div>
              )}
              {archetype.mid_game && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-spire-accent" />
                    中期思路
                  </h3>
                  <p className="text-sm text-spire-text-dim whitespace-pre-wrap leading-relaxed">
                    {archetype.mid_game}
                  </p>
                </div>
              )}
              {archetype.late_game && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-2 flex items-center gap-2">
                    <Trophy size={16} className="text-spire-accent" />
                    后期思路
                  </h3>
                  <p className="text-sm text-spire-text-dim whitespace-pre-wrap leading-relaxed">
                    {archetype.late_game}
                  </p>
                </div>
              )}
              {archetype.advanced_tips && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-2 flex items-center gap-2">
                    <Star size={16} className="text-spire-accent" />
                    进阶技巧
                  </h3>
                  <p className="text-sm text-spire-text-dim whitespace-pre-wrap leading-relaxed">
                    {archetype.advanced_tips}
                  </p>
                </div>
              )}
              {!archetype.early_game && !archetype.mid_game && !archetype.late_game && !archetype.advanced_tips && (
                <div className="text-center py-8 text-spire-text-dim text-sm">
                  <BookOpen size={24} className="mx-auto mb-2 opacity-30" />
                  暂无攻略内容
                </div>
              )}
            </div>
          )}

          {/* ====== 标签2：核心卡牌 ====== */}
          {activeTab === 'cards' && (
            <div className="spire-panel">
              <h3 className="font-semibold text-spire-text mb-3 flex items-center gap-2">
                <Crosshair size={16} className="text-spire-accent" />
                核心卡牌
              </h3>
              {archetype.core_cards_detail?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {archetype.core_cards_detail.map((card: any) => {
                    const typeInfo = TYPE_ICONS[card.type] || { color: 'text-spire-text-dim', label: card.type }
                    return (
                      <div key={card.id} className="game-card">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-spire-text text-sm">{card.name_cn || card.name_en}</span>
                          <span className="text-xs font-bold text-spire-accent">
                            {card.cost === 'X' ? 'X' : card.cost}
                          </span>
                        </div>
                        <p className="text-xs text-spire-text-dim line-clamp-2 mb-2 min-h-[2rem]">
                          {card.effect_base || '暂无效果描述'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${typeInfo.color}`}>{typeInfo.label}</span>
                          <span className="text-[10px] text-spire-text-dim">{card.rarity}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-spire-text-dim text-sm">
                  <Crosshair size={24} className="mx-auto mb-2 opacity-30" />
                  暂无核心卡牌数据
                </div>
              )}
            </div>
          )}

          {/* ====== 标签3：关键遗物 ====== */}
          {activeTab === 'relics' && (
            <div className="space-y-4">
              {archetype.key_relics_detail?.length > 0 && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-3 flex items-center gap-2">
                    <Gem size={16} className="text-spire-accent" />
                    推荐遗物
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {archetype.key_relics_detail.map((relic: any) => (
                      <div key={relic.id} className="game-card">
                        <div className="font-semibold text-spire-text text-sm mb-1">{relic.name_cn || relic.name_en}</div>
                        <p className="text-xs text-spire-text-dim line-clamp-2">{relic.effect || '暂无效果描述'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {archetype.avoid_relics_detail?.length > 0 && (
                <div className="spire-panel">
                  <h3 className="font-semibold text-spire-text mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-spire-red" />
                    避免遗物
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {archetype.avoid_relics_detail.map((relic: any) => (
                      <div key={relic.id} className="game-card border-red-900/30">
                        <div className="font-semibold text-spire-text text-sm mb-1">{relic.name_cn || relic.name_en}</div>
                        <p className="text-xs text-spire-text-dim line-clamp-2">{relic.effect || '暂无效果描述'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!archetype.key_relics_detail?.length && !archetype.avoid_relics_detail?.length && (
                <div className="text-center py-8 text-spire-text-dim text-sm">
                  <Gem size={24} className="mx-auto mb-2 opacity-30" />
                  暂无遗物推荐数据
                </div>
              )}
            </div>
          )}

          {/* ====== 标签4：路线偏好 ====== */}
          {activeTab === 'route' && (
            <div className="spire-panel space-y-4">
              <h3 className="font-semibold text-spire-text flex items-center gap-2">
                <Map size={16} className="text-spire-accent" />
                路线偏好
              </h3>
              {archetype.route_preferences ? (
                <div className="space-y-3">
                  {(() => {
                    const rp = typeof archetype.route_preferences === 'string'
                      ? JSON.parse(archetype.route_preferences)
                      : archetype.route_preferences
                    const entries = Object.entries(rp || {})
                    if (entries.length === 0) return (
                      <p className="text-sm text-spire-text-dim">暂无路线偏好数据</p>
                    )
                    return entries.map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-spire-bg rounded-lg p-3 border border-spire-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-spire-text capitalize">{key}</span>
                          <span className="text-xs text-spire-accent">{String(value)}</span>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              ) : (
                <p className="text-sm text-spire-text-dim">暂无路线偏好数据</p>
              )}
            </div>
          )}

          {/* ====== 标签5：我的尝试 ====== */}
          {activeTab === 'attempts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-spire-text flex items-center gap-2">
                  <ClipboardList size={16} className="text-spire-accent" />
                  我的尝试记录
                </h3>
                <button onClick={openAddModal} className="spire-btn text-xs py-1.5">
                  <Plus size={14} />
                  新尝试
                </button>
              </div>

              {attempts.length > 0 ? (
                <div className="space-y-2">
                  {attempts.map((attempt, idx) => (
                    <div key={attempt.id} className="spire-panel py-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-spire-text-dim">#{idx + 1}</span>
                          <OutcomeIcon outcome={attempt.outcome} />
                          <span className="text-sm font-medium text-spire-text">
                            <OutcomeLabel outcome={attempt.outcome} />
                          </span>
                          <span className="text-xs text-spire-text-dim">
                            进阶{attempt.ascension || 0}
                          </span>
                          {attempt.seed && (
                            <span className="text-[10px] text-spire-text-dim font-mono">种子:{attempt.seed}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(attempt)}
                            className="p-1 rounded hover:bg-spire-bg text-spire-text-dim hover:text-spire-text transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteAttempt(attempt.id)}
                            className="p-1 rounded hover:bg-spire-bg text-spire-text-dim hover:text-spire-red transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {attempt.final_floor && (
                        <div className="text-xs text-spire-text-dim mb-1">
                          到达第 {attempt.final_floor} 层
                          {attempt.duration_minutes && ` · 时长 ${attempt.duration_minutes} 分钟`}
                        </div>
                      )}

                      {attempt.notes && (
                        <p className="text-sm text-spire-text-dim whitespace-pre-wrap mt-1">{attempt.notes}</p>
                      )}

                      {attempt.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-spire-text-dim">{attempt.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-spire-text-dim">
                  <ClipboardList size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无尝试记录</p>
                  <p className="text-xs mt-1">记录你的游戏体验，帮助改进攻略</p>
                  <button onClick={openAddModal} className="spire-btn mt-3 text-xs py-1.5">
                    <Plus size={14} />
                    添加第一条记录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI助手面板（嵌入详情页底部） */}
      <div className="spire-panel mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-spire-accent" />
          <h3 className="font-semibold text-spire-text">AI助手 — {archetype.name_cn}专属</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-spire-accent/15 text-spire-accent">
            已注入流派上下文
          </span>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') askAi() }}
            placeholder={`询问关于「${archetype.name_cn}」的策略问题...`}
            className="spire-input flex-1"
            disabled={aiLoading}
          />
          <button
            onClick={askAi}
            disabled={aiLoading || !aiQuestion.trim()}
            className="spire-btn px-3"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {aiAnswer && (
          <div className="bg-spire-bg border border-spire-border rounded-lg p-3 text-sm text-spire-text whitespace-pre-wrap leading-relaxed">
            {aiAnswer}
          </div>
        )}
      </div>

      {/* 弹窗：尝试记录表单 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-spire-surface border border-spire-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-spire-border">
              <h3 className="font-semibold text-spire-text">
                {editingAttempt ? '编辑尝试记录' : '新增尝试记录'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded hover:bg-spire-bg text-spire-text-dim hover:text-spire-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* 角色 */}
              <div>
                <label className="text-xs text-spire-text-dim mb-1 block">角色</label>
                <select
                  value={attemptForm.character}
                  onChange={(e) => setAttemptForm({ ...attemptForm, character: e.target.value })}
                  className="spire-input"
                  disabled={!!editingAttempt}
                >
                  {Object.entries(CHARACTERS).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
              </div>

              {/* 种子 + 进阶 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-spire-text-dim mb-1 block">种子（可选）</label>
                  <input
                    type="text"
                    value={attemptForm.seed}
                    onChange={(e) => setAttemptForm({ ...attemptForm, seed: e.target.value })}
                    placeholder="如 ABC123"
                    className="spire-input"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-spire-text-dim mb-1 block">进阶</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={attemptForm.ascension}
                    onChange={(e) => setAttemptForm({ ...attemptForm, ascension: parseInt(e.target.value) || 0 })}
                    className="spire-input"
                  />
                </div>
              </div>

              {/* 结果 */}
              <div>
                <label className="text-xs text-spire-text-dim mb-1 block">结果</label>
                <div className="flex gap-2">
                  {['win', 'lose', 'abandoned', 'in_progress'].map((o) => (
                    <button
                      key={o}
                      onClick={() => setAttemptForm({ ...attemptForm, outcome: o })}
                      className={`
                        flex-1 py-1.5 rounded-lg text-xs border transition-all
                        ${attemptForm.outcome === o
                          ? 'bg-spire-accent/15 border-spire-accent text-spire-accent'
                          : 'bg-spire-bg border-spire-border text-spire-text-dim hover:border-spire-accent/30'
                        }
                      `}
                    >
                      <OutcomeLabel outcome={o} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 到达层数 + 时长 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-spire-text-dim mb-1 block">到达层数（可选）</label>
                  <input
                    type="number"
                    value={attemptForm.final_floor || ''}
                    onChange={(e) => setAttemptForm({ ...attemptForm, final_floor: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="spire-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-spire-text-dim mb-1 block">时长分钟（可选）</label>
                  <input
                    type="number"
                    value={attemptForm.duration_minutes || ''}
                    onChange={(e) => setAttemptForm({ ...attemptForm, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="spire-input"
                  />
                </div>
              </div>

              {/* 评分 */}
              <div>
                <label className="text-xs text-spire-text-dim mb-1 block">评分</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAttemptForm({ ...attemptForm, rating: r })}
                      className="p-1"
                    >
                      <Star
                        size={18}
                        className={r <= attemptForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-spire-text-dim'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 心得 */}
              <div>
                <label className="text-xs text-spire-text-dim mb-1 block">心得体会</label>
                <textarea
                  value={attemptForm.notes}
                  onChange={(e) => setAttemptForm({ ...attemptForm, notes: e.target.value })}
                  placeholder="记录你的游戏心得、关键决策、遇到的困难..."
                  rows={4}
                  className="spire-input resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-spire-border">
              <button onClick={() => setModalOpen(false)} className="spire-btn-secondary text-xs">
                取消
              </button>
              <button onClick={saveAttempt} className="spire-btn text-xs">
                <Check size={14} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
