/**
 * 卡牌翻译修正脚本
 * 修复已知翻译错误 + 检查 colorless 卡牌命名规范
 */

const Database = require('better-sqlite3');
const db = new Database('data/spireguide.db');

console.log('=== 翻译修正开始 ===');

// 5.1 已知错误修正
const knownFixes = [
  { name_en: 'Swift Strike', name_cn_old: '科学方法', name_cn_new: '迅捷打击' },
  { name_en: 'Quick Slash', name_cn_old: '急速斩', name_cn_new: '快斩' },
];

const updateStmt = db.prepare(`
  UPDATE cards SET name_cn = ? WHERE name_en = ? AND name_cn = ?
`);

for (const fix of knownFixes) {
  const result = updateStmt.run(fix.name_cn_new, fix.name_en, fix.name_cn_old);
  console.log(`修正: ${fix.name_cn_old} → ${fix.name_cn_new} (${result.changes} 条)`);
}

// 5.2 检查 colorless 卡牌 — 英文名/带空格的中文名需要修正
console.log('\n=== colorless 卡牌检查 ===');
const colorlessCards = db.prepare(`
  SELECT id, name_cn, name_en, character, game_version
  FROM cards
  WHERE character = 'colorless' OR name_en LIKE 'Colorless%'
`).all();

console.log(`colorless 卡牌总数: ${colorlessCards.length}`);

// 检查英文名（应为大写首字母的英文原名，而非中文）
let issues = 0;
for (const card of colorlessCards) {
  // 如果 name_cn 看起来像英文（全是 ASCII 字母），记录问题
  const isAsciiName = /^[A-Za-z\s'-]+$/.test(card.name_cn);
  if (isAsciiName) {
    console.log(`  [需关注] name_cn 为英文: ${card.name_cn} (en=${card.name_en}, id=${card.id})`);
    issues++;
  }
  // 检查 name_en 是否包含空格但 name_cn 也有空格（可能译名未标准化）
  if (card.name_en && card.name_en.includes(' ') && card.name_cn && card.name_cn.includes(' ')) {
    console.log(`  [需关注] 中英文均含空格: cn=${card.name_cn} en=${card.name_en}`);
    issues++;
  }
}

// 5.3 输出当前 colorless 卡牌列表供人工审阅
console.log('\ncolorless 卡牌当前译名一览:');
for (const card of colorlessCards) {
  console.log(`  ${card.name_en.padEnd(25)} → ${card.name_cn}`);
}

console.log(`\n=== 翻译修正完成 ===`);
console.log(`已知错误修正: ${knownFixes.length} 项`);
console.log(`colorless 需关注: ${issues} 项`);

db.close();
