import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule, ConfirmDialogPassThrough } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { PokemonDraft, PokemonFormDialog } from '../pokemon-form-dialog/pokemon-form-dialog';
import { PokemonTable } from '../pokemon-table/pokemon-table';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
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
  private readonly document = inject(DOCUMENT);

  protected readonly pokemons = this.pokemonService.pokemons;
  protected readonly dialogVisible = signal(false);
  /** Pokémon being edited, or `null` while creating a new one. */
  protected readonly editedPokemon = signal<Pokemon | null>(null);

  /** Accessibility fixes PrimeNG's ConfirmDialog does not expose as inputs. */
  protected readonly confirmDialogPt: ConfirmDialogPassThrough = {
    // The inner <p-dialog> host keeps a stray role="alertdialog"; the rendered dialog has its own.
    host: { role: null },
    // closeAriaLabel is not forwarded to the close button.
    pcCloseButton: { root: { 'aria-label': 'Close' } },
  };

  /** PrimeNG dialogs do not restore focus on close: the element that opened the last one. */
  private focusReturnTarget: HTMLElement | null = null;

  protected openCreate(): void {
    this.rememberFocus();
    this.editedPokemon.set(null);
    this.dialogVisible.set(true);
  }

  protected openEdit(pokemon: Pokemon): void {
    this.rememberFocus();
    this.editedPokemon.set(pokemon);
    this.dialogVisible.set(true);
  }

  protected savePokemon(draft: PokemonDraft): void {
    const edited = this.editedPokemon();
    if (edited) {
      this.pokemonService.update({ ...draft, id: edited.id });
    } else {
      this.pokemonService.create(draft);
    }
    this.dialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: edited ? 'Pokémon updated' : 'Pokémon created',
      detail: edited
        ? `${draft.name} has been updated.`
        : `${draft.name} has been added to your Pokédex.`,
    });
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.rememberFocus();
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Do you really want to delete ${pokemon.name}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
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

  protected restoreFocus(): void {
    if (this.focusReturnTarget?.isConnected) {
      this.focusReturnTarget.focus();
    }
    this.focusReturnTarget = null;
  }

  private rememberFocus(): void {
    const active = this.document.activeElement;
    this.focusReturnTarget = active instanceof HTMLElement ? active : null;
  }
}
