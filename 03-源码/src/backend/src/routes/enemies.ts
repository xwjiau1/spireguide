import { Router } from 'express';
import db from '../database/db';

/**
 * 敌人API路由
 * 提供敌人列表、搜索、详情功能
 */

const router = Router();

// 获取敌人列表
router.get('/', (req, res) => {
  const { game_version, act, type, q } = req.query;

  let sql = 'SELECT id, game_version, name_cn, name_en, act, type, hp_min, hp_max, strategy_general FROM enemies WHERE 1=1';
  const params: any[] = [];

  if (game_version) {
    sql += ' AND game_version = ?';
    params.push(game_version);
  }
  if (act) {
    sql += ' AND act = ?';
    params.push(act);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (q) {
    sql += ' AND (name_cn LIKE ? OR name_en LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }

  sql += ' ORDER BY act, type, name_cn';

  const stmt = db.prepare(sql);
  const enemies = stmt.all(...params);

  res.json({ success: true, data: enemies });
});

// 搜索敌人
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ success: false, error: '缺少搜索关键词' });
  }

  const like = `%${q}%`;
  const stmt = db.prepare(`
    SELECT id, game_version, name_cn, name_en, act, type, hp_min, hp_max, strategy_general 
    FROM enemies 
    WHERE name_cn LIKE ? OR name_en LIKE ? OR strategy_general LIKE ?
    ORDER BY act, type
    LIMIT 50
  `);

  const enemies = stmt.all(like, like, like);
  res.json({ success: true, data: enemies, count: enemies.length });
});

// 获取单个敌人详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM enemies WHERE id = ?');
  const enemy = stmt.get(id);

  if (!enemy) {
    return res.status(404).json({ success: false, error: '敌人不存在' });
  }

  res.json({
    success: true,
    data: {
      ...enemy,
      intents: JSON.parse((enemy as any).intents || '[]'),
      strategy_by_character: JSON.parse((enemy as any).strategy_by_character || 'null'),
    },
  });
});

export default router;
