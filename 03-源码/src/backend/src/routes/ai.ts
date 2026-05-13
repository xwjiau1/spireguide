import { Router } from 'express';
import db from '../database/db';

/**
 * AI问答API路由
 * 核心功能：截图识别 + 策略生成
 * 支持真实AI调用（配置开启时）和Mock回退
 * v0.2.0 新增：错误分类降级、流派上下文注入、免责声明
 */

const router = Router();

// ——— 错误分类枚举与降级 ———
enum AiErrorType {
  NETWORK_ERROR = 'network_error',
  API_KEY_INVALID = 'api_key_invalid',
  RATE_LIMITED = 'rate_limited',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

interface ClassifiedError {
  type: AiErrorType;
  message: string;
  recoverable: boolean;
}

/**
 * 对API调用异常进行分类，用于前端展示和自动恢复判断
 */
function classifyError(err: any): ClassifiedError {
  const msg = err?.message || String(err);

  // 401 Unauthorized → API密钥无效
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API密钥')) {
    return { type: AiErrorType.API_KEY_INVALID, message: 'API密钥无效或已过期，请检查设置', recoverable: false };
  }

  // 429 Too Many Requests → 速率限制
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
    return { type: AiErrorType.RATE_LIMITED, message: '请求过于频繁，请稍后再试', recoverable: true };
  }

  // fetch failed / connection error → 网络问题
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('network') || msg.includes('timeout')) {
    // 注意：timeout 和 network 有重叠，这里单独处理显式 timeout
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
      return { type: AiErrorType.TIMEOUT, message: '请求超时，网络连接不稳定', recoverable: true };
    }
    return { type: AiErrorType.NETWORK_ERROR, message: '网络连接失败，请检查网络', recoverable: true };
  }

  return { type: AiErrorType.UNKNOWN, message: '未知错误：' + msg, recoverable: true };
}

// 免责声明
const DISCLAIMER = '\n\n---\n⚠️ 免责声明：以上建议由 AI 生成，仅供参考。杀戮尖塔是一款高度依赖随机性的Roguelike游戏，实际对局请结合当前牌组、遗物和敌人状态综合判断。';

// 辅助：读取AI配置
function getAiConfig() {
  const stmt = db.prepare('SELECT * FROM ai_configs WHERE id = 1');
  return stmt.get() as any;
}

// 辅助：获取默认API地址
function getApiBaseUrl(provider: string, customUrl?: string): string {
  if (customUrl) return customUrl.replace(/\/$/, '');
  switch (provider) {
    case 'kimi': return 'https://api.moonshot.cn/v1';
    case 'openai': return 'https://api.openai.com/v1';
    default: return 'https://api.moonshot.cn/v1';
  }
}

// 辅助：查询流派攻略（用于注入提示词上下文）
function getArchetypeContext(archetypeId: number): any | null {
  const stmt = db.prepare('SELECT * FROM archetypes WHERE id = ?');
  const archetype = stmt.get(archetypeId) as any;
  if (!archetype) return null;

  // 解析JSON字段
  const fieldsToParse = ['core_cards', 'support_cards', 'key_relics', 'avoid_cards', 'playstyle_tags', 'mvp_relics', 'avoid_relics', 'route_preferences'];
  for (const field of fieldsToParse) {
    if (archetype[field] && typeof archetype[field] === 'string') {
      try {
        archetype[field] = JSON.parse(archetype[field]);
      } catch {
        archetype[field] = [];
      }
    }
  }
  return archetype;
}

