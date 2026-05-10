#!/usr/bin/env node
/**
 * SpireGuide 快速测试脚本
 * 启动后端，运行 API 测试，输出报告
 */

const { spawn } = require('child_process')
const path = require('path')

const BACKEND_DIR = path.join(__dirname, '../03-源码/src/backend')
const BASE_URL = 'http://localhost:3001'

let server = null
let passed = 0
let failed = 0

async function startServer() {
  return new Promise((resolve, reject) => {
    server = spawn('npx', ['ts-node', 'src/index.ts'], {
      cwd: BACKEND_DIR,
      env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
      stdio: 'pipe',
    })
    let resolved = false
    server.stdout.on('data', (data) => {
      if (!resolved && data.toString().includes('运行在端口')) {
        resolved = true
        setTimeout(resolve, 500)
      }
    })
    server.on('error', reject)
    setTimeout(() => { if (!resolved) { resolved = true; resolve() } }, 5000)
  })
}

function stopServer() {
  if (server) { server.kill('SIGTERM'); server = null }
}

async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✅ ${name}`)
  } catch (err) {
    failed++
    console.log(`  ❌ ${name}: ${err.message}`)
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

async function runTests() {
  console.log('启动测试服务器...')
  await startServer()
  console.log('服务器就绪，开始测试\n')

  // 健康检查
  await test('GET /api/health', async () => {
    const { status, body } = await request('/api/health')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.success) throw new Error('success=false')
    if (body.data.status !== 'ok') throw new Error(`status=${body.data.status}`)
  })

  // 卡牌
  await test('GET /api/cards 列表', async () => {
    const { status, body } = await request('/api/cards?limit=5')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!Array.isArray(body.data)) throw new Error('not array')
    if (body.data.length === 0) throw new Error('empty')
  })

  await test('GET /api/cards?character=ironclad 筛选', async () => {
    const { status, body } = await request('/api/cards?character=ironclad&limit=5')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.every(c => c.character === 'ironclad')) throw new Error('filter failed')
  })

  await test('GET /api/cards/search?q=打击 搜索', async () => {
    const { status, body } = await request('/api/cards/search?q=打击')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.some(c => c.name_cn.includes('打击'))) throw new Error('not found')
  })

  await test('GET /api/cards/1 详情', async () => {
    const { status, body } = await request('/api/cards/1')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.id) throw new Error('no id')
  })

  await test('GET /api/cards/compare?id=1&id=2 对比', async () => {
    const { status, body } = await request('/api/cards/compare?id=1&id=2')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.card1 || !body.data.card2) throw new Error('missing cards')
  })

  // 敌人
  await test('GET /api/enemies 列表', async () => {
    const { status, body } = await request('/api/enemies?limit=5')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!Array.isArray(body.data)) throw new Error('not array')
    if (body.data.length === 0) throw new Error('empty')
  })

  await test('GET /api/enemies?type=boss 筛选', async () => {
    const { status, body } = await request('/api/enemies?type=boss')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.every(e => e.type === 'boss')) throw new Error('filter failed')
  })

  await test('GET /api/enemies/search?q=六火 搜索', async () => {
    const { status, body } = await request('/api/enemies/search?q=六火')
    if (status !== 200) throw new Error(`status=${status}`)
    if (body.data.length === 0) throw new Error('empty')
  })

  await test('GET /api/enemies/1 详情', async () => {
    const { status, body } = await request('/api/enemies/1')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.id) throw new Error('no id')
  })

  // 遗物
  await test('GET /api/relics 列表', async () => {
    const { status, body } = await request('/api/relics?limit=5')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!Array.isArray(body.data)) throw new Error('not array')
    if (body.data.length === 0) throw new Error('empty')
  })

  await test('GET /api/relics?rarity=boss 筛选', async () => {
    const { status, body } = await request('/api/relics?rarity=boss')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.every(r => r.rarity === 'boss')) throw new Error('filter failed')
  })

  // 对局记录
  let sessionId
  await test('POST /api/sessions 创建', async () => {
    const { status, body } = await request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ game_version: 'sts1', character: 'ironclad', ascension: 5, seed: 'TEST123', notes: '测试' }),
    })
    if (status !== 201) throw new Error(`status=${status}`)
    if (!body.data.id) throw new Error('no id')
    sessionId = body.data.id
  })

  await test('GET /api/sessions 列表', async () => {
    const { status, body } = await request('/api/sessions')
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.some(s => s.seed === 'TEST123')) throw new Error('not found')
  })

  await test('GET /api/sessions/:id 详情', async () => {
    const { status, body } = await request(`/api/sessions/${sessionId}`)
    if (status !== 200) throw new Error(`status=${status}`)
    if (body.data.id !== sessionId) throw new Error('wrong id')
  })

  await test('PATCH /api/sessions/:id 更新', async () => {
    const { status, body } = await request(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ outcome: 'win' }),
    })
    if (status !== 200) throw new Error(`status=${status}`)
    if (body.data.outcome !== 'win') throw new Error(`outcome=${body.data.outcome}`)
  })

  await test('DELETE /api/sessions/:id 删除', async () => {
    const { status, body } = await request(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.success) throw new Error('success=false')
  })

  // AI
  await test('POST /api/ai/recognize 识别', async () => {
    const { status, body } = await request('/api/ai/recognize', {
      method: 'POST',
      body: JSON.stringify({ image_url: 'https://example.com/test.png', game_version: 'sts1', character: 'ironclad', device_id: 'test' }),
    })
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.recognized_elements) throw new Error('no elements')
  })

  await test('POST /api/ai/strategy 策略', async () => {
    const { status, body } = await request('/api/ai/strategy', {
      method: 'POST',
      body: JSON.stringify({ screenshot_id: 1, confirmed_elements: { hp: 50 }, confirmed: true, device_id: 'test' }),
    })
    if (status !== 200) throw new Error(`status=${status}`)
    if (!body.data.strategy_text) throw new Error('no strategy')
    if (!body.data.strategy_text.includes('仅供参考')) throw new Error('no disclaimer')
  })

  // 错误处理
  await test('GET /api/cards/99999 返回 404', async () => {
    const { status } = await request('/api/cards/99999')
    if (status !== 404) throw new Error(`status=${status}`)
  })

  await test('GET /api/unknown 返回 404', async () => {
    const { status } = await request('/api/unknown')
    if (status !== 404) throw new Error(`status=${status}`)
  })

  // 静态文件
  await test('GET / 返回 SPA', async () => {
    const res = await fetch(`${BASE_URL}/`)
    if (res.status !== 200) throw new Error(`status=${res.status}`)
    const text = await res.text()
    if (!text.includes('SpireGuide')) throw new Error('no SpireGuide')
  })

  // 报告
  console.log(`
========================================`)
  console.log(`  测试完成: ${passed} 通过, ${failed} 失败`)
  console.log(`  总计: ${passed + failed} 项`)
  console.log(`========================================`)

  stopServer()
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(err => {
  console.error('测试运行失败:', err)
  stopServer()
  process.exit(1)
})
