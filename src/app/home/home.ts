import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { FluidModule } from 'primeng/fluid';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { POKEMON_MOVES, POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { ThemeService } from '../theme/theme.service';

const PLACEHOLDER_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
const MAX_IMAGE_SIZE_MB = 5;

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    FileUploadModule,
    FluidModule,
    ImageModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    ToolbarModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  protected readonly themeService = inject(ThemeService);

  protected readonly types = POKEMON_TYPES;
  protected readonly placeholderImageUrl = PLACEHOLDER_IMAGE_URL;
  protected readonly maxImageSize = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  // PrimeNG's default detail prints the limit with three decimals ("5.000 MB").
  protected readonly maxImageSizeDetail = `maximum upload size is ${MAX_IMAGE_SIZE_MB} MB.`;
  protected readonly today = new Date();

  protected readonly typeFilter = signal<string[]>([]);
  protected readonly first = signal(0);
  /**
   * Pokémon with at least one of the selected types. Always a new array:
   * p-table sorts its value in place and must not reorder the service state.
   */
  protected readonly pokemons = computed(() => {
    const types = this.typeFilter();
    return this.pokemonService
      .pokemons()
      .filter((pokemon) => !types.length || pokemon.types.some((type) => types.includes(type)));
  });

  protected readonly dialogVisible = signal(false);
  protected readonly editedId = signal<number | null>(null);
  protected readonly imageUrl = signal('');
  protected readonly moveSuggestions = signal<string[]>([]);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: [[] as string[], Validators.required],
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
    capturedAt: [null as Date | null, Validators.required],
    favorite: false,
    moves: [[] as string[], Validators.maxLength(4)],
  });

  protected filterByTypes(types: string[] | null): void {
    this.typeFilter.set(types ?? []);
    this.first.set(0);
  }

  protected openDialog(pokemon?: Pokemon): void {
    this.editedId.set(pokemon?.id ?? null);
    this.form.reset(
      pokemon && {
        name: pokemon.name,
        types: [...pokemon.types],
        level: pokemon.level,
        capturedAt: toLocalDate(pokemon.capturedAt),
        favorite: pokemon.favorite,
        moves: [...pokemon.moves],
      },
    );
    this.imageUrl.set(pokemon?.imageUrl ?? '');
    this.dialogVisible.set(true);
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    const term = query.trim().toLowerCase();
    const selected = this.form.controls.moves.value.map((move) => move.toLowerCase());
    const matches = POKEMON_MOVES.filter(
      (move) => move.toLowerCase().includes(term) && !selected.includes(move.toLowerCase()),
    );
    // Moves missing from POKEMON_MOVES are allowed: the typed text is offered as the last suggestion.
    const isNewMove =
      term !== '' &&
      !selected.includes(term) &&
      !POKEMON_MOVES.some((move) => move.toLowerCase() === term);
    this.moveSuggestions.set(isNewMove ? [...matches, query.trim()] : matches);
  }

  protected onImageUpload({ files: [file] }: FileUploadHandlerEvent): void {
    const reader = new FileReader();
    reader.onload = () => this.imageUrl.set(reader.result as string);
    reader.onerror = () =>
      this.messageService.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: `${file.name} could not be read.`,
      });
    reader.readAsDataURL(file);
  }

  protected save(): void {
    const { name, types, level, capturedAt, favorite, moves } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }

    const pokemon: Omit<Pokemon, 'id'> = {
      name: name.trim(),
      types,
      level,
      capturedAt: toUtcDate(capturedAt),
      favorite,
      moves,
      imageUrl: this.imageUrl(),
    };
    const id = this.editedId();
    if (id === null) {
      this.pokemonService.create(pokemon);
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon created',
        detail: `${pokemon.name} was added to your Pokédex.`,
      });
    } else {
      this.pokemonService.update({ ...pokemon, id });
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon updated',
        detail: `${pokemon.name} was saved.`,
      });
    }
    this.dialogVisible.set(false);
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      // The header is rendered as text, whereas the message is rendered as HTML.
      header: `Delete ${pokemon.name}?`,
      message: 'This Pokémon will be permanently removed from your Pokédex.',
      icon: 'pi pi-exclamation-triangle',
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

// Capture dates are calendar days stored at UTC midnight, like `new Date('2025-01-14')` in the
// seed data, while the date picker works with local dates: convert on the way in and out.
function toLocalDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
