-- ============================================================
-- SpireGuide v0.2.0 数据库 Schema 变更脚本
-- 基于 v0.1.x 扩展，兼容旧数据
-- 执行方式：better-sqlite3 直接执行或通过 db.exec()
-- ============================================================

-- ------------------------------------------------------------
-- 1. 流派表扩充（已有表 ALTER）
-- ------------------------------------------------------------
-- 注意：SQLite 的 ALTER TABLE 能力有限，better-sqlite3 支持简单 ADD COLUMN
-- 如果 ALTER 失败，需使用「重建表」策略（见文件底部注释）

ALTER TABLE archetypes ADD COLUMN difficulty_rating INTEGER DEFAULT 3;
ALTER TABLE archetypes ADD COLUMN win_rate REAL;
ALTER TABLE archetypes ADD COLUMN recommended_ascension INTEGER DEFAULT 0;
ALTER TABLE archetypes ADD COLUMN playstyle_tags TEXT;
ALTER TABLE archetypes ADD COLUMN mvp_relics TEXT;
ALTER TABLE archetypes ADD COLUMN avoid_relics TEXT;
ALTER TABLE archetypes ADD COLUMN key_nodes TEXT;
ALTER TABLE archetypes ADD COLUMN advanced_tips TEXT;
ALTER TABLE archetypes ADD COLUMN route_preferences TEXT;
ALTER TABLE archetypes ADD COLUMN data_source TEXT DEFAULT 'manual';
ALTER TABLE archetypes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 为已有字段增加索引
CREATE INDEX IF NOT EXISTS idx_archetypes_character ON archetypes(character);
CREATE INDEX IF NOT EXISTS idx_archetypes_game ON archetypes(game_version);

-- ------------------------------------------------------------
-- 2. 流派尝试记录表（新建）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS archetype_attempts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    archetype_id    INTEGER NOT NULL,
    device_id       TEXT,                       -- 匿名用户标识
    character       TEXT NOT NULL,              -- 实际使用的角色
    seed            TEXT,                       -- 游戏种子
    ascension       INTEGER DEFAULT 0,          -- 进阶等级
    outcome         TEXT,                       -- 'win'|'lose'|'abandoned'|'in_progress'
    final_floor     INTEGER,
    duration_minutes INTEGER,                   -- 对局时长（分钟）
    notes           TEXT,                       -- 心得体会（长文本）
    rating          INTEGER CHECK(rating BETWEEN 1 AND 5), -- 用户评分 1-5
    is_favorite     INTEGER DEFAULT 0,          -- 0=否 1=是
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (archetype_id) REFERENCES archetypes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempts_archetype ON archetype_attempts(archetype_id);
CREATE INDEX IF NOT EXISTS idx_attempts_device ON archetype_attempts(device_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON archetype_attempts(created_at);

-- ------------------------------------------------------------
-- 3. 数据迁移辅助（如 ALTER 失败时的重建表策略）
-- ------------------------------------------------------------
-- 若 ALTER TABLE 执行失败，按以下步骤操作：
--
-- BEGIN TRANSACTION;
-- CREATE TABLE archetypes_new (
--     id              INTEGER PRIMARY KEY AUTOINCREMENT,
--     game_version    TEXT NOT NULL,
--     character       TEXT NOT NULL,
--     name_cn         TEXT NOT NULL,
--     name_en         TEXT,
--     description     TEXT,
--     core_cards      TEXT,
--     support_cards   TEXT,
--     key_relics      TEXT,
--     avoid_cards     TEXT,
--     early_game      TEXT,
--     mid_game        TEXT,
--     late_game       TEXT,
--     difficulty_rating INTEGER DEFAULT 3,
--     win_rate        REAL,
--     recommended_ascension INTEGER DEFAULT 0,
--     playstyle_tags  TEXT,
--     mvp_relics      TEXT,
--     avoid_relics    TEXT,
--     key_nodes       TEXT,
--     advanced_tips   TEXT,
--     route_preferences TEXT,
--     data_source     TEXT DEFAULT 'manual',
--     updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
--     created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
-- );
-- INSERT INTO archetypes_new SELECT * FROM archetypes;
-- DROP TABLE archetypes;
-- ALTER TABLE archetypes_new RENAME TO archetypes;
-- COMMIT;

-- ------------------------------------------------------------
-- 4. 验证脚本
-- ------------------------------------------------------------
-- 执行后验证：
-- SELECT name FROM pragma_table_info('archetypes');
-- 期望包含新增字段：difficulty_rating, win_rate, route_preferences 等
--
-- SELECT COUNT(*) FROM archetype_attempts;
-- 初始应为 0
