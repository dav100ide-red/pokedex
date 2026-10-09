import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ImageModule } from 'primeng/image';

/** Shown wherever a Pokémon has no image of its own. */
const POKE_BALL_PLACEHOLDER =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

@Component({
  selector: 'app-pokemon-sprite',
  imports: [ImageModule],
  template: `
    <p-image
      [src]="src()"
      [alt]="alt()"
      [width]="size()"
      [height]="size()"
      [imageStyle]="{ 'object-fit': 'contain' }"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSprite {
  /** Remote sprite URL or uploaded data URL; empty when the Pokémon has no image. */
  readonly imageUrl = input('');
  readonly name = input('Pokémon');
  /** Rendered width and height in pixels. */
  readonly size = input('56');

  protected readonly src = computed(() => this.imageUrl() || POKE_BALL_PLACEHOLDER);
  protected readonly alt = computed(() =>
    this.imageUrl() ? `${this.name()} sprite` : `Poké Ball placeholder for ${this.name()}`,
  );
}
