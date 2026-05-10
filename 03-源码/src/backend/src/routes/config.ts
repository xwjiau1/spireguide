import { Router } from 'express';
import db from '../database/db';

/**
 * 系统配置API路由
 * AI设置：开启/关闭、配置密钥、选择协议
 */

const router = Router();

// 获取AI配置
router.get('/ai', (_req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM ai_configs WHERE id = 1');
    const config = stmt.get();
    if (!config) {
      // 如果不存在则插入默认值
      const insert = db.prepare(`
        INSERT OR IGNORE INTO ai_configs (id, enabled, provider, model, system_prompt)
        VALUES (1, 0, 'kimi', 'kimi-latest', '你是一位杀戮尖塔游戏策略专家。根据玩家提供的游戏截图识别结果，给出具体的出牌建议和策略分析。回答要简洁实用，考虑能量、手牌、敌人和当前血量。')
      `);
      insert.run();
      const defaultStmt = db.prepare('SELECT * FROM ai_configs WHERE id = 1');
      const defaultConfig = defaultStmt.get();
      return res.json({ success: true, data: sanitizeConfig(defaultConfig) });
    }
    res.json({ success: true, data: sanitizeConfig(config) });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// 更新AI配置
router.post('/ai', (req, res) => {
  try {
    const {
      enabled,
      provider,
      api_key,
      api_url,
      model,
      vision_model,
      timeout_ms,
      max_tokens,
      temperature,
      system_prompt,
    } = req.body;

    // 确保记录存在
    const ensureStmt = db.prepare(`
      INSERT OR IGNORE INTO ai_configs (id, enabled, provider, model, system_prompt)
      VALUES (1, 0, 'kimi', 'kimi-latest', '你是一位杀戮尖塔游戏策略专家。根据玩家提供的游戏截图识别结果，给出具体的出牌建议和策略分析。回答要简洁实用，考虑能量、手牌、敌人和当前血量。')
    `);
    ensureStmt.run();

    // 构建更新语句（只更新传入的字段）
    const updates: string[] = [];
    const values: any[] = [];

    if (enabled !== undefined) { updates.push('enabled = ?'); values.push(enabled ? 1 : 0); }
    if (provider !== undefined) { updates.push('provider = ?'); values.push(provider); }
    if (api_key !== undefined) { updates.push('api_key = ?'); values.push(api_key); }
    if (api_url !== undefined) { updates.push('api_url = ?'); values.push(api_url); }
    if (model !== undefined) { updates.push('model = ?'); values.push(model); }
    if (vision_model !== undefined) { updates.push('vision_model = ?'); values.push(vision_model); }
    if (timeout_ms !== undefined) { updates.push('timeout_ms = ?'); values.push(timeout_ms); }
    if (max_tokens !== undefined) { updates.push('max_tokens = ?'); values.push(max_tokens); }
    if (temperature !== undefined) { updates.push('temperature = ?'); values.push(temperature); }
    if (system_prompt !== undefined) { updates.push('system_prompt = ?'); values.push(system_prompt); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(1); // id条件值

    const sql = `UPDATE ai_configs SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values);

    // 返回更新后的配置
    const getStmt = db.prepare('SELECT * FROM ai_configs WHERE id = 1');
    const config = getStmt.get();
    res.json({ success: true, data: sanitizeConfig(config) });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// 测试连接（验证API密钥有效性）
router.post('/ai/test', async (req, res) => {
  try {
    const { api_key, api_url, provider, model } = req.body;

    if (!api_key) {
      return res.status(400).json({ success: false, error: '缺少API密钥' });
    }

    const baseUrl = api_url || getDefaultUrl(provider);
    const testModel = model || 'kimi-latest';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as any;
      return res.status(400).json({
        success: false,
        error: `连接失败 (${response.status}): ${errData.error?.message || response.statusText}`,
      });
    }

    const data = await response.json() as any;
    res.json({
      success: true,
      data: {
        connected: true,
        model: data.model || testModel,
        response_sample: data.choices?.[0]?.message?.content?.substring(0, 50) || '',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `连接测试失败: ${(err as Error).message}` });
  }
});

// 辅助函数：返回前端安全版本（隐藏完整密钥）
function sanitizeConfig(config: any) {
  if (!config) return null;
  const safe = { ...config };
  if (safe.api_key) {
    const key = safe.api_key as string;
    safe.api_key = key.length > 8 ? key.substring(0, 4) + '****' + key.substring(key.length - 4) : '****';
    safe.has_key = true;
  } else {
    safe.has_key = false;
  }
  return safe;
}

// 辅助函数：获取默认URL
function getDefaultUrl(provider: string): string {
  switch (provider) {
    case 'kimi': return 'https://api.moonshot.cn/v1';
    case 'openai': return 'https://api.openai.com/v1';
    default: return 'https://api.moonshot.cn/v1';
  }
}

export default router;
