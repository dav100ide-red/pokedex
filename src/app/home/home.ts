import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Image } from 'primeng/image';
import { MultiSelect } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Toolbar } from 'primeng/toolbar';
import { Tooltip } from 'primeng/tooltip';
import { POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { POKEBALL_IMAGE_URL, PokemonSprite } from '../shared/pokemon-sprite';
import { PokemonTypeTag } from '../shared/pokemon-type-tag';
import { ThemeService } from '../theme.service';
import { PokemonFormDialog } from './pokemon-form-dialog/pokemon-form-dialog';

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    FormsModule,
    Button,
    Card,
    ConfirmDialog,
    Image,
    MultiSelect,
    TableModule,
    Toast,
    ToggleSwitch,
    Toolbar,
    Tooltip,
    PokemonFormDialog,
    PokemonSprite,
    PokemonTypeTag,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly formDialog = viewChild.required(PokemonFormDialog);

  protected readonly theme = inject(ThemeService);
  protected readonly logoUrl = POKEBALL_IMAGE_URL;
  protected readonly types = POKEMON_TYPES;
  /** Types picked in the filter: a Pokémon is listed when it has at least one of them. */
  protected readonly selectedTypes = signal<string[]>([]);
  /** Always a new array, as p-table sorts its value in place: the service state stays untouched. */
  protected readonly pokemons = computed(() => {
    const types = this.selectedTypes();
    const pokemons = this.pokemonService.pokemons();
    return types.length > 0
      ? pokemons.filter((pokemon) => pokemon.types.some((type) => types.includes(type)))
      : [...pokemons];
  });
  /** Index of the first row of the current page, back to the first page when the filter changes. */
  protected readonly first = linkedSignal({ source: this.selectedTypes, computation: () => 0 });

  protected openNew(): void {
    this.formDialog().open();
  }

  protected openEdit(pokemon: Pokemon): void {
    this.formDialog().open(pokemon);
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Are you sure you want to delete ${pokemon.name}? This cannot be undone.`,
      acceptButtonProps: { label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      defaultFocus: 'reject',
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
