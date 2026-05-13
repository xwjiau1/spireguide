import { Router } from 'express';
import db from '../database/db';

/**
 * 流派尝试记录（Archetype Attempt）API路由
 * 记录用户对某一流派的实际游戏体验与心得
 */

const router = Router();

// 辅助：从请求中获取 device_id
function getDeviceId(req: any): string | null {
  return (req.headers['x-device-id'] as string) || req.body.device_id || null;
}

// ——— GET /api/attempts —— 尝试记录列表（支持筛选） ———
router.get('/', (req, res) => {
  const { archetype_id, device_id, outcome, limit = '20', offset = '0' } = req.query;

  let sql = 'SELECT * FROM archetype_attempts WHERE 1=1';
  const params: any[] = [];

  if (archetype_id) {
    sql += ' AND archetype_id = ?';
    params.push(parseInt(archetype_id as string));
  }
  if (device_id) {
    sql += ' AND device_id = ?';
    params.push(device_id);
  }
  if (outcome) {
    sql += ' AND outcome = ?';
    params.push(outcome);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string), parseInt(offset as string));

  const stmt = db.prepare(sql);
  const attempts = stmt.all(...params);

  res.json({ success: true, data: attempts });
});

// ——— POST /api/attempts —— 创建尝试记录 ———
router.post('/', (req, res) => {
  const {
    archetype_id,
    character,
    seed,
    ascension,
    outcome,
    final_floor,
    duration_minutes,
    notes,
    rating,
    is_favorite,
  } = req.body;

  if (!archetype_id || !character) {
    return res.status(400).json({ success: false, error: '缺少必要参数（archetype_id, character）' });
  }

  const deviceId = getDeviceId(req);

  const stmt = db.prepare(`
    INSERT INTO archetype_attempts (
      archetype_id, device_id, character, seed, ascension,
      outcome, final_floor, duration_minutes, notes, rating, is_favorite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    archetype_id,
    deviceId,
    character,
    seed || null,
    ascension !== undefined ? ascension : 0,
    outcome || null,
    final_floor !== undefined ? final_floor : null,
    duration_minutes !== undefined ? duration_minutes : null,
    notes || null,
    rating !== undefined ? rating : null,
    is_favorite ? 1 : 0
  );

  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

// ——— PUT /api/attempts/:id —— 更新尝试记录 ———
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const allowedFields = ['notes', 'outcome', 'final_floor', 'rating', 'is_favorite'];

  const updates: string[] = [];
  const params: any[] = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === 'is_favorite') {
        params.push(req.body[field] ? 1 : 0);
      } else {
        params.push(req.body[field]);
      }
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, error: '没有提供任何可更新字段' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const sql = `UPDATE archetype_attempts SET ${updates.join(', ')} WHERE id = ?`;
  params.push(id);

  const stmt = db.prepare(sql);
  stmt.run(...params);

  // 返回更新后的记录
  const updatedStmt = db.prepare('SELECT * FROM archetype_attempts WHERE id = ?');
  const updated = updatedStmt.get(id);

  if (!updated) {
    return res.status(404).json({ success: false, error: '尝试记录不存在' });
  }

  res.json({ success: true, data: updated });
});

// ——— DELETE /api/attempts/:id —— 删除尝试记录 ———
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM archetype_attempts WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: '尝试记录不存在' });
  }

  res.json({ success: true });
});

export default router;
