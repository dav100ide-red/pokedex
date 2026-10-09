import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { AutoCompleteCompleteEvent } from 'primeng/types/autocomplete';
import { FileUploadHandlerEvent } from 'primeng/types/fileupload';
import { POKEMON_MOVES, POKEMON_TYPES } from '../../data/pokemon.data';
import { Pokemon } from '../../data/pokemon.model';
import { PokemonService } from '../../data/pokemon.service';
import { PokemonSprite } from '../../shared/pokemon-sprite';
import { PokemonTypeTag } from '../../shared/pokemon-type-tag';

const MAX_TYPES = 2;
const MAX_MOVES = 4;
const MIN_LEVEL = 1;
const MAX_LEVEL = 100;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

interface PokemonForm {
  name: FormControl<string>;
  types: FormControl<string[]>;
  level: FormControl<number | null>;
  capturedAt: FormControl<Date | null>;
  favorite: FormControl<boolean>;
  moves: FormControl<string[]>;
}

@Component({
  selector: 'app-pokemon-form-dialog',
  imports: [
    ReactiveFormsModule,
    AutoComplete,
    Button,
    DatePicker,
    Dialog,
    FileUpload,
    InputNumber,
    InputText,
    Message,
    MultiSelect,
    ToggleSwitch,
    PokemonSprite,
    PokemonTypeTag,
  ],
  templateUrl: './pokemon-form-dialog.html',
  styleUrl: './pokemon-form-dialog.scss',
})
export class PokemonFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly pokemonService = inject(PokemonService);
  private readonly messageService = inject(MessageService);

  protected readonly types = POKEMON_TYPES;
  protected readonly maxTypes = MAX_TYPES;
  protected readonly maxMoves = MAX_MOVES;
  protected readonly minLevel = MIN_LEVEL;
  protected readonly maxLevel = MAX_LEVEL;
  protected readonly maxImageBytes = MAX_IMAGE_BYTES;
  protected readonly today = new Date();

  protected readonly visible = signal(false);
  /** The Pokémon being edited, or null when creating a new one. */
  protected readonly editing = signal<Pokemon | null>(null);
  protected readonly header = computed(() => {
    const pokemon = this.editing();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });
  /** Data URL of an uploaded image, the current image when editing, or '' for none. */
  protected readonly imageUrl = signal('');
  protected readonly imageLoading = signal(false);
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form: FormGroup<PokemonForm> = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.pattern(/\S/)]),
    types: this.fb.control<string[]>([], [Validators.required, Validators.maxLength(MAX_TYPES)]),
    level: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(MIN_LEVEL),
      Validators.max(MAX_LEVEL),
    ]),
    capturedAt: this.fb.control<Date | null>(null, Validators.required),
    favorite: this.fb.control(false),
    moves: this.fb.control<string[]>([], Validators.maxLength(MAX_MOVES)),
  });

  /** Identifies the latest image read, so that a stale result never overwrites a newer choice. */
  private imageRead = 0;

  /** Opens the dialog empty, or pre-filled with the given Pokémon. */
  open(pokemon?: Pokemon): void {
    this.editing.set(pokemon ?? null);
    this.form.reset(
      pokemon && {
        name: pokemon.name,
        types: [...pokemon.types],
        level: pokemon.level,
        capturedAt: toCalendarDate(pokemon.capturedAt),
        favorite: pokemon.favorite,
        moves: [...pokemon.moves],
      },
    );
    this.setImage(pokemon?.imageUrl ?? '');
    this.visible.set(true);
  }

  protected isInvalid(controlName: keyof PokemonForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  protected movesLimitReached(): boolean {
    return this.form.controls.moves.value.length >= MAX_MOVES;
  }

  protected isKnownMove(move: string): boolean {
    return POKEMON_MOVES.includes(move);
  }

  /**
   * Suggests the moves not picked yet that contain the typed text, those starting with it first
   * (the first suggestion is the one Enter picks), plus the typed text itself when it is a new move.
   */
  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    if (this.movesLimitReached()) {
      this.moveSuggestions.set([]);
      return;
    }
    const text = query.trim();
    const term = text.toLowerCase();
    const picked = new Set(this.form.controls.moves.value.map((move) => move.toLowerCase()));
    const startsWithTerm = (move: string) => move.toLowerCase().startsWith(term);
    const matches = POKEMON_MOVES.filter(
      (move) => !picked.has(move.toLowerCase()) && move.toLowerCase().includes(term),
    ).sort((a, b) => Number(startsWithTerm(b)) - Number(startsWithTerm(a)));
    const isNewMove =
      term !== '' &&
      !picked.has(term) &&
      !POKEMON_MOVES.some((move) => move.toLowerCase() === term);
    this.moveSuggestions.set(isNewMove ? [...matches, text] : matches);
  }

  protected async onImageSelected({ files }: FileUploadHandlerEvent): Promise<void> {
    const [file] = files;
    if (!file) {
      return;
    }
    const read = ++this.imageRead;
    this.imageLoading.set(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      if (read === this.imageRead) {
        this.imageUrl.set(dataUrl);
      }
    } catch {
      if (read === this.imageRead) {
        this.messageService.add({
          severity: 'error',
          summary: 'Image not loaded',
          detail: `${file.name} could not be read.`,
        });
      }
    } finally {
      if (read === this.imageRead) {
        this.imageLoading.set(false);
      }
    }
  }

  protected removeImage(): void {
    this.setImage('');
  }

  protected save(): void {
    if (this.form.invalid || this.imageLoading()) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, types, level, capturedAt, favorite, moves } = this.form.getRawValue();
    if (level === null || capturedAt === null) {
      return; // Unreachable: both controls are required.
    }
    const pokemon: Omit<Pokemon, 'id'> = {
      name: name.trim(),
      types,
      level,
      capturedAt: toStoredDate(capturedAt),
      favorite,
      moves,
      imageUrl: this.imageUrl(),
    };

    const editing = this.editing();
    if (editing) {
      this.pokemonService.update({ ...pokemon, id: editing.id });
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon updated',
        detail: `${pokemon.name} has been saved.`,
      });
    } else {
      const created = this.pokemonService.create(pokemon);
      this.messageService.add({
        severity: 'success',
        summary: 'Pokémon created',
        detail: `${created.name} has been added to your Pokédex.`,
      });
    }
    this.visible.set(false);
  }

  /** Sets the image and discards any image read still in progress. */
  private setImage(imageUrl: string): void {
    this.imageRead++;
    this.imageLoading.set(false);
    this.imageUrl.set(imageUrl);
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/*
 * Capture dates are calendar days stored at UTC midnight, like the seed data (`new Date('2025-01-14')`),
 * while the date picker works with local midnight: convert both ways so the day never shifts.
 */
function toCalendarDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toStoredDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
