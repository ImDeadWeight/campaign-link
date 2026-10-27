/**
 * @file The B/X stat block editor: the classic monster line (AC, HD, Att,
 * THAC0, MV, SV, ML, AL, XP, NA, TT) and special abilities.
 */
import { BX_SAVES, BX_SAVE_LABELS, type BxStatBlock } from '../../../formats/bx/statBlock.js';
import { NumberField, NumberInput, TextField } from '../../common/fields.js';
import { EntryListEditor } from '../dnd5e/EntryListEditor.js';
import { HitPointsEditor } from '../dnd5e/HitPointsEditor.js';
import type { StatBlockEditorProps } from '../formatUi.js';
import '../statblock.css';

/** Controlled editor: every change produces a new stat block via onChange. */
export function BxEditor({ value: sb, kind, onChange }: StatBlockEditorProps<BxStatBlock>) {
  // Merge a partial change into the stat block.
  const patch = (p: Partial<BxStatBlock>) => onChange({ ...sb, ...p });
  // A labelled text field bound to one string field.
  const text = (key: keyof BxStatBlock, label: string, placeholder?: string) => (
    <TextField label={label} placeholder={placeholder} value={sb[key] as string} onChange={(v) => patch({ [key]: v })} />
  );
  // A labelled number field bound to one number field.
  const num = (key: keyof BxStatBlock, label: string, min?: number) => (
    <NumberField label={label} value={sb[key] as number} min={min} onChange={(v) => patch({ [key]: v })} />
  );

  return (
    <div className="sb-editor">
      <fieldset>
        <legend>Basics</legend>
        <div className="sb-grid">
          {kind === 'pc' && num('level', 'Level', 1)}
          {num('armorClass', 'AC (descending)')}
          {text('attacks', 'Attacks', '1 × weapon (1d6)')}
          {num('thac0', 'THAC0', 1)}
          {text('movement', 'Movement', "120' (40')")}
          {num('morale', 'Morale', 2)}
          {text('alignment', 'Alignment', 'Chaotic')}
          {num('xp', 'XP', 0)}
          {text('numberAppearing', 'No. appearing', '2d4 (6d10)')}
          {text('treasureType', 'Treasure type', 'C')}
        </div>
        <span className="muted">
          Ascending AC {19 - sb.armorClass} · attack bonus +{19 - sb.thac0}
        </span>
      </fieldset>

      <HitPointsEditor maxHp={sb.maxHp} hitDice={sb.hitDice} conModifier={0} onChange={patch} />
      <TextField
        label="Hit dice as printed (optional)"
        placeholder="1+1, 2*"
        value={sb.hitDiceNote}
        onChange={(hitDiceNote) => patch({ hitDiceNote })}
      />

      <fieldset>
        <legend>Saving throws</legend>
        <div className="sb-abilities">
          {BX_SAVES.map((s) => (
            <div key={s} className="sb-ability-edit" title={BX_SAVE_LABELS[s].name}>
              <span className="sb-ability-name">{BX_SAVE_LABELS[s].short}</span>
              <NumberInput value={sb.saves[s]} min={2} max={20} onChange={(n) => patch({ saves: { ...sb.saves, [s]: n } })} />
            </div>
          ))}
        </div>
      </fieldset>

      <EntryListEditor title="Special abilities" entries={sb.specialAbilities} onChange={(specialAbilities) => patch({ specialAbilities })} />
    </div>
  );
}
