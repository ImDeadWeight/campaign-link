/**
 * @file Read-only PF1e / 3.5e stat block in the familiar layout: header,
 * Defense, Offense, Statistics, Special Abilities.
 */
import { formatFormula, formatModifier } from '../../../formats/dice.js';
import { D20_ABILITIES, type D20StatBlock } from '../../../formats/d20/statBlock.js';
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
export function D20View({ statBlock: sb, kind }: StatBlockViewProps<D20StatBlock>) {
  const subtitle = [sb.alignment, sb.size, sb.creatureType].filter(Boolean).join(' ');
  const scores = D20_ABILITIES.map((a) => `${a[0].toUpperCase()}${a.slice(1)} ${sb.abilities[a] === 0 ? '—' : sb.abilities[a]}`).join(', ');
  const hp = `${sb.maxHp}${sb.hitDice ? ` (${formatFormula(sb.hitDice)})` : ''}`;

  return (
    <div className="statblock">
      <div className="sb-subtitle muted">
        {kind === 'pc' ? `Level ${sb.level}` : `CR ${sb.challengeRating}`}
        {subtitle && ` · ${subtitle}`}
      </div>
      <div className="sb-section">
        <Line label="Init" value={[formatModifier(sb.initiative), sb.senses && `Senses ${sb.senses}`].filter(Boolean).join('; ')} />
      </div>
      <div className="sb-section">
        <h4 className="sb-heading">Defense</h4>
        <Line
          label="AC"
          value={`${sb.armorClass}, touch ${sb.touchAc}, flat-footed ${sb.flatFootedAc}${sb.armorNote ? ` (${sb.armorNote})` : ''}`}
        />
        <Line label="hp" value={hp} />
        <Line label="Fort" value={`${formatModifier(sb.fortitude)}, Ref ${formatModifier(sb.reflex)}, Will ${formatModifier(sb.will)}`} />
        <Line label="Defenses" value={sb.defenses} />
      </div>
      <div className="sb-section">
        <h4 className="sb-heading">Offense</h4>
        <Line label="Speed" value={sb.speed} />
        <Line label="Melee" value={sb.melee} />
        <Line label="Ranged" value={sb.ranged} />
        <Line label="Space/Reach" value={sb.spaceReach} />
        <Line label="Special Attacks" value={sb.specialAttacks} />
        {sb.spells && <p className="sb-entry">{sb.spells}</p>}
      </div>
      <div className="sb-section">
        <h4 className="sb-heading">Statistics</h4>
        <div className="sb-line">{scores}</div>
        <Line label="Base Atk" value={[formatModifier(sb.baseAttack), sb.maneuvers].filter(Boolean).join('; ')} />
        <Line label="Feats" value={sb.feats} />
        <Line label="Skills" value={sb.skills} />
        <Line label="Languages" value={sb.languages} />
        <Line label="Gear" value={sb.gear} />
      </div>
      {sb.specialAbilities.length > 0 && (
        <div className="sb-section">
          <h4 className="sb-heading">Special Abilities</h4>
          {sb.specialAbilities.map((entry, i) => (
            <p key={i} className="sb-entry">
              <strong>{entry.name}.</strong> {entry.description}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
