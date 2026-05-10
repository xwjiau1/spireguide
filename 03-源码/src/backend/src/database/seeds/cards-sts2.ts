/**
 * StS2 (Early Access) 卡牌数据
 * 部分收录：Ironclad/Silent/Defect已有卡牌 + Necrobinder/Regent已知卡牌
 * 数据不完整是预期内，随版本更新补充
 */

export const sts2Cards = [
  // StS2 Ironclad - Early Access已知
  { game_version: 'sts2', character: 'ironclad', name_cn: '打击', name_en: 'Strike', cost: 1, type: 'attack', rarity: 'basic', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '防御', name_en: 'Defend', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得5点格挡。', effect_upgraded: '获得8点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '痛击', name_en: 'Bash', cost: 2, type: 'attack', rarity: 'basic', effect_base: '造成8点伤害。给予2层易伤。', effect_upgraded: '造成10点伤害。给予3层易伤。', keywords: '["vulnerable"]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '顺劈斩', name_en: 'Cleave', cost: 1, type: 'attack', rarity: 'common', effect_base: '对所有敌人造成8点伤害。', effect_upgraded: '对所有敌人造成11点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '血祭', name_en: 'Offering', cost: 0, type: 'skill', rarity: 'rare', effect_base: '失去6点生命。获得2点能量。抽3张牌。消耗。', effect_upgraded: '失去6点生命。获得2点能量。抽5张牌。消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '恶魔形态', name_en: 'Demon Form', cost: 3, type: 'power', rarity: 'rare', effect_base: '在你的回合开始时，获得2点力量。', effect_upgraded: '在你的回合开始时，获得3点力量。', keywords: '[]' },
  { game_version: 'sts2', character: 'ironclad', name_cn: '旋风斩', name_en: 'Whirlwind', cost: -1, type: 'attack', rarity: 'uncommon', effect_base: '对所有敌人造成5点伤害X次。', effect_upgraded: '对所有敌人造成8点伤害X次。', keywords: '[]' },
  // StS2 Silent - Early Access已知
  { game_version: 'sts2', character: 'silent', name_cn: '打击', name_en: 'Strike', cost: 1, type: 'attack', rarity: 'basic', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'silent', name_cn: '防御', name_en: 'Defend', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得5点格挡。', effect_upgraded: '获得8点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'silent', name_cn: '幸存', name_en: 'Survivor', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得8点格挡。丢弃1张手牌。', effect_upgraded: '获得11点格挡。丢弃1张手牌。', keywords: '[]' },
  { game_version: 'sts2', character: 'silent', name_cn: '中和', name_en: 'Neutralize', cost: 0, type: 'attack', rarity: 'basic', effect_base: '造成3点伤害。给予1层虚弱。', effect_upgraded: '造成4点伤害。给予2层虚弱。', keywords: '["weak"]' },
  { game_version: 'sts2', character: 'silent', name_cn: '涂毒', name_en: 'Poisoned Stab', cost: 1, type: 'attack', rarity: 'common', effect_base: '造成6点伤害。给予3层中毒。', effect_upgraded: '造成8点伤害。给予4层中毒。', keywords: '["poison"]' },
  { game_version: 'sts2', character: 'silent', name_cn: '千刃', name_en: 'Thousand Cuts', cost: 2, type: 'power', rarity: 'rare', effect_base: '每当你打出一张牌时，对所有敌人造成1点伤害。', effect_upgraded: '每当你打出一张牌时，对所有敌人造成2点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'silent', name_cn: '催化剂', name_en: 'Catalyst', cost: 1, type: 'skill', rarity: 'uncommon', effect_base: '将敌人的中毒层数翻倍。消耗。', effect_upgraded: '将敌人的中毒层数变为3倍。消耗。', keywords: '["exhaust","poison"]' },
  // StS2 Defect - Early Access已知
  { game_version: 'sts2', character: 'defect', name_cn: '打击', name_en: 'Strike', cost: 1, type: 'attack', rarity: 'basic', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'defect', name_cn: '防御', name_en: 'Defend', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得5点格挡。', effect_upgraded: '获得8点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'defect', name_cn: '双发', name_en: 'Dualcast', cost: 0, type: 'skill', rarity: 'basic', effect_base: '激发你下一个充能球的效果2次。消耗。', effect_upgraded: '激发你下一个充能球的效果2次。消耗。', keywords: '["exhaust","evoke"]' },
  { game_version: 'sts2', character: 'defect', name_cn: '球状闪电', name_en: 'Ball Lightning', cost: 1, type: 'attack', rarity: 'common', effect_base: '造成7点伤害。生成1个闪电充能球。', effect_upgraded: '造成10点伤害。生成1个闪电充能球。', keywords: '["orb"]' },
  { game_version: 'sts2', character: 'defect', name_cn: '碎片整理', name_en: 'Defragment', cost: 1, type: 'power', rarity: 'uncommon', effect_base: '获得1点集中力。', effect_upgraded: '获得2点集中力。', keywords: '[]' },
  // StS2 Necrobinder - Early Access新角色（部分已知卡牌）
  { game_version: 'sts2', character: 'necrobinder', name_cn: '打击', name_en: 'Strike', cost: 1, type: 'attack', rarity: 'basic', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '防御', name_en: 'Defend', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得5点格挡。', effect_upgraded: '获得8点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '缚魂', name_en: 'Bind Spirit', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得4点格挡。生成1个灵魂充能球。', effect_upgraded: '获得6点格挡。生成1个灵魂充能球。', keywords: '["orb"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '魂爆', name_en: 'Soul Burst', cost: 0, type: 'attack', rarity: 'common', effect_base: '造成4点伤害。激发你最右侧的充能球。', effect_upgraded: '造成6点伤害。激发你最右侧的充能球。', keywords: '["evoke"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '通灵', name_en: 'Spirit Channel', cost: 1, type: 'skill', rarity: 'common', effect_base: '生成1个灵魂充能球。抽1张牌。', effect_upgraded: '生成1个灵魂充能球。抽2张牌。', keywords: '["orb"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '亡者之握', name_en: 'Dead Grasp', cost: 2, type: 'attack', rarity: 'uncommon', effect_base: '造成14点伤害。如果你激发了充能球，再造成7点伤害。', effect_upgraded: '造成18点伤害。如果你激发了充能球，再造成9点伤害。', keywords: '["evoke"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '灵魂虹吸', name_en: 'Soul Siphon', cost: 1, type: 'skill', rarity: 'uncommon', effect_base: '激发你最右侧的充能球。恢复等同其伤害的生命值。', effect_upgraded: '激发你最右侧的充能球。恢复等同其伤害+5的生命值。', keywords: '["evoke"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '灵魂绽放', name_en: 'Soul Bloom', cost: 2, type: 'power', rarity: 'rare', effect_base: '在你的回合开始时，生成2个灵魂充能球。', effect_upgraded: '在你的回合开始时，生成2个灵魂充能球。获得1点集中力。', keywords: '["orb"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '亡者复生', name_en: 'Raise Dead', cost: 1, type: 'skill', rarity: 'uncommon', effect_base: '将消耗牌堆中的1张攻击牌加入手牌。消耗。', effect_upgraded: '将消耗牌堆中的1张攻击牌加入手牌。它本回合费用为0。消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts2', character: 'necrobinder', name_cn: '灵魂燃烧', name_en: 'Soul Burn', cost: 1, type: 'attack', rarity: 'common', effect_base: '造成8点伤害。消耗1张手牌。如果消耗的是技能牌，获得1点能量。', effect_upgraded: '造成11点伤害。消耗1张手牌。如果消耗的是技能牌，获得1点能量。', keywords: '["exhaust"]' },
  // StS2 Regent - Early Access新角色（部分已知卡牌）
  { game_version: 'sts2', character: 'regent', name_cn: '打击', name_en: 'Strike', cost: 1, type: 'attack', rarity: 'basic', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '防御', name_en: 'Defend', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得5点格挡。', effect_upgraded: '获得8点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '王权', name_en: 'Kingly Decree', cost: 1, type: 'skill', rarity: 'basic', effect_base: '获得3点格挡。下一张打出的攻击牌伤害+2。', effect_upgraded: '获得5点格挡。下一张打出的攻击牌伤害+3。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '加冕', name_en: 'Coronation', cost: 0, type: 'skill', rarity: 'common', effect_base: '获得1点力量。如果手牌有5张以上，再获得1点力量。', effect_upgraded: '获得2点力量。如果手牌有5张以上，再获得1点力量。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '御令', name_en: 'Royal Command', cost: 2, type: 'attack', rarity: 'common', effect_base: '造成12点伤害。抽1张牌。', effect_upgraded: '造成16点伤害。抽1张牌。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '绝对统治', name_en: 'Absolute Rule', cost: 2, type: 'power', rarity: 'rare', effect_base: '在你的回合开始时，获得1点力量和1点格挡。', effect_upgraded: '在你的回合开始时，获得2点力量和2点格挡。', keywords: '[]' },
  { game_version: 'sts2', character: 'regent', name_cn: '君临', name_en: 'Ascendancy', cost: 1, type: 'attack', rarity: 'uncommon', effect_base: '造成7点伤害。你每有1点力量，伤害+2。', effect_upgraded: '造成9点伤害。你每有1点力量，伤害+3。', keywords: '[]' },
];
