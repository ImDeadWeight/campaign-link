/**
 * @file The built-in conditions for d20-era games (PF1e and 3.5e), written
 * to cover both. Bleed and Negative Levels carry a value.
 */
import type { ConditionDef } from '../types.js';

/**
 * d20 conditions, paraphrased. Disabled, dying and stable aren't listed:
 * the combat tracker handles them from HP.
 */
const defs: Omit<ConditionDef, 'id'>[] = [
  {
    name: 'Bleed',
    effect: 'Takes damage equal to the value at the start of each of its turns.',
    endsWhen: 'A DC 15 Heal check or any magical healing stops it.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Blinded',
    effect:
      "Can't see: −2 AC, loses its Dex bonus to AC, −4 on most Str- and Dex-based skill checks; everything has total concealment (50% miss) against it. Moves at half speed.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Confused',
    effect: 'Each turn, roll to see what it does: acts normally, babbles, hurts itself, or attacks the nearest creature.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Cowering',
    effect: "Frozen in fear and can't act: −2 AC and loses its Dex bonus to AC.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Dazed',
    effect: "Can't act, but has no penalty to AC.",
    endsWhen: 'Usually lasts 1 round.',
    repeatsSave: false,
  },
  {
    name: 'Dazzled',
    effect: '−1 on attack rolls and sight-based Perception (Spot/Search) checks.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Deafened',
    effect: "−4 initiative; 20% chance to fail spells with verbal components; can't succeed on hearing-based checks.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Entangled',
    effect: "−2 on attacks, −4 Dex; half speed and can't run or charge. Casting needs a concentration check.",
    endsWhen: 'Break free or escape as the effect allows.',
    repeatsSave: false,
  },
  {
    name: 'Exhausted',
    effect: "Half speed, −6 Str and Dex; can't run or charge.",
    endsWhen: 'An hour of complete rest makes it fatigued instead.',
    repeatsSave: false,
  },
  {
    name: 'Fascinated',
    effect: 'Stands or sits quietly paying attention to the effect; −4 on reactive checks such as Perception.',
    endsWhen: 'Any obvious threat (e.g. an attack) ends it.',
    repeatsSave: false,
  },
  {
    name: 'Fatigued',
    effect: "−2 Str and Dex; can't run or charge.",
    endsWhen: '8 hours of complete rest.',
    repeatsSave: false,
  },
  {
    name: 'Flat-Footed',
    effect: "Loses its Dex bonus to AC and can't make attacks of opportunity.",
    endsWhen: 'Ends when it acts for the first time in combat.',
    repeatsSave: false,
  },
  {
    name: 'Frightened',
    effect: '−2 on attack rolls, saves, skill and ability checks; flees from the source as best it can.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Grappled',
    effect:
      "Can't move or use two-handed actions; −4 Dex and −2 on attacks and combat maneuvers except to grapple or escape. Casting needs a concentration check.",
    endsWhen: 'Escape with a grapple check / combat maneuver or Escape Artist.',
    repeatsSave: false,
  },
  {
    name: 'Helpless',
    effect: 'Treated as Dex 0 (−5); melee attacks against it get +4. Can be killed with a coup de grace.',
    endsWhen: 'Lasts while the cause (paralysis, sleep, binding) lasts.',
    repeatsSave: false,
  },
  {
    name: 'Invisible',
    effect: "Can't be seen: +2 on attacks against sighted foes, who lose their Dex bonus to AC; attacks against it have a 50% miss chance.",
    endsWhen: 'Lasts until the effect ends (Invisibility ends when it attacks).',
    repeatsSave: false,
  },
  {
    name: 'Nauseated',
    effect: "Can only take a single move action each turn; can't attack, cast spells or concentrate.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Negative Levels',
    effect: '−1 per level on attacks, saves, skill and ability checks and caster level, and −5 max HP per level. Dies when levels equal its Hit Dice.',
    endsWhen: 'Temporary levels fade after 24 hours unless a save fails; Restoration removes them.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Panicked',
    effect: 'Drops what it holds and flees at top speed; −2 on saves, skill and ability checks. Cowers if cornered.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Paralyzed',
    effect: 'Str and Dex 0, helpless; can take only purely mental actions.',
    endsWhen: 'Lasts until the effect ends; many effects allow a new save each round.',
    repeatsSave: true,
  },
  {
    name: 'Petrified',
    effect: 'Turned to stone; counts as unconscious.',
    endsWhen: 'Usually needs magic such as stone to flesh.',
    repeatsSave: false,
  },
  {
    name: 'Pinned',
    effect: 'Held tightly: flat-footed and −4 AC; can only try to escape.',
    endsWhen: 'Escape with a grapple check / combat maneuver or Escape Artist.',
    repeatsSave: false,
  },
  {
    name: 'Prone',
    effect: "−4 on melee attacks; can't use most ranged weapons (crossbows are fine). +4 AC against ranged attacks, −4 AC against melee.",
    endsWhen: 'Standing up is a move action that provokes attacks of opportunity.',
    repeatsSave: false,
  },
  {
    name: 'Shaken',
    effect: '−2 on attack rolls, saves, skill and ability checks.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Sickened',
    effect: '−2 on attack rolls, weapon damage, saves, skill and ability checks.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Staggered',
    effect: 'Can take only a single move or standard action each round (plus free, swift and immediate actions).',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Stunned',
    effect: "Drops what it holds and can't act; −2 AC and loses its Dex bonus to AC.",
    endsWhen: 'Lasts until the effect ends (often 1 round).',
    repeatsSave: false,
  },
  {
    name: 'Unconscious',
    effect: 'Knocked out and helpless.',
    endsWhen: 'Ends when it is healed above 0 HP or the effect ends.',
    repeatsSave: false,
  },
];

/** The d20 conditions with stable ids under a format's prefix ("pf1e:flat-footed", "dnd35:flat-footed"). */
export function d20Conditions(prefix: string): ConditionDef[] {
  return defs.map((d) => ({ id: `${prefix}:${d.name.toLowerCase().replace(/\s+/g, '-')}`, ...d }));
}
