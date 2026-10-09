import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
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

/** Table filter match mode: keeps the Pokémon having at least one of the selected types. */
const HAS_ANY_TYPE = 'hasAnyType';

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
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly placeholderImageUrl = PLACEHOLDER_IMAGE_URL;
  protected readonly hasAnyType = HAS_ANY_TYPE;
  protected readonly types = POKEMON_TYPES;
  protected readonly today = startOfToday();
  protected readonly theme = inject(ThemeService);

  // p-table sorts its value in place: give it a copy so the service state is never mutated.
  protected readonly pokemons = computed(() => [...this.pokemonService.pokemons()]);
  protected readonly typeFilter = signal<string[] | null>(null);

  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Pokemon | null>(null);
  protected readonly dialogHeader = computed(() => {
    const editing = this.editing();
    return editing ? `Edit ${editing.name}` : 'New Pokémon';
  });
  protected readonly submitted = signal(false);
  // Outside the form: it is set asynchronously by FileReader, and a signal re-renders the preview.
  protected readonly imageUrl = signal('');
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: [[] as string[], Validators.required],
    level: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    capturedAt: this.formBuilder.control<Date | null>(null, Validators.required),
    favorite: false,
    moves: [[] as string[]],
  });

  constructor() {
    inject(FilterService).register(
      HAS_ANY_TYPE,
      (types: string[], selected: string[] | null): boolean =>
        !selected?.length || selected.some((type) => types.includes(type)),
    );
  }

  protected openDialog(pokemon?: Pokemon): void {
    this.editing.set(pokemon ?? null);
    this.form.reset({
      name: pokemon?.name ?? '',
      types: [...(pokemon?.types ?? [])],
      level: pokemon?.level ?? null,
      capturedAt: pokemon ? new Date(pokemon.capturedAt) : startOfToday(),
      favorite: pokemon?.favorite ?? false,
      moves: [...(pokemon?.moves ?? [])],
    });
    this.imageUrl.set(pokemon?.imageUrl ?? '');
    this.submitted.set(false);
    this.dialogVisible.set(true);
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || this.submitted());
  }

  protected searchMoves({ query }: AutoCompleteCompleteEvent): void {
    const typed = query.trim();
    const term = typed.toLowerCase();
    const selected = this.form.controls.moves.value;
    const suggestions = POKEMON_MOVES.filter(
      (move) => !selected.includes(move) && move.toLowerCase().includes(term),
    );
    // Suggestions come from POKEMON_MOVES, but a move missing from the list can still be added.
    const known = [...POKEMON_MOVES, ...selected].some((move) => move.toLowerCase() === term);
    this.moveSuggestions.set(typed && !known ? [...suggestions, typed] : suggestions);
  }

  protected isNewMove(move: string): boolean {
    return !POKEMON_MOVES.includes(move);
  }

  protected async onImageUpload({ files }: FileUploadHandlerEvent): Promise<void> {
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
    this.submitted.set(true);
    const { name, types, level, capturedAt, favorite, moves } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      return;
    }

    const pokemon = {
      name: name.trim(),
      types,
      level,
      capturedAt,
      favorite,
      moves,
      imageUrl: this.imageUrl(),
    };
    const editing = this.editing();
    if (editing) {
      this.pokemonService.update({ ...pokemon, id: editing.id });
    } else {
      this.pokemonService.create(pokemon);
    }

    this.messageService.add({
      severity: 'success',
      summary: editing ? 'Pokémon updated' : 'Pokémon created',
      detail: `${pokemon.name} has been saved.`,
    });
    this.dialogVisible.set(false);
  }

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Are you sure you want to delete ${pokemon.name}?`,
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      accept: () => {
        this.pokemonService.delete(pokemon.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Pokémon deleted',
          detail: `${pokemon.name} has been removed.`,
        });
      },
    });
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
