import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 导入种子数据
import { ironcladCards } from './seeds/cards-ironclad';
import { silentCards } from './seeds/cards-silent';
import { defectCards } from './seeds/cards-defect';
import { watcherCards } from './seeds/cards-watcher';
import { colorlessCards } from './seeds/cards-colorless';
import { sts2Cards } from './seeds/cards-sts2';
import { relicsData } from './seeds/relics';
import { enemiesData } from './seeds/enemies';

/**
 * 数据库种子脚本
 * 将种子数据插入SQLite数据库
 */

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'spireguide.db');

// 确保目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 执行Schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// 检查是否已有数据
const count = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
if (count.count > 0) {
  console.log('数据库已有数据，跳过种子');
  process.exit(0);
}

console.log('开始插入种子数据...');

// 插入卡牌数据
const allCards = [
  ...ironcladCards,
  ...silentCards,
  ...defectCards,
  ...watcherCards,
  ...colorlessCards,
  ...sts2Cards,
];

const insertCard = db.prepare(`
  INSERT INTO cards (game_version, character, name_cn, name_en, cost, type, rarity, effect_base, effect_upgraded, keywords, patch_version)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCards = db.transaction((cards: any[]) => {
  for (const card of cards) {
    insertCard.run(
      card.game_version,
      card.character,
      card.name_cn,
      card.name_en,
      card.cost,
      card.type,
      card.rarity,
      card.effect_base,
      card.effect_upgraded,
      card.keywords,
      'v0.1'
    );
  }
});

insertCards(allCards);
console.log(`插入 ${allCards.length} 张卡牌`);

// 插入遗物
const insertRelic = db.prepare(`
  INSERT INTO relics (game_version, name_cn, name_en, rarity, character, effect, flavor_text, keywords, patch_version)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertRelics = db.transaction((relics: any[]) => {
  for (const relic of relics) {
    insertRelic.run(
      relic.game_version,
      relic.name_cn,
      relic.name_en,
      relic.rarity,
      relic.character,
      relic.effect,
      relic.flavor_text,
      relic.keywords,
      'v0.1'
    );
  }
});

insertRelics(relicsData);
console.log(`插入 ${relicsData.length} 个遗物`);

// 插入敌人
const insertEnemy = db.prepare(`
  INSERT INTO enemies (game_version, name_cn, name_en, act, type, hp_min, hp_max, intents, strategy_general, strategy_by_character, patch_version)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertEnemies = db.transaction((enemies: any[]) => {
  for (const enemy of enemies) {
    insertEnemy.run(
      enemy.game_version,
      enemy.name_cn,
      enemy.name_en,
      enemy.act,
      enemy.type,
      enemy.hp_min,
      enemy.hp_max,
      enemy.intents,
      enemy.strategy_general,
      enemy.strategy_by_character,
      'v0.1'
    );
  }
});

insertEnemies(enemiesData);
console.log(`插入 ${enemiesData.length} 个敌人`);

console.log('种子数据插入完成！');
console.log(`卡牌总数: ${allCards.length}`);
console.log(`遗物总数: ${relicsData.length}`);
console.log(`敌人总数: ${enemiesData.length}`);

// 统计
const stats = db.prepare(`
  SELECT game_version, COUNT(*) as count FROM cards GROUP BY game_version
`).all();
console.log('卡牌统计:', stats);

db.close();
