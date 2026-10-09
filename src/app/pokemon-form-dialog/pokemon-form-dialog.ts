import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompletePassThrough,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule, MultiSelectPassThrough } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { POKEMON_MOVES, POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonSprite } from '../pokemon-sprite/pokemon-sprite';

/** What the form produces: a Pokémon without its id, as expected by `PokemonService.create`. */
export type PokemonDraft = Omit<Pokemon, 'id'>;

const MAX_TYPES = 2;
const MAX_MOVES = 4;
/** Enough to pick from while typing, and short enough for the list to never need scrolling. */
const MAX_MOVE_SUGGESTIONS = 10;
/** Images are kept in memory as data URLs, so their size is capped. */
const MAX_IMAGE_BYTES = 1024 * 1024;

@Component({
  selector: 'app-pokemon-form-dialog',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    FileUploadModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ToggleSwitchModule,
    PokemonSprite,
  ],
  templateUrl: './pokemon-form-dialog.html',
  styleUrl: './pokemon-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonFormDialog {
  readonly visible = model(false);
  /** Pokémon to edit; `null` opens an empty form to create a new one. */
  readonly pokemon = input<Pokemon | null>(null);
  readonly save = output<PokemonDraft>();
  /** Emitted once the dialog has finished hiding. */
  readonly closed = output();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  /** Overlays open inside this component (within <main>) rather than at the end of <body>. */
  protected readonly overlayHost = inject(ElementRef);
  /**
   * PrimeNG renders the chips of a multiple AutoComplete as listbox options that contain the text
   * input and the chip remove buttons (nested interactive controls). Plain list semantics avoid it.
   */
  protected readonly movesPt: AutoCompletePassThrough = {
    inputMultiple: { role: null, 'aria-orientation': null, 'aria-label': 'Selected moves' },
    chipItem: { role: null, 'aria-selected': null },
    inputChip: { role: null },
  };
  /**
   * Each MultiSelect option is a listbox option holding a (transparent, focusable) checkbox input.
   * The visible box is drawn separately and the option itself handles clicks, so the input can go.
   */
  protected readonly typesPt: MultiSelectPassThrough = {
    pcOptionCheckbox: { input: { style: { display: 'none' } } },
  };

  protected readonly types = POKEMON_TYPES;
  protected readonly maxTypes = MAX_TYPES;
  protected readonly maxMoves = MAX_MOVES;
  protected readonly maxImageBytes = MAX_IMAGE_BYTES;
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: this.formBuilder.control<string[]>([], Validators.required),
    level: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    capturedAt: this.formBuilder.control<Date | null>(null, [Validators.required, notInFuture]),
    favorite: false,
    moves: this.formBuilder.control<string[]>([], Validators.maxLength(MAX_MOVES)),
    imageUrl: '',
  });

  /** The image control has no input bound to it, so the preview follows it through a signal. */
  protected readonly imageUrl = toSignal(this.form.controls.imageUrl.valueChanges, {
    initialValue: this.form.controls.imageUrl.value,
  });

  protected readonly header = computed(() => {
    const pokemon = this.pokemon();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });

  constructor() {
    // Every time the dialog opens, start from an empty form (create) or the current values (edit).
    effect(() => {
      if (this.visible()) {
        const pokemon = this.pokemon();
        untracked(() => this.form.reset(toFormValue(pokemon)));
      }
    });
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  protected searchMoves(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    const selected = this.form.controls.moves.value;
    this.moveSuggestions.set(
      POKEMON_MOVES.filter(
        (move) => !selected.includes(move) && move.toLowerCase().includes(query),
      ).slice(0, MAX_MOVE_SUGGESTIONS),
    );
  }

  /** There is no backend: the chosen file is read locally and stored as a data URL. */
  protected readImage(event: FileUploadHandlerEvent, uploader: FileUpload): void {
    const [file] = event.files;
    uploader.clear();
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.form.controls.imageUrl.setValue(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  protected removeImage(): void {
    this.form.controls.imageUrl.setValue('');
  }

  protected submit(): void {
    const { name, level, capturedAt, ...rest } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit({ ...rest, name: name.trim(), level, capturedAt });
  }
}

/** A Pokémon cannot have been captured after today. */
function notInFuture(control: AbstractControl<Date | null>): ValidationErrors | null {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return control.value && control.value > endOfToday ? { future: true } : null;
}

/** Fresh arrays and dates, so editing never mutates the Pokémon held by the service. */
function toFormValue(pokemon: Pokemon | null) {
  return {
    name: pokemon?.name ?? '',
    types: [...(pokemon?.types ?? [])],
    level: pokemon?.level ?? null,
    capturedAt: pokemon ? new Date(pokemon.capturedAt) : null,
    favorite: pokemon?.favorite ?? false,
    moves: [...(pokemon?.moves ?? [])],
    imageUrl: pokemon?.imageUrl ?? '',
  };
}
