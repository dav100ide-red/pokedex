import { Pipe, PipeTransform } from '@angular/core';

export const POKE_BALL_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

/** Resolves the image to display for a Pokémon, falling back to a Poké Ball when it has none. */
@Pipe({ name: 'pokemonImage' })
export class PokemonImagePipe implements PipeTransform {
  transform(imageUrl: string | null | undefined): string {
    return imageUrl || POKE_BALL_IMAGE_URL;
  }
}
