/**
 * 杀戮尖塔攻略平台 — SQLite数据库Schema
 * 所有注释用中文
 */

-- 卡牌表：存储StS1和StS2所有卡牌
CREATE TABLE IF NOT EXISTS cards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,              -- 'sts1' | 'sts2'
    character       TEXT NOT NULL,              -- 'ironclad' | 'silent' | 'defect' | 'watcher' | 'necrobinder' | 'regent'
    name_cn         TEXT NOT NULL,              -- 中文名
    name_en         TEXT NOT NULL,              -- 英文名
    cost            INTEGER,                    -- 费用（-1=X费）
    type            TEXT NOT NULL,              -- 'attack' | 'skill' | 'power' | 'curse' | 'status'
    rarity          TEXT NOT NULL,              -- 'basic' | 'common' | 'uncommon' | 'rare' | 'special'
    effect_base     TEXT NOT NULL,              -- 基础效果
    effect_upgraded TEXT,                       -- 升级后效果
    keywords        TEXT,                       -- JSON数组 ['exhaust','ethereal',...]
    image_url       TEXT,                       -- 图片URL（预留）
    patch_version   TEXT,                       -- 最后更新版本
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cards_game ON cards(game_version);
CREATE INDEX IF NOT EXISTS idx_cards_character ON cards(character);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name_cn, name_en);

-- 遗物表
CREATE TABLE IF NOT EXISTS relics (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    name_cn         TEXT NOT NULL,
    name_en         TEXT NOT NULL,
    rarity          TEXT NOT NULL,              -- 'starter'|'common'|'uncommon'|'rare'|'boss'|'shop'|'event'
    character       TEXT,                       -- NULL=通用
    effect          TEXT NOT NULL,
    flavor_text     TEXT,                       -- 风味文本
    keywords        TEXT,                       -- JSON数组
    image_url       TEXT,
    patch_version   TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_relics_game ON relics(game_version);
CREATE INDEX IF NOT EXISTS idx_relics_character ON relics(character);
CREATE INDEX IF NOT EXISTS idx_relics_rarity ON relics(rarity);

-- 敌人/BOSS表
CREATE TABLE IF NOT EXISTS enemies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    name_cn         TEXT NOT NULL,
    name_en         TEXT NOT NULL,
    act             INTEGER NOT NULL,           -- 1|2|3|4
    type            TEXT NOT NULL,              -- 'normal'|'elite'|'boss'
    hp_min          INTEGER,
    hp_max          INTEGER,
    intents         TEXT NOT NULL,              -- JSON [{"pattern":"攻击","damage":15}]
    strategy_general TEXT,                    -- 通用对策
    strategy_by_character TEXT,                 -- JSON {"ironclad":"...","silent":"..."}
    image_url       TEXT,
    patch_version   TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enemies_game ON enemies(game_version);
CREATE INDEX IF NOT EXISTS idx_enemies_act ON enemies(act);
CREATE INDEX IF NOT EXISTS idx_enemies_type ON enemies(type);

-- 对局记录表
CREATE TABLE IF NOT EXISTS game_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id       TEXT,                       -- 匿名用户标识
    game_version    TEXT NOT NULL,
    character       TEXT NOT NULL,
    ascension       INTEGER DEFAULT 0,          -- 进阶等级
    seed            TEXT,                       -- 游戏种子
    outcome         TEXT,                       -- 'win'|'lose'|'abandoned'|'in_progress'
    final_floor     INTEGER,
    notes           TEXT,                       -- 对局备注
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME
);

CREATE INDEX IF NOT EXISTS idx_sessions_device ON game_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON game_sessions(created_at);

-- 对局截图表
CREATE TABLE IF NOT EXISTS session_screenshots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER NOT NULL,
    timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
    floor           INTEGER,                    -- 当前层数
    phase           TEXT,                       -- 'combat'|'card_reward'|'map'|'event'|'shop'|'rest'|'other'
    image_path      TEXT,                       -- 本地存储路径
    image_hash      TEXT,                       -- MD5去重/缓存
    ocr_result      TEXT,                       -- JSON：AI识别结果缓存
    player_notes    TEXT,                       -- 用户手动备注
    ai_qa_id        INTEGER,                    -- 关联qa_history
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_screenshots_session ON session_screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_hash ON session_screenshots(image_hash);

-- AI问答历史表
CREATE TABLE IF NOT EXISTS qa_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id       TEXT,
    session_id      INTEGER,
    question_type   TEXT,                       -- 'combat_advice'|'card_pick'|'general'
    question_text   TEXT,                       -- 用户文字提问
    screenshot_id   INTEGER,
    ai_response     TEXT NOT NULL,
    ai_model        TEXT,
    tokens_used     INTEGER,
    response_time_ms INTEGER,
    user_rating     INTEGER CHECK(user_rating BETWEEN 1 AND 5),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (screenshot_id) REFERENCES session_screenshots(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_qa_device ON qa_history(device_id);
CREATE INDEX IF NOT EXISTS idx_qa_created ON qa_history(created_at);

-- 系统配置表：AI设置
CREATE TABLE IF NOT EXISTS ai_configs (
    id              INTEGER PRIMARY KEY CHECK (id = 1),  -- 单条记录，id固定为1
    enabled         INTEGER NOT NULL DEFAULT 0,           -- 0=关闭 1=开启
    provider        TEXT NOT NULL DEFAULT 'kimi',         -- 'kimi' | 'openai' | 'custom'
    api_key         TEXT,                                 -- API密钥（加密存储预留）
    api_url         TEXT,                                 -- 自定义API地址
    model           TEXT DEFAULT 'kimi-latest',             -- 模型名称
    vision_model    TEXT DEFAULT 'kimi-latest',             -- 视觉模型名称
    timeout_ms      INTEGER DEFAULT 30000,                -- 请求超时（毫秒）
    max_tokens      INTEGER DEFAULT 4096,                 -- 最大token数
    temperature     REAL DEFAULT 0.7,                     -- 温度参数
    system_prompt   TEXT,                                 -- 系统提示词
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化默认配置
INSERT OR IGNORE INTO ai_configs (id, enabled, provider, model, system_prompt)
VALUES (1, 0, 'kimi', 'kimi-latest', '你是一位杀戮尖塔游戏策略专家。根据玩家提供的游戏截图识别结果，给出具体的出牌建议和策略分析。回答要简洁实用，考虑能量、手牌、敌人和当前血量。');
CREATE TABLE IF NOT EXISTS card_combos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    card_id         INTEGER NOT NULL,
    combo_card_id   INTEGER NOT NULL,
    combo_type      TEXT NOT NULL,              -- 'synergy'|'anti_synergy'
    description     TEXT,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (combo_card_id) REFERENCES cards(id)
);

-- 流派表
CREATE TABLE IF NOT EXISTS archetypes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    character       TEXT NOT NULL,
    name_cn         TEXT NOT NULL,              -- 如"力量战"
    name_en         TEXT,
    description     TEXT,
    core_cards      TEXT,                       -- JSON
    support_cards   TEXT,                       -- JSON
    key_relics      TEXT,                       -- JSON
    avoid_cards     TEXT,                       -- JSON
    early_game      TEXT,
    mid_game        TEXT,
    late_game       TEXT
);

-- 卡牌流派关联表
CREATE TABLE IF NOT EXISTS card_archetype_links (
    card_id         INTEGER REFERENCES cards(id),
    archetype_id    INTEGER REFERENCES archetypes(id),
    role            TEXT NOT NULL,              -- 'core'|'support'|'optional'
    PRIMARY KEY (card_id, archetype_id)
);
