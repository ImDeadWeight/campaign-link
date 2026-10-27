/**
 * @file Editor for a list of named entries (traits, actions, bonus actions,
 * reactions, legendary actions).
 */
import { Plus, Trash2 } from 'lucide-react';
import type { NamedEntry } from '../../../formats/dnd5e/statBlock.js';

/** Props for EntryListEditor. */
interface Props {
  title: string;
  entries: NamedEntry[];
  onChange(entries: NamedEntry[]): void;
}

/** Name + description list used for traits, actions, reactions, etc. */
export function EntryListEditor({ title, entries, onChange }: Props) {
  // Change one entry's name or description.
  const update = (i: number, patch: Partial<NamedEntry>) =>
    onChange(entries.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  return (
    <fieldset>
      <legend>{title}</legend>
      {entries.map((entry, i) => (
        <div key={i} className="entry-edit">
          <div className="entry-fields">
            <input placeholder="Name" value={entry.name} onChange={(e) => update(i, { name: e.target.value })} />
            <textarea placeholder="Description" value={entry.description} onChange={(e) => update(i, { description: e.target.value })} />
          </div>
          <button type="button" className="icon" title="Delete" onClick={() => onChange(entries.filter((_, j) => j !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={() => onChange([...entries, { name: '', description: '' }])}>
          <Plus size={16} /> Add
        </button>
      </div>
    </fieldset>
  );
}
