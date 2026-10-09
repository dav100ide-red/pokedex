import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { PokemonDraft, PokemonFormDialog } from '../pokemon-form-dialog/pokemon-form-dialog';
import { PokemonTable } from '../pokemon-table/pokemon-table';
import { injectFocusReturn } from '../shared/focus-return';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-home',
  imports: [
    CardModule,
    ConfirmDialogModule,
    ToastModule,
    PokemonFormDialog,
    PokemonTable,
    ThemeToggle,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  protected readonly confirmFocusReturn = injectFocusReturn();

  protected readonly pokemons = this.pokemonService.pokemons;
  protected readonly dialogVisible = signal(false);
  /** Pokémon open in the dialog; null when creating a new one. */
  protected readonly editedPokemon = signal<Pokemon | null>(null);

  protected openCreateDialog(): void {
    this.editedPokemon.set(null);
    this.dialogVisible.set(true);
  }

  protected openEditDialog(pokemon: Pokemon): void {
    this.editedPokemon.set(pokemon);
    this.dialogVisible.set(true);
  }

  protected savePokemon(draft: PokemonDraft): void {
    const edited = this.editedPokemon();
    if (edited) {
      this.pokemonService.update({ ...draft, id: edited.id });
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon updated',
        detail: `${draft.name} has been saved.`,
      });
    } else {
      const created = this.pokemonService.create(draft);
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon created',
        detail: `${created.name} has been added to your Pokédex.`,
      });
    }
    this.dialogVisible.set(false);
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmFocusReturn.capture();
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Delete ${pokemon.name}? This cannot be undone.`,
      defaultFocus: 'reject',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      accept: () => {
        this.pokemonService.delete(pokemon.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Pokémon deleted',
          detail: `${pokemon.name} has been removed from your Pokédex.`,
        });
      },
    });
  }
}
