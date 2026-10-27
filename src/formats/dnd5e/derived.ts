/**
 * @file Derived 5e numbers: proficiency bonus, saving throws, skills,
 * initiative and passive Perception. Computed from the stat block's scores
 * and proficiencies so modifiers never have to be entered by hand.
 */
import type { CharacterKind } from '../types.js';
import { abilityModifier, type Ability } from './abilities.js';
import { proficiencyForCr, proficiencyForLevel } from './proficiency.js';
import { SKILL_KEYS, SKILLS, type Skill } from './skills.js';
import type { Dnd5eStatBlock } from './statBlock.js';

/** Proficiency bonus: from level for PCs, from challenge rating for NPCs. */
export function proficiencyBonus(sb: Dnd5eStatBlock, kind: CharacterKind): number {
  return kind === 'pc' ? proficiencyForLevel(sb.level) : proficiencyForCr(sb.challengeRating);
}

/** Saving throw bonus for one ability: its modifier, plus proficiency if proficient. */
export function savingThrowBonus(sb: Dnd5eStatBlock, kind: CharacterKind, ability: Ability): number {
  const mod = abilityModifier(sb.abilities[ability]);
  return sb.savingThrows[ability] ? mod + proficiencyBonus(sb, kind) : mod;
}

/** Skill bonus: the skill's ability modifier, plus proficiency (or double it for expertise). */
export function skillBonus(sb: Dnd5eStatBlock, kind: CharacterKind, skill: Skill): number {
  const mod = abilityModifier(sb.abilities[SKILLS[skill].ability]);
  const pb = proficiencyBonus(sb, kind);
  switch (sb.skills[skill] ?? 'none') {
    case 'proficient':
      return mod + pb;
    case 'expertise':
      return mod + 2 * pb;
    default:
      return mod;
  }
}

/** Skills the creature is proficient in, with their final bonus. */
export function proficientSkills(sb: Dnd5eStatBlock, kind: CharacterKind): { skill: Skill; bonus: number }[] {
  return SKILL_KEYS.filter((s) => (sb.skills[s] ?? 'none') !== 'none').map((skill) => ({
    skill,
    bonus: skillBonus(sb, kind, skill),
  }));
}

/** Initiative bonus: DEX modifier plus any extra bonus (e.g. the Alert feat). */
export function initiativeModifier(sb: Dnd5eStatBlock): number {
  return abilityModifier(sb.abilities.dex) + sb.initiativeBonus;
}

/** Passive Perception: 10 + Perception skill bonus. */
export function passivePerception(sb: Dnd5eStatBlock, kind: CharacterKind): number {
  return 10 + skillBonus(sb, kind, 'perception');
}
