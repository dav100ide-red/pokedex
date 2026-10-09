import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
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
import { PokemonService } from '../../data/pokemon.service';
import { PokemonImagePipe } from '../../shared/pokemon-image.pipe';

const MIN_LEVEL = 1;
const MAX_LEVEL = 100;
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
    PokemonImagePipe,
  ],
  templateUrl: './pokemon-form-dialog.html',
  styleUrl: './pokemon-form-dialog.scss',
})
export class PokemonFormDialog {
  private readonly pokemonService = inject(PokemonService);
  private readonly messageService = inject(MessageService);

  protected readonly types = POKEMON_TYPES;
  protected readonly minLevel = MIN_LEVEL;
  protected readonly maxLevel = MAX_LEVEL;
  protected readonly maxImageSize = MAX_IMAGE_SIZE;
  protected readonly today = new Date();

  protected readonly visible = signal(false);
  /** The Pokémon being edited, or null when creating a new one. */
  protected readonly pokemon = signal<Pokemon | null>(null);
  protected readonly header = computed(() => {
    const pokemon = this.pokemon();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });
  /** Kept outside the form: it is set asynchronously by the file reader, not by a form control. */
  protected readonly imageUrl = signal('');
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: [[] as string[], Validators.required],
    level: [
      null as number | null,
      [Validators.required, Validators.min(MIN_LEVEL), Validators.max(MAX_LEVEL)],
    ],
    capturedAt: [null as Date | null, Validators.required],
    favorite: [false],
    moves: [[] as string[]],
  });

  /** Opens the dialog pre-filled with the given Pokémon, or empty to create a new one. */
  open(pokemon?: Pokemon): void {
    this.pokemon.set(pokemon ?? null);
    this.imageUrl.set(pokemon?.imageUrl ?? '');
    this.form.reset(
      pokemon
        ? {
            name: pokemon.name,
            types: [...pokemon.types],
            level: pokemon.level,
            capturedAt: new Date(pokemon.capturedAt),
            favorite: pokemon.favorite,
            moves: [...pokemon.moves],
          }
        : undefined,
    );
    this.visible.set(true);
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    const term = query.trim().toLowerCase();
    const selected = this.form.controls.moves.value;
    this.moveSuggestions.set(
      POKEMON_MOVES.filter((move) => !selected.includes(move) && move.toLowerCase().includes(term)),
    );
  }

  protected async onImageSelected({ files }: FileUploadHandlerEvent): Promise<void> {
    const [file] = files;
    if (!file) {
      return;
    }
    try {
      this.imageUrl.set(await readAsDataUrl(file));
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: `${file.name} could not be read.`,
      });
    }
  }

  protected save(): void {
    const { name, types, level, capturedAt, favorite, moves } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }

    const data = {
      name: name.trim(),
      types,
      level,
      capturedAt,
      favorite,
      moves,
      imageUrl: this.imageUrl(),
    };
    const edited = this.pokemon();
    if (edited) {
      this.pokemonService.update({ ...data, id: edited.id });
    } else {
      this.pokemonService.create(data);
    }

    this.messageService.add({
      severity: 'success',
      summary: edited ? 'Pokémon updated' : 'Pokémon created',
      detail: edited
        ? `${data.name} has been saved.`
        : `${data.name} has been added to your Pokédex.`,
    });
    this.visible.set(false);
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
