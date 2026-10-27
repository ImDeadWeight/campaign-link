/**
 * @file The PF1e / 3.5e stat block editor: basics, defense, offense,
 * ability scores, statistics and special abilities. Numbers are entered as
 * printed; HP can be rolled from hit dice.
 */
import {
  D20_ABILITIES,
  D20_SIZES,
  d20AbilityModifier,
  type D20Size,
  type D20StatBlock,
} from '../../../formats/d20/statBlock.js';
import { NumberField, NumberInput, TextField } from '../../common/fields.js';
import { Select } from '../../common/Select.js';
import { EntryListEditor } from '../dnd5e/EntryListEditor.js';
import { HitPointsEditor } from '../dnd5e/HitPointsEditor.js';
import type { StatBlockEditorProps } from '../formatUi.js';
import '../statblock.css';

/** Controlled editor: every change produces a new stat block via onChange. */
export function D20Editor({ value: sb, kind, onChange }: StatBlockEditorProps<D20StatBlock>) {
  // Merge a partial change into the stat block.
  const patch = (p: Partial<D20StatBlock>) => onChange({ ...sb, ...p });
  // A labelled text field bound to one string field.
  const text = (key: keyof D20StatBlock, label: string, placeholder?: string) => (
    <TextField label={label} placeholder={placeholder} value={sb[key] as string} onChange={(v) => patch({ [key]: v })} />
  );
  // A labelled number field bound to one number field.
  const num = (key: keyof D20StatBlock, label: string, min?: number) => (
    <NumberField label={label} value={sb[key] as number} min={min} onChange={(v) => patch({ [key]: v })} />
  );

  return (
    <div className="sb-editor">
      <fieldset>
        <legend>Basics</legend>
        <div className="sb-grid">
          {kind === 'pc' ? num('level', 'Level', 1) : text('challengeRating', 'Challenge rating', '1/3')}
          {text('alignment', 'Alignment', 'NE')}
          <label className="field">
            Size
            <Select<D20Size> value={sb.size} options={D20_SIZES.map((s) => ({ value: s, label: s }))} onChange={(size) => patch({ size })} />
          </label>
          {text('creatureType', 'Type', 'humanoid (goblinoid)')}
          {num('initiative', 'Initiative')}
          {text('senses', 'Senses', 'darkvision 60 ft.; Perception −1')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Defense</legend>
        <div className="sb-grid">
          {num('armorClass', 'AC', 0)}
          {num('touchAc', 'Touch', 0)}
          {num('flatFootedAc', 'Flat-footed', 0)}
          {text('armorNote', 'AC note', '+2 armor, +1 Dex, +1 size')}
          {num('fortitude', 'Fort')}
          {num('reflex', 'Ref')}
          {num('will', 'Will')}
          {text('defenses', 'Other defenses', 'DR 5/silver; immune fire; SR 15')}
        </div>
      </fieldset>

      <HitPointsEditor
        maxHp={sb.maxHp}
        hitDice={sb.hitDice}
        conModifier={d20AbilityModifier(sb.abilities.con)}
        onChange={patch}
      />

      <fieldset>
        <legend>Offense</legend>
        <div className="sb-grid">
          {text('speed', 'Speed', '30 ft.')}
          {text('melee', 'Melee', 'short sword +2 (1d4/19–20)')}
          {text('ranged', 'Ranged', 'short bow +4 (1d4/×3)')}
          {text('spaceReach', 'Space / reach', '5 ft./5 ft.')}
          {text('specialAttacks', 'Special attacks')}
        </div>
        <textarea placeholder="Spells known / prepared" value={sb.spells} onChange={(e) => patch({ spells: e.target.value })} />
      </fieldset>

      <fieldset>
        <legend>Ability scores</legend>
        <div className="sb-abilities">
          {D20_ABILITIES.map((a) => (
            <div key={a} className="sb-ability-edit">
              <span className="sb-ability-name">{a.toUpperCase()}</span>
              <NumberInput value={sb.abilities[a]} min={0} max={60} onChange={(n) => patch({ abilities: { ...sb.abilities, [a]: n } })} />
            </div>
          ))}
        </div>
        <span className="muted">0 means no score (—), e.g. undead Constitution: such creatures are destroyed at 0 HP.</span>
      </fieldset>

      <fieldset>
        <legend>Statistics</legend>
        <div className="sb-grid">
          {num('baseAttack', 'Base attack')}
          {text('maneuvers', 'CMB / CMD or grapple', 'CMB +0; CMD 12')}
          {text('feats', 'Feats')}
          {text('skills', 'Skills', 'Ride +10, Stealth +10')}
          {text('languages', 'Languages')}
          {text('gear', 'Gear')}
        </div>
      </fieldset>

      <EntryListEditor title="Special abilities" entries={sb.specialAbilities} onChange={(specialAbilities) => patch({ specialAbilities })} />
    </div>
  );
}
