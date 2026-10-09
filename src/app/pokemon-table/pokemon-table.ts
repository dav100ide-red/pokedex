import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonSprite } from '../pokemon-sprite/pokemon-sprite';

@Component({
  selector: 'app-pokemon-table',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    PokemonSprite,
  ],
  templateUrl: './pokemon-table.html',
  styleUrl: './pokemon-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonTable {
  readonly pokemons = input.required<Pokemon[]>();
  readonly edit = output<Pokemon>();
  readonly remove = output<Pokemon>();

  protected readonly types = POKEMON_TYPES;
  protected readonly typeFilter = signal<string | null>(null);
  /** Index of the first row of the current page. */
  protected readonly first = signal(0);

  /** A new array every time, because p-table sorts its value in place (never the service's). */
  protected readonly rows = computed(() => {
    const type = this.typeFilter();
    const pokemons = this.pokemons();
    return type ? pokemons.filter((pokemon) => pokemon.types.includes(type)) : [...pokemons];
  });

  /** Keeps row elements stable across updates, so focus can return to a row's Edit button. */
  protected readonly trackById = (_index: number, pokemon: Pokemon) => pokemon.id;

  protected filterByType(type: string | null): void {
    this.typeFilter.set(type);
    this.first.set(0);
  }
}
