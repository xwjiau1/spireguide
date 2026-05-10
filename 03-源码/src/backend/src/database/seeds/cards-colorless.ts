/**
 * StS1 无色牌和诅咒牌
 */

export const colorlessCards = [
  // 无色攻击
  { game_version: 'sts1', character: 'colorless', name_cn: '匕首投掷', name_en: 'Dagger Throw', cost: 1, type: 'attack', rarity: 'common', effect_base: '造成9点伤害。抽1张牌。丢弃1张手牌。', effect_upgraded: '造成12点伤害。抽1张牌。丢弃1张手牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '疯狂', name_en: 'Madness', cost: 1, type: 'skill', rarity: 'uncommon', effect_base: '选择一张手牌。本回合它的费用变为0。消耗。', effect_upgraded: '选择一张手牌。本回合它的费用变为0。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '恐慌', name_en: 'Panic', cost: 0, type: 'skill', rarity: 'common', effect_base: '获得8点格挡。弃牌堆中每有一张牌，额外获得1点格挡。', effect_upgraded: '获得8点格挡。弃牌堆中每有一张牌，额外获得2点格挡。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '致残毒云', name_en: 'Crippling Poison', cost: 2, type: 'skill', rarity: 'uncommon', effect_base: '给予所有敌人4层中毒和2层虚弱。消耗。', effect_upgraded: '给予所有敌人6层中毒和2层虚弱。消耗。', keywords: '["exhaust","poison","weak"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '幽灵形态', name_en: 'Ghostly', cost: 1, type: 'skill', rarity: 'rare', effect_base: '获得1层幽灵形态。', effect_upgraded: '获得2层幽灵形态。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '急速斩', name_en: 'Quick Slash', cost: 1, type: 'attack', rarity: 'common', effect_base: '造成8点伤害。抽1张牌。', effect_upgraded: '造成12点伤害。抽1张牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: '科学方法', name_en: 'Swift Strike', cost: 0, type: 'attack', rarity: 'common', effect_base: '造成6点伤害。', effect_upgraded: '造成9点伤害。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' Bandage Up', name_en: 'Bandage Up', cost: 0, type: 'skill', rarity: 'common', effect_base: '恢复4点生命。消耗。', effect_upgraded: '恢复6点生命。消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' blind', name_en: 'Blind', cost: 0, type: 'skill', rarity: 'common', effect_base: '给予所有敌人2层虚弱。', effect_upgraded: '给予所有敌人2层虚弱。不可被阻止。', keywords: '["weak"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' dark shackles', name_en: 'Dark Shackles', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '敌人失去9点力量。下回合开始时恢复。', effect_upgraded: '敌人失去11点力量。下回合开始时恢复。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' deep breath', name_en: 'Deep Breath', cost: 0, type: 'skill', rarity: 'common', effect_base: '将弃牌堆中的牌洗回抽牌堆。抽1张牌。', effect_upgraded: '将弃牌堆中的牌洗回抽牌堆。抽2张牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' discovery', name_en: 'Discovery', cost: 1, type: 'skill', rarity: 'rare', effect_base: '选择一张无色牌加入你的手牌。消耗。', effect_upgraded: '选择一张无色牌加入你的手牌。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' dramatic entrance', name_en: 'Dramatic Entrance', cost: 0, type: 'attack', rarity: 'uncommon', effect_base: '不可打出。 innate。对所有敌人造成8点伤害。消耗。', effect_upgraded: '不可打出。 innate。对所有敌人造成12点伤害。消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' en-lightenment', name_en: 'Enlightenment', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '本回合你手牌中所有费用≥2的牌费用变为1。', effect_upgraded: '本回合你手牌中所有费用≥2的牌费用变为1。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' finesse', name_en: 'Finesse', cost: 0, type: 'skill', rarity: 'common', effect_base: '获得2点格挡。抽1张牌。', effect_upgraded: '获得4点格挡。抽1张牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' flash of steel', name_en: 'Flash of Steel', cost: 0, type: 'attack', rarity: 'uncommon', effect_base: '造成3点伤害。抽1张牌。', effect_upgraded: '造成6点伤害。抽1张牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' forethought', name_en: 'Forethought', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '选择至多2张手牌。将它们放到抽牌堆底部。', effect_upgraded: '选择至多2张手牌。将它们放到抽牌堆底部。抽取的牌费用为0。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' good instincts', name_en: 'Good Instincts', cost: 0, type: 'skill', rarity: 'common', effect_base: '获得6点格挡。', effect_upgraded: '获得9点格挡。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' impatience', name_en: 'Impatience', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '如果你没有攻击牌，抽2张牌。', effect_upgraded: '如果你没有攻击牌，抽3张牌。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' jack of all trades', name_en: 'Jack of All Trades', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '增加2张随机无色牌到你的手牌。消耗。', effect_upgraded: '增加2张随机无色牌到你的手牌。它们本回合费用为0。消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' madness', name_en: 'Madness', cost: 1, type: 'skill', rarity: 'uncommon', effect_base: '选择一张手牌。本回合它的费用变为0。消耗。', effect_upgraded: '选择一张手牌。本回合它的费用变为0。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' mind blast', name_en: 'Mind Blast', cost: 2, type: 'attack', rarity: 'uncommon', effect_base: '你牌库中每有一张牌，造成1点伤害。innate。', effect_upgraded: '你牌库中每有一张牌，造成2点伤害。innate。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' panache', name_en: 'Panache', cost: 0, type: 'power', rarity: 'rare', effect_base: '每当你本回合打出5张牌，对所有敌人造成10点伤害。', effect_upgraded: '每当你本回合打出5张牌，对所有敌人造成14点伤害。', keywords: '[]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' purity', name_en: 'Purity', cost: 0, type: 'skill', rarity: 'uncommon', effect_base: '选择至多3张手牌。将它们消耗。', effect_upgraded: '选择至多5张手牌。将它们消耗。', keywords: '["exhaust"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' trip', name_en: 'Trip', cost: 0, type: 'skill', rarity: 'common', effect_base: '给予所有敌人2层易伤。', effect_upgraded: '给予所有敌人2层易伤。不可被阻止。', keywords: '["vulnerable"]' },
  { game_version: 'sts1', character: 'colorless', name_cn: ' violence', name_en: 'Violence', cost: 0, type: 'skill', rarity: 'rare', effect_base: '增加3张随机攻击牌到你的手牌。消耗。', effect_upgraded: '增加3张随机攻击牌到你的手牌。它们本回合费用为0。消耗。', keywords: '["exhaust"]' },
  // 诅咒
  { game_version: 'sts1', character: 'curse', name_cn: '伤口', name_en: 'Wound', cost: 0, type: 'status', rarity: 'special', effect_base: '不可打出。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '虚空', name_en: 'Void', cost: 0, type: 'status', rarity: 'special', effect_base: '不可打出。抽到这张牌时失去1点能量。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '灼伤', name_en: 'Burn', cost: 0, type: 'status', rarity: 'special', effect_base: '不可打出。在你的回合结束时受到2点伤害。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '腐朽', name_en: 'Decay', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。在你的回合结束时，失去2点生命。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '疑虑', name_en: 'Doubt', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。抽到这张牌时获得2层虚弱。', effect_upgraded: null, keywords: '["weak"]' },
  { game_version: 'sts1', character: 'curse', name_cn: '笨拙', name_en: 'Clumsy', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。抽到这张牌时获得1层脆弱。', effect_upgraded: null, keywords: '["vulnerable"]' },
  { game_version: 'sts1', character: 'curse', name_cn: '痛苦', name_en: 'Pain', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。在你的回合开始时，失去1点生命。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '寄生', name_en: 'Parasite', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。从你牌库中移除时失去3点最大生命。', effect_upgraded: null, keywords: '[]' },
  { game_version: 'sts1', character: 'curse', name_cn: '羞愧', name_en: 'Shame', cost: 0, type: 'curse', rarity: 'special', effect_base: '不可打出。抽到这张牌时获得1层脆弱。', effect_upgraded: null, keywords: '["vulnerable"]' },
];
