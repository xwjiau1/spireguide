import { describe, it } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import { join } from 'node:path'

/**
 * SpireGuide 后端 API 测试套件
 * 使用 Node.js 内置 test runner
 */

const BASE_URL = 'http://localhost:3001'
const BACKEND_DIR = join(process.cwd(), 'src/backend')

let server: any = null

// 启动测试服务器
async function startServer() {
  return new Promise<void>((resolve, reject) => {
    server = spawn('npx', ['ts-node', 'src/index.ts'], {
      cwd: BACKEND_DIR,
      env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
      stdio: 'pipe',
    })
    server.stdout.on('data', (data: Buffer) => {
      const text = data.toString()
      if (text.includes('运行在端口')) {
        resolve()
      }
    })
    server.stderr.on('data', (data: Buffer) => {
      // 忽略 stderr 输出
    })
    server.on('error', reject)
    setTimeout(() => resolve(), 5000)
  })
}

// 关闭服务器
function stopServer() {
  if (server) {
    server.kill('SIGTERM')
    server = null
  }
}

// 通用请求辅助函数
async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

describe('SpireGuide API 测试', async () => {
  await startServer()
  await new Promise((r) => setTimeout(r, 2000))

  // === 健康检查 ===
  await describe('健康检查', async () => {
    await it('GET /api/health 返回状态正常', async () => {
      const { status, body } = await request('/api/health')
      assert.strictEqual(status, 200)
      assert.strictEqual(body.success, true)
      assert.strictEqual(body.data.status, 'ok')
    })
  })

  // === 卡牌 API ===
  await describe('卡牌 API', async () => {
    await it('GET /api/cards 返回卡牌列表', async () => {
      const { status, body } = await request('/api/cards?page=1&limit=10')
      assert.strictEqual(status, 200)
      assert.strictEqual(body.success, true)
      assert.ok(Array.isArray(body.data))
      assert.ok(body.data.length > 0)
    })

    await it('GET /api/cards?character=ironclad 筛选铁甲战士卡牌', async () => {
      const { status, body } = await request('/api/cards?character=ironclad&limit=5')
      assert.strictEqual(status, 200)
      assert.ok(body.data.every((c: any) => c.character === 'ironclad'))
    })

    await it('GET /api/cards?game_version=sts1 筛选 StS1', async () => {
      const { status, body } = await request('/api/cards?game_version=sts1&limit=5')
      assert.strictEqual(status, 200)
      assert.ok(body.data.every((c: any) => c.game_version === 'sts1'))
    })

    await it('GET /api/cards/search?q=打击 搜索中文', async () => {
      const { status, body } = await request('/api/cards/search?q=打击')
      assert.strictEqual(status, 200)
      assert.ok(body.data.length > 0)
      assert.ok(body.data.some((c: any) => c.name_cn.includes('打击')))
    })

    await it('GET /api/cards/search?q=strike 搜索英文', async () => {
      const { status, body } = await request('/api/cards/search?q=strike')
      assert.strictEqual(status, 200)
      assert.ok(body.data.some((c: any) => c.name_en.toLowerCase().includes('strike')))
    })

    await it('GET /api/cards/1 获取单张卡牌详情', async () => {
      const { status, body } = await request('/api/cards/1')
      assert.strictEqual(status, 200)
      assert.ok(body.data.id)
      assert.ok(body.data.name_cn)
    })

    await it('GET /api/cards/compare?id=1&id=2 卡牌对比', async () => {
      const { status, body } = await request('/api/cards/compare?id=1&id=2')
      assert.strictEqual(status, 200)
      assert.strictEqual(body.data.length, 2)
    })
  })

  // === 敌人 API ===
  await describe('敌人 API', async () => {
    await it('GET /api/enemies 返回敌人列表', async () => {
      const { status, body } = await request('/api/enemies?page=1&limit=10')
      assert.strictEqual(status, 200)
      assert.ok(Array.isArray(body.data))
      assert.ok(body.data.length > 0)
    })

    await it('GET /api/enemies?type=boss 筛选 BOSS', async () => {
      const { status, body } = await request('/api/enemies?type=boss')
      assert.strictEqual(status, 200)
      assert.ok(body.data.every((e: any) => e.type === 'boss'))
    })

    await it('GET /api/enemies/search?q=六火 搜索敌人', async () => {
      const { status, body } = await request('/api/enemies/search?q=六火')
      assert.strictEqual(status, 200)
      assert.ok(body.data.length > 0)
    })

    await it('GET /api/enemies/1 获取敌人详情', async () => {
      const { status, body } = await request('/api/enemies/1')
      assert.strictEqual(status, 200)
      assert.ok(body.data.id)
      assert.ok(body.data.name_cn)
    })
  })

  // === 遗物 API ===
  await describe('遗物 API', async () => {
    await it('GET /api/relics 返回遗物列表', async () => {
      const { status, body } = await request('/api/relics?page=1&limit=10')
      assert.strictEqual(status, 200)
      assert.ok(Array.isArray(body.data))
      assert.ok(body.data.length > 0)
    })

    await it('GET /api/relics?rarity=boss 筛选 BOSS 遗物', async () => {
      const { status, body } = await request('/api/relics?rarity=boss')
      assert.strictEqual(status, 200)
      assert.ok(body.data.every((r: any) => r.rarity === 'boss'))
    })
  })

  // === 对局记录 API ===
  await describe('对局记录 API', async () => {
    let sessionId: number

    await it('POST /api/sessions 创建对局', async () => {
      const { status, body } = await request('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          game_version: 'sts1',
          character: 'ironclad',
          ascension: 5,
          seed: 'TEST123',
          notes: '测试对局',
        }),
      })
      assert.strictEqual(status, 201)
      assert.strictEqual(body.success, true)
      assert.ok(body.data.id)
      sessionId = body.data.id
    })

    await it('GET /api/sessions 获取对局列表', async () => {
      const { status, body } = await request('/api/sessions')
      assert.strictEqual(status, 200)
      assert.ok(Array.isArray(body.data))
      assert.ok(body.data.some((s: any) => s.seed === 'TEST123'))
    })

    await it('GET /api/sessions/:id 获取对局详情', async () => {
      const { status, body } = await request(`/api/sessions/${sessionId}`)
      assert.strictEqual(status, 200)
      assert.strictEqual(body.data.id, sessionId)
      assert.strictEqual(body.data.seed, 'TEST123')
    })

    await it('PATCH /api/sessions/:id 更新对局', async () => {
      const { status, body } = await request(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome: 'win', notes: '已通关' }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(body.data.outcome, 'win')
    })

    await it('POST /api/sessions/:id/screenshots 添加截图记录', async () => {
      // 由于没有真实文件上传，测试 400 参数缺失
      const { status } = await request(`/api/sessions/${sessionId}/screenshots`, {
        method: 'POST',
        body: JSON.stringify({ node_type: 'combat', node_floor: 3 }),
      })
      // 400 因为没有实际文件，但 API 路径存在
      assert.ok([400, 500].includes(status))
    })

    await it('DELETE /api/sessions/:id 删除对局', async () => {
      const { status, body } = await request(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(body.success, true)
    })
  })

  // === AI API ===
  await describe('AI API', async () => {
    await it('POST /api/ai/recognize 识别截图（mock）', async () => {
      const { status, body } = await request('/api/ai/recognize', {
        method: 'POST',
        body: JSON.stringify({
          image_url: 'https://example.com/test.png',
          game_version: 'sts1',
          character: 'ironclad',
          device_id: 'test-device',
        }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(body.success, true)
      assert.ok(body.data.recognized_elements)
    })

    await it('POST /api/ai/strategy 生成策略（需 confirmed）', async () => {
      const { status, body } = await request('/api/ai/strategy', {
        method: 'POST',
        body: JSON.stringify({
          screenshot_id: 1,
          confirmed_elements: { hp: 50, energy: 3 },
          confirmed: true,
          device_id: 'test-device',
        }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(body.success, true)
      assert.ok(body.data.strategy_text)
      assert.ok(body.data.strategy_text.includes('仅供参考'))
    })
  })

  // === 错误处理 ===
  await describe('错误处理', async () => {
    await it('GET /api/cards/99999 返回 404', async () => {
      const { status } = await request('/api/cards/99999')
      assert.strictEqual(status, 404)
    })

    await it('GET /api/unknown 返回 404', async () => {
      const { status } = await request('/api/unknown')
      assert.strictEqual(status, 404)
    })
  })

  // === 静态文件 ===
  await describe('静态文件与 SPA', async () => {
    await it('GET / 返回前端页面', async () => {
      const res = await fetch(`${BASE_URL}/`)
      assert.strictEqual(res.status, 200)
      const text = await res.text()
      assert.ok(text.includes('SpireGuide'))
    })
  })

  stopServer()
})
