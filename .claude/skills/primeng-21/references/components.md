# PrimeNG 21 (Angular 21) component reference, condensed

Condensed on 2026-10-08 from the official PrimeNG v21 docs, one page per component at `https://v21.primeng.org/<component>.md` (e.g. https://v21.primeng.org/table.md, https://v21.primeng.org/select.md).
Only the import line, selector, key inputs/outputs, template slots and one trimmed example per component are kept; the full page (every demo, pass-through options, CSS classes, design tokens) is at that URL.
Every fact below comes from those pages; where a page has no API table or omits something, the section says so instead of guessing.
Conventions seen in all demos: standalone components importing `XxxModule` from `primeng/xxx`; icons are PrimeIcons classes (`pi pi-check`); slots are `<ng-template #name>` (the `pTemplate="name"` form is deprecated since v20); `styleClass` is marked deprecated on host-element components, use `class`; form controls bind with `[(ngModel)]` (FormsModule) or `formControlName` (ReactiveFormsModule) and most accept `[invalid]`, `[disabled]`, `required`, `name`, `fluid`, `size="small|large"`, `variant="outlined|filled"` (see each section).

## Table
Import: `import { Table, TableModule } from 'primeng/table';` (most demos import only `TableModule`; `Table` is the component class used for `#dt` refs). Event types come from `primeng/api`: `import { TableLazyLoadEvent } from 'primeng/api';` (also `SortEvent`).
Selector `<p-table>`; helpers: `<p-sortIcon field="x" />`, `<p-columnFilter>`, `<p-tableHeaderCheckbox />`, `<p-tableCheckbox [value]="row" />`, `<p-tableRadioButton [value]="row" />`, `<p-cellEditor>`; directives `pSortableColumn`, `pSortableColumnDisabled`, `pSelectableRow`, `pSelectableRowIndex`, `pRowToggler`, `pRowTogglerDisabled`, `pEditableColumn`, `pEditableColumnField`, `pEditableRow`, `pInitEditableRow`, `pSaveEditableRow`, `pCancelEditableRow`, `pEditableRowDisabled`, `pResizableColumn`, `pReorderableColumn`, `pFrozenColumn`, `pRowGroupHeader`, `pContextMenuRow`.
Purpose: displays data in tabular format with paging, sorting, filtering, selection, expansion, editing, lazy loading.
Inputs (by feature):
- Data: `value: RowData[]`; `columns: any[]` (dynamic columns, exposed to templates as `let-columns`); `dataKey: string` (unique row id, needed for selection/expansion/editing); `tableStyle` (inline style of the `<table>`); `loading: boolean = false` (mask); `size: "small" | "large"`; `showGridlines`, `stripedRows`, `rowHover: boolean = false`; `scrollable: boolean = false` + `scrollHeight` (px or `"flex"`); `virtualScroll` + `virtualScrollItemSize: number` (row height px).
- Pagination: `paginator: boolean = false`; `rows: number`; `first: number`; `rowsPerPageOptions: any[]`; `totalRecords: number = 0` (defaults to `value.length`); `showCurrentPageReport: boolean = false`; `currentPageReportTemplate = "{currentPage} of {totalPages}"` (placeholders `{currentPage} {totalPages} {rows} {first} {last} {totalRecords}`); `paginatorPosition: "top" | "bottom" | "both" = bottom`; `alwaysShowPaginator = true`.
- Sorting: `sortMode: "single" | "multiple" = single` (multiple needs metaKey click); `sortField: string`; `sortOrder: number`; `multiSortMeta: SortMeta[]`; `defaultSortOrder = 1`; `resetPageOnSort = true`; `customSort` + `(sortFunction)`.
- Filtering: `filters: { [s: string]: FilterMetadata | FilterMetadata[] } = {}`; `globalFilterFields: string[]`; `filterDelay = 300` ms; `filterLocale`.
- Selection: `selectionMode: "single" | "multiple"`; `[(selection)]` (row in single mode, array in multiple); `metaKeySelection = false`; `selectionPageOnly = false`; `rowSelectable: (row: { data; index }) => boolean`; `compareSelectionBy: "equals" | "deepEquals" = deepEquals`.
- Expansion: `expandedRowKeys: { [dataKey]: boolean } = {}`; `rowExpandMode: "multiple" | "single" = multiple`.
- Editing: `editMode: "row" | "cell" = cell`; `editingRowKeys: { [dataKey]: boolean }`.
- Lazy / state: `lazy = false`; `lazyLoadOnInit = true`; `stateKey: string` + `stateStorage: "session" | "local" = session`.
- Misc: `resizableColumns` + `columnResizeMode: "fit" | "expand"`; `reorderableColumns`; `rowGroupMode: "subheader" | "rowspan"` + `groupRowsBy`; `exportFilename = "download"`, `csvSeparator = ","`; `frozenValue`, `frozenColumns`.
Outputs: `selectionChange`, `onRowSelect(TableRowSelectEvent)`, `onRowUnselect`, `onHeaderCheckboxToggle`, `selectAllChange`; `onPage(TablePageEvent)`, `firstChange`, `rowsChange`; `onSort`; `onFilter(TableFilterEvent)`; `onLazyLoad(TableLazyLoadEvent)` (paging/sorting/filtering in lazy mode; demo reads `event.first`, `event.rows`, calls `event.forceUpdate()`); `onRowExpand(TableRowExpandEvent)` / `onRowCollapse` (`event.data` is the row); `onEditInit`, `onEditComplete`, `onEditCancel`; `onColResize`, `onColReorder`, `onRowReorder`; `onStateSave` / `onStateRestore(TableState)`.
Methods (on the `#dt` ref): `exportCSV(options)`, `filterGlobal(value, matchMode)` and `clear()` (both used in demos), `resetScrollTop()`, `scrollToVirtualIndex(index)`, `scrollTo(options)`.
Templates: `#caption`, `#header` (`let-columns`), `#body` (implicit row, `let-rowIndex="rowIndex"`, `let-columns="columns"`, `let-expanded="expanded"`, `let-editing="editing"`), `#footer`, `#emptymessage`, `#expandedrow`, `#loadingbody` (virtual scroll placeholder rows), `#groupheader` / `#groupfooter` (subheader grouping), `#frozenbody`; inside `p-cellEditor`: `#input` / `#output`; inside `p-columnFilter`: `#filter let-value let-filter="filterCallback"`.
`<p-columnFilter>` attributes used in demos: `type="text|numeric|date|boolean"`, `field`, `matchMode` (`equals`, `in`, `between`), `display="menu"` (overlay; omitted = inline in the header row), `placeholder`, `ariaLabel`, `filterOn="input"`, `[showMenu]`, `[showMatchModes]`, `[showOperator]`, `[showAddButton]`, `currency="USD"`.

Basic list with paginator, sorting and empty message (trimmed from Basic / paginatorbasic / singlecolumnsort demos):
```html
<p-table [value]="products" dataKey="id" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]" [tableStyle]="{ 'min-width': '50rem' }">
  <ng-template #header>
    <tr>
      <th pSortableColumn="code">Code <p-sortIcon field="code" /></th>
      <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
      <th>Category</th>
    </tr>
  </ng-template>
  <ng-template #body let-product>
    <tr><td>{{ product.code }}</td><td>{{ product.name }}</td><td>{{ product.category }}</td></tr>
  </ng-template>
  <ng-template #emptymessage><tr><td colspan="3">No products found.</td></tr></ng-template>
</p-table>
```
```typescript
@Component({ imports: [TableModule], providers: [ProductService], template: `...` })
export class TableBasicDemo implements OnInit {
  private productService = inject(ProductService);
  products!: Product[];
  ngOnInit() { this.productService.getProductsMini().then((data) => (this.products = data)); }
}
```
Dynamic columns (`[columns]` + `let-columns`):
```html
<p-table [columns]="cols" [value]="products">
  <ng-template #header let-columns>
    <tr>@for (col of columns; track col) { <th>{{ col.header }}</th> }</tr>
  </ng-template>
  <ng-template #body let-rowData let-columns="columns">
    <tr>@for (col of columns; track col) { <td>{{ rowData[col.field] }}</td> }</tr>
  </ng-template>
</p-table>
```
Filtering: global search in `#caption` plus per-column filters in a second header row (filterbasic demo; `display="menu"` variant from Advanced demo):
```html
<p-table #dt2 [value]="customers" dataKey="id" [rows]="10" [paginator]="true" [loading]="loading"
         [globalFilterFields]="['name', 'country.name', 'representative.name', 'status']">
  <ng-template #caption>
    <p-iconfield iconPosition="left" class="ml-auto">
      <p-inputicon><i class="pi pi-search"></i></p-inputicon>
      <input pInputText type="text" (input)="dt2.filterGlobal($event.target.value, 'contains')" placeholder="Search keyword" />
    </p-iconfield>
  </ng-template>
  <ng-template #header>
    <tr><th>Name</th><th>Status</th><th>Verified</th><th>Balance</th></tr>
    <tr>
      <th><p-columnFilter type="text" field="name" placeholder="Type to search" filterOn="input" /></th>
      <th>
        <p-columnFilter field="status" matchMode="equals" [showMenu]="false">
          <ng-template #filter let-value let-filter="filterCallback">
            <p-select [(ngModel)]="value" [options]="statuses" (onChange)="filter($event.value)" placeholder="Select One" [showClear]="true" />
          </ng-template>
        </p-columnFilter>
      </th>
      <th><p-columnFilter type="boolean" field="verified" /></th>
      <th><p-columnFilter type="numeric" field="balance" display="menu" currency="USD" /></th>
    </tr>
  </ng-template>
  ...
</p-table>
```
Selection (singleselection / checkboxselection / selectionevents demos):
```html
<!-- single: click a row -->
<p-table [value]="products" selectionMode="single" [(selection)]="selectedProduct" dataKey="id" (onRowSelect)="onRowSelect($event)">
  <ng-template #body let-product><tr [pSelectableRow]="product"><td>{{ product.name }}</td></tr></ng-template>
</p-table>
<!-- multiple with checkboxes (selectedProducts is an array) -->
<p-table [value]="products" [(selection)]="selectedProducts" dataKey="code">
  <ng-template #header><tr><th style="width: 4rem"><p-tableHeaderCheckbox /></th><th>Name</th></tr></ng-template>
  <ng-template #body let-product><tr><td><p-tableCheckbox [value]="product" /></td><td>{{ product.name }}</td></tr></ng-template>
</p-table>
```
Row expansion (rowexpansion demo; needs `dataKey`, `#expandedrow` and `pRowToggler`):
```html
<p-table [value]="products" dataKey="id" [expandedRowKeys]="expandedRows" (onRowExpand)="onRowExpand($event)" (onRowCollapse)="onRowCollapse($event)">
  <ng-template #body let-product let-expanded="expanded">
    <tr>
      <td><p-button type="button" [pRowToggler]="product" [text]="true" [rounded]="true" severity="secondary"
                    [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" /></td>
      <td>{{ product.name }}</td>
    </tr>
  </ng-template>
  <ng-template #expandedrow let-product>
    <tr><td colspan="2"><div class="p-4"><h5>Orders for {{ product.name }}</h5> ... nested content ... </div></td></tr>
  </ng-template>
</p-table>
```
```typescript
expandedRows: any = {};
expandAll() { this.expandedRows = this.products.reduce((acc, p) => (acc[p.id] = true) && acc, {}); }
collapseAll() { this.expandedRows = {}; }
onRowExpand(event: TableRowExpandEvent) { this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 }); }
```
Lazy loading (virtualscrolllazy demo; same `[lazy]`/`(onLazyLoad)` pair drives server-side paging/sorting/filtering):
```html
<p-table [value]="virtualCars" [rows]="100" [lazy]="true" (onLazyLoad)="loadCarsLazy($event)" [scrollable]="true" scrollHeight="400px" [virtualScroll]="true" [virtualScrollItemSize]="46">
```
```typescript
loadCarsLazy(event: TableLazyLoadEvent) {
  const loadedCars = this.cars.slice(event.first, event.first + event.rows);   // load the requested page
  Array.prototype.splice.apply(this.virtualCars, [...[event.first, event.rows], ...loadedCars]);
  event.forceUpdate();                                                           // trigger change detection
}
```
Editing. Cell edit (default `editMode="cell"`): `<td [pEditableColumn]="product.code" pEditableColumnField="code"><p-cellEditor><ng-template #input><input pInputText [(ngModel)]="product.code" fluid /></ng-template><ng-template #output>{{ product.code }}</ng-template></p-cellEditor></td>`.
Row edit: `<p-table ... dataKey="id" editMode="row">`, `<ng-template #body let-product let-editing="editing" let-ri="rowIndex"><tr [pEditableRow]="product">` with the same `p-cellEditor` cells and buttons `<button pButton pInitEditableRow icon="pi pi-pencil" (click)="onRowEditInit(product)" *ngIf="!editing">`, `pSaveEditableRow` and `pCancelEditableRow` shown when `editing`; save/cancel logic (clone row, restore on cancel) is left to you.
Other demos on the page: frozen columns/rows, column resize/reorder/toggle, row grouping, context menu, CSV export (`dt.exportCSV()`), stateful table, skeleton loading, column groups.

## Dialog
Import: `import { DialogModule } from 'primeng/dialog';` — `<p-dialog>`. No service or provider: it is declarative, visibility is bound with `[(visible)]`.
Purpose: container to display content in an overlay window.
Inputs: `header: string`; `visible: boolean` (two-way); `modal: boolean = false`; `closable = true`; `dismissableMask = false` (click on mask hides); `closeOnEscape = true`; `draggable = true`; `resizable = true`; `maximizable = false`; `style` (demos set width here) + `breakpoints` (e.g. `[breakpoints]="{ '1199px': '75vw', '575px': '90vw' }"`); `position: "center" | "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright"`; `appendTo = 'self'`; `showHeader = true`; `blockScroll = false`; `focusOnShow = true`; `contentStyle`, `contentStyleClass`.
Outputs: `visibleChange(boolean)`, `onShow`, `onHide`, `onMaximize`, `onResizeEnd`, `onDragEnd`.
Templates: `#header`, `#content`, `#footer`, `#closeicon`, `#maximizeicon`, `#minimizeicon`, `#headless`.
```html
<p-button (click)="visible = true" label="Show" />
<p-dialog header="Edit Profile" [modal]="true" [(visible)]="visible" [style]="{ width: '25rem' }">
  <div class="flex items-center gap-4 mb-4">
    <label for="username" class="font-semibold w-24">Username</label>
    <input pInputText id="username" class="flex-auto" autocomplete="off" />
  </div>
  <ng-template #footer>
    <p-button label="Cancel" [text]="true" severity="secondary" (click)="visible = false" />
    <p-button label="Save" (click)="visible = false" />
  </ng-template>
</p-dialog>
```
```typescript
imports: [ButtonModule, DialogModule, InputTextModule]  ...  visible: boolean = false;
```

## Select
Import: `import { SelectModule } from 'primeng/select';` — `<p-select>`. No service; works with `[(ngModel)]` (FormsModule) or `formControlName` (ReactiveFormsModule).
Purpose: choose one item from a collection of options.
Inputs: `options: any[]`; `optionLabel: string`, `optionValue: string` (omit both for primitive arrays), `optionDisabled`; `placeholder`; `filter: boolean = false` + `filterBy` (comma-separated fields) + `filterPlaceholder` + `filterMatchMode = contains`; `showClear = false`; `editable = false` (free text allowed); `group = false` + `optionGroupLabel = label` + `optionGroupChildren = items`; `dataKey`; `loading = false`; `checkmark = false`; `emptyMessage`, `emptyFilterMessage`; `scrollHeight = 200px`; `virtualScroll` + `virtualScrollItemSize`; `lazy`; `appendTo = 'self'`; `inputId`; `invalid`, `disabled`, `required`, `fluid`, `size`, `variant`.
Outputs: `onChange(SelectChangeEvent)` (`event.value`), `onFilter`, `onFocus`, `onBlur`, `onShow`, `onHide`, `onClear`, `onLazyLoad(SelectLazyLoadEvent)`.
Templates: `#item` (`<ng-template let-country #item>`), selected value (demos use `<ng-template #selectedItem let-selectedOption>`; API table lists it as `selecteditem`), `#group`, `#header`, `#footer`, `#filter`, `#empty`, `#emptyfilter`, `#dropdownicon`, `#clearicon`, `#loader`, `#loadingicon`.
Methods: `show()`, `hide()`, `clear(event)`, `resetFilter()`, `focus()`.
```html
<p-select [options]="cities" [(ngModel)]="selectedCity" optionLabel="name" placeholder="Select a City" class="w-full md:w-56" />
<p-select [options]="countries" [(ngModel)]="selectedCountry" optionLabel="name" [filter]="true" filterBy="name" [showClear]="true" placeholder="Select a Country">
  <ng-template #selectedItem let-selectedOption><div>{{ selectedOption.name }}</div></ng-template>
  <ng-template let-country #item><div class="flex items-center gap-2">{{ country.name }}</div></ng-template>
</p-select>
<!-- reactive form -->
<p-select formControlName="city" [options]="cities" [invalid]="isInvalid('city')" optionLabel="name" placeholder="Select a City" />
@if (isInvalid('city')) { <p-message severity="error" size="small" variant="simple">City is required.</p-message> }
```
```typescript
interface City { name: string; code: string; }
cities: City[] = [{ name: 'New York', code: 'NY' }, { name: 'Rome', code: 'RM' }];
selectedCity: City | undefined;
```

## DatePicker
Import: `import { DatePickerModule } from 'primeng/datepicker';` — `<p-datepicker>`. No service; `[(ngModel)]` bound to a `Date` (array of dates for `multiple`/`range`). Note: the page's "template-doc" demo still uses the old `<p-calendar>` tag, every other demo uses `<p-datepicker>`.
Purpose: input component to select a date, date range or time.
Inputs: `dateFormat: string` (default `mm/dd/yy`; tokens `d dd D DD m mm M MM y yy`); `selectionMode: "single" | "multiple" | "range" = single`; `minDate`, `maxDate: Date`; `disabledDates: Date[]`, `disabledDays: number[]`; `showIcon = false` (demos also pass `[iconDisplay]="'input'"`, which the Props table does not list); `showTime: boolean` + `hourFormat: "12" | "24"` + `timeOnly = false` + `showSeconds = false` + `stepMinute = 1`; `showButtonBar = false` (today/clear); `showClear = false`; `readonlyInput = false`; `inline = false`; `numberOfMonths`; `view: "date" | "month"`; `dataType: "date" | "string" = date`; `placeholder`; `inputId`; `showOnFocus = true`; `hideOnDateTimeSelect = true`; `firstDayOfWeek`; `showWeek = false`; `touchUI = false`; `maxDateCount` (multiple mode); `appendTo = 'self'`; `invalid`, `disabled`, `required`, `fluid`, `size`, `variant`.
Outputs: `onSelect(Date)`, `onClear`, `onInput`, `onFocus`, `onBlur`, `onShow`, `onClose`, `onMonthChange(DatePickerMonthChangeEvent)`, `onYearChange`, `onTodayClick`, `onClearClick`, `onClickOutside`.
Templates: `#date` (`let-date`, custom day cell), `#header`, `#footer`, `#disableddate`, `#decade`, `#inputicon` (`let-clickCallBack="clickCallBack"`), `#buttonbar` (`let-todayCallback let-clearCallback`), `#triggericon`, `#clearicon`, `#previousicon`, `#nexticon`, `#incrementicon`, `#decrementicon`.
```html
<p-datepicker [(ngModel)]="date" dateFormat="dd.mm.yy" [showIcon]="true" inputId="buttondisplay" />
<p-datepicker [(ngModel)]="date" [minDate]="minDate" [maxDate]="maxDate" [readonlyInput]="true" />
<p-datepicker [(ngModel)]="rangeDates" selectionMode="range" [readonlyInput]="true" />
<p-datepicker inputId="calendar-24h" [(ngModel)]="datetime24h" [showTime]="true" [hourFormat]="24" />
<p-datepicker inputId="calendar-timeonly" [(ngModel)]="time" [timeOnly]="true" />
```
```typescript
imports: [DatePickerModule, FormsModule]
date: Date | undefined;  rangeDates: Date[] | undefined;  minDate: Date | undefined;  maxDate: Date | undefined;
```

## MultiSelect
Import: `import { MultiSelectModule } from 'primeng/multiselect';` — `<p-multiselect>`. No service; `[(ngModel)]` bound to an array.
Purpose: select multiple items from a collection; default label field is `label`, default value field `value`, otherwise the object itself is the value.
Inputs: `options: any[]`; `optionLabel`, `optionValue`, `optionDisabled`; `placeholder`; `display: "comma" | "chip" = comma`; `filter: boolean = true` + `filterBy` + `filterPlaceHolder` + `filterMatchMode = contains`; `maxSelectedLabels: number` + `selectedItemsLabel` (`{0} items selected`); `selectionLimit`; `showToggleAll = true`; `showHeader = true`; `showClear = false`; `group` + `optionGroupLabel` + `optionGroupChildren`; `dataKey`; `loading = false`; `emptyMessage`, `emptyFilterMessage`; `scrollHeight = 200px`; `virtualScroll` + `virtualScrollItemSize`; `appendTo = 'self'`; `inputId`; `invalid`, `disabled`, `required`, `fluid`, `size`, `variant`.
Outputs: `onChange(MultiSelectChangeEvent)` (`event.value`), `onFilter`, `onFocus`, `onBlur`, `onClear`, `onPanelShow`, `onPanelHide`, `onRemove(MultiSelectRemoveEvent)`, `onSelectAllChange`, `onLazyLoad`.
Templates: `#item` (`<ng-template let-country #item>`), `#group`, `#header`, `#footer`, `#filter`, `#empty`, `#emptyfilter`, `#selecteditems`, `#loader`, `#dropdownicon`, `#clearicon`, `#chipicon`, `#removetokenicon`, `#itemcheckboxicon`, `#headercheckboxicon` (`let-allSelected="checked" let-partialSelected="partialSelected"`).
Methods: `show()`, `hide()`, `updateModel(value, event)`.
```html
<p-multiselect [options]="cities" [(ngModel)]="selectedCities" optionLabel="name" placeholder="Select Cities" [maxSelectedLabels]="3" class="w-full md:w-80" />
<p-multiselect [options]="cities" [(ngModel)]="selectedCities" optionLabel="name" display="chip" [filter]="true" placeholder="Select Cities" />
```
```typescript
imports: [MultiSelectModule, FormsModule]
cities!: City[];  selectedCities!: City[];
```

## Toast + MessageService
Import: `import { ToastModule } from 'primeng/toast';` and `import { MessageService } from 'primeng/api';` — `<p-toast />`. Provider exactly as the demos: `providers: [MessageService]` on the component (every demo page does this); inject with `private messageService = inject(MessageService);`.
Purpose: display messages in an overlay; messages are pushed with `messageService.add(message)` / `addAll(messages)`, removed with `messageService.clear()` (all) or `clear(key)`.
Message object (from demos): `severity: 'success' | 'info' | 'warn' | 'error'` (demos also use `'secondary'`, `'contrast'`), `summary`, `detail`, `life` (ms, overrides the toast default), `sticky: true` (never auto-hide), `key` (route to the `<p-toast key="...">` with the same key).
Inputs: `key: string`; `position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "center"`; `life = 3000`; `preventDuplicates = false`; `preventOpenDuplicates = false`; `baseZIndex = 0`; `breakpoints` (styles per screen size).
Outputs: `onClose(ToastCloseEvent)`.
Templates: message body `<ng-template let-message #message>` (API table name `template`), `#headless` (`let-message let-closeFn="closeFn"`).
```html
<p-toast />
<p-toast position="bottom-left" key="bl" />
<p-button (onClick)="showSuccess()" label="Success" severity="success" />
```
```typescript
@Component({ imports: [ButtonModule, ToastModule], providers: [MessageService], template: `...` })
export class ToastSeverityDemo {
  private messageService = inject(MessageService);
  showSuccess() { this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' }); }
  showError() { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Message Content' }); }
  showBottomLeft() { this.messageService.add({ severity: 'warn', summary: 'Warn Message', detail: 'Message Content', key: 'bl', life: 3000 }); }
  clear() { this.messageService.clear(); }
}
```

## ConfirmDialog + ConfirmationService
Import: `import { ConfirmDialogModule } from 'primeng/confirmdialog';` and `import { ConfirmationService } from 'primeng/api';` — `<p-confirmdialog />`. Provider exactly as the demos: `providers: [ConfirmationService, MessageService]` on the component (MessageService only because the demos show a toast on accept/reject); inject with `private confirmationService = inject(ConfirmationService);`.
Purpose: dialog backed by a service (Observables) so one `<p-confirmdialog>` can serve several actions; opened by `confirmationService.confirm({...})`.
confirm() options used in demos: `target: event.target as EventTarget`, `message`, `header`, `icon`, `rejectLabel`, `rejectButtonProps: { label, severity, outlined }`, `acceptButtonProps: { label, severity }`, `accept: () => {}`, `reject: () => {}`, plus `key` and `position` when several dialogs exist. `message`, `icon`, `header` may instead be set declaratively on `<p-confirmdialog>` or via `#header`/`#message`/`#icon`/`#footer` templates; `confirm()` values override them.
Inputs: `header`, `message`, `icon: string`; `key: string` (matches `confirm({ key })`); `position: "center" | "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright" = center`; `acceptLabel`, `rejectLabel`, `acceptIcon`, `rejectIcon`; `acceptVisible = true`, `rejectVisible = true`; `acceptButtonStyleClass`, `rejectButtonStyleClass`; `closable = true`; `closeOnEscape = true`; `dismissableMask = false`; `modal = true`; `blockScroll = true`; `defaultFocus: "accept" | "reject" | "none" | "close" = accept`; `draggable = true`; `breakpoints`; `appendTo = 'body'`; `style`, `styleClass`.
Outputs: `onHide(ConfirmEventType)`.
Templates: `#header`, `#footer`, `#message` (`<ng-template #message let-message>`), `#icon`, `#accepticon`, `#rejecticon`, `#headless` (`let-message let-onAccept="onAccept" let-onReject="onReject"`).
```html
<p-toast />
<p-confirmdialog />
<p-button (click)="confirm2($event)" label="Delete" severity="danger" [outlined]="true" />
```
```typescript
@Component({ imports: [ButtonModule, ConfirmDialogModule, ToastModule], providers: [ConfirmationService, MessageService], template: `...` })
export class ConfirmdialogBasicDemo {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  confirm2(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget, message: 'Do you want to delete this record?', header: 'Danger Zone', icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true }, acceptButtonProps: { label: 'Delete', severity: 'danger' },
      accept: () => this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' })
    });
  }
}
```

## Paginator
Import: `import { PaginatorModule } from 'primeng/paginator';` (one demo also imports `Paginator`) — `<p-paginator>`. Event type `PaginatorState` (used in demos; import line not shown on the page).
Purpose: standalone pager; controlled via `first`, `rows`, `totalRecords` and `(onPageChange)`.
Inputs: `first: number` (zero-based index of first row); `rows = 0` (rows per page); `totalRecords = 0`; `rowsPerPageOptions: any[]` (needed for the rows dropdown; `[10, 20, 30, { showAll: 'All' }]` supported); `pageLinkSize = 5`; `showCurrentPageReport = false` + `currentPageReportTemplate = "{currentPage} of {totalPages}"` (placeholders `{currentPage} {totalPages} {rows} {first} {last} {totalRecords}`); `showFirstLastIcon = true`; `showPageLinks = true`; `showJumpToPageDropdown = false`; `showJumpToPageInput = false`; `alwaysShow = true`; `templateLeft`, `templateRight: TemplateRef`; `appendTo = 'self'`; `locale`.
Outputs: `onPageChange(PaginatorState)`; demos read `event.first` and `event.rows`.
Templates: `#dropdownicon`, `#firstpagelinkicon`, `#previouspagelinkicon`, `#nextpagelinkicon`, `#lastpagelinkicon`.
```html
<p-paginator (onPageChange)="onPageChange($event)" [first]="first" [rows]="rows" [totalRecords]="120" [rowsPerPageOptions]="[10, 20, 30]"
             [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" />
```
```typescript
first: number = 0;  rows: number = 10;
onPageChange(event: PaginatorState) { this.first = event.first ?? 0; this.rows = event.rows ?? 10; }
```

## DataView
Import: `import { DataViewModule } from 'primeng/dataview';` — `<p-dataview>`.
Purpose: list or grid layout for a collection with pagination and sorting; grid mode is not built in and needs a CSS grid library such as Tailwind.
Inputs: `value: any[]`; `layout: "list" | "grid" = list`; `paginator = false` + `rows` + `first = 0` + `totalRecords` + `rowsPerPageOptions` + `paginatorPosition = bottom` + `showCurrentPageReport` + `currentPageReportTemplate`; `sortField`, `sortOrder` (bind from your own UI); `lazy = false` + `lazyLoadOnInit = true`; `loading = false`; `emptyMessage`; `filterBy`; `gridStyleClass`; `trackBy`.
Outputs: `onPage(DataViewPageEvent)`, `onSort(DataViewSortEvent)`, `onLazyLoad(DataViewLazyLoadEvent)`, `onChangeLayout`.
Templates: `#list` (`let-items`, receives the page of items), `#grid` (`let-items`), `#header`, `#footer`, `#emptymessage`, `#paginatorleft`, `#paginatorright`, `#paginatordropdownitem`, `#loadingicon`, `#listicon`, `#gridicon`.
```html
<p-dataview #dv [value]="products()" [rows]="5" [paginator]="true" [layout]="layout" [sortField]="sortField" [sortOrder]="sortOrder">
  <ng-template #header>
    <p-selectbutton [(ngModel)]="layout" [options]="options" [allowEmpty]="false" />   <!-- SelectButtonModule from 'primeng/selectbutton' -->
  </ng-template>
  <ng-template #list let-items>
    <div *ngFor="let item of items; let first = first" class="flex p-6 gap-4">{{ item.name }} - {{ '$' + item.price }}</div>
  </ng-template>
  <ng-template #grid let-items>
    <div class="grid grid-cols-12 gap-4"><div *ngFor="let item of items" class="col-span-12 sm:col-span-6 lg:col-span-4">{{ item.name }}</div></div>
  </ng-template>
</p-dataview>
```
```typescript
products = signal<any>([]);  layout: 'list' | 'grid' = 'list';  options = ['list', 'grid'];
```

## Button
Import: `import { ButtonModule } from 'primeng/button';` — `<p-button>` component, or `<button pButton>` directive with `pButtonLabel` / `pButtonIcon` helper directives.
Purpose: extension of the standard button with icons, severities, badges and loading state.
Inputs: `label: string`; `icon: string`; `iconPos: ButtonIconPosition = left` (demos: right, top, bottom); `severity: ButtonSeverity` (demo values `secondary`, `success`, `info`, `warn`, `help`, `danger`, `contrast`); `outlined`, `text`, `plain`, `rounded`, `raised`, `link: boolean = false`; `size: "small" | "large"`; `loading = false` + `loadingIcon`; `disabled = false`; `badge: string` + `badgeSeverity = secondary`; `fluid`; `type = "button"`; `ariaLabel`; `style`, `styleClass`.
Outputs: `onClick(MouseEvent)`, `onFocus`, `onBlur` for `<p-button>`; with `<button pButton>` use `(click)`.
Templates: `#content`, `#icon`, `#loadingicon`.
```html
<p-button label="Submit" />
<p-button label="Save" icon="pi pi-check" iconPos="right" [loading]="loading()" (onClick)="load()" />
<p-button icon="pi pi-home" aria-label="Save" severity="secondary" [outlined]="true" />
<p-button label="Inbox" icon="pi pi-inbox" badge="2" badgeSeverity="contrast" outlined />
<button pButton><i class="pi pi-check" pButtonIcon></i><span pButtonLabel>Save</span></button>
```
```typescript
loading = signal(false);
load() { this.loading.set(true); setTimeout(() => this.loading.set(false), 2000); }
```

## InputText
Import: `import { InputTextModule } from 'primeng/inputtext';` — directive `pInputText` on a native `<input>`.
Purpose: themed text input (used inside Table filters, Dialog forms, IconField, FloatLabel).
Inputs: `pSize: "small" | "large"`; `variant: "outlined" | "filled"`; `fluid`; `invalid`. Everything else is the native input (`type`, `placeholder`, `id`, `autocomplete`, `aria-describedby`).
```html
<input type="text" pInputText [(ngModel)]="value" />
<input pInputText [(ngModel)]="value2" [invalid]="!value2" variant="filled" placeholder="Name" />
<div class="flex flex-col gap-2">
  <label for="username">Username</label>
  <input pInputText id="username" aria-describedby="username-help" [(ngModel)]="value" />
  <small id="username-help">Enter your username to reset your password.</small>
</div>
```

## InputNumber
Import: `import { InputNumberModule } from 'primeng/inputnumber';` — `<p-inputnumber>`.
Purpose: numerical input with locale formatting, currency, prefix/suffix and spinner buttons.
Inputs: `mode: "decimal" | "currency" = decimal`; `currency` (ISO 4217, required for currency mode) + `currencyDisplay: "symbol" | "code" | "name"`; `locale`; `min`, `max`, `step`; `minFractionDigits`, `maxFractionDigits`; `useGrouping = true`; `prefix`, `suffix`; `showButtons = false` + `buttonLayout: "stacked" | "horizontal" | "vertical" = stacked`; `placeholder`; `inputId`; `showClear = false`; `allowEmpty = true`; `format = true`; `readonly`; `invalid`, `disabled`, `required`, `fluid`, `size`, `variant`.
Outputs: `onInput(InputNumberInputEvent)`, `onFocus`, `onBlur`, `onKeyDown`, `onClear`.
Templates: `#clearicon`, `#incrementbuttonicon`, `#decrementbuttonicon`.
```html
<p-inputnumber [(ngModel)]="value1" inputId="currency-germany" mode="currency" currency="EUR" locale="de-DE" />
<p-inputnumber [(ngModel)]="value2" mode="decimal" [showButtons]="true" inputId="minmax-buttons" [min]="0" [max]="100" />
<p-inputnumber [(ngModel)]="value3" [showButtons]="true" buttonLayout="horizontal" [step]="0.25" mode="currency" currency="EUR" />
```
```typescript
imports: [InputNumberModule, FormsModule]   value1: number = 1500;
```

## Textarea
Import: the page shows no `primeng/textarea` import line (its demos list only `FormsModule`); the directive is `pTextarea` on a native `<textarea>`.
Purpose: themed textarea with optional auto-resize.
Inputs: `autoResize: boolean = false` (grows instead of scrolling); `pSize: "small" | "large"`; `variant`; `fluid`; `invalid`.
Outputs: `onResize`.
```html
<textarea rows="5" cols="30" pTextarea [(ngModel)]="value"></textarea>
<textarea rows="5" cols="30" pTextarea [autoResize]="true"></textarea>
```

## Checkbox
Import: `import { CheckboxModule } from 'primeng/checkbox';` — `<p-checkbox>`.
Purpose: themed checkbox; `binary` for a boolean model, otherwise `value` is pushed into an array model shared by a group.
Inputs: `binary = false`; `value: any`; `name`; `inputId` (pairs with `<label for>`); `label: string` (clickable built-in label; shown in the label demo, absent from the Props table); `trueValue = true`, `falseValue = false`; `indeterminate = false`; `readonly`; `invalid`, `disabled`, `required`, `size`, `variant`; `ariaLabel`.
Outputs: `onChange(CheckboxChangeEvent)`, `onFocus`, `onBlur`.
Templates: `#checkboxicon`.
```html
<p-checkbox [(ngModel)]="checked" [binary]="true" />
<div class="flex items-center">
  <p-checkbox inputId="ingredient1" name="pizza" value="Cheese" [(ngModel)]="pizza" />
  <label for="ingredient1" class="ml-2"> Cheese </label>
</div>
<p-checkbox name="groupname" value="val1" label="Value 1" [(ngModel)]="selectedValues" />
```
```typescript
checked: any = null;  pizza: string[] = [];
```

## RadioButton
Import: `import { RadioButtonModule } from 'primeng/radiobutton';` — `<p-radiobutton>`. The page has no Props/Emits table; attributes below are the ones its demos use.
Purpose: themed radio button; all buttons sharing `name` and the same `[(ngModel)]` form a group, `value` is written to the model.
Attributes used: `name`, `value` / `[value]` (object values allowed), `inputId` / `[inputId]`, `[(ngModel)]`, `formControlName`, `[invalid]`, `[disabled]`, `size`, `variant`.
```html
<div class="flex items-center">
  <p-radiobutton name="pizza" value="Cheese" [(ngModel)]="ingredient" inputId="ingredient1" />
  <label for="ingredient1" class="ml-2">Cheese</label>
</div>
<div *ngFor="let category of categories">
  <p-radiobutton [inputId]="category.key" name="category" [value]="category" [(ngModel)]="selectedCategory" />
  <label [for]="category.key" class="ml-2">{{ category.name }}</label>
</div>
```

## ToggleSwitch
Import: `import { ToggleSwitchModule } from 'primeng/toggleswitch';` — `<p-toggleswitch>`. The page has no Props/Emits table; attributes below are the ones its demos use.
Purpose: select a boolean value; `[(ngModel)]="true"` renders it active initially.
Attributes used: `[(ngModel)]`, `formControlName`, `name`, `required`, `[invalid]`, `[disabled]`, `inputId` (pairs with `<label for>` in the Table demos).
Templates: `#handle` with `let-checked="checked"` for custom handle content.
```html
<p-toggleswitch [(ngModel)]="checked" inputId="input-metakey" />
<p-toggleswitch [(ngModel)]="checked">
  <ng-template #handle let-checked="checked"><i [ngClass]="['!text-xs', 'pi', checked ? 'pi-check' : 'pi-times']"></i></ng-template>
</p-toggleswitch>
```
```typescript
imports: [ToggleSwitchModule, FormsModule]   checked: boolean = false;
```

## Card
Import: `import { CardModule } from 'primeng/card';` — `<p-card>`.
Purpose: flexible content container with optional header/title/subtitle/footer.
Inputs: `header: string`; `subheader: string`; `style`.
Templates: `#header`, `#title`, `#subtitle`, `#content`, `#footer`.
```html
<p-card header="Simple Card"><p class="m-0">Body text</p></p-card>
<p-card [style]="{ width: '25rem', overflow: 'hidden' }">
  <ng-template #header><img alt="Card" class="w-full" src="..." /></ng-template>
  <ng-template #title> Advanced Card </ng-template>
  <ng-template #subtitle> Card subtitle </ng-template>
  <p>Body text</p>
  <ng-template #footer>
    <div class="flex gap-4 mt-1"><p-button label="Cancel" severity="secondary" [outlined]="true" /><p-button label="Save" /></div>
  </ng-template>
</p-card>
```

## Tag
Import: `import { TagModule } from 'primeng/tag';` — `<p-tag>`.
Purpose: categorize content (status labels in tables).
Inputs: `value: string`; `severity: "success" | "info" | "warn" | "danger" | "secondary" | "contrast"`; `icon: string`; `rounded = false` (pill). Children are projected as custom content.
Templates: `#icon`.
```html
<p-tag value="New" />
<p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
<p-tag icon="pi pi-check" severity="success" value="Success" [rounded]="true" />
```

## Chip
Import: `import { ChipModule } from 'primeng/chip';` — `<p-chip>`.
Purpose: represent an entity with label, icon or image; optionally removable.
Inputs: `label`; `icon`; `image` + `alt`; `removable = false`; `removeIcon`; `disabled = false`.
Outputs: `onRemove(MouseEvent)`, `onImageError`.
Templates: `#removeicon`.
```html
<p-chip label="Action" />
<p-chip label="Microsoft" icon="pi pi-microsoft" [removable]="true" />
<p-chip label="Amy Elsner" image="https://.../amyelsner.png" alt="Avatar image" />
```

## Badge
Import: `import { BadgeModule } from 'primeng/badge';` — `<p-badge>`; overlay form `<p-overlaybadge>` from `import { OverlayBadgeModule } from 'primeng/overlaybadge';`. The `pBadge` directive is also shown but is deprecated since v20 in favour of OverlayBadge (see renames).
Purpose: small status indicator (count) for another element; buttons have built-in `badge`.
Inputs: `value: string | number`; `severity: "success" | "info" | "warn" | "danger" | "secondary" | "contrast"`; `badgeSize: "small" | "large" | "xlarge"`; `badgeDisabled`.
```html
<p-badge value="2" />
<p-badge value="8" badgeSize="xlarge" severity="success" />
<p-overlaybadge value="4" severity="danger"><i class="pi pi-calendar" style="font-size: 2rem"></i></p-overlaybadge>
<p-button label="Inbox" icon="pi pi-inbox" badge="2" badgeSeverity="contrast" outlined />
```

## Avatar
Import: `import { AvatarModule } from 'primeng/avatar';` — `<p-avatar>`, grouped inside `<p-avatar-group>`.
Purpose: represent people with a label, icon or image.
Inputs: `label: string`; `icon: string`; `image: string`; `size: "normal" | "large" | "xlarge" = normal`; `shape: "square" | "circle" = square`; `ariaLabel`; `style`.
Outputs: `onImageError`.
```html
<p-avatar label="P" size="xlarge" shape="circle" />
<p-avatar icon="pi pi-user" style="background-color: #dee9fc; color: #1a2551" shape="circle" />
<p-avatar-group>
  <p-avatar image="https://.../amyelsner.png" size="large" shape="circle" />
  <p-avatar label="+2" shape="circle" size="large" />
</p-avatar-group>
```

## Image
Import: `import { ImageModule } from 'primeng/image';` — `<p-image>`.
Purpose: native img wrapper with an optional preview modal (zoom/rotate); supports native img attributes.
Inputs: `src: string | SafeUrl`; `alt`; `width`, `height: string`; `preview = false`; `previewImageSrc`; `loading: "eager" | "lazy"`; `imageClass`, `imageStyle`; `srcSet`, `sizes`; `appendTo = 'self'`.
Outputs: `onShow`, `onHide`, `onImageError`.
Templates: `#indicator`, `#image`, `#preview` (`let-style="style" let-previewCallback="previewCallback"`), plus icon slots `#zoominicon`, `#zoomouticon`, `#rotatelefticon`, `#rotaterighticon`, `#closeicon`.
```html
<p-image src="https://.../galleria10.jpg" alt="Image" width="250" />
<p-image src="small.jpg" previewImageSrc="large.jpg" alt="Image" width="250" [preview]="true" />
```

## Message
Import: `import { MessageModule } from 'primeng/message';` — `<p-message>`; content is projected (the `text` input is deprecated).
Purpose: inline message (form validation text, notices); not service driven.
Inputs: `severity: "success" | "info" | "warn" | "error" | "secondary" | "contrast" = 'info'`; `closable = false`; `icon`, `closeIcon`; `size: "small" | "large"`; `variant: "text" | "outlined" | "simple"` (`simple` = no border/background); `[life]` in ms (Life demo: `<p-message [life]="3000" severity="success">`); `style`, `styleClass`.
Outputs: `onClose({ originalEvent })`. Method: `close(event)`.
Templates: `#container`, `#icon`, `#closeicon`.
```html
<p-message severity="success">Success Message</p-message>
<p-message closable>Closable Message</p-message>
@if (isInvalid('city')) { <p-message severity="error" size="small" variant="simple">City is required.</p-message> }
```

## IconField
Import: `import { IconFieldModule } from 'primeng/iconfield';` and `import { InputIconModule } from 'primeng/inputicon';` — `<p-iconfield>` wrapping `<p-inputicon>` and an `<input pInputText>`.
Purpose: input with a leading or trailing icon (search boxes, Table global filter).
Inputs: `iconPosition: "left" | "right"` (Props table default `left`; the Basic text says default is right and icon order in markup also decides). `<p-inputicon>` takes the icon as `class="pi pi-search"` or projected content; works inside `<p-floatlabel>`/`<p-iftalabel>` and with `pSize`.
```html
<p-iconfield>
  <p-inputicon class="pi pi-search" />
  <input type="text" pInputText placeholder="Search" />
</p-iconfield>
<p-iconfield iconPosition="left">
  <p-inputicon><i class="pi pi-search"></i></p-inputicon>
  <input pInputText type="text" (input)="dt.filterGlobal($event.target.value, 'contains')" placeholder="Search keyword" />
</p-iconfield>
```

## FloatLabel
Import: `import { FloatLabelModule } from 'primeng/floatlabel';` — `<p-floatlabel>` wrapping the input and its `<label for>`.
Purpose: label floats above the input on focus/value; highlighted when the input is invalid.
Inputs: `variant: "over" | "in" | "on" = over`.
```html
<p-floatlabel>
  <input id="username" pInputText [(ngModel)]="value" autocomplete="off" />
  <label for="username">Username</label>
</p-floatlabel>
<p-floatlabel variant="on">
  <input pInputText id="on_label" [(ngModel)]="value2" [invalid]="!value2" autocomplete="off" />
  <label for="on_label">On Label</label>
</p-floatlabel>
```

## Rating
Import: `import { RatingModule } from 'primeng/rating';` — `<p-rating>`.
Purpose: star-based numeric input.
Inputs: `stars = 5`; `readonly = false`; `disabled`, `invalid`, `required`, `name`; `iconOnClass`, `iconOffClass`, `iconOnStyle`, `iconOffStyle`; `autofocus`. (Table demos also pass `[cancel]="false"`; `cancel` is not in the Props table.)
Outputs: `onRate(RatingRateEvent)`, `onFocus`, `onBlur`.
Templates: `#onicon`, `#officon`.
```html
<p-rating [(ngModel)]="value" />
<p-rating [(ngModel)]="product.rating" [readonly]="true" [stars]="10" />
<p-rating formControlName="ratingValue" [invalid]="isInvalid('ratingValue')" />
```

## Divider
Import: `import { DividerModule } from 'primeng/divider';` — `<p-divider>`; children are rendered inside the line.
Purpose: separate content horizontally or vertically.
Inputs: `layout: "horizontal" | "vertical" = horizontal`; `type: "solid" | "dashed" | "dotted" = solid`; `align: "left" | "center" | "right"` (horizontal) or `"top" | "center" | "bottom"` (vertical).
```html
<p-divider />
<p-divider align="center" type="dotted"><b>Center</b></p-divider>
<p-divider layout="vertical"><b>OR</b></p-divider>
```

## Toolbar
Import: `import { ToolbarModule } from 'primeng/toolbar';` — `<p-toolbar>`.
Purpose: group buttons and other content in `start`, `center` and `end` sections.
Inputs: `ariaLabelledBy`.
Templates: `#start`, `#center`, `#end`.
```html
<p-toolbar>
  <ng-template #start>
    <p-button icon="pi pi-plus" class="mr-2" text severity="secondary" />
    <p-button icon="pi pi-print" class="mr-2" text severity="secondary" />
  </ng-template>
  <ng-template #center>
    <p-iconfield iconPosition="left"><p-inputicon class="pi pi-search" /><input type="text" pInputText placeholder="Search" /></p-iconfield>
  </ng-template>
  <ng-template #end><p-splitbutton label="Save" [model]="items" /></ng-template>   <!-- SplitButtonModule from 'primeng/splitbutton' -->
</p-toolbar>
```

## Menubar
Import: `import { MenubarModule } from 'primeng/menubar';` and `import { MenuItem } from 'primeng/api';` — `<p-menubar [model]="items">`.
Purpose: horizontal menu driven by nested `MenuItem[]`.
Inputs: `model: MenuItem[]`; `autoDisplay = true` (open root submenu on hover); `autoHide = false` + `autoHideDelay = 100`; `breakpoint = 960px` (mobile mode); `ariaLabel`, `ariaLabelledBy`.
MenuItem fields used in demos: `label`, `icon`, `items` (nested), `routerLink`, `url` (external), `command: () => {}`.
Outputs: `onFocus`, `onBlur`.
Templates: `#start`, `#end`, `#item` (`let-item let-root="root"`), `#menuicon`, `#submenuicon`.
```html
<p-menubar [model]="items">
  <ng-template #start><svg ...logo... /></ng-template>
  <ng-template #end><input type="text" pInputText placeholder="Search" /></ng-template>
</p-menubar>
```
```typescript
items: MenuItem[] | undefined;
ngOnInit() {
  this.items = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Projects', icon: 'pi pi-search', items: [{ label: 'Components', icon: 'pi pi-bolt' }, { label: 'Angular', url: 'https://angular.io/' }] },
    { label: 'Programmatic', icon: 'pi pi-link', command: () => { this.router.navigate(['/installation']); } }
  ];
}
```

## Skeleton
Import: `import { SkeletonModule } from 'primeng/skeleton';` — `<p-skeleton>`.
Purpose: placeholder shown while content loads (lists, cards, table rows; Table's `#loadingbody` uses it).
Inputs: `shape: string = rectangle` (`"circle"`); `width = 100%`; `height = 1rem`; `size` (square/circle side); `borderRadius`.
```html
<p-skeleton shape="circle" size="4rem" class="mr-2" />
<p-skeleton width="10rem" height="4rem" borderRadius="16px" />
<td><p-skeleton /></td>
```

## ProgressSpinner
Import: the page shows no import line (both demos use `imports: []`); selector `<p-progress-spinner>`.
Purpose: infinite spin animation as a process status indicator.
Inputs: `strokeWidth = "2"`; `fill = "none"` (circle background); `animationDuration = "2s"`; `ariaLabel`; `style` (set width/height here).
```html
<p-progress-spinner ariaLabel="loading" />
<p-progress-spinner strokeWidth="8" fill="transparent" animationDuration=".5s" [style]="{ width: '50px', height: '50px' }" />
```

## Tooltip
Import: `import { TooltipModule } from 'primeng/tooltip';` — directive `pTooltip="text"` or `[pTooltip]="templateRef"` on any element.
Purpose: advisory text on hover/focus.
Inputs: `tooltipPosition: "top" | "bottom" | "left" | "right"` (default right); `tooltipEvent: "hover" | "focus" | "both" = hover`; `showDelay`, `hideDelay`, `life` (ms); `autoHide = true` (false keeps it open while hovering the tooltip); `escape = true` (false allows HTML); `tooltipStyleClass`; `disabled`; `appendTo = 'self'`; `fitContent = true`; `hideOnEscape = true`; `showOnEllipsis = false`; `tooltipOptions: TooltipOptions`.
```html
<input type="text" pInputText pTooltip="Enter your username" tooltipPosition="top" placeholder="Top" />
<p-button pTooltip="Confirm to proceed" showDelay="1000" hideDelay="300" label="Save" />
<p-button [pTooltip]="tooltipContent" tooltipPosition="bottom" label="Button" />
<ng-template #tooltipContent><span><b>PrimeNG</b> rocks!</span></ng-template>
```

## Panel
Import: `import { PanelModule } from 'primeng/panel';` — `<p-panel>`.
Purpose: container with a header and optional collapse toggle.
Inputs: `header: string` (listed as `_header` in the Props table, used as `header="..."` in demos); `toggleable = false`; `collapsed: boolean` (one- or two-way); `toggler: "icon" | "header" = icon`; `iconPos: "start" | "center" | "end" = end`; `showHeader = true`; `toggleButtonProps`.
Outputs: `collapsedChange(boolean)`, `onBeforeToggle(PanelBeforeToggleEvent)`, `onAfterToggle`.
Templates: `#header`, `#icons` (extra header buttons), `#content`, `#footer`, `#headericons`.
```html
<p-panel header="Header" [toggleable]="true"><p class="m-0">Body</p></p-panel>
<p-panel [toggleable]="true">
  <ng-template #header><div class="flex items-center gap-2"><p-avatar image="..." shape="circle" /><span class="font-bold">Amy Elsner</span></div></ng-template>
  <ng-template #icons><p-button icon="pi pi-cog" severity="secondary" rounded text (click)="menu.toggle($event)" /></ng-template>
  <p class="m-0">Body</p>
  <ng-template #footer><span>Updated 2 hours ago</span></ng-template>
</p-panel>
```

## Fieldset
Import: `import { FieldsetModule } from 'primeng/fieldset';` — `<p-fieldset>`.
Purpose: grouping box with a legend and optional collapse.
Inputs: `legend: string`; `toggleable = false` (click the legend to toggle); `collapsed: boolean` (one- or two-way); `style`, `styleClass`.
Outputs: `collapsedChange(boolean)`, `onBeforeToggle`, `onAfterToggle`.
Templates: `#header`, `#content`, `#expandicon`, `#collapseicon`.
```html
<p-fieldset legend="Header" [toggleable]="true"><p class="m-0">Body</p></p-fieldset>
<p-fieldset>
  <ng-template #header><div class="flex items-center gap-2 px-2"><p-avatar image="..." shape="circle" /><span class="font-bold">Amy Elsner</span></div></ng-template>
  <p class="m-0">Body</p>
</p-fieldset>
```

## Drawer
Import: `import { DrawerModule } from 'primeng/drawer';` (one demo also imports `Drawer`) — `<p-drawer>`. No service; visibility is `[(visible)]`.
Purpose: overlay panel sliding from an edge of the screen (the Props table still describes it as "Sidebar").
Inputs: `visible: boolean` (two-way); `header: string`; `position: "left" | "right" | "top" | "bottom" | "full" = 'left'`; `fullScreen = false`; `modal = true`; `dismissible = true` (mask click closes); `closable = true`; `closeOnEscape = true`; `blockScroll = false`; `style` (demos set `{ height: 'auto' }` for top/bottom), `styleClass`; `appendTo = 'self'`; `ariaCloseLabel`; `closeButtonProps`.
Outputs: `visibleChange(boolean)`, `onShow`, `onHide`.
Templates: `#header`, `#content`, `#footer`, `#closeicon`, `#headless`.
```html
<p-drawer [(visible)]="visible" header="Drawer" position="right">
  <p>Content</p>
  <ng-template #footer>
    <button pButton label="Account" icon="pi pi-user" class="w-full" outlined></button>
    <button pButton label="Logout" icon="pi pi-sign-out" class="w-full" severity="danger" text></button>
  </ng-template>
</p-drawer>
<p-button (click)="visible = true" icon="pi pi-arrow-right" />
```
```typescript
imports: [ButtonModule, DrawerModule]   visible: boolean = false;
```

## Tabs
Import: `import { TabsModule } from 'primeng/tabs';` — `<p-tabs>` containing `<p-tablist>` with `<p-tab value>` items and `<p-tabpanels>` with `<p-tabpanel value>` items; a Tab and a TabPanel are associated by equal `value`.
Purpose: group content behind tabs; replaces TabView.
Inputs on `<p-tabs>` (the only API table on the page): `value: string | number` (active tab; two-way `[(value)]` for programmatic control); `scrollable = false` + `showNavigators = true`; `lazy = false` (panels rendered on activation); `selectOnFocus = false`; `tabindex = 0`. `<p-tab>` / `<p-tabpanel>` take `value`; a tab can be disabled with a bare attribute (Disabled demo: `<p-tab disabled>Header IV</p-tab>`).
```html
<p-tabs [(value)]="value">
  <p-tablist>
    @for (tab of tabs; track tab.value) { <p-tab [value]="tab.value">{{ tab.title }}</p-tab> }
  </p-tablist>
  <p-tabpanels>
    @for (tab of tabs; track tab.value) { <p-tabpanel [value]="tab.value"><p class="m-0">{{ tab.content }}</p></p-tabpanel> }
  </p-tabpanels>
</p-tabs>
```
```typescript
imports: [TabsModule]
value = 0;
tabs = [{ title: 'Tab 1', value: 0, content: 'Tab 1 Content' }, { title: 'Tab 2', value: 1, content: 'Tab 2 Content' }];
```

## Renamed / replaced in recent versions
Evidence: the only explicit rename statements in the source set are in `migration_v20.md` (https://v21.primeng.org/migration/v20.md); `migration_v21.md` in the set was an empty HTML shell. The component pages themselves only hint at it (drawer.md's API table still says "Sidebar is a panel component displayed as an overlay at the edges of the screen."; datepicker.md's template demo still uses `<p-calendar>`; toggleswitch.md's accessibility text still says "InputSwitch component uses a hidden native checkbox element").
Quoted from migration_v20.md, section "Removals" ("The list of items that were deprecated in previous releases and removed in this iteration. API Deprecated Since Replacement Status in v20"): "Calendar v18 DatePicker Dropdown v18 Select InputSwitch v18 ToggleSwitch OverlayPanel v18 Popover Sidebar v18 Drawer Chips v18 AutoComplete in multiple mode without typehead option TabMenu v18 Tabs without panels Steps v18 Stepper without panels Messages v18 Message InlineMessage v18 Message TabView v18 Tabs Accordion activeIndex property v18 value property ... AccordionTab v18 AccordionPanel, AccordionHeader, AccordionContent ... Badge size property v18 badgeSize property ... MultiSelect checkicon template v18 headercheckboxicon and itemcheckboxicon . ... Rating onCancel event and cancelIcon template v18 Obsolete, not utilized. MultiSelect defaultLabel property v18 placeholder property. MultiSelect/Select itemSize property v18 virtualScrollItemSize property ... Panel expandIcon and collapseIcon properties v18 headericons template ... Table/TreeTable virtualRowHeight property v18 virtualScrollItemSize property".
In short (old -> new): Calendar -> DatePicker (`<p-datepicker>`), Dropdown -> Select (`<p-select>`), InputSwitch -> ToggleSwitch (`<p-toggleswitch>`), Sidebar -> Drawer (`<p-drawer>`), OverlayPanel -> Popover, Messages / InlineMessage -> Message (`<p-message>`), TabView -> Tabs (`<p-tabs>`), TabMenu -> Tabs without panels, Steps -> Stepper, Chips -> AutoComplete multiple mode.
Quoted from migration_v20.md, section "Deprecations" ("The following items are marked as deprecated. API Deprecated Since Replacement Removal Status"): "@primeng/themes v20 @primeuix/themes v22 pTemplate v20 ng-template with a template reference variable v22 styleClass *(for host enabled components) v20 class v22 Global inputStyle config v20 inputVariant v22 CamelCase Selectors v20 Kebab case v22 pButton iconPos, loadingIcon, icon and label properties v20 pButtonIcon and pButtonLabel directives v22 pButton buttonProps property v20 Use button properties directly on the element v22 p-button badgeClass property v20 badgeSeverity property v22 ... Paginator dropdownAppendTo property v20 appendTo v22 Message text and escape properties v20 Content projection v22 ... Table responsiveLayout property v20 Always defaults to scroll, stack mode needs custom implementation v22 ... pBadge directive v20 OverlayBadge component v22 clearFilterIcon template of Table v20 Obsolete, not utilized. v22".
Practical consequences for new code: use `<ng-template #name>` not `pTemplate="name"`; use `class` not `styleClass`; use kebab-case selectors (`<p-datepicker>`, `<p-toggleswitch>`, `<p-inputnumber>`, `<p-multiselect>`, `<p-floatlabel>`, `<p-iconfield>`, `<p-inputicon>`, `<p-confirmdialog>`, `<p-overlaybadge>`, `<p-progress-spinner>`, `<p-avatar-group>`); on `<button pButton>` use `pButtonIcon`/`pButtonLabel` instead of `icon`/`label`; project Message content instead of `text`; use `<p-overlaybadge>` instead of `pBadge`; the `invalid` input (added in v20) replaces reliance on the `ng-invalid.ng-dirty` styling.
