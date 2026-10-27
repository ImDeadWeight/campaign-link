/**
 * @file The 15 built-in 5e conditions with rules text (what each does, how
 * it ends) and whether it defaults to needing a save each turn.
 */
import type { ConditionDef } from '../types.js';

/**
 * 5e conditions (paraphrased from the SRD 5.1). `repeatsSave` marks the ones
 * most often imposed by "repeat the save at the end of each turn" effects
 * (Hold Person, Fear, Charm Person-style magic); it's only a default.
 */
const defs: Omit<ConditionDef, 'id'>[] = [
  {
    name: 'Blinded',
    effect: "Can't see; automatically fails checks that rely on sight. Attacks against it have advantage; its attacks have disadvantage.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Charmed',
    effect: "Can't attack the charmer or target it with harmful abilities. The charmer has advantage on social checks against it.",
    endsWhen: 'Lasts until the effect ends; many charms end early if the charmer harms it.',
    repeatsSave: true,
  },
  {
    name: 'Deafened',
    effect: "Can't hear; automatically fails checks that rely on hearing.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Exhaustion',
    effect:
      'Cumulative levels: 1 disadvantage on ability checks; 2 speed halved; 3 disadvantage on attacks and saves; 4 HP maximum halved; 5 speed 0; 6 death.',
    endsWhen: 'A long rest (with food and drink) removes one level.',
    repeatsSave: false,
  },
  {
    name: 'Frightened',
    effect: "Disadvantage on ability checks and attacks while the source of fear is in sight; can't willingly move closer to it.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Grappled',
    effect: 'Speed becomes 0 and can’t benefit from bonuses to speed.',
    endsWhen:
      'Escape with an action: Athletics or Acrobatics check against the grappler’s Athletics. Also ends if the grappler is incapacitated or it is moved out of reach.',
    repeatsSave: false,
  },
  {
    name: 'Incapacitated',
    effect: "Can't take actions or reactions.",
    endsWhen: 'Lasts until the effect that caused it ends.',
    repeatsSave: false,
  },
  {
    name: 'Invisible',
    effect: "Can't be seen without magic or a special sense. Attacks against it have disadvantage; its attacks have advantage.",
    endsWhen: 'Lasts until the effect ends (spells like Invisibility end when it attacks or casts).',
    repeatsSave: false,
  },
  {
    name: 'Paralyzed',
    effect:
      "Incapacitated; can't move or speak. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Petrified',
    effect:
      'Turned to stone: incapacitated, can’t move or speak, unaware. Resistant to all damage; immune to poison and disease. Automatically fails Strength and Dexterity saves; attacks against it have advantage.',
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
      'Can only crawl; disadvantage on its attacks. Attacks against it have advantage within 5 ft and disadvantage from farther away.',
    endsWhen: 'Standing up costs half its speed.',
    repeatsSave: false,
  },
  {
    name: 'Restrained',
    effect: 'Speed 0. Attacks against it have advantage; its attacks have disadvantage. Disadvantage on Dexterity saves.',
    endsWhen: 'Usually escaped with an action and a Strength check, as set by the effect.',
    repeatsSave: false,
  },
  {
    name: 'Stunned',
    effect:
      "Incapacitated; can't move and can speak only falteringly. Automatically fails Strength and Dexterity saves. Attacks against it have advantage.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Unconscious',
    effect:
      "Incapacitated, can't move or speak, unaware; drops what it holds and falls prone. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and hits from within 5 ft are critical hits.",
    endsWhen: 'Ends when it regains HP or the effect ends.',
    repeatsSave: false,
  },
];

/** The 5e conditions with stable ids ("dnd5e:blinded", …) so saved data keeps matching them. */
export const DND5E_CONDITIONS: ConditionDef[] = defs.map((d) => ({ id: `dnd5e:${d.name.toLowerCase()}`, ...d }));
