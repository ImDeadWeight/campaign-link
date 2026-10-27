/**
 * @file UI registry: the stat block view and editor component for each game
 * format.
 */
import type { ComponentType } from 'react';
import type { CharacterKind, StatBlock } from '../../formats/types.js';
import type { FormatId } from '../../formats/formatIds.js';
import { BxEditor } from './bx/BxEditor.js';
import { BxView } from './bx/BxView.js';
import { D20Editor } from './d20/D20Editor.js';
import { D20View } from './d20/D20View.js';
import { Dnd5eEditor } from './dnd5e/Dnd5eEditor.js';
import { Dnd5eView } from './dnd5e/Dnd5eView.js';
import { Pf2eEditor } from './pf2e/Pf2eEditor.js';
import { Pf2eView } from './pf2e/Pf2eView.js';

/** Props every format's stat block view receives (its own stat block shape). */
export interface StatBlockViewProps<S = StatBlock> {
  statBlock: S;
  kind: CharacterKind;
}

/** Props every format's stat block editor receives (controlled). */
export interface StatBlockEditorProps<S = StatBlock> {
  value: S;
  kind: CharacterKind;
  onChange(next: S): void;
}

/** UI half of a format; the rules half lives in domain/formats. */
interface FormatUi {
  View: ComponentType<StatBlockViewProps>;
  Editor: ComponentType<StatBlockEditorProps>;
}

/** Pairs a format's view and editor. A template only ever hands a format its own stat block, so widening is safe. */
function formatUi<S extends StatBlock>(
  View: ComponentType<StatBlockViewProps<S>>,
  Editor: ComponentType<StatBlockEditorProps<S>>,
): FormatUi {
  return { View, Editor } as unknown as FormatUi;
}

/** View and editor per format. */
export const FORMAT_UI: Record<FormatId, FormatUi> = {
  dnd5e: formatUi(Dnd5eView, Dnd5eEditor),
  // Same stat block as 2014.
  dnd5e2024: formatUi(Dnd5eView, Dnd5eEditor),
  pf2e: formatUi(Pf2eView, Pf2eEditor),
  // Same stat block as PF2e.
  sf2e: formatUi(Pf2eView, Pf2eEditor),
  pf1e: formatUi(D20View, D20Editor),
  dnd35: formatUi(D20View, D20Editor),
  bx: formatUi(BxView, BxEditor),
};
