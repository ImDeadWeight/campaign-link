/**
 * @file 5e hit points: fixed max HP, or a hit dice formula that can be rolled or
 * averaged.
 */
import { Dices } from 'lucide-react';
import { DIE_SIDES, averageOf, rollFormula, type DiceFormula } from '../../../formats/dice.js';
import { NumberField, NumberInput } from '../../common/fields.js';
import { Select } from '../../common/Select.js';

/** Props for HitPointsEditor. */
interface Props {
  maxHp: number;
  hitDice: DiceFormula | null;
  conModifier: number;
  onChange(next: { maxHp: number; hitDice: DiceFormula | null }): void;
}

/**
 * Max HP can be typed directly, or rolled from hit dice. Keeping hit dice set
 * also makes every copy added to an encounter roll its own HP.
 */
export function HitPointsEditor({ maxHp, hitDice, conModifier, onChange }: Props) {
  // Current hit dice, or a 1d8 + CON starting point when none are set.
  const dice = hitDice ?? { count: 1, sides: 8, bonus: conModifier };
  // Change part of the hit dice formula.
  const setDice = (patch: Partial<DiceFormula>) => onChange({ maxHp, hitDice: { ...dice, ...patch } });

  return (
    <fieldset>
      <legend>Hit Points</legend>
      <div className="row wrap">
        <NumberField label="Max HP" value={maxHp} min={1} onChange={(n) => onChange({ maxHp: n, hitDice })} />
        <label className="inline">
          <input
            type="checkbox"
            checked={hitDice !== null}
            onChange={(e) => onChange({ maxHp, hitDice: e.target.checked ? dice : null })}
          />
          Hit dice
        </label>
      </div>
      {hitDice && (
        <div className="row wrap">
          <NumberInput value={dice.count} min={1} onChange={(count) => setDice({ count })} />
          <Select
            value={dice.sides}
            options={DIE_SIDES.map((s) => ({ value: s as number, label: `d${s}` }))}
            onChange={(sides) => setDice({ sides })}
          />
          <span>+</span>
          <NumberInput value={dice.bonus} onChange={(bonus) => setDice({ bonus })} />
          <button type="button" title={`Use CON modifier × dice (${conModifier * dice.count})`} onClick={() => setDice({ bonus: conModifier * dice.count })}>
            CON
          </button>
          <button type="button" onClick={() => onChange({ maxHp: rollFormula(dice), hitDice })}>
            <Dices size={16} /> Roll
          </button>
          <button type="button" onClick={() => onChange({ maxHp: averageOf(dice), hitDice })}>
            Average
          </button>
        </div>
      )}
      {hitDice && <span className="muted">Each copy added to an encounter rolls its own HP from these dice.</span>}
    </fieldset>
  );
}
