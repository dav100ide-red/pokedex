import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
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
import { AutoCompleteCompleteEvent } from 'primeng/types/autocomplete';
import { FileUploadHandlerEvent } from 'primeng/types/fileupload';
import { POKEMON_MOVES, POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { ThemeService } from '../theme/theme.service';

const PLACEHOLDER_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

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
  providers: [ConfirmationService, MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly theme = inject(ThemeService);

  protected readonly types = POKEMON_TYPES;
  protected readonly placeholderImageUrl = PLACEHOLDER_IMAGE_URL;
  protected readonly maxImageSize = MAX_IMAGE_SIZE;
  protected readonly today = new Date();
  protected readonly imageStyle = { objectFit: 'contain' };

  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly first = signal(0);

  // Always a new array: p-table sorts its value in place, which must not reorder the service state.
  protected readonly pokemons = computed(() => {
    const selectedTypes = this.selectedTypes();
    return this.pokemonService
      .pokemons()
      .filter(
        (pokemon) =>
          selectedTypes.length === 0 || pokemon.types.some((type) => selectedTypes.includes(type)),
      );
  });

  protected readonly dialogVisible = signal(false);
  protected readonly editedPokemon = signal<Pokemon | null>(null);
  protected readonly dialogHeader = computed(() => {
    const pokemon = this.editedPokemon();
    return pokemon ? `Edit ${pokemon.name}` : 'New Pokémon';
  });
  protected readonly imageUrl = signal('');
  protected readonly moveSuggestions = signal<string[]>([]);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    types: this.formBuilder.control<string[]>([], Validators.required),
    level: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    capturedAt: this.formBuilder.control<Date | null>(null, Validators.required),
    favorite: false,
    moves: this.formBuilder.control<string[]>([]),
  });

  protected filterByTypes(types: string[] | null): void {
    this.selectedTypes.set(types ?? []);
    this.first.set(0);
  }

  protected openNew(): void {
    this.editedPokemon.set(null);
    this.form.reset();
    this.imageUrl.set('');
    this.dialogVisible.set(true);
  }

  protected openEdit(pokemon: Pokemon): void {
    this.editedPokemon.set(pokemon);
    this.form.reset({
      name: pokemon.name,
      types: [...pokemon.types],
      level: pokemon.level,
      capturedAt: new Date(pokemon.capturedAt),
      favorite: pokemon.favorite,
      moves: [...pokemon.moves],
    });
    this.imageUrl.set(pokemon.imageUrl);
    this.dialogVisible.set(true);
  }

  protected searchMoves(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    const selectedMoves = this.form.controls.moves.value;
    this.moveSuggestions.set(
      POKEMON_MOVES.filter(
        (move) => !selectedMoves.includes(move) && move.toLowerCase().includes(query),
      ),
    );
  }

  protected uploadImage(event: FileUploadHandlerEvent, uploader: FileUpload): void {
    const [file] = event.files;
    uploader.clear();

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
    const { name, level, capturedAt, ...values } = this.form.getRawValue();
    if (this.form.invalid || level === null || capturedAt === null) {
      this.form.markAllAsTouched();
      return;
    }

    const pokemon = { ...values, name: name.trim(), level, capturedAt, imageUrl: this.imageUrl() };
    const editedPokemon = this.editedPokemon();
    if (editedPokemon) {
      this.pokemonService.update({ ...pokemon, id: editedPokemon.id });
      this.notify('Pokémon updated', `${pokemon.name} has been saved.`);
    } else {
      this.pokemonService.create(pokemon);
      this.notify('Pokémon created', `${pokemon.name} has been added to the Pokédex.`);
    }
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
        this.notify('Pokémon deleted', `${pokemon.name} has been removed from the Pokédex.`);
      },
    });
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  private notify(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }
}
