/**
 * @file The full 5e stat block editor: basics, hit points, abilities, skills,
 * defenses, and trait/action lists.
 */
import { formatModifier } from '../../../formats/dice.js';
import { abilityModifier } from '../../../formats/dnd5e/abilities.js';
import { initiativeModifier, proficiencyBonus } from '../../../formats/dnd5e/derived.js';
import { CHALLENGE_RATINGS } from '../../../formats/dnd5e/proficiency.js';
import {
  ENTRY_SECTIONS,
  ENTRY_SECTION_TITLES,
  SIZES,
  type Dnd5eStatBlock,
  type Size,
} from '../../../formats/dnd5e/statBlock.js';
import type { StatBlockEditorProps } from '../formatUi.js';
import { AbilityEditor } from './AbilityEditor.js';
import { EntryListEditor } from './EntryListEditor.js';
import { NumberField, TextField } from '../../common/fields.js';
import { Select } from '../../common/Select.js';
import { HitPointsEditor } from './HitPointsEditor.js';
import { SkillsEditor } from './SkillsEditor.js';
import '../statblock.css';

/** Controlled editor: every change produces a new stat block via onChange. */
export function Dnd5eEditor({ value: sb, kind, onChange }: StatBlockEditorProps<Dnd5eStatBlock>) {
  // Merge a partial change into the stat block.
  const patch = (p: Partial<Dnd5eStatBlock>) => onChange({ ...sb, ...p });
  // A labelled text field bound to one string field.
  const text = (key: keyof Dnd5eStatBlock, label: string, placeholder?: string) => (
    <TextField label={label} placeholder={placeholder} value={sb[key] as string} onChange={(v) => patch({ [key]: v })} />
  );

  return (
    <div className="sb-editor">
      <fieldset>
        <legend>Basics</legend>
        <div className="sb-grid">
          <label className="field">
            Size
            <Select<Size> value={sb.size} options={SIZES.map((s) => ({ value: s, label: s }))} onChange={(size) => patch({ size })} />
          </label>
          {text('creatureType', 'Type', 'humanoid (goblinoid)')}
          {text('alignment', 'Alignment', 'neutral evil')}
          <NumberField label="Armor Class" value={sb.armorClass} min={0} onChange={(armorClass) => patch({ armorClass })} />
          {text('armorNote', 'Armor note', 'leather armor, shield')}
          {text('speed', 'Speed', '30 ft., fly 60 ft.')}
          {kind === 'pc' ? (
            <NumberField label="Level" value={sb.level} min={1} onChange={(level) => patch({ level })} />
          ) : (
            <label className="field">
              Challenge rating
              <Select
                value={sb.challengeRating}
                options={CHALLENGE_RATINGS.map((cr) => ({ value: cr, label: cr }))}
                onChange={(challengeRating) => patch({ challengeRating })}
              />
            </label>
          )}
          <NumberField label="Extra initiative bonus" value={sb.initiativeBonus} onChange={(initiativeBonus) => patch({ initiativeBonus })} />
        </div>
        <span className="muted">
          Proficiency bonus {formatModifier(proficiencyBonus(sb, kind))} · Initiative {formatModifier(initiativeModifier(sb))}
        </span>
      </fieldset>

      <HitPointsEditor
        maxHp={sb.maxHp}
        hitDice={sb.hitDice}
        conModifier={abilityModifier(sb.abilities.con)}
        onChange={patch}
      />
      <AbilityEditor abilities={sb.abilities} savingThrows={sb.savingThrows} onChange={patch} />
      <SkillsEditor statBlock={sb} kind={kind} onChange={(skills) => patch({ skills })} />

      <fieldset>
        <legend>Defenses &amp; Senses</legend>
        <div className="sb-grid">
          {text('damageVulnerabilities', 'Damage vulnerabilities')}
          {text('damageResistances', 'Damage resistances')}
          {text('damageImmunities', 'Damage immunities')}
          {text('conditionImmunities', 'Condition immunities')}
          {text('senses', 'Senses', 'darkvision 60 ft.')}
          {text('languages', 'Languages')}
        </div>
      </fieldset>

      {ENTRY_SECTIONS.map((section) => (
        <EntryListEditor
          key={section}
          title={ENTRY_SECTION_TITLES[section]}
          entries={sb[section]}
          onChange={(entries) => patch({ [section]: entries })}
        />
      ))}
    </div>
  );
}
