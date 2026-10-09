import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Tag, TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonSprite } from '../pokemon-sprite/pokemon-sprite';

/** Tag colour per type so types can be told apart at a glance; unlisted types are grey. */
const TYPE_SEVERITIES: Record<string, Tag['severity']> = {
  Bug: 'success',
  Grass: 'success',
  Water: 'info',
  Flying: 'info',
  Fire: 'danger',
  Fairy: 'danger',
  Electric: 'warn',
  Ground: 'warn',
  Poison: 'contrast',
  Normal: 'secondary',
};

@Component({
  selector: 'app-pokemon-table',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    MultiSelectModule,
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

  readonly create = output();
  readonly edit = output<Pokemon>();
  readonly remove = output<Pokemon>();

  protected readonly types = POKEMON_TYPES;
  protected readonly typeSeverities = TYPE_SEVERITIES;

  // The MultiSelect clear button writes null.
  protected readonly typeFilter = new FormControl<string[] | null>([]);
  private readonly selectedTypes = toSignal(this.typeFilter.valueChanges, {
    initialValue: this.typeFilter.value,
  });

  /** Pokémon having at least one of the selected types; always a new array, as p-table sorts in place. */
  protected readonly filteredPokemons = computed(() => {
    const selected = this.selectedTypes() ?? [];
    const pokemons = this.pokemons();
    return selected.length
      ? pokemons.filter((pokemon) => pokemon.types.some((type) => selected.includes(type)))
      : [...pokemons];
  });

  /** Index of the first visible row: back to the first page whenever the type filter changes. */
  protected readonly first = linkedSignal({ source: this.selectedTypes, computation: () => 0 });

  protected readonly trackById = (_index: number, pokemon: Pokemon) => pokemon.id;
}
