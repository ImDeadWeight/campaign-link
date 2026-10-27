/**
 * @file Read-only PF2e stat block in the familiar three-part layout:
 * perception and skills, then defenses, then Speed, Strikes, spells and
 * offensive abilities.
 */
import { formatModifier } from '../../../formats/dice.js';
import {
  PF2E_ATTRIBUTES,
  type ActionCost,
  type Pf2eEntry,
  type Pf2eStatBlock,
} from '../../../formats/pf2e/statBlock.js';
import type { StatBlockViewProps } from '../formatUi.js';
import '../statblock.css';

/** Action cost symbols as printed in PF2e books. */
const COST_GLYPHS: Record<ActionCost, string> = { '': '', '1': '◆', '2': '◆◆', '3': '◆◆◆', free: '◇', reaction: '⟲' };
/** Spelled out for tooltips and screen readers. */
const COST_NAMES: Record<ActionCost, string> = {
  '': '',
  '1': 'One action',
  '2': 'Two actions',
  '3': 'Three actions',
  free: 'Free action',
  reaction: 'Reaction',
};

/** A "Label value" line; hidden when the value is empty. */
function Line({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="sb-line">
      <strong>{label}</strong> {value}
    </div>
  );
}

/** One ability: name, action symbol, traits in parentheses, description. */
function Entry({ entry }: { entry: Pf2eEntry }) {
  return (
    <p className="sb-entry">
      <strong>{entry.name}</strong>
      {entry.cost && (
        <span className="action-cost" title={COST_NAMES[entry.cost]} aria-label={COST_NAMES[entry.cost]}>
          {' '}
          {COST_GLYPHS[entry.cost]}
        </span>
      )}
      {entry.traits && <span className="muted"> ({entry.traits})</span>} {entry.description}
    </p>
  );
}

/** The stat block as shown in the right panel. */
export function Pf2eView({ statBlock: sb, kind }: StatBlockViewProps<Pf2eStatBlock>) {
  const skills = sb.skills.map((s) => `${s.name} ${formatModifier(s.bonus)}`).join(', ');
  const attributes = PF2E_ATTRIBUTES.map((a) => `${a[0].toUpperCase()}${a.slice(1)} ${formatModifier(sb.attributes[a])}`).join(', ');
  const saves = `Fort ${formatModifier(sb.fortitude)}, Ref ${formatModifier(sb.reflex)}, Will ${formatModifier(sb.will)}`;

  return (
    <div className="statblock">
      <div className="sb-subtitle muted">
        {kind === 'pc' ? 'Level' : 'Creature'} {sb.level}
        {sb.traits && ` · ${sb.size}, ${sb.traits}`}
        {!sb.traits && ` · ${sb.size}`}
      </div>
      <div className="sb-section">
        <Line label="Perception" value={[formatModifier(sb.perception), sb.senses].filter(Boolean).join('; ')} />
        <Line label="Languages" value={sb.languages} />
        <Line label="Skills" value={skills} />
        <div className="sb-line">{attributes}</div>
        <Line label="Items" value={sb.items} />
        {sb.interaction.map((e, i) => <Entry key={i} entry={e} />)}
      </div>
      <div className="sb-section">
        <Line label="AC" value={`${sb.armorClass}; ${saves}${sb.saveNote ? `; ${sb.saveNote}` : ''}`} />
        <Line label="HP" value={`${sb.maxHp}${sb.hpNote ? `; ${sb.hpNote}` : ''}`} />
        <Line label="Immunities" value={sb.immunities} />
        <Line label="Weaknesses" value={sb.weaknesses} />
        <Line label="Resistances" value={sb.resistances} />
        {sb.defensive.map((e, i) => <Entry key={i} entry={e} />)}
      </div>
      <div className="sb-section">
        <Line label="Speed" value={sb.speed} />
        {sb.strikes.map((s, i) => (
          <p key={i} className="sb-entry">
            <strong>{s.kind === 'melee' ? 'Melee' : 'Ranged'}</strong>
            <span className="action-cost" title="One action" aria-label="One action"> ◆</span> {s.name} {formatModifier(s.bonus)}
            {s.traits && <span className="muted"> ({s.traits})</span>}
            {s.damage && (
              <>
                , <strong>Damage</strong> {s.damage}
              </>
            )}
          </p>
        ))}
        {sb.spells && <p className="sb-entry">{sb.spells}</p>}
        {sb.offensive.map((e, i) => <Entry key={i} entry={e} />)}
      </div>
    </div>
  );
}
