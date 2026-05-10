import { useState, useCallback, useEffect } from 'react'
import { Upload, Image, CheckCircle, AlertTriangle, Sparkles, Loader2, X } from 'lucide-react'
import { aiApi } from '../services/api'

/**
 * AI助手首页
 * 核心功能：截图上传 → AI识别 → 人机确认 → 策略生成
 */

interface HandCard {
  name: string
  cost: number
  effect?: string
}

interface RecognizeResult {
  scene: string
  character: string
  turn: number
  energy: string
  handCards: HandCard[]
  enemyName: string
  enemyHp: string
  playerHp: string
  gold: number
  rawText: string
}

export default function HomePage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [recognizeResult, setRecognizeResult] = useState<RecognizeResult | null>(null)
  const [question, setQuestion] = useState('这轮怎么打？')
  const [generating, setGenerating] = useState(false)
  const [strategy, setStrategy] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [gameVersion, setGameVersion] = useState<'sts1' | 'sts2'>('sts1')
  const [editMode, setEditMode] = useState(false)

  // 拖拽上传
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  // 粘贴上传
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) handleFile(file)
      }
    }
  }, [])

  // 监听粘贴事件
  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  // 处理文件
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setRecognizeResult(null)
      setStrategy(null)
      setConfirmed(false)
      setEditMode(false)
      // 自动识别
      recognizeImage(result)
    }
    reader.readAsDataURL(file)
  }

  // AI识别截图
  const recognizeImage = async (image: string) => {
    setRecognizing(true)
    try {
      const result = await aiApi.recognize(image)
      setRecognizeResult(result.data as RecognizeResult)
      setConfirmed(false)
    } catch (err: any) {
      alert('识别失败：' + err.message)
    } finally {
      setRecognizing(false)
    }
  }

  // 生成策略
  const generateStrategy = async () => {
    if (!recognizeResult) return
    if (!confirmed) {
      alert('请先确认识别结果无误')
      return
    }

    setGenerating(true)
    setStrategy(null)
    try {
      const result = await aiApi.strategy({
        question,
        gameVersion,
        character: recognizeResult.character,
        turn: recognizeResult.turn,
        energy: recognizeResult.energy,
        handCards: recognizeResult.handCards,
        enemyName: recognizeResult.enemyName,
        enemyHp: recognizeResult.enemyHp,
        playerHp: recognizeResult.playerHp,
        gold: recognizeResult.gold,
        confirmed: true,
      })
      setStrategy((result.data as any).answer)
    } catch (err: any) {
      alert('策略生成失败：' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  // 更新手牌
  const updateHandCard = (index: number, field: 'name' | 'cost', value: string | number) => {
    if (!recognizeResult) return
    const newCards = [...recognizeResult.handCards]
    newCards[index] = { ...newCards[index], [field]: value }
    setRecognizeResult({ ...recognizeResult, handCards: newCards })
    setConfirmed(false)
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-spire-text">AI 截图助手</h1>
        <p className="text-spire-muted mt-1">上传游戏截图，AI识别状态并给出策略建议</p>
      </div>

      {/* 游戏版本切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setGameVersion('sts1')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameVersion === 'sts1'
              ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
              : 'bg-spire-card text-spire-muted border border-spire-border hover:text-spire-text'
          }`}
        >
          杀戮尖塔 1 (StS1)
        </button>
        <button
          onClick={() => setGameVersion('sts2')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameVersion === 'sts2'
              ? 'bg-spire-accent/20 text-spire-accent border border-spire-accent/30'
              : 'bg-spire-card text-spire-muted border border-spire-border hover:text-spire-text'
          }`}
        >
          杀戮尖塔 2 (StS2)
        </button>
      </div>

      {/* 上传区域 */}
      {!uploadedImage ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-spire-accent bg-spire-accent/10'
              : 'border-spire-border bg-spire-card'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 text-spire-muted" size={48} />
          <p className="text-lg font-medium">拖拽截图到此处</p>
          <p className="text-spire-muted mt-2">或 Ctrl+V 粘贴截图</p>
          <p className="text-xs text-spire-muted mt-4">支持 PNG/JPG，最大 10MB</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="bg-spire-card rounded-xl border border-spire-border p-4">
          <div className="flex items-start gap-4">
            <img
              src={uploadedImage}
              alt="上传的截图"
              className="w-64 h-auto rounded-lg border border-spire-border"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Image size={18} />
                  已上传截图
                </h3>
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setRecognizeResult(null)
                    setStrategy(null)
                    setConfirmed(false)
                  }}
                  className="text-spire-muted hover:text-spire-accent"
                >
                  <X size={18} />
                </button>
              </div>
              {recognizing && (
                <div className="flex items-center gap-2 mt-3 text-spire-accent">
                  <Loader2 className="animate-spin" size={18} />
                  <span>AI正在识别截图...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 识别结果 */}
      {recognizeResult && (
        <div className="bg-spire-card rounded-xl border border-spire-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-spire-accent" />
              AI识别结果
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm px-3 py-1 rounded bg-spire-border/50 hover:bg-spire-border text-spire-muted"
            >
              {editMode ? '完成编辑' : '修正结果'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">角色</p>
              {editMode ? (
                <input
                  value={recognizeResult.character || ''}
                  onChange={(e) => setRecognizeResult({ ...recognizeResult, character: e.target.value })}
                  className="w-full bg-transparent text-spire-text font-medium border-b border-spire-border focus:border-spire-accent outline-none"
                />
              ) : (
                <p className="font-medium">{recognizeResult.character || '未知'}</p>
              )}
            </div>
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">回合</p>
              <p className="font-medium">第 {recognizeResult.turn || '?'} 回合</p>
            </div>
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">能量</p>
              <p className="font-medium">{recognizeResult.energy || '?'}</p>
            </div>
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">敌人</p>
              {editMode ? (
                <input
                  value={recognizeResult.enemyName || ''}
                  onChange={(e) => setRecognizeResult({ ...recognizeResult, enemyName: e.target.value })}
                  className="w-full bg-transparent text-spire-text font-medium border-b border-spire-border focus:border-spire-accent outline-none"
                />
              ) : (
                <p className="font-medium">{recognizeResult.enemyName || '未知'}</p>
              )}
            </div>
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">敌人血量</p>
              <p className="font-medium">{recognizeResult.enemyHp || '?'}</p>
            </div>
            <div className="bg-spire-bg rounded-lg p-3">
              <p className="text-xs text-spire-muted">玩家血量</p>
              <p className="font-medium">{recognizeResult.playerHp || '?'}</p>
            </div>
          </div>

          {/* 手牌 */}
          <div className="mt-4">
            <p className="text-xs text-spire-muted mb-2">手牌</p>
            <div className="flex flex-wrap gap-2">
              {recognizeResult.handCards.map((card, i) => (
                <div key={i} className="bg-spire-bg rounded-lg px-3 py-2 border border-spire-border">
                  {editMode ? (
                    <div className="flex gap-2">
                      <input
                        value={card.name}
                        onChange={(e) => updateHandCard(i, 'name', e.target.value)}
                        className="w-24 bg-transparent text-sm border-b border-spire-border focus:border-spire-accent outline-none"
                      />
                      <input
                        type="number"
                        value={card.cost}
                        onChange={(e) => updateHandCard(i, 'cost', parseInt(e.target.value))}
                        className="w-10 bg-transparent text-sm border-b border-spire-border focus:border-spire-accent outline-none text-center"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium">{card.name} <span className="text-spire-muted">({card.cost}费)</span></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 人机确认 */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setConfirmed(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                confirmed
                  ? 'bg-spire-success/20 text-spire-success border border-spire-success/30'
                  : 'bg-spire-border/50 text-spire-muted hover:bg-spire-border'
              }`}
            >
              <CheckCircle size={18} />
              {confirmed ? '已确认' : '确认识别结果'}
            </button>
            {!confirmed && (
              <p className="text-sm text-spire-warning flex items-center gap-1">
                <AlertTriangle size={14} />
                请检查识别结果，确认无误后再获取策略
              </p>
            )}
          </div>
        </div>
      )}

      {/* 问题输入和策略生成 */}
      {recognizeResult && confirmed && (
        <div className="bg-spire-card rounded-xl border border-spire-border p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-spire-accent" />
            获取策略建议
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="输入你的问题，例如：这轮怎么打？"
              className="flex-1 bg-spire-bg border border-spire-border rounded-lg px-4 py-3 text-spire-text placeholder:text-spire-muted focus:border-spire-accent outline-none"
            />
            <button
              onClick={generateStrategy}
              disabled={generating}
              className="px-6 py-3 bg-spire-accent text-white rounded-lg font-medium hover:bg-spire-accent/90 disabled:opacity-50 flex items-center gap-2"
            >
              {generating && <Loader2 className="animate-spin" size={18} />}
              {generating ? '生成中...' : '获取策略'}
            </button>
          </div>
        </div>
      )}

      {/* 策略结果 */}
      {strategy && (
        <div className="bg-spire-card rounded-xl border border-spire-border p-6">
          <h3 className="text-lg font-bold mb-4 text-spire-success">策略建议</h3>
          <div className="bg-spire-bg rounded-lg p-4 whitespace-pre-wrap text-spire-text leading-relaxed">
            {strategy}
          </div>
        </div>
      )}
    </div>
  )
}
