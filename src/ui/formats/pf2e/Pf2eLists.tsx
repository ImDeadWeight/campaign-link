/**
 * @file PF2e list editors: skills (name + modifier), Strikes (melee/ranged,
 * bonus, traits, damage) and abilities (name, action cost, traits,
 * description).
 */
import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  ACTION_COSTS,
  ACTION_COST_LABELS,
  type ActionCost,
  type Pf2eEntry,
  type Pf2eSkill,
  type Pf2eStrike,
} from '../../../formats/pf2e/statBlock.js';
import { NumberInput } from '../../common/fields.js';
import { Select } from '../../common/Select.js';

/** Props for RowList. */
interface RowListProps<T> {
  title: string;
  items: T[];
  blank: T;
  onChange(items: T[]): void;
  /** The fields for one item; `set` merges a change into it. */
  renderRow(item: T, set: (patch: Partial<T>) => void): ReactNode;
}

/** A titled list of editable rows with delete buttons and an Add button. */
function RowList<T>({ title, items, blank, onChange, renderRow }: RowListProps<T>) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {items.map((item, i) => (
        <div key={i} className="entry-edit">
          <div className="entry-fields">
            {renderRow(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          </div>
          <button type="button" className="icon" title="Delete" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={() => onChange([...items, blank])}>
          <Plus size={16} /> Add
        </button>
      </div>
    </fieldset>
  );
}

/** Skills with their total modifiers (lores included). */
export function SkillListEditor({ skills, onChange }: { skills: Pf2eSkill[]; onChange(skills: Pf2eSkill[]): void }) {
  return (
    <RowList<Pf2eSkill>
      title="Skills"
      items={skills}
      blank={{ name: '', bonus: 0 }}
      onChange={onChange}
      renderRow={(s, set) => (
        <div className="entry-inline">
          <input className="grow" placeholder="Skill (e.g. Stealth, Warfare Lore)" value={s.name} onChange={(e) => set({ name: e.target.value })} />
          <NumberInput value={s.bonus} onChange={(bonus) => set({ bonus })} />
        </div>
      )}
    />
  );
}

/** Melee and ranged Strikes. */
export function StrikeListEditor({ strikes, onChange }: { strikes: Pf2eStrike[]; onChange(strikes: Pf2eStrike[]): void }) {
  return (
    <RowList<Pf2eStrike>
      title="Strikes"
      items={strikes}
      blank={{ kind: 'melee', name: '', bonus: 0, traits: '', damage: '' }}
      onChange={onChange}
      renderRow={(s, set) => (
        <>
          <div className="entry-inline">
            <Select<Pf2eStrike['kind']>
              value={s.kind}
              options={[
                { value: 'melee', label: 'Melee' },
                { value: 'ranged', label: 'Ranged' },
              ]}
              onChange={(kind) => set({ kind })}
            />
            <input className="grow" placeholder="Name (e.g. dogslicer)" value={s.name} onChange={(e) => set({ name: e.target.value })} />
            <NumberInput value={s.bonus} onChange={(bonus) => set({ bonus })} />
          </div>
          <input placeholder="Traits (e.g. agile, backstabber, finesse)" value={s.traits} onChange={(e) => set({ traits: e.target.value })} />
          <input placeholder="Damage (e.g. 1d6 slashing)" value={s.damage} onChange={(e) => set({ damage: e.target.value })} />
        </>
      )}
    />
  );
}

/** Abilities with an action cost, traits and description. */
export function AbilityListEditor({ title, entries, onChange }: { title: string; entries: Pf2eEntry[]; onChange(entries: Pf2eEntry[]): void }) {
  return (
    <RowList<Pf2eEntry>
      title={title}
      items={entries}
      blank={{ name: '', cost: '', traits: '', description: '' }}
      onChange={onChange}
      renderRow={(entry, set) => (
        <>
          <div className="entry-inline">
            <input className="grow" placeholder="Name" value={entry.name} onChange={(e) => set({ name: e.target.value })} />
            <Select<ActionCost>
              value={entry.cost}
              options={ACTION_COSTS.map((c) => ({ value: c, label: ACTION_COST_LABELS[c] }))}
              onChange={(cost) => set({ cost })}
            />
          </div>
          <input placeholder="Traits (e.g. arcane, fire)" value={entry.traits} onChange={(e) => set({ traits: e.target.value })} />
          <textarea placeholder="Description" value={entry.description} onChange={(e) => set({ description: e.target.value })} />
        </>
      )}
    />
  );
}
