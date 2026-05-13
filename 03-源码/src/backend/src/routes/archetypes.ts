import { Router } from 'express';
import db from '../database/db';

/**
 * 流派（Archetype）API路由
 * 提供流派列表、详情、核心卡牌/遗物关联查询、尝试记录
 */

const router = Router();

// ——— 辅助：解析流派JSON字段 ———
function parseArchetypeJSON(raw: any) {
  const fieldsToParse = [
    'core_cards',
    'support_cards',
    'key_relics',
    'avoid_cards',
    'playstyle_tags',
    'mvp_relics',
    'avoid_relics',
    'route_preferences',
  ];
  const parsed: any = { ...raw };
  for (const field of fieldsToParse) {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch {
        parsed[field] = [];
      }
    }
  }
  return parsed;
}

// ——— GET /api/archetypes —— 流派列表（支持筛选） ———
router.get('/', (req, res) => {
  const { game_version, character, difficulty_max } = req.query;

  let sql = 'SELECT * FROM archetypes WHERE 1=1';
  const params: any[] = [];

  if (game_version) {
    sql += ' AND game_version = ?';
    params.push(game_version);
  }
  if (character) {
    sql += ' AND character = ?';
    params.push(character);
  }
  if (difficulty_max) {
    sql += ' AND difficulty_rating <= ?';
    params.push(parseInt(difficulty_max as string));
  }

  sql += ' ORDER BY character, difficulty_rating, name_cn';

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  const archetypes = rows.map(parseArchetypeJSON);

  res.json({ success: true, data: archetypes });
});

// ——— GET /api/archetypes/:id —— 流派详情（含核心卡牌+关键遗物） ———
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const archetypeStmt = db.prepare('SELECT * FROM archetypes WHERE id = ?');
  const rawArchetype = archetypeStmt.get(id);

  if (!rawArchetype) {
    return res.status(404).json({ success: false, error: '流派不存在' });
  }

  const archetype = parseArchetypeJSON(rawArchetype);

  // 1. 优先通过 card_archetype_links JOIN 查询核心卡牌
  const coreCardsStmt = db.prepare(`
    SELECT c.*, cal.role
    FROM cards c
    JOIN card_archetype_links cal ON c.id = cal.card_id
    WHERE cal.archetype_id = ? AND cal.role = 'core'
  `);
  let coreCards = coreCardsStmt.all(id) as any[];

  // 2. 如果 links 表为空，从 archetypes.core_cards 字段解析英文名，再用 LIKE 模糊匹配
  if (coreCards.length === 0 && Array.isArray(archetype.core_cards) && archetype.core_cards.length > 0) {
    const placeholders = archetype.core_cards.map(() => '?').join(',');
    const fallbackStmt = db.prepare(`
      SELECT *, 'core' AS role FROM cards
      WHERE game_version = ?
        AND (name_en IN (${placeholders}) OR name_cn IN (${placeholders}))
    `);
    const fallbackParams = [
      archetype.game_version,
      ...archetype.core_cards,
      ...archetype.core_cards,
    ];
    coreCards = fallbackStmt.all(...fallbackParams);
  }

  // 解析卡牌 keywords JSON
  const parsedCoreCards = coreCards.map((card: any) => ({
    ...card,
    keywords: JSON.parse(card.keywords || '[]'),
  }));

  // 关键遗物（从 archetypes.key_relics 解析英文名，匹配 relics 表）
  let keyRelics: any[] = [];
  if (Array.isArray(archetype.key_relics) && archetype.key_relics.length > 0) {
    const placeholders = archetype.key_relics.map(() => '?').join(',');
    const relicsStmt = db.prepare(`
      SELECT * FROM relics
      WHERE game_version = ?
        AND (name_en IN (${placeholders}) OR name_cn IN (${placeholders}))
    `);
    const relicParams = [
      archetype.game_version,
      ...archetype.key_relics,
      ...archetype.key_relics,
    ];
    keyRelics = relicsStmt.all(...relicParams);
    keyRelics = keyRelics.map((r: any) => ({
      ...r,
      keywords: JSON.parse(r.keywords || '[]'),
    }));
  }

  // 避免遗物（同理）
  let avoidRelics: any[] = [];
  if (Array.isArray(archetype.avoid_relics) && archetype.avoid_relics.length > 0) {
    const placeholders = archetype.avoid_relics.map(() => '?').join(',');
    const avoidStmt = db.prepare(`
      SELECT * FROM relics
      WHERE game_version = ?
        AND (name_en IN (${placeholders}) OR name_cn IN (${placeholders}))
    `);
    const avoidParams = [
      archetype.game_version,
      ...archetype.avoid_relics,
      ...archetype.avoid_relics,
    ];
    avoidRelics = avoidStmt.all(...avoidParams);
    avoidRelics = avoidRelics.map((r: any) => ({
      ...r,
      keywords: JSON.parse(r.keywords || '[]'),
    }));
  }

  res.json({
    success: true,
    data: {
      ...archetype,
      core_cards_detail: parsedCoreCards,
      key_relics_detail: keyRelics,
      avoid_relics_detail: avoidRelics,
    },
  });
});

