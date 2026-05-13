const Database = require('better-sqlite3');
const db = new Database('data/spireguide.db');

const sql = `
  INSERT OR REPLACE INTO ai_configs (id, enabled, provider, api_key, api_url, model, vision_model, timeout_ms, max_tokens, temperature, system_prompt, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const stmt = db.prepare(sql);
stmt.run(
  1,
  1,
  'kimi',
  'sk-aVBHeol55uuBxi3aoX990T7aZbPGIo44EExkaXND9iX0zsQA',
  null,
  'kimi-k2.6',
  'kimi-k2.6',
  30000,
  4096,
  0.7,
  '你是一位杀戮尖塔游戏策略专家。根据玩家提供的游戏截图识别结果，给出具体的出牌建议和策略分析。回答要简洁实用，考虑能量、手牌、敌人和当前血量。',
  new Date().toISOString()
);

console.log('ai_configs 已恢复');
const row = db.prepare('SELECT id, enabled, provider, api_key, model FROM ai_configs').get();
console.log('验证:', JSON.stringify(row, null, 2));
db.close();
