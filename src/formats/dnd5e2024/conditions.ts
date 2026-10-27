/**
 * @file The 15 built-in 2024 5e conditions with rules text (what each does,
 * how it ends) and whether it defaults to needing a save each turn.
 */
import type { ConditionDef } from '../types.js';

/**
 * 2024 5e conditions (paraphrased from the SRD 5.2). Exhaustion carries its
 * level as the condition's value. `repeatsSave` marks the ones most often
 * imposed by "repeat the save at the end of each turn" effects; it's only a
 * default.
 */
const defs: Omit<ConditionDef, 'id'>[] = [
  {
    name: 'Blinded',
    effect: "Can't see; automatically fails ability checks that need sight. Attacks against it have advantage; its attacks have disadvantage.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Charmed',
    effect: "Can't attack the charmer or target it with damaging abilities or magic. The charmer has advantage on ability checks to interact with it socially.",
    endsWhen: 'Lasts until the effect ends; many charms end early if the charmer harms it.',
    repeatsSave: true,
  },
  {
    name: 'Deafened',
    effect: "Can't hear; automatically fails ability checks that need hearing.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Exhaustion',
    effect:
      'Cumulative levels: each level gives −2 to every D20 Test (attacks, ability checks, saves) and reduces speed by 5 ft. Dies at level 6.',
    endsWhen: 'A long rest removes one level.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Frightened',
    effect: "Disadvantage on ability checks and attacks while the source of fear is in sight; can't willingly move closer to it.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Grappled',
    effect:
      "Speed 0 and can't increase. Disadvantage on attacks against anyone but the grappler. The grappler can drag or carry it (costing extra movement).",
    endsWhen:
      'Escape with an action: Athletics or Acrobatics check against the escape DC. Also ends if the grappler is incapacitated or it is moved out of reach.',
    repeatsSave: false,
  },
  {
    name: 'Incapacitated',
    effect:
      "Can't take actions, bonus actions or reactions, and can't speak. Concentration is broken. Disadvantage on initiative if incapacitated when it's rolled.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Invisible',
    effect:
      "Advantage on initiative. Unaffected by anything that needs the target to be seen. Attacks against it have disadvantage; its attacks have advantage (unless the other creature can see it).",
    endsWhen: 'Lasts until the effect ends (spells like Invisibility end when it attacks, deals damage or casts).',
    repeatsSave: false,
  },
  {
    name: 'Paralyzed',
    effect:
      'Incapacitated; speed 0. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Petrified',
    effect:
      'Turned to stone with its gear: incapacitated, speed 0, unaware. Resistant to all damage; immune to poison. Automatically fails Strength and Dexterity saves; attacks against it have advantage.',
    endsWhen: 'Usually needs magic such as Greater Restoration.',
    repeatsSave: false,
  },
  {
    name: 'Poisoned',
    effect: 'Disadvantage on attack rolls and ability checks.',
    endsWhen: 'Lasts until the poison’s duration ends.',
    repeatsSave: false,
  },
  {
    name: 'Prone',
    effect:
      'Can only crawl or stand up; disadvantage on its attacks. Attacks against it have advantage within 5 ft and disadvantage from farther away.',
    endsWhen: 'Standing up costs movement equal to half its speed.',
    repeatsSave: false,
  },
  {
    name: 'Restrained',
    effect: 'Speed 0. Attacks against it have advantage; its attacks have disadvantage. Disadvantage on Dexterity saves.',
    endsWhen: 'Usually escaped with an action and a check, as set by the effect.',
    repeatsSave: false,
  },
  {
    name: 'Stunned',
    effect: 'Incapacitated. Automatically fails Strength and Dexterity saves. Attacks against it have advantage.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Unconscious',
    effect:
      "Incapacitated, prone, speed 0, unaware; drops what it holds. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits.",
    endsWhen: 'Ends when it regains HP or the effect ends.',
    repeatsSave: false,
  },
];

/** The 2024 conditions with stable ids ("dnd5e2024:blinded", …) so saved data keeps matching them. */
export const DND5E_2024_CONDITIONS: ConditionDef[] = defs.map((d) => ({ id: `dnd5e2024:${d.name.toLowerCase()}`, ...d }));
