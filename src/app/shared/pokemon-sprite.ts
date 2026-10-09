import { Component, computed, input, linkedSignal } from '@angular/core';
import { Image } from 'primeng/image';

/** Shown instead of the Pokémon image when there is none (or it cannot be loaded). */
export const POKEBALL_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

@Component({
  selector: 'app-pokemon-sprite',
  imports: [Image],
  template: `
    <p-image
      [src]="src()"
      [alt]="alt()"
      [width]="dimension()"
      [height]="dimension()"
      [imageStyle]="{ objectFit: 'scale-down', display: 'block' }"
      (onImageError)="failed.set(true)"
    />
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
  `,
})
export class PokemonSprite {
  readonly imageUrl = input('');
  readonly name = input('');
  /** Width and height of the image box, in pixels. */
  readonly size = input(64);

  /** Reset for every new image URL. */
  protected readonly failed = linkedSignal({ source: this.imageUrl, computation: () => false });
  protected readonly src = computed(() =>
    this.imageUrl() && !this.failed() ? this.imageUrl() : POKEBALL_IMAGE_URL,
  );
  protected readonly alt = computed(() =>
    this.src() === POKEBALL_IMAGE_URL ? 'Poké Ball (no image)' : this.name() || 'Pokémon image',
  );
  protected readonly dimension = computed(() => String(this.size()));
}
