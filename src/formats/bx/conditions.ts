/**
 * @file The built-in B/X conditions. Old-school rules name few conditions,
 * so these cover the effects that come up most in play.
 */
import type { ConditionDef } from '../types.js';

/** B/X conditions, paraphrased. Energy Drained carries the number of levels lost. */
const defs: Omit<ConditionDef, 'id'>[] = [
  {
    name: 'Asleep',
    effect: 'Helpless; a sleeping creature can be slain automatically with an edged weapon.',
    endsWhen: 'Woken by being slapped or shaken, or when the magic runs out.',
    repeatsSave: false,
  },
  {
    name: 'Blinded',
    effect: "Can't see: attacks at a heavy penalty (commonly −4) and can't target what it can't locate.",
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: false,
  },
  {
    name: 'Charmed',
    effect: "Treats the charmer as a trusted friend and ally; follows commands that aren't against its nature, and won't harm the charmer.",
    endsWhen: 'Ends when the charm is broken; some charms allow new saves at intervals set by Intelligence.',
    repeatsSave: false,
  },
  {
    name: 'Confused',
    effect: 'Each round roll 2d6: 2–5 attacks the caster’s side, 6–8 does nothing, 9–12 attacks its own side.',
    endsWhen: 'Lasts until the effect ends.',
    repeatsSave: true,
  },
  {
    name: 'Energy Drained',
    effect: 'Has lost this many levels or Hit Dice: hit points, attacks, saves and abilities as the lower level.',
    endsWhen: 'Permanent unless restored by powerful magic.',
    repeatsSave: false,
    valued: true,
  },
  {
    name: 'Fleeing',
    effect: 'Failed a morale check: tries to escape (or surrenders if it cannot).',
    endsWhen: 'Ends when it is safe or the referee decides it rallies.',
    repeatsSave: false,
  },
  {
    name: 'Held',
    effect: "Held by magic: can't move or act.",
    endsWhen: 'Lasts for the spell’s duration.',
    repeatsSave: false,
  },
  {
    name: 'Invisible',
    effect: "Can't be seen; attacks against it are difficult and it can act unseen.",
    endsWhen: 'Lasts until the effect ends (invisibility usually ends when it attacks or casts).',
    repeatsSave: false,
  },
  {
    name: 'Paralysed',
    effect: "Can't move or act; attacks against it hit automatically.",
    endsWhen: 'Lasts for the effect’s duration (e.g. 2d4 turns) or until cured.',
    repeatsSave: false,
  },
  {
    name: 'Petrified',
    effect: 'Turned to stone.',
    endsWhen: 'Needs magic to reverse.',
    repeatsSave: false,
  },
  {
    name: 'Surprised',
    effect: 'Caught unawares: loses its actions this round.',
    endsWhen: 'Ends after the surprise round.',
    repeatsSave: false,
  },
];

/** The B/X conditions with stable ids ("bx:energy-drained", …). */
export const BX_CONDITIONS: ConditionDef[] = defs.map((d) => ({ id: `bx:${d.name.toLowerCase().replace(/\s+/g, '-')}`, ...d }));
