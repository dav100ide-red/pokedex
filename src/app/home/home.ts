import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { ThemeService } from '../theme/theme.service';
import { POKEMON_PLACEHOLDER_IMAGE, TYPE_TAG_STYLES } from './pokemon-display';
import { PokemonFormDialog } from './pokemon-form-dialog/pokemon-form-dialog';

/** Table match mode keeping the Pokémon that have at least one of the selected types. */
const HAS_ANY_TYPE = 'hasAnyType';

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    ImageModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    ToolbarModule,
    TooltipModule,
    PokemonFormDialog,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly theme = inject(ThemeService);

  // p-table sorts its value in place: give it a copy so the service state is never mutated.
  protected readonly pokemons = computed(() => [...this.pokemonService.pokemons()]);
  protected readonly types = POKEMON_TYPES;
  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly typeTagStyles = TYPE_TAG_STYLES;
  protected readonly placeholderImage = POKEMON_PLACEHOLDER_IMAGE;

  constructor() {
    inject(FilterService).register(HAS_ANY_TYPE, (types: string[], selected: string[]) =>
      selected.some((type) => types.includes(type)),
    );
  }

  protected filterByTypes(table: Table, types: string[] | null): void {
    table.filter(types, 'types', HAS_ANY_TYPE);
  }

  protected create(pokemon: Omit<Pokemon, 'id'>): void {
    const created = this.pokemonService.create(pokemon);
    this.messageService.add({
      severity: 'success',
      summary: 'Pokémon created',
      detail: `${created.name} was added to your Pokédex.`,
    });
  }

  protected update(pokemon: Pokemon): void {
    this.pokemonService.update(pokemon);
    this.messageService.add({
      severity: 'success',
      summary: 'Pokémon updated',
      detail: `${pokemon.name} was saved.`,
    });
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Are you sure you want to delete ${pokemon.name}? This cannot be undone.`,
      defaultFocus: 'reject',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      accept: () => {
        this.pokemonService.delete(pokemon.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Pokémon deleted',
          detail: `${pokemon.name} was removed from your Pokédex.`,
        });
      },
    });
  }
}