// ——— GET /api/archetypes/:id/attempts —— 该流派的尝试记录 ———
router.get('/:id/attempts', (req, res) => {
  const { id } = req.params;
  const deviceId = req.headers['x-device-id'] || req.query.device_id;

  let sql = 'SELECT * FROM archetype_attempts WHERE archetype_id = ?';
  const params: any[] = [id];

  if (deviceId) {
    sql += ' AND device_id = ?';
    params.push(deviceId);
  }

  sql += ' ORDER BY created_at DESC';

  const stmt = db.prepare(sql);
  const attempts = stmt.all(...params);

  res.json({ success: true, data: attempts });
});

// ——— POST /api/archetypes —— 录入新流派 ———
router.post('/', (req, res) => {
  const {
    game_version,
    character,
    name_cn,
    name_en,
    description,
    core_cards,
    support_cards,
    key_relics,
    avoid_cards,
    early_game,
    mid_game,
    late_game,
    difficulty_rating,
    win_rate,
    recommended_ascension,
    playstyle_tags,
    mvp_relics,
    avoid_relics,
    key_nodes,
    advanced_tips,
    route_preferences,
  } = req.body;

  if (!game_version || !character || !name_cn) {
    return res.status(400).json({ success: false, error: '缺少必要参数（game_version, character, name_cn）' });
  }

  const stmt = db.prepare(`
    INSERT INTO archetypes (
      game_version, character, name_cn, name_en, description,
      core_cards, support_cards, key_relics, avoid_cards,
      early_game, mid_game, late_game,
      difficulty_rating, win_rate, recommended_ascension,
      playstyle_tags, mvp_relics, avoid_relics, key_nodes, advanced_tips,
      route_preferences, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    game_version,
    character,
    name_cn,
    name_en || null,
    description || null,
    Array.isArray(core_cards) ? JSON.stringify(core_cards) : (core_cards || '[]'),
    Array.isArray(support_cards) ? JSON.stringify(support_cards) : (support_cards || '[]'),
    Array.isArray(key_relics) ? JSON.stringify(key_relics) : (key_relics || '[]'),
    Array.isArray(avoid_cards) ? JSON.stringify(avoid_cards) : (avoid_cards || '[]'),
    early_game || null,
    mid_game || null,
    late_game || null,
    difficulty_rating || 3,
    win_rate !== undefined ? win_rate : null,
    recommended_ascension !== undefined ? recommended_ascension : 0,
    Array.isArray(playstyle_tags) ? JSON.stringify(playstyle_tags) : (playstyle_tags || '[]'),
    typeof mvp_relics === 'object' ? JSON.stringify(mvp_relics) : (mvp_relics || '[]'),
    typeof avoid_relics === 'object' ? JSON.stringify(avoid_relics) : (avoid_relics || '[]'),
    key_nodes || null,
    advanced_tips || null,
    typeof route_preferences === 'object' ? JSON.stringify(route_preferences) : (route_preferences || '{}'),
    'manual'
  );

  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

// ——— PUT /api/archetypes/:id —— 更新流派 ———
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    'game_version', 'character', 'name_cn', 'name_en', 'description',
    'core_cards', 'support_cards', 'key_relics', 'avoid_cards',
    'early_game', 'mid_game', 'late_game',
    'difficulty_rating', 'win_rate', 'recommended_ascension',
    'playstyle_tags', 'mvp_relics', 'avoid_relics', 'key_nodes', 'advanced_tips',
    'route_preferences',
  ];

  const updates: string[] = [];
  const params: any[] = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      let val = req.body[field];
      if (['core_cards', 'support_cards', 'key_relics', 'avoid_cards', 'playstyle_tags'].includes(field)) {
        val = Array.isArray(val) ? JSON.stringify(val) : val;
      }
      if (['mvp_relics', 'avoid_relics', 'route_preferences'].includes(field)) {
        val = typeof val === 'object' ? JSON.stringify(val) : val;
      }
      params.push(val);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, error: '没有提供任何可更新字段' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const sql = `UPDATE archetypes SET ${updates.join(', ')} WHERE id = ?`;
  params.push(id);

  const stmt = db.prepare(sql);
  stmt.run(...params);

  // 返回更新后的流派
  const updatedStmt = db.prepare('SELECT * FROM archetypes WHERE id = ?');
  const updated = updatedStmt.get(id);

  if (!updated) {
    return res.status(404).json({ success: false, error: '流派不存在' });
  }

  res.json({ success: true, data: parseArchetypeJSON(updated) });
});

// ——— DELETE /api/archetypes/:id —— 删除流派 ———
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM archetypes WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: '流派不存在' });
  }

  res.json({ success: true });
});

export default router;
