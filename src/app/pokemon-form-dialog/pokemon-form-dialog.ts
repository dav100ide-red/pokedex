import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { POKEMON_MOVES, POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonSprite } from '../pokemon-sprite/pokemon-sprite';
import { injectFocusReturn } from '../shared/focus-return';

/** What the form produces: a Pokémon without its id, which PokemonService assigns on create. */
export type PokemonDraft = Omit<Pokemon, 'id'>;

const DEFAULT_LEVEL = 5;
const MAX_IMAGE_MB = 2;

const notBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

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
  /** Pokémon to edit, or null to create a new one. */
  readonly pokemon = input<Pokemon | null>(null);
  readonly save = output<PokemonDraft>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly imageUpload = viewChild.required(FileUpload);
  protected readonly focusReturn = injectFocusReturn();

  protected readonly types = POKEMON_TYPES;
  protected readonly maxImageMb = MAX_IMAGE_MB;
  protected readonly header = computed(() => {
    const pokemon = this.pokemon();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });
  protected readonly moveSuggestions = signal<string[]>([]);
  /** Kept out of the form: it is set by the file upload, not typed into a control. */
  protected readonly imageUrl = signal('');
  /** Latest selectable capture date. */
  protected readonly today = signal(startOfToday());

  // MultiSelect and AutoComplete write null when they are cleared.
  protected readonly form = this.fb.group({
    name: this.fb.control('', [notBlank, Validators.maxLength(30)]),
    types: this.fb.control<string[] | null>([], Validators.required),
    level: this.fb.control<number | null>(DEFAULT_LEVEL, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    capturedAt: this.fb.control<Date | null>(null, Validators.required),
    favorite: this.fb.control(false),
    moves: this.fb.control<string[] | null>([]),
  });

  constructor() {
    // Load the Pokémon being edited, or a blank form, each time the dialog opens.
    effect(() => {
      if (this.visible()) {
        const pokemon = this.pokemon();
        untracked(() => this.reset(pokemon));
      }
    });
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    const term = query.trim().toLowerCase();
    const selected = this.form.controls.moves.value ?? [];
    this.moveSuggestions.set(
      POKEMON_MOVES.filter((move) => !selected.includes(move) && move.toLowerCase().includes(term)),
    );
  }

  protected async onImageUpload({ files }: FileUploadHandlerEvent): Promise<void> {
    const [file] = files;
    if (file) {
      this.imageUrl.set(await readAsDataUrl(file));
    }
  }

  protected removeImage(): void {
    this.imageUrl.set('');
  }

  protected submit(): void {
    const { name, types, level, capturedAt, favorite, moves } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit({
      name: name.trim(),
      types: types ?? [],
      level,
      capturedAt,
      favorite,
      moves: moves ?? [],
      imageUrl: this.imageUrl(),
    });
  }

  private reset(pokemon: Pokemon | null): void {
    this.focusReturn.capture();
    this.today.set(startOfToday());
    this.form.reset({
      name: pokemon?.name ?? '',
      types: [...(pokemon?.types ?? [])],
      level: pokemon?.level ?? DEFAULT_LEVEL,
      capturedAt: pokemon ? new Date(pokemon.capturedAt) : startOfToday(),
      favorite: pokemon?.favorite ?? false,
      moves: [...(pokemon?.moves ?? [])],
    });
    this.imageUrl.set(pokemon?.imageUrl ?? '');
    this.moveSuggestions.set([]);
    // Drop any "invalid file" message left over from the previous opening.
    this.imageUpload().clear();
  }
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
