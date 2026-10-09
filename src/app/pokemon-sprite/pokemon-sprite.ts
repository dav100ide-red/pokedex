import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ImageModule } from 'primeng/image';

/** Shown wherever a Pokémon has no image of its own. */
export const POKEBALL_PLACEHOLDER_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

@Component({
  selector: 'app-pokemon-sprite',
  imports: [ImageModule],
  template: `
    <p-image
      [src]="hasImage() ? src() : placeholderUrl"
      [alt]="hasImage() ? name() : 'No image for ' + name()"
      [width]="size()"
      [height]="size()"
      [imageClass]="hasImage() ? 'pokemon-sprite' : 'pokemon-sprite pokemon-sprite--placeholder'"
      loading="lazy"
    />
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSprite {
  /** Remote URL or data URL; empty when the Pokémon has no image. */
  readonly src = input('');
  readonly name = input.required<string>();
  /** Rendered width and height, in pixels. */
  readonly size = input('48');

  protected readonly placeholderUrl = POKEBALL_PLACEHOLDER_URL;
  protected readonly hasImage = computed(() => this.src() !== '');
}
