/**
 * @file Read-only 5e stat block in the familiar layout, with all bonuses derived
 * from the scores.
 */
import { formatFormula, formatModifier } from '../../../formats/dice.js';
import { ABILITIES, abilityModifier } from '../../../formats/dnd5e/abilities.js';
import {
  initiativeModifier,
  passivePerception,
  proficiencyBonus,
  proficientSkills,
  savingThrowBonus,
} from '../../../formats/dnd5e/derived.js';
import { SKILLS } from '../../../formats/dnd5e/skills.js';
import { ENTRY_SECTIONS, ENTRY_SECTION_TITLES, type Dnd5eStatBlock } from '../../../formats/dnd5e/statBlock.js';
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
export function Dnd5eView({ statBlock: sb, kind }: StatBlockViewProps<Dnd5eStatBlock>) {
  const saves = ABILITIES.filter((a) => sb.savingThrows[a])
    .map((a) => `${a.toUpperCase()} ${formatModifier(savingThrowBonus(sb, kind, a))}`)
    .join(', ');
  const skills = proficientSkills(sb, kind)
    .map(({ skill, bonus }) => `${SKILLS[skill].name} ${formatModifier(bonus)}`)
    .join(', ');
  const subtitle = [sb.size, sb.creatureType].filter(Boolean).join(' ') + (sb.alignment ? `, ${sb.alignment}` : '');

  return (
    <div className="statblock">
      {subtitle && <div className="sb-subtitle muted">{subtitle}</div>}
      <div className="sb-section">
        <Line label="Armor Class" value={`${sb.armorClass}${sb.armorNote ? ` (${sb.armorNote})` : ''}`} />
        <Line label="Hit Points" value={`${sb.maxHp}${sb.hitDice ? ` (${formatFormula(sb.hitDice)})` : ''}`} />
        <Line label="Speed" value={sb.speed} />
        <Line label="Initiative" value={formatModifier(initiativeModifier(sb))} />
      </div>
      <div className="sb-abilities">
        {ABILITIES.map((a) => (
          <div key={a} className="sb-ability">
            <div className="sb-ability-name">{a.toUpperCase()}</div>
            <div>{sb.abilities[a]}</div>
            <div className="muted">{formatModifier(abilityModifier(sb.abilities[a]))}</div>
          </div>
        ))}
      </div>
      <div className="sb-section">
        <Line label="Saving Throws" value={saves} />
        <Line label="Skills" value={skills} />
        <Line label="Damage Vulnerabilities" value={sb.damageVulnerabilities} />
        <Line label="Damage Resistances" value={sb.damageResistances} />
        <Line label="Damage Immunities" value={sb.damageImmunities} />
        <Line label="Condition Immunities" value={sb.conditionImmunities} />
        <Line label="Senses" value={[sb.senses, `passive Perception ${passivePerception(sb, kind)}`].filter(Boolean).join(', ')} />
        <Line label="Languages" value={sb.languages} />
        <Line
          label={kind === 'pc' ? 'Level' : 'Challenge'}
          value={`${kind === 'pc' ? sb.level : sb.challengeRating} (PB ${formatModifier(proficiencyBonus(sb, kind))})`}
        />
      </div>
      {ENTRY_SECTIONS.filter((s) => sb[s].length > 0).map((section) => (
        <div key={section} className="sb-section">
          <h4 className="sb-heading">{ENTRY_SECTION_TITLES[section]}</h4>
          {sb[section].map((entry, i) => (
            <p key={i} className="sb-entry">
              <strong>{entry.name}.</strong> {entry.description}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