// 获取问答历史
router.get('/history', (req, res) => {
  const { limit = '20', offset = '0' } = req.query;

  const stmt = db.prepare(`
    SELECT * FROM qa_history
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const history = stmt.all(parseInt(limit as string), parseInt(offset as string));

  res.json({ success: true, data: history });
});

// 截图识别 — 优先使用真实Vision API，否则Mock
router.post('/recognize', async (req, res) => {
  const { image, image_url } = req.body;

  if (!image && !image_url) {
    return res.status(400).json({ success: false, error: '缺少图片数据' });
  }

  const config = getAiConfig();
  const startTime = Date.now();

  // 如果AI开启且有密钥，调用真实Vision API
  if (config?.enabled && config?.api_key) {
    try {
      const baseUrl = getApiBaseUrl(config.provider, config.api_url);
      const model = config.vision_model || config.model || 'kimi-latest';

      // 构建消息内容（支持图片URL或base64）
      const content: any[] = [
        {
          type: 'text',
          text: '请识别这张杀戮尖塔游戏截图，提取以下信息并以JSON格式返回：\n' +
            '{\n' +
            '  "scene": "combat|card_reward|map|event|shop|rest|other",\n' +
            '  "character": "ironclad|silent|defect|watcher|necrobinder|regent",\n' +
            '  "turn": 数字,\n' +
            '  "energy": "当前能量/最大能量",\n' +
            '  "handCards": [{"name":"卡牌名","cost":费用}],\n' +
            '  "enemyName": "敌人名",\n' +
            '  "enemyHp": "当前血量/最大血量",\n' +
            '  "playerHp": "当前血量/最大血量",\n' +
            '  "gold": 金币数\n' +
            '}\n' +
            '如果无法识别某项，用null填充。只返回JSON，不要其他文字。'
        }
      ];

      if (image_url) {
        content.push({ type: 'image_url', image_url: { url: image_url } });
      } else if (image) {
        // 支持 base64 data URL
        content.push({ type: 'image_url', image_url: { url: image } });
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.api_key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content }],
          max_tokens: config.max_tokens || 4096,
          temperature: (config.temperature ?? 0.1),
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误 ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      const rawText = data.choices?.[0]?.message?.content || '{}';
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {};
      }

      const result = {
        recognized_elements: {
          scene: parsed.scene || 'combat',
          character: parsed.character || 'ironclad',
          turn: parsed.turn || 1,
          energy: parsed.energy || '?/?',
          handCards: parsed.handCards || [],
          enemyName: parsed.enemyName || '未知敌人',
          enemyHp: parsed.enemyHp || '?/?',
          playerHp: parsed.playerHp || '?/?',
          gold: parsed.gold || 0,
        },
        rawText: rawText,
        model: data.model || model,
        responseTimeMs: Date.now() - startTime,
      };

      return res.json({ success: true, data: result });
    } catch (err) {
      // 真实API调用失败，降级到Mock
      console.warn('[AI] Vision API调用失败，降级到Mock:', (err as Error).message);
    }
  }

  // Mock回退
  const mockResult = {
    recognized_elements: {
      scene: 'combat',
      character: 'ironclad',
      turn: 3,
      energy: '3/3',
      handCards: [
        { name: 'Strike', cost: 1 },
        { name: 'Strike', cost: 1 },
        { name: 'Defend', cost: 1 },
        { name: 'Bash', cost: 2 },
      ],
      enemyName: '虱虫',
      enemyHp: '20/39',
      playerHp: '65/80',
      gold: 186,
    },
    rawText: '模拟识别：当前为战斗场景，角色铁甲战士，第3回合，能量3/3，手牌为2张打击、1张防御、1张痛击。敌人虱虫20/39血量。\n\n提示：AI未配置或配置无效，使用模拟数据。请在设置中配置API密钥。',
    model: 'kimi-mock',
    responseTimeMs: Date.now() - startTime,
  };

  res.json({ success: true, data: mockResult });
});

// 策略生成 — 优先使用真实Chat API，否则Mock
router.post('/strategy', async (req, res) => {
  const {
    question,
    gameVersion,
    character,
    turn,
    energy,
    handCards,
    enemyName,
    enemyHp,
    enemyIntent,
    confirmed,
    playerHp,
    gold,
    screenshot_id,
    confirmed_elements,
    archetype_id, // v0.2.0 新增：流派上下文
  } = req.body;

  const hasDetailedParams = question && gameVersion && character;
  const hasConfirmedParams = screenshot_id && confirmed_elements && confirmed;

  if (!hasDetailedParams && !hasConfirmedParams) {
    return res.status(400).json({ success: false, error: '缺少必要参数' });
  }

  if (!confirmed) {
    return res.status(400).json({
      success: false,
      error: '必须先完成人机确认流程（confirmed=true）',
    });
  }

  const effectiveQuestion = question || '当前对局策略建议';
  const effectiveGameVersion = gameVersion || 'sts1';
  const effectiveCharacter = character || (confirmed_elements?.character || 'ironclad');
  const effectiveTurn = turn || confirmed_elements?.turn || 1;
  const effectiveEnergy = energy || confirmed_elements?.energy || '?/?';
  const effectiveHandCards = handCards || confirmed_elements?.handCards || [{ name: 'Strike', cost: 1 }];
  const effectiveEnemyName = enemyName || confirmed_elements?.enemyName || '未知敌人';
  const effectiveEnemyHp = enemyHp || confirmed_elements?.enemyHp || '?/?';
  const effectivePlayerHp = playerHp || confirmed_elements?.hp || '?/?';
  const effectiveGold = gold || confirmed_elements?.gold || 0;

  // 数据增强：查询卡牌效果和敌人策略
  const enhancedCards = effectiveHandCards?.map((card: any) => {
    const stmt = db.prepare(
      'SELECT effect_base, effect_upgraded FROM cards WHERE game_version = ? AND (name_en = ? OR name_cn = ?) LIMIT 1'
    );
    const dbCard = stmt.get(effectiveGameVersion, card.name, card.name);
    return {
      ...card,
      effect: dbCard ? (dbCard as any).effect_base : '（数据库暂无此卡牌效果）',
    };
  }) || [];

  const enemyStmt = db.prepare(
    'SELECT strategy_general, strategy_by_character FROM enemies WHERE game_version = ? AND (name_en = ? OR name_cn = ?) LIMIT 1'
  );
  const enemyData = enemyStmt.get(effectiveGameVersion, effectiveEnemyName, effectiveEnemyName);

  // v0.2.0 新增：查询流派上下文
  let archetypeContext = null;
  if (archetype_id) {
    archetypeContext = getArchetypeContext(parseInt(archetype_id));
  }

  const config = getAiConfig();
  const startTime = Date.now();

  // 如果AI开启且有密钥，调用真实API
  if (config?.enabled && config?.api_key) {
    try {
      const baseUrl = getApiBaseUrl(config.provider, config.api_url);
      const model = config.model || 'kimi-latest';
      const systemPrompt = config.system_prompt || '你是一位杀戮尖塔游戏策略专家。';

      // 构建策略提示词
      const userPrompt = buildStrategyPrompt({
        character: effectiveCharacter,
        turn: effectiveTurn,
        energy: effectiveEnergy,
        handCards: enhancedCards,
        enemyName: effectiveEnemyName,
        enemyHp: effectiveEnemyHp,
        enemyIntent,
        playerHp: effectivePlayerHp,
        gold: effectiveGold,
        question: effectiveQuestion,
        enemyData,
        gameVersion: effectiveGameVersion,
        archetypeContext,
      });

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.api_key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: config.max_tokens || 4096,
          temperature: config.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误 ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      let answer = data.choices?.[0]?.message?.content || 'AI未返回有效回答';
      // v0.2.0 新增：追加免责声明
      answer += DISCLAIMER;

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = data.usage?.total_tokens || 0;

      // 记录QA历史
      const qaStmt = db.prepare(`
        INSERT INTO qa_history (device_id, question_type, question_text, ai_response, ai_model, tokens_used, response_time_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      qaStmt.run(
        req.body.device_id || req.headers['x-device-id'] || null,
        'combat_advice',
        effectiveQuestion,
        answer,
        data.model || model,
        tokensUsed,
        responseTimeMs
      );

      return res.json({
        success: true,
        data: {
          strategy_text: answer,
          answer,
          model: data.model || model,
          tokensUsed,
          responseTimeMs,
          source: 'real-api',
        },
      });
    } catch (err) {
      const classified = classifyError(err);
      console.warn(`[AI] Chat API调用失败 [${classified.type}]，降级到Mock:`, classified.message);

      // v0.2.0 新增：降级时返回带 _fallback=true 的 Mock 结果
      return res.json({
        success: true,
        data: buildMockStrategy({
          effectiveCharacter,
          effectiveTurn,
          effectiveEnergy,
          enhancedCards,
          effectiveEnemyName,
          effectiveEnemyHp,
          effectivePlayerHp,
          effectiveGold,
          effectiveQuestion,
          enemyData,
          archetypeContext,
        }),
        _fallback: true,
        _fallback_reason: classified.type,
        _fallback_message: classified.message,
      });
    }
  }

  // Mock回退（未配置AI时）
  const mockData = buildMockStrategy({
    effectiveCharacter,
    effectiveTurn,
    effectiveEnergy,
    enhancedCards,
    effectiveEnemyName,
    effectiveEnemyHp,
    effectivePlayerHp,
    effectiveGold,
    effectiveQuestion,
    enemyData,
    archetypeContext,
  });

  const responseTimeMs = Date.now() - startTime;

  const qaStmt = db.prepare(`
    INSERT INTO qa_history (device_id, question_type, question_text, ai_response, ai_model, tokens_used, response_time_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  qaStmt.run(
    req.body.device_id || req.headers['x-device-id'] || null,
    'combat_advice',
    effectiveQuestion,
    mockData.answer,
    'kimi-mock',
    0,
    responseTimeMs
  );

  res.json({
    success: true,
    data: mockData,
  });
});

/**
 * 构建Mock策略数据（用于降级或未配置AI时）
 * v0.2.0 新增：支持流派上下文注入
 */
function buildMockStrategy(params: any) {
  const {
    effectiveCharacter, effectiveTurn, effectiveEnergy,
    enhancedCards, effectiveEnemyName, effectiveEnemyHp,
    effectivePlayerHp, effectiveGold, effectiveQuestion,
    enemyData, archetypeContext,
  } = params;

  let answer = `【基于识别结果的策略建议】\n\n`;
  answer += `当前状态：${effectiveCharacter} 第${effectiveTurn}回合，能量${effectiveEnergy}\n`;
  answer += `手牌：${enhancedCards.map((c: any) => `${c.name}(费${c.cost})`).join('、')}\n`;
  answer += `敌人：${effectiveEnemyName || '未知'} ${effectiveEnemyHp || ''}\n\n`;

  // 如果存在流派上下文，注入流派攻略摘要
  if (archetypeContext) {
    answer += `【流派：${archetypeContext.name_cn}】\n`;
    if (archetypeContext.description) {
      answer += `${archetypeContext.description}\n`;
    }
    if (Array.isArray(archetypeContext.playstyle_tags) && archetypeContext.playstyle_tags.length > 0) {
      answer += `标签：${archetypeContext.playstyle_tags.join('、')}\n`;
    }
    if (archetypeContext.early_game) {
      answer += `早期策略：${archetypeContext.early_game.substring(0, 200)}${archetypeContext.early_game.length > 200 ? '...' : ''}\n`;
    }
    if (archetypeContext.key_nodes) {
      answer += `关键节点：${archetypeContext.key_nodes.substring(0, 200)}${archetypeContext.key_nodes.length > 200 ? '...' : ''}\n`;
    }
    answer += `\n`;
  }

  if (enhancedCards.length > 0) {
    answer += `【出牌建议】\n`;
    const attacks = enhancedCards.filter((c: any) => c.cost <= 1);
    const skills = enhancedCards.filter((c: any) => c.cost <= 1 && c.name.includes('Defend'));

    if (attacks.length > 0) {
      answer += `1. 优先使用低费攻击牌输出（${attacks.map((c: any) => c.name).join('、')}）\n`;
    }
    if (skills.length > 0) {
      answer += `2. 如敌人下回合高伤害，保留防御牌\n`;
    }
    answer += `3. 注意能量分配，尽量用完所有能量\n`;
  }

  if (enemyData) {
    const strat = (enemyData as any).strategy_by_character
      ? JSON.parse((enemyData as any).strategy_by_character)?.[effectiveCharacter] || (enemyData as any).strategy_general
      : (enemyData as any).strategy_general;
    if (strat) {
      answer += `\n【针对${effectiveEnemyName}的要点】\n${strat}\n`;
    }
  }

  answer += `\n【仅供参考，请结合实际判断】\n`;
  answer += `如果识别结果有误，请修正后再获取策略。\n\n`;

  if (!archetypeContext) {
    answer += `提示：当前使用模拟策略。在「系统设置」中配置AI API密钥后，可获得更精准的策略建议。`;
  } else {
    answer += `提示：当前使用模拟策略（已结合${archetypeContext.name_cn}流派攻略）。配置真实AI后策略会更精准。`;
  }

  answer += DISCLAIMER;

  return {
    strategy_text: answer,
    answer,
    model: 'kimi-mock',
    tokensUsed: 0,
    responseTimeMs: Date.now(),
    source: 'mock',
  };
}

// 辅助：构建策略提示词
function buildStrategyPrompt(params: any): string {
  const {
    character, turn, energy, handCards, enemyName, enemyHp,
    enemyIntent, playerHp, gold, question, enemyData, gameVersion,
    archetypeContext, // v0.2.0 新增
  } = params;

  let prompt = `我正在玩杀戮尖塔${gameVersion === 'sts2' ? '2' : ''}，需要策略建议。\n\n`;
  prompt += `【当前状态】\n`;
  prompt += `- 角色：${character}\n`;
  prompt += `- 第${turn}回合\n`;
  prompt += `- 能量：${energy}\n`;
  prompt += `- 玩家血量：${playerHp}\n`;
  prompt += `- 金币：${gold}\n\n`;

  // v0.2.0 新增：流派上下文注入
  if (archetypeContext) {
    prompt += `【流派攻略参考：${archetypeContext.name_cn}】\n`;
    if (archetypeContext.description) {
      prompt += `- 简介：${archetypeContext.description}\n`;
    }
    if (Array.isArray(archetypeContext.core_cards) && archetypeContext.core_cards.length > 0) {
      prompt += `- 核心卡牌：${archetypeContext.core_cards.join('、')}\n`;
    }
    if (Array.isArray(archetypeContext.playstyle_tags) && archetypeContext.playstyle_tags.length > 0) {
      prompt += `- 玩法标签：${archetypeContext.playstyle_tags.join('、')}\n`;
    }
    if (archetypeContext.early_game) {
      prompt += `- 早期策略：${archetypeContext.early_game}\n`;
    }
    if (archetypeContext.mid_game) {
      prompt += `- 中期策略：${archetypeContext.mid_game}\n`;
    }
    if (archetypeContext.late_game) {
      prompt += `- 后期策略：${archetypeContext.late_game}\n`;
    }
    if (archetypeContext.key_nodes) {
      prompt += `- 关键节点：${archetypeContext.key_nodes}\n`;
    }
    if (archetypeContext.advanced_tips) {
      prompt += `- 进阶技巧：${archetypeContext.advanced_tips}\n`;
    }
    if (archetypeContext.route_preferences && typeof archetypeContext.route_preferences === 'object') {
      prompt += `- 路线偏好：${JSON.stringify(archetypeContext.route_preferences)}\n`;
    }
    prompt += `\n请结合以上流派攻略，给出针对性的出牌建议。\n\n`;
  }

  prompt += `【手牌】\n`;
  handCards.forEach((card: any, i: number) => {
    prompt += `${i + 1}. ${card.name}（费用${card.cost}）${card.effect ? `- ${card.effect}` : ''}\n`;
  });
  prompt += `\n`;

  prompt += `【敌人】\n`;
  prompt += `- 名称：${enemyName}\n`;
  prompt += `- 血量：${enemyHp}\n`;
  if (enemyIntent) prompt += `- 意图：${enemyIntent}\n`;
  if (enemyData?.strategy_general) {
    prompt += `- 通用对策：${enemyData.strategy_general}\n`;
  }
  prompt += `\n`;

  prompt += `【问题】\n${question}\n\n`;
  prompt += `请给出具体的出牌顺序建议，并简要说明理由。`;

  return prompt;
}

export default router;
