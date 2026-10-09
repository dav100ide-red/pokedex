import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
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
import { POKE_BALL_IMAGE_URL, PokemonImagePipe } from '../shared/pokemon-image.pipe';
import { ThemeService } from '../theme.service';
import { PokemonFormDialog } from './pokemon-form-dialog/pokemon-form-dialog';

/** Custom table filter: keeps the Pokémon having at least one of the selected types. */
const HAS_ANY_TYPE = 'hasAnyType';

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
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
    PokemonImagePipe,
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
  protected readonly logoUrl = POKE_BALL_IMAGE_URL;
  // The table sorts its value in place, so it gets a copy rather than the service state.
  protected readonly pokemons = computed(() => [...this.pokemonService.pokemons()]);
  protected readonly types = POKEMON_TYPES;

  constructor() {
    inject(FilterService).register(
      HAS_ANY_TYPE,
      (pokemonTypes: string[], selectedTypes: string[] | null) =>
        !selectedTypes?.length || pokemonTypes.some((type) => selectedTypes.includes(type)),
    );
  }

  protected filterByType(table: Table, types: string[] | null): void {
    table.filter(types, 'types', HAS_ANY_TYPE);
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Are you sure you want to delete ${pokemon.name}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      accept: () => {
        this.pokemonService.delete(pokemon.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Pokémon deleted',
          detail: `${pokemon.name} has been removed from your Pokédex.`,
        });
      },
    });
  }
}
