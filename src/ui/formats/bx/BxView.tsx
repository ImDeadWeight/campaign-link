/**
 * @file Read-only B/X stat block: the classic monster line, then special
 * abilities.
 */
import { formatFormula } from '../../../formats/dice.js';
import { BX_SAVES, BX_SAVE_LABELS, type BxStatBlock } from '../../../formats/bx/statBlock.js';
import type { StatBlockViewProps } from '../formatUi.js';
import '../statblock.css';

/** A "Label value" line; hidden when the value is empty. */
function Line({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="sb-line">
      <strong>{label}</strong> {value}
    </div>
  );
}

/** The stat block as shown in the right panel. */
export function BxView({ statBlock: sb, kind }: StatBlockViewProps<BxStatBlock>) {
  const hd = sb.hitDiceNote || (sb.hitDice ? formatFormula(sb.hitDice) : '');
  const saves = BX_SAVES.map((s) => `${BX_SAVE_LABELS[s].short}${sb.saves[s]}`).join(' ');

  return (
    <div className="statblock">
      {kind === 'pc' && <div className="sb-subtitle muted">Level {sb.level}</div>}
      <div className="sb-section">
        <Line label="AC" value={`${sb.armorClass} [${19 - sb.armorClass}]`} />
        <Line label="HD" value={[hd, `(${sb.maxHp} hp)`].filter(Boolean).join(' ')} />
        <Line label="Att" value={sb.attacks} />
        <Line label="THAC0" value={`${sb.thac0} [+${19 - sb.thac0}]`} />
        <Line label="MV" value={sb.movement} />
        <Line label="SV" value={saves} />
        <Line label="ML" value={String(sb.morale)} />
        <Line label="AL" value={sb.alignment} />
        <Line label="XP" value={String(sb.xp)} />
        <Line label="NA" value={sb.numberAppearing} />
        <Line label="TT" value={sb.treasureType} />
      </div>
      {sb.specialAbilities.length > 0 && (
        <div className="sb-section">
          {sb.specialAbilities.map((entry, i) => (
            <p key={i} className="sb-entry">
              <strong>{entry.name}:</strong> {entry.description}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
