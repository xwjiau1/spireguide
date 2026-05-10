import { Router } from 'express';
import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * 对局记录API路由
 */

const router = Router();

// 获取对局列表
router.get('/', (req, res) => {
  const { device_id, game_version, limit = '20', offset = '0' } = req.query;

  let sql = 'SELECT * FROM game_sessions WHERE 1=1';
  const params: any[] = [];

  if (device_id) {
    sql += ' AND device_id = ?';
    params.push(device_id);
  }
  if (game_version) {
    sql += ' AND game_version = ?';
    params.push(game_version);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string), parseInt(offset as string));

  const stmt = db.prepare(sql);
  const sessions = stmt.all(...params);

  res.json({ success: true, data: sessions });
});

// 创建对局
router.post('/', (req, res) => {
  const { device_id, game_version, character, ascension, seed, notes } = req.body;

  if (!game_version || !character) {
    return res.status(400).json({ success: false, error: '缺少必要参数' });
  }

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO game_sessions (device_id, game_version, character, ascension, seed, notes, outcome)
    VALUES (?, ?, ?, ?, ?, ?, 'in_progress')
  `);

  const result = stmt.run(device_id || null, game_version, character, ascension || 0, seed || null, notes || null);

  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

// 获取对局详情（含截图）
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sessionStmt = db.prepare('SELECT * FROM game_sessions WHERE id = ?');
  const session = sessionStmt.get(id);

  if (!session) {
    return res.status(404).json({ success: false, error: '对局不存在' });
  }

  const screenshotStmt = db.prepare('SELECT * FROM session_screenshots WHERE session_id = ? ORDER BY timestamp');
  const screenshots = screenshotStmt.all(id);

  const parsedScreenshots = screenshots.map((s: any) => ({
    ...s,
    ocr_result: JSON.parse(s.ocr_result || 'null'),
  }));

  res.json({
    success: true,
    data: {
      ...session,
      screenshots: parsedScreenshots,
    },
  });
});

// 添加截图
router.post('/:id/screenshots', (req, res) => {
  const { id } = req.params;
  const { floor, phase, image_path, image_hash, ocr_result, player_notes } = req.body;

  const stmt = db.prepare(`
    INSERT INTO session_screenshots (session_id, floor, phase, image_path, image_hash, ocr_result, player_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    id,
    floor || null,
    phase || null,
    image_path || null,
    image_hash || null,
    ocr_result ? JSON.stringify(ocr_result) : null,
    player_notes || null
  );

  res.json({ success: true, data: { id: result.lastInsertRowid } });
});

// 更新截图备注
router.patch('/:id/screenshots/:sid', (req, res) => {
  const { sid } = req.params;
  const { player_notes } = req.body;

  const stmt = db.prepare('UPDATE session_screenshots SET player_notes = ? WHERE id = ?');
  stmt.run(player_notes, sid);

  res.json({ success: true });
});

// 删除截图
router.delete('/:id/screenshots/:sid', (req, res) => {
  const { sid } = req.params;

  const stmt = db.prepare('DELETE FROM session_screenshots WHERE id = ?');
  stmt.run(sid);

  res.json({ success: true });
});

// 结束对局
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { outcome, final_floor } = req.body;

  const stmt = db.prepare('UPDATE game_sessions SET outcome = ?, final_floor = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(outcome, final_floor, id);

  // 返回更新后的对局
  const sessionStmt = db.prepare('SELECT * FROM game_sessions WHERE id = ?');
  const session = sessionStmt.get(id);

  res.json({ success: true, data: session });
});

// 删除对局
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // 先删除关联截图
  const delScreenshots = db.prepare('DELETE FROM session_screenshots WHERE session_id = ?');
  delScreenshots.run(id);

  // 再删除对局
  const delSession = db.prepare('DELETE FROM game_sessions WHERE id = ?');
  delSession.run(id);

  res.json({ success: true });
});

export default router;
