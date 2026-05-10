/**
 * 前后端共享类型定义
 * 杀戮尖塔攻略平台 — SpireGuide
 */

// 游戏版本
export type GameVersion = 'sts1' | 'sts2';

// 角色
export type Character = 'ironclad' | 'silent' | 'defect' | 'watcher' | 'necrobinder' | 'regent';

// 卡牌类型
export type CardType = 'attack' | 'skill' | 'power' | 'curse' | 'status';

// 卡牌稀有度
export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'special';

// 遗物稀有度
export type RelicRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'boss' | 'shop' | 'event';

// 敌人类型
export type EnemyType = 'normal' | 'elite' | 'boss';

// 场景类型
export type SceneType = 'combat' | 'card_reward' | 'map' | 'shop' | 'event' | 'rest' | 'other';

// 卡牌接口
export interface Card {
  id: number;
  game_version: GameVersion;
  character: Character | string;
  name_cn: string;
  name_en: string;
  cost: number;
  type: CardType;
  rarity: CardRarity;
  effect_base: string;
  effect_upgraded: string | null;
  keywords: string[];
  image_url: string | null;
  patch_version: string | null;
  created_at: string;
}

// 遗物接口
export interface Relic {
  id: number;
  game_version: GameVersion;
  name_cn: string;
  name_en: string;
  rarity: RelicRarity;
  character: Character | string | null;
  effect: string;
  flavor_text: string | null;
  keywords: string[];
  image_url: string | null;
  patch_version: string | null;
  created_at: string;
}

// 敌人接口
export interface Enemy {
  id: number;
  game_version: GameVersion;
  name_cn: string;
  name_en: string;
  act: number;
  type: EnemyType;
  hp_min: number | null;
  hp_max: number | null;
  intents: EnemyIntent[];
  strategy_general: string | null;
  strategy_by_character: Record<string, string> | null;
  image_url: string | null;
  patch_version: string | null;
  created_at: string;
}

export interface EnemyIntent {
  pattern: string;
  damage?: number;
  block?: number;
  buff?: string;
  condition?: string;
}

// 对局记录
export interface GameSession {
  id: number;
  device_id: string | null;
  game_version: GameVersion;
  character: Character;
  ascension: number;
  seed: string | null;
  outcome: 'win' | 'lose' | 'abandoned' | 'in_progress' | null;
  final_floor: number | null;
  notes: string | null;
  created_at: string;
  ended_at: string | null;
  screenshots?: SessionScreenshot[];
}

// 对局截图
export interface SessionScreenshot {
  id: number;
  session_id: number;
  timestamp: string;
  floor: number | null;
  phase: SceneType | string | null;
  image_path: string | null;
  image_hash: string | null;
  ocr_result: ScreenshotOcrResult | null;
  player_notes: string | null;
  ai_qa_id: number | null;
}

export interface ScreenshotOcrResult {
  scene?: SceneType;
  character?: string;
  turn?: number;
  energy?: string;
  handCards?: { name: string; cost: number }[];
  enemyName?: string;
  enemyHp?: string;
  playerHp?: string;
  gold?: number;
}

// AI问答历史
export interface QaHistory {
  id: number;
  device_id: string | null;
  session_id: number | null;
  question_type: string | null;
  question_text: string | null;
  screenshot_id: number | null;
  ai_response: string;
  ai_model: string | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  user_rating: number | null;
  created_at: string;
}

// AI识别请求/响应
export interface AiRecognizeRequest {
  image: string; // base64
}

export interface AiRecognizeResponse {
  scene: SceneType | null;
  character: string | null;
  turn: number | null;
  energy: string | null;
  handCards: { name: string; cost: number }[];
  enemyName: string | null;
  enemyHp: string | null;
  playerHp: string | null;
  gold: number | null;
  rawText?: string;
}

// AI策略请求
export interface AiStrategyRequest {
  question: string;
  gameVersion: GameVersion;
  character: string;
  turn: number | null;
  energy: string | null;
  handCards: { name: string; cost: number; effect?: string }[];
  enemyName: string | null;
  enemyHp: string | null;
  enemyIntent: string | null;
  confirmed: boolean;
  playerHp?: string;
  gold?: number;
  relics?: string[];
  potions?: string[];
}

export interface AiStrategyResponse {
  answer: string;
  model: string;
  tokensUsed: number | null;
  responseTimeMs: number;
}

// API通用响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
