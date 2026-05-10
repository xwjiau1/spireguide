import { Router } from 'express';
import db from '../database/db';

/**
 * 遗物API路由
 */

const router = Router();

// 获取遗物列表
router.get('/', (req, res) => {
  const { game_version, character, rarity, q } = req.query;

  let sql = 'SELECT * FROM relics WHERE 1=1';
  const params: any[] = [];

  if (game_version) {
    sql += ' AND game_version = ?';
    params.push(game_version);
  }
  if (character) {
    sql += ' AND (character = ? OR character IS NULL)';
    params.push(character);
  }
  if (rarity) {
    sql += ' AND rarity = ?';
    params.push(rarity);
  }
  if (q) {
    sql += ' AND (name_cn LIKE ? OR name_en LIKE ? OR effect LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY rarity, name_cn';

  const stmt = db.prepare(sql);
  const relics = stmt.all(...params);

  const parsedRelics = relics.map((relic: any) => ({
    ...relic,
    keywords: JSON.parse(relic.keywords || '[]'),
  }));

  res.json({ success: true, data: parsedRelics });
});

// 获取单个遗物详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM relics WHERE id = ?');
  const relic = stmt.get(id);

  if (!relic) {
    return res.status(404).json({ success: false, error: '遗物不存在' });
  }

  res.json({
    success: true,
    data: {
      ...relic,
      keywords: JSON.parse((relic as any).keywords || '[]'),
    },
  });
});

export default router;
