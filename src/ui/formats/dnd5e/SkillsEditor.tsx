/**
 * @file 5e skill proficiency editor showing each skill's resulting bonus.
 */
import type { CharacterKind } from '../../../formats/types.js';
import { formatModifier } from '../../../formats/dice.js';
import { skillBonus } from '../../../formats/dnd5e/derived.js';
import { SKILL_KEYS, SKILLS, type SkillProficiency } from '../../../formats/dnd5e/skills.js';
import type { Dnd5eStatBlock } from '../../../formats/dnd5e/statBlock.js';
import { Select, type SelectOption } from '../../common/Select.js';

/** Choices for each skill's dropdown. */
const PROFICIENCY_OPTIONS: SelectOption<SkillProficiency>[] = [
  { value: 'none', label: '—' },
  { value: 'proficient', label: 'Proficient' },
  { value: 'expertise', label: 'Expertise' },
];

/** Props for SkillsEditor. */
interface Props {
  statBlock: Dnd5eStatBlock;
  kind: CharacterKind;
  onChange(skills: Dnd5eStatBlock['skills']): void;
}

/** All 18 skills with a proficiency dropdown each. */
export function SkillsEditor({ statBlock, kind, onChange }: Props) {
  // Set one skill's proficiency; "none" removes it.
  const set = (skill: keyof typeof SKILLS, value: SkillProficiency) => {
    const next = { ...statBlock.skills };
    if (value === 'none') delete next[skill];
    else next[skill] = value;
    onChange(next);
  };
  return (
    <fieldset>
      <legend>Skills</legend>
      <div className="sb-skill-grid">
        {SKILL_KEYS.map((skill) => (
          <div key={skill} className="row">
            <span className="spacer">
              {SKILLS[skill].name} <span className="muted">{formatModifier(skillBonus(statBlock, kind, skill))}</span>
            </span>
            <Select
              className="skill-select"
              value={statBlock.skills[skill] ?? 'none'}
              options={PROFICIENCY_OPTIONS}
              onChange={(v) => set(skill, v)}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
