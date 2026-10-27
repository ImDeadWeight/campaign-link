/**
 * @file The built-in PF2e (Remaster) conditions with rules text, which ones
 * carry a value, which drop each turn, and which need a roll each turn.
 * SF2e uses the same conditions under its own ids.
 */
import type { ConditionDef } from '../types.js';

/**
 * PF2e conditions (paraphrased from Player Core). Dying isn't listed: the
 * combat tracker handles it at 0 HP, using Wounded and Doomed from here.
 * Attitudes and item conditions are left out as they rarely matter in a fight.
 */
const defs: Omit<ConditionDef, 'id'>[] = [
  {
    name: 'Blinded',
    effect:
      "Can't see: everything counts as undetected to it, terrain is difficult, and it fails checks that need sight. −4 status penalty to Perception; immune to visual effects. Overrides dazzled.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Clumsy',
    effect: 'Status penalty equal to the value on Dexterity-based rolls and DCs: AC, Reflex saves, ranged attacks, Acrobatics, Stealth, Thievery.',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Concealed',
    effect: 'Hard to see (fog, dim light). Anyone targeting it must succeed at a DC 5 flat check or the attack or effect is wasted.',
    endsWhen: 'Ends when what conceals it is gone.',
    repeatsSave: false,
  },
  {
    name: 'Confused',
    effect:
      "Off-guard; treats no one as an ally; can't Delay, Ready or use reactions. Spends its actions Striking or using offensive cantrips on random targets.",
    endsWhen: 'Each time it takes damage from an attack or spell, a DC 11 flat check ends it.',
    repeatsSave: false,
  },
  {
    name: 'Controlled',
    effect: 'Someone else decides what actions it takes.',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Dazzled',
    effect: 'Everything counts as concealed to it (DC 5 flat check to target anything that relies on sight).',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Deafened',
    effect:
      "Can't hear; critically fails checks that need hearing. −2 status penalty to Perception for initiative and to checks involving sound. Auditory actions need a DC 5 flat check. Immune to auditory effects.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Doomed',
    effect: 'Dies at a lower Dying value: Dying 4 minus the doomed value.',
    endsWhen: 'Drops by 1 after each full night of rest.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Drained',
    effect:
      'Status penalty equal to the value on Constitution-based rolls and DCs (Fortitude saves). Loses HP equal to level × value, and max HP drops by the same amount.',
    endsWhen: 'Drops by 1 after each full night of rest (max HP returns with it).',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Encumbered',
    effect: 'Clumsy 1 and −10 feet to all Speeds (minimum 5 feet).',
    endsWhen: 'Ends when it carries less.',
    repeatsSave: false,
  },
  {
    name: 'Enfeebled',
    effect: 'Status penalty equal to the value on Strength-based rolls and DCs: melee attacks, melee damage, Athletics.',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Fascinated',
    effect: "−2 status penalty to Perception and skill checks; can't use concentrate actions unless they relate to the subject.",
    endsWhen: 'Ends if anyone takes a hostile action against it or its allies.',
    repeatsSave: false,
  },
  {
    name: 'Fatigued',
    effect: '−1 status penalty to AC and saving throws; can’t take exploration activities while traveling.',
    endsWhen: 'Ends after a full night of rest.',
    repeatsSave: false,
  },
  {
    name: 'Fleeing',
    effect: "Must spend its actions trying to get away from the source as fast as it can; can't Delay or Ready.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Frightened',
    effect: 'Status penalty equal to the value on all checks and DCs.',
    endsWhen: 'Drops by 1 at the end of each of its turns.',
    repeatsSave: false,
    valued: true,
    dropsEachTurn: true,
  },
  {
    name: 'Grabbed',
    effect: 'Off-guard and immobilized. Manipulate actions need a DC 5 flat check or are wasted.',
    endsWhen: 'Escape (Athletics, Acrobatics or unarmed attack vs. the grabber’s DC), or the grabber lets go or moves away.',
    repeatsSave: false,
  },
  {
    name: 'Hidden',
    effect: 'Its location is known but it can’t be seen: off-guard to it, and targeting it needs a DC 11 flat check.',
    endsWhen: 'Ends when it is seen, e.g. after a successful Seek or when it attacks.',
    repeatsSave: false,
  },
  {
    name: 'Immobilized',
    effect: "Can't use any action with the move trait.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Invisible',
    effect: "Can't be seen: undetected to everyone (hidden to those who Seek it successfully).",
    endsWhen: 'Lasts until the effect ends (Invisibility ends when it uses a hostile action).',
    repeatsSave: false,
  },
  {
    name: 'Off-Guard',
    effect: '−2 circumstance penalty to AC.',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Paralyzed',
    effect: "Off-guard; can't act except to Recall Knowledge and purely mental actions. Its senses still work.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Persistent Damage',
    effect: 'Takes the damage at the end of each of its turns (note the amount and type, e.g. 1d6 bleed).',
    endsWhen: 'After taking the damage, a DC 15 flat check ends it (DC 10 with appropriate help).',
    repeatsSave: true,
  },
  {
    name: 'Petrified',
    effect: "Turned to stone: can't act or sense anything; it's an object.",
    endsWhen: 'Usually needs magic to reverse.',
    repeatsSave: false,
  },
  {
    name: 'Prone',
    effect: 'Off-guard; −2 circumstance penalty to attack rolls. Its only move actions are Crawl and Stand.',
    endsWhen: 'Stand (1 action).',
    repeatsSave: false,
  },
  {
    name: 'Quickened',
    effect: 'Gains 1 extra action at the start of each turn, usable only as the effect says.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Restrained',
    effect: "Off-guard and immobilized; can't use attack or manipulate actions except to Escape or Force Open. Overrides grabbed.",
    endsWhen: 'Escape against the restraint’s DC, or the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Sickened',
    effect: "Status penalty equal to the value on all checks and DCs; can't willingly eat or drink.",
    endsWhen: 'Spend an action retching for a Fortitude save: success lowers it by 1 (critical success by 2).',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Slowed',
    effect: 'Loses actions equal to the value at the start of each turn.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Stunned',
    effect:
      "Can't act. At the start of its turn it loses actions equal to the value, and the value drops by the actions lost. Overrides slowed.",
    endsWhen: 'Ends when the value reaches 0 (or after the stated duration).',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Stupefied',
    effect:
      'Status penalty equal to the value on Intelligence-, Wisdom- and Charisma-based rolls and DCs (Will saves, spell attacks, spell DCs). Casting a spell needs a DC 5 + value flat check or the spell is lost.',
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Unconscious',
    effect:
      "Can't act; blinded, off-guard, −4 status penalty to AC, Perception and Reflex saves. Falls prone and drops what it holds.",
    endsWhen: 'At 0 HP it wakes when healed; otherwise when it takes damage, is woken, or the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Undetected',
    effect: 'Its location is unknown: attackers must pick a square and succeed at a DC 11 flat check; off-guard to it.',
    endsWhen: 'Ends when it is found, e.g. after a successful Seek.',
    repeatsSave: false,
  },
  {
    name: 'Wounded',
    effect: 'When it gains the Dying condition, Dying increases by the value. Leaving Dying raises Wounded by 1.',
    endsWhen: 'Ends when someone restores HP with Treat Wounds, or it is at full HP and rests for 10 minutes.',
    repeatsSave: false,
    valued: true,
  },
];

/** Stable id for a condition name: "Off-Guard" → "pf2e:off-guard", "Persistent Damage" → "pf2e:persistent-damage". */
export function pf2eConditionId(name: string, prefix = 'pf2e'): string {
  return `${prefix}:${name.toLowerCase().replace(/\s+/g, '-')}`;
}

/** The PF2e-engine conditions with stable ids under a format's prefix, so saved data keeps matching them. */
export function pf2eEngineConditions(prefix: string): ConditionDef[] {
  return defs.map((d) => ({ id: pf2eConditionId(d.name, prefix), ...d }));
}

/** The PF2e conditions. */
export const PF2E_CONDITIONS = pf2eEngineConditions('pf2e');
