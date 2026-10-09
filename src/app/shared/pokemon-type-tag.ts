import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';

const DARK_TEXT = '#1e1e1e';
const LIGHT_TEXT = '#ffffff';

/** Classic type colors; each text color keeps a WCAG AA contrast ratio (4.5:1 or more). */
const TYPE_COLORS: Readonly<Record<string, { background: string; color: string }>> = {
  Normal: { background: '#A8A77A', color: DARK_TEXT },
  Fire: { background: '#EE8130', color: DARK_TEXT },
  Water: { background: '#6390F0', color: DARK_TEXT },
  Electric: { background: '#F7D02C', color: DARK_TEXT },
  Grass: { background: '#7AC74C', color: DARK_TEXT },
  Ice: { background: '#96D9D6', color: DARK_TEXT },
  Fighting: { background: '#C22E28', color: LIGHT_TEXT },
  Poison: { background: '#A33EA1', color: LIGHT_TEXT },
  Ground: { background: '#E2BF65', color: DARK_TEXT },
  Flying: { background: '#A98FF3', color: DARK_TEXT },
  Psychic: { background: '#F95587', color: DARK_TEXT },
  Bug: { background: '#A6B91A', color: DARK_TEXT },
  Rock: { background: '#B6A136', color: DARK_TEXT },
  Ghost: { background: '#735797', color: LIGHT_TEXT },
  Dragon: { background: '#6F35FC', color: LIGHT_TEXT },
  Dark: { background: '#705746', color: LIGHT_TEXT },
  Steel: { background: '#B7B7CE', color: DARK_TEXT },
  Fairy: { background: '#D685AD', color: DARK_TEXT },
};

@Component({
  selector: 'app-pokemon-type-tag',
  imports: [Tag],
  template: `<p-tag [value]="type()" [rounded]="true" [style]="colors()" />`,
})
export class PokemonTypeTag {
  readonly type = input.required<string>();

  /** Unknown types keep the default tag colors. */
  protected readonly colors = computed(() => TYPE_COLORS[this.type()] ?? null);
}
