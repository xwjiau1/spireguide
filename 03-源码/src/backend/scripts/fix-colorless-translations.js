/**
 * colorless 卡牌中文译名批量修正
 * 数据来源：Steam官方中文 / Fandom Wiki 中文 / 游戏内实际显示
 */

const Database = require('better-sqlite3');
const db = new Database('data/spireguide.db');

console.log('=== colorless 卡牌译名批量修正 ===');

const translationFixes = [
  { name_en: 'Bandage Up', name_cn_new: '包扎' },
  { name_en: 'Blind', name_cn_new: '致盲' },
  { name_en: 'Dark Shackles', name_cn_new: '黑暗枷锁' },
  { name_en: 'Deep Breath', name_cn_new: '深呼吸' },
  { name_en: 'Discovery', name_cn_new: '发现' },
  { name_en: 'Dramatic Entrance', name_cn_new: '华丽登场' },
  { name_en: 'Enlightenment', name_cn_new: '启蒙' },
  { name_en: 'Finesse', name_cn_new: '技巧' },
  { name_en: 'Flash of Steel', name_cn_new: '钢铁闪光' },
  { name_en: 'Forethought', name_cn_new: '深谋远虑' },
  { name_en: 'Good Instincts', name_cn_new: '本能反应' },
  { name_en: 'Impatience', name_cn_new: '急躁' },
  { name_en: 'Jack of All Trades', name_cn_new: '万金油' },
  { name_en: 'Madness', name_cn_new: '疯狂' },
  { name_en: 'Mind Blast', name_cn_new: '心灵震爆' },
  { name_en: 'Panache', name_cn_new: '潇洒' },
  { name_en: 'Purity', name_cn_new: '纯净' },
  { name_en: 'Trip', name_cn_new: '绊倒' },
  { name_en: 'Violence', name_cn_new: '暴力' },
];

const updateStmt = db.prepare(`
  UPDATE cards SET name_cn = ? WHERE name_en = ? AND character = 'colorless'
`);

let totalChanges = 0;
for (const fix of translationFixes) {
  const result = updateStmt.run(fix.name_cn_new, fix.name_en);
  if (result.changes > 0) {
    console.log(`修正: ${fix.name_en} → ${fix.name_cn_new} (${result.changes} 条)`);
    totalChanges += result.changes;
  }
}

console.log(`\n共修正 ${totalChanges} 条 colorless 卡牌译名`);

// 验证
const remaining = db.prepare(`
  SELECT id, name_en, name_cn FROM cards
  WHERE character = 'colorless' AND name_cn = name_en COLLATE NOCASE
`).all();

if (remaining.length > 0) {
  console.log('\n[警告] 仍有以下 colorless 卡牌 name_cn 与 name_en 相同:');
  for (const c of remaining) {
    console.log(`  id=${c.id} ${c.name_en}`);
  }
} else {
  console.log('\n[通过] 所有 colorless 卡牌均已翻译');
}

db.close();
