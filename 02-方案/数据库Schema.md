# 杀戮尖塔攻略平台 — 数据库Schema设计

**项目：** SpireGuide  
**数据库：** SQLite  
**编制：** Irra  
**日期：** 2026-05-10

---

## 设计原则

1. **轻量优先**：SQLite单文件，零配置，适合MVP
2. **兼容两代**：所有表含 `game_version` 字段，`'sts1'` / `'sts2'`
3. **预留扩展**：卡牌/敌人表预留JSON字段用于后续扩展
4. **中文注释**：代码注释和说明用中文

---

## 表结构

### 1. cards（卡牌表）

存储StS1和StS2所有卡牌信息。

```sql
CREATE TABLE cards (
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

CREATE INDEX idx_cards_game ON cards(game_version);
CREATE INDEX idx_cards_character ON cards(character);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_name ON cards(name_cn, name_en);
```

**数据规模：**
- StS1：约350张（4角色，含无色/诅咒）
- StS2：约150+张（Early Access已有角色，持续增加）

---

### 2. relics（遗物表）

```sql
CREATE TABLE relics (
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

CREATE INDEX idx_relics_game ON relics(game_version);
CREATE INDEX idx_relics_character ON relics(character);
CREATE INDEX idx_relics_rarity ON relics(rarity);
```

---

### 3. enemies（敌人/BOSS表）

```sql
CREATE TABLE enemies (
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

CREATE INDEX idx_enemies_game ON enemies(game_version);
CREATE INDEX idx_enemies_act ON enemies(act);
CREATE INDEX idx_enemies_type ON enemies(type);
```

---

### 4. game_sessions（对局记录表）

```sql
CREATE TABLE game_sessions (
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

CREATE INDEX idx_sessions_device ON game_sessions(device_id);
CREATE INDEX idx_sessions_created ON game_sessions(created_at);
```

---

### 5. session_screenshots（对局截图表）

```sql
CREATE TABLE session_screenshots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER NOT NULL,
    timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
    floor           INTEGER,                    -- 当前层数
    phase           TEXT,                       -- 'combat'|'card_reward'|'map'|'event'|'shop'|'rest'|'other'
    image_path      TEXT,                       -- 本地存储路径（相对于uploads/）
    image_hash      TEXT,                       -- MD5去重/缓存
    ocr_result      TEXT,                       -- JSON：AI识别结果缓存
    player_notes    TEXT,                       -- 用户手动备注
    ai_qa_id        INTEGER,                    -- 关联qa_history
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_screenshots_session ON session_screenshots(session_id);
CREATE INDEX idx_screenshots_hash ON session_screenshots(image_hash);
```

---

### 6. qa_history（AI问答历史表）

```sql
CREATE TABLE qa_history (
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

CREATE INDEX idx_qa_device ON qa_history(device_id);
CREATE INDEX idx_qa_created ON qa_history(created_at);
```

---

### 7. card_combos（卡牌配合表）

```sql
CREATE TABLE card_combos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    card_id         INTEGER NOT NULL,
    combo_card_id   INTEGER NOT NULL,           -- 配合卡牌ID
    combo_type      TEXT NOT NULL,              -- 'synergy'|'anti_synergy'
    description     TEXT,                       -- 配合说明
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (combo_card_id) REFERENCES cards(id)
);
```

---

### 8. card_archetypes（卡牌流派关联表）

```sql
CREATE TABLE archetypes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_version    TEXT NOT NULL,
    character       TEXT NOT NULL,
    name_cn         TEXT NOT NULL,              -- 如"力量战"
    name_en         TEXT,
    description     TEXT,
    core_cards      TEXT,                       -- JSON [{"card_name":"...","quantity":2}]
    support_cards   TEXT,                       -- JSON
    key_relics      TEXT,                       -- JSON
    avoid_cards     TEXT,                       -- JSON
    early_game      TEXT,
    mid_game        TEXT,
    late_game       TEXT
);

CREATE TABLE card_archetype_links (
    card_id         INTEGER REFERENCES cards(id),
    archetype_id    INTEGER REFERENCES archetypes(id),
    role            TEXT NOT NULL,              -- 'core'|'support'|'optional'
    PRIMARY KEY (card_id, archetype_id)
);
```

---

## 数据录入策略

### StS1数据（完整）

- **来源**：官方Wiki + 游戏内数据 + 社区资料
- **状态**：已完成全部4角色卡牌录入
- **质量**：每张卡牌含中英文名称、费用、类型、稀有度、基础/升级效果

### StS2数据（Early Access）

- **来源**：IGN Wiki、官方公告、社区测试
- **状态**：已录入Ironclad/Silent/Defect已有卡牌，Necrobinder/Regent部分卡牌
- **策略**：预留 `patch_version` 字段，后续版本更新时标注变更

---

## 与PostgreSQL方案的差异说明

| 原方案(PostgreSQL) | MVP方案(SQLite) | 原因 |
|-------------------|----------------|------|
| `SERIAL` | `INTEGER PRIMARY KEY AUTOINCREMENT` | SQLite标准自增 |
| `TEXT[]` 数组 | `TEXT` 存JSON字符串 | SQLite无数组类型 |
| `JSONB` | `TEXT` 存JSON字符串 | SQLite用TEXT存JSON，查询时解析 |
| `UUID` | `INTEGER` 自增ID | MVP简化，后续可迁移 |
| `to_tsvector` 全文搜索 | `LIKE` + 名称索引 | MVP简化，数据量小(<1000条)时性能足够 |
| `TIMESTAMP` | `DATETIME` | SQLite日期类型 |

**迁移路径：** MVP验证后如需扩展，可无损迁移至PostgreSQL：导出SQLite为SQL → 导入PostgreSQL → 启用JSONB和全文搜索。

---

*编制：Irra | 基于技术架构方案SQLite化落地*
