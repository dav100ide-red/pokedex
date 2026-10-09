import { Component, computed, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { POKEMON_MOVES, POKEMON_TYPES } from '../../data/pokemon.data';
import { Pokemon } from '../../data/pokemon.model';
import { POKEMON_PLACEHOLDER_IMAGE } from '../pokemon-display';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

@Component({
  selector: 'app-pokemon-form-dialog',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    FileUploadModule,
    ImageModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ToggleSwitchModule,
  ],
  templateUrl: './pokemon-form-dialog.html',
  styleUrl: './pokemon-form-dialog.scss',
})
export class PokemonFormDialog {
  readonly created = output<Omit<Pokemon, 'id'>>();
  readonly updated = output<Pokemon>();

  protected readonly types = POKEMON_TYPES;
  protected readonly placeholderImage = POKEMON_PLACEHOLDER_IMAGE;
  protected readonly maxImageSize = MAX_IMAGE_SIZE;

  protected readonly visible = signal(false);
  protected readonly today = signal(new Date());
  protected readonly editedPokemon = signal<Pokemon | null>(null);
  protected readonly title = computed(() => {
    const pokemon = this.editedPokemon();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });
  protected readonly imageUrl = signal('');
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: [[] as string[], Validators.required],
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
    capturedAt: [null as Date | null, Validators.required],
    favorite: false,
    moves: [[] as string[]],
  });

  /**
   * Bumped whenever the image changes (new upload, removal, dialog reopened),
   * so a file read that completes late is ignored instead of overwriting it.
   */
  private imageReadId = 0;

  /** Opens the dialog pre-filled with `pokemon`, or empty to create a new one. */
  open(pokemon?: Pokemon): void {
    this.editedPokemon.set(pokemon ?? null);
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
    this.imageReadId++;
    this.today.set(new Date());
    this.visible.set(true);
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected isKnownMove(move: string): boolean {
    return POKEMON_MOVES.includes(move);
  }

  /** Suggests matching moves; an unknown query is offered last so new moves can be added too. */
  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    const search = query.trim().toLowerCase();
    const selected = this.form.controls.moves.value.map((move) => move.toLowerCase());
    const matches = POKEMON_MOVES.filter(
      (move) => move.toLowerCase().includes(search) && !selected.includes(move.toLowerCase()),
    );
    const isNewMove =
      search !== '' &&
      !selected.includes(search) &&
      !POKEMON_MOVES.some((move) => move.toLowerCase() === search);
    this.moveSuggestions.set(isNewMove ? [...matches, query.trim()] : matches);
  }

  /** There is no backend: the image is kept as a data URL. */
  protected onImageUpload({ files }: FileUploadHandlerEvent): void {
    const readId = ++this.imageReadId;
    const reader = new FileReader();
    reader.onload = () => {
      if (readId === this.imageReadId) {
        this.imageUrl.set(reader.result as string);
      }
    };
    reader.readAsDataURL(files[0]);
  }

  protected removeImage(): void {
    this.imageReadId++;
    this.imageUrl.set('');
  }

  protected save(): void {
    const { name, level, capturedAt, ...rest } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }

    const pokemon = {
      ...rest,
      name: name.trim(),
      level,
      capturedAt: toUtcDate(capturedAt),
      imageUrl: this.imageUrl(),
    };
    const edited = this.editedPokemon();
    if (edited) {
      this.updated.emit({ ...pokemon, id: edited.id });
    } else {
      this.created.emit(pokemon);
    }
    this.visible.set(false);
  }
}

// Capture dates are calendar days stored at UTC midnight, like the seed data
// (`new Date('2025-01-14')`), while the date picker works with local dates.

function toLocalDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
