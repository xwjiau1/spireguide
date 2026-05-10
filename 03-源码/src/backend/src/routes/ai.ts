import { Router } from 'express';
import db from '../database/db';

/**
 * AI问答API路由
 * 核心功能：截图识别 + 策略生成
 * 注意：实际Kimi API调用需要配置API密钥
 */

const router = Router();

// 模拟截图识别（实际部署时替换为Kimi Vision API调用）
router.post('/recognize', (req, res) => {
  const { image, image_url } = req.body;

  if (!image && !image_url) {
    return res.status(400).json({ success: false, error: '缺少图片数据' });
  }

  // MVP阶段：模拟识别结果
  // 实际部署时，此处应调用Kimi Vision API
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
    rawText: '模拟识别：当前为战斗场景，角色铁甲战士，第3回合，能量3/3，手牌为2张打击、1张防御、1张痛击。敌人虱虫20/39血量。',
  };

  res.json({ success: true, data: mockResult });
});

// 策略生成（实际部署时替换为Kimi Chat API调用）
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
    // 人机确认流程替代参数
    screenshot_id,
    confirmed_elements,
  } = req.body;

  // 支持两种调用方式：详细参数 或 人机确认简化参数
  const hasDetailedParams = question && gameVersion && character;
  const hasConfirmedParams = screenshot_id && confirmed_elements && confirmed;

  if (!hasDetailedParams && !hasConfirmedParams) {
    return res.status(400).json({ success: false, error: '缺少必要参数（需提供 question+gameVersion+character 或 screenshot_id+confirmed_elements+confirmed）' });
  }

  if (!confirmed) {
    return res.status(400).json({
      success: false,
      error: '必须先完成人机确认流程（confirmed=true）',
    });
  }

  // 使用测试默认值填充缺失字段
  const effectiveQuestion = question || '当前对局策略建议';
  const effectiveGameVersion = gameVersion || 'sts1';
  const effectiveCharacter = character || (confirmed_elements?.character || 'ironclad');
  const effectiveTurn = turn || confirmed_elements?.turn || 1;
  const effectiveEnergy = energy || confirmed_elements?.energy || '3/3';
  const effectiveHandCards = handCards || confirmed_elements?.handCards || [{ name: 'Strike', cost: 1 }];
  const effectiveEnemyName = enemyName || confirmed_elements?.enemyName || '未知敌人';
  const effectiveEnemyHp = enemyHp || confirmed_elements?.enemyHp || '?';
  const effectivePlayerHp = playerHp || confirmed_elements?.hp || '?';
  const effectiveGold = gold || confirmed_elements?.gold || 0;

  // 从数据库查询手牌完整效果（数据增强）
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

  // 从数据库查询敌人信息
  const enemyStmt = db.prepare(
    'SELECT strategy_general, strategy_by_character FROM enemies WHERE game_version = ? AND (name_en = ? OR name_cn = ?) LIMIT 1'
  );
  const enemyData = enemyStmt.get(effectiveGameVersion, effectiveEnemyName, effectiveEnemyName);

  // MVP阶段：模拟策略生成
  // 实际部署时，此处应构建Prompt并调用Kimi Chat API
  const startTime = Date.now();

  let answer = `【基于识别结果的策略建议】\n\n`;
  answer += `当前状态：${effectiveCharacter} 第${effectiveTurn}回合，能量${effectiveEnergy}\n`;
  answer += `手牌：${enhancedCards.map((c: any) => `${c.name}(费${c.cost})`).join('、')}\n`;
  answer += `敌人：${effectiveEnemyName || '未知'} ${effectiveEnemyHp || ''}\n\n`;

  if (enhancedCards.length > 0) {
    answer += `【出牌建议】\n`;
    // 简单启发式策略
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
  answer += `如果识别结果有误，请修正后再获取策略。`;

  const responseTimeMs = Date.now() - startTime;

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
    'kimi-mock',
    0,
    responseTimeMs
  );

  res.json({
    success: true,
    data: {
      strategy_text: answer,
      answer,
      model: 'kimi-mock',
      tokensUsed: 0,
      responseTimeMs,
    },
  });
});

export default router;
