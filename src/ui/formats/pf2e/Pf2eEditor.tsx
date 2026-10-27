/**
 * @file The full PF2e stat block editor: basics, attributes, skills,
 * defenses, Strikes, spells and ability lists. Numbers are entered as
 * printed in the stat block.
 */
import { formatModifier } from '../../../formats/dice.js';
import {
  PF2E_ATTRIBUTES,
  PF2E_ENTRY_SECTIONS,
  PF2E_ENTRY_SECTION_TITLES,
  PF2E_SIZES,
  type Pf2eSize,
  type Pf2eStatBlock,
} from '../../../formats/pf2e/statBlock.js';
import { NumberField, NumberInput, TextField } from '../../common/fields.js';
import { Select } from '../../common/Select.js';
import type { StatBlockEditorProps } from '../formatUi.js';
import { AbilityListEditor, SkillListEditor, StrikeListEditor } from './Pf2eLists.js';
import '../statblock.css';

/** Controlled editor: every change produces a new stat block via onChange. */
export function Pf2eEditor({ value: sb, onChange }: StatBlockEditorProps<Pf2eStatBlock>) {
  // Merge a partial change into the stat block.
  const patch = (p: Partial<Pf2eStatBlock>) => onChange({ ...sb, ...p });
  // A labelled text field bound to one string field.
  const text = (key: keyof Pf2eStatBlock, label: string, placeholder?: string) => (
    <TextField label={label} placeholder={placeholder} value={sb[key] as string} onChange={(v) => patch({ [key]: v })} />
  );
  // A labelled number field bound to one modifier or value.
  const num = (key: keyof Pf2eStatBlock, label: string, min?: number) => (
    <NumberField label={label} value={sb[key] as number} min={min} onChange={(v) => patch({ [key]: v })} />
  );

  return (
    <div className="sb-editor">
      <fieldset>
        <legend>Basics</legend>
        <div className="sb-grid">
          {num('level', 'Level', -1)}
          <label className="field">
            Size
            <Select<Pf2eSize> value={sb.size} options={PF2E_SIZES.map((s) => ({ value: s, label: s }))} onChange={(size) => patch({ size })} />
          </label>
          {text('traits', 'Traits', 'Goblin, Humanoid')}
          {num('perception', 'Perception')}
          {text('senses', 'Senses', 'darkvision')}
          {text('languages', 'Languages', 'Common, Goblin')}
          {text('speed', 'Speed', '25 feet')}
        </div>
        <span className="muted">Initiative uses Perception ({formatModifier(sb.perception)}).</span>
      </fieldset>

      <fieldset>
        <legend>Attribute modifiers</legend>
        <div className="sb-abilities">
          {PF2E_ATTRIBUTES.map((a) => (
            <div key={a} className="sb-ability-edit">
              <span className="sb-ability-name">{a.toUpperCase()}</span>
              <NumberInput value={sb.attributes[a]} min={-5} max={10} onChange={(n) => patch({ attributes: { ...sb.attributes, [a]: n } })} />
            </div>
          ))}
        </div>
      </fieldset>

      <SkillListEditor skills={sb.skills} onChange={(skills) => patch({ skills })} />

      <fieldset>
        <legend>Defenses</legend>
        <div className="sb-grid">
          {num('armorClass', 'AC', 0)}
          {num('fortitude', 'Fortitude')}
          {num('reflex', 'Reflex')}
          {num('will', 'Will')}
          {text('saveNote', 'Save note', '+1 status to all saves vs. magic')}
          {num('maxHp', 'Max HP', 1)}
          {text('hpNote', 'HP note', 'void healing')}
          {text('immunities', 'Immunities')}
          {text('weaknesses', 'Weaknesses', 'cold iron 5')}
          {text('resistances', 'Resistances', 'fire 5')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Items</legend>
        {text('items', 'Items', 'dogslicer, leather armor, shortbow (20 arrows)')}
      </fieldset>

      <StrikeListEditor strikes={sb.strikes} onChange={(strikes) => patch({ strikes })} />

      <fieldset>
        <legend>Spells</legend>
        <textarea
          placeholder="Occult Innate Spells DC 18, attack +10; 1st fear; Cantrips (1st) daze"
          value={sb.spells}
          onChange={(e) => patch({ spells: e.target.value })}
        />
      </fieldset>

      {PF2E_ENTRY_SECTIONS.map((section) => (
        <AbilityListEditor
          key={section}
          title={PF2E_ENTRY_SECTION_TITLES[section]}
          entries={sb[section]}
          onChange={(entries) => patch({ [section]: entries })}
        />
      ))}
    </div>
  );
}
