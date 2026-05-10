import { Router } from 'express';
import db from '../database/db';

/**
 * 卡牌API路由
 * 提供卡牌列表、搜索、详情、对比功能
 */

const router = Router();

// 获取卡牌列表（支持筛选）
router.get('/', (req, res) => {
  const { game_version, character, type, rarity, q } = req.query;

  let sql = 'SELECT * FROM cards WHERE 1=1';
  const params: any[] = [];

  if (game_version) {
    sql += ' AND game_version = ?';
    params.push(game_version);
  }
  if (character) {
    sql += ' AND character = ?';
    params.push(character);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (rarity) {
    sql += ' AND rarity = ?';
    params.push(rarity);
  }
  if (q) {
    sql += ' AND (name_cn LIKE ? OR name_en LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }

  sql += ' ORDER BY character, rarity, cost, name_cn';

  const stmt = db.prepare(sql);
  const cards = stmt.all(...params);

  // 解析 keywords JSON
  const parsedCards = cards.map((card: any) => ({
    ...card,
    keywords: JSON.parse(card.keywords || '[]'),
  }));

  res.json({ success: true, data: parsedCards });
});

// 搜索卡牌
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ success: false, error: '缺少搜索关键词' });
  }

  const like = `%${q}%`;
  const stmt = db.prepare(`
    SELECT * FROM cards 
    WHERE name_cn LIKE ? OR name_en LIKE ? OR effect_base LIKE ?
    ORDER BY 
      CASE WHEN name_cn = ? THEN 0
           WHEN name_cn LIKE ? THEN 1
           ELSE 2
      END,
      character, rarity, cost
    LIMIT 50
  `);

  const cards = stmt.all(like, like, like, q, `%${q}%`);
  const parsedCards = cards.map((card: any) => ({
    ...card,
    keywords: JSON.parse(card.keywords || '[]'),
  }));

  res.json({ success: true, data: parsedCards, count: parsedCards.length });
});

// 卡牌对比（支持 ?id=1&id=2 格式）
router.get('/compare', (req, res) => {
  let { id1, id2, id } = req.query;

  // 支持 ?id=1&id=2 数组格式
  if (!id1 && Array.isArray(id)) {
    id1 = id[0];
    id2 = id[1];
  }

  if (!id1 || !id2) {
    return res.status(400).json({ success: false, error: '需要提供两张卡牌ID（id1&id2 或 id&id）' });
  }

  const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  const card1 = stmt.get(id1);
  const card2 = stmt.get(id2);

  if (!card1 || !card2) {
    return res.status(404).json({ success: false, error: '卡牌不存在' });
  }

  res.json({
    success: true,
    data: {
      card1: { ...card1, keywords: JSON.parse((card1 as any).keywords || '[]') },
      card2: { ...card2, keywords: JSON.parse((card2 as any).keywords || '[]') },
    },
  });
});

// 获取单张卡牌详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  const card = stmt.get(id);

  if (!card) {
    return res.status(404).json({ success: false, error: '卡牌不存在' });
  }

  // 查找相关配合卡牌
  const comboStmt = db.prepare(`
    SELECT c.*, cc.combo_type, cc.description
    FROM card_combos cc
    JOIN cards c ON cc.combo_card_id = c.id
    WHERE cc.card_id = ?
  `);
  const combos = comboStmt.all(id);

  // 查找所属流派
  const archetypeStmt = db.prepare(`
    SELECT a.*, cal.role
    FROM archetypes a
    JOIN card_archetype_links cal ON a.id = cal.archetype_id
    WHERE cal.card_id = ?
  `);
  const archetypes = archetypeStmt.all(id);

  res.json({
    success: true,
    data: {
      ...card,
      keywords: JSON.parse((card as any).keywords || '[]'),
      combos,
      archetypes,
    },
  });
});

export default router;
