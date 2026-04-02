# Button System API Reference

Dokumentasi lengkap untuk semua API dalam Button System.

## Daftar Isi

1. [GlobalButtonHandler](#globalbuttonhandler)
2. [StandardButton](#standardbutton)
3. [Common Action Handlers](#common-action-handlers)
4. [Error Handler](#error-handler)
5. [Utility Functions](#utility-functions)

---

## GlobalButtonHandler

Class utama untuk mengelola semua button event handling.

### Constructor

```javascript
new GlobalButtonHandler(options)
```

**Parameters:**
- `options` (Object, optional)
  - `debounceTime` (Number): Waktu debounce dalam ms (default: 300)
  - `debug` (Boolean): Enable debug mode (default: false)

**Example:**
```javascript
const buttonHandler = new GlobalButtonHandler({
  debounceTime: 500,
  debug: true
});
```

### Methods

#### register(action, handler)

Mendaftarkan handler untuk action tertentu.

**Parameters:**
- `action` (String): Nama action (dari data-action attribute)
- `handler` (Function): Handler function

**Handler Signature:**
```javascript
async function handler(button, data) {
  // button: HTMLButtonElement yang diklik
  // data: Object dari semua data-* attributes
}
```

**Returns:** void

**Example:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  await apiService.save(data);
  showNotification('Berhasil', 'success');
});
```

#### unregister(action)

Menghapus handler untuk action tertentu.

**Parameters:**
- `action` (String): Nama action

**Returns:** Boolean (true jika berhasil)

**Example:**
```javascript
window.buttonHandler.unregister('save');
```

#### execute(action, button, data)

Menjalankan handler secara manual.

**Parameters:**
- `action` (String): Nama action
- `button` (HTMLButtonElement): Button element
- `data` (Object): Data untuk handler

**Returns:** Promise

**Example:**
```javascript
const button = document.querySelector('[data-action="save"]');
await window.buttonHandler.execute('save', button, { id: 123 });
```

#### on(event, callback)

Subscribe ke button events.

**Parameters:**
- `event` (String): Event name ('click', 'error', 'complete')
- `callback` (Function): Callback function

**Returns:** void

**Example:**
```javascript
window.buttonHandler.on('click', (button, data) => {
  console.log('Button clicked:', button, data);
});

window.buttonHandler.on('error', (error, button, data) => {
  console.error('Button error:', error);
});
```

#### off(event, callback)

Unsubscribe dari button events.

**Parameters:**
- `event` (String): Event name
- `callback` (Function): Callback function yang sama dengan on()

**Returns:** void

**Example:**
```javascript
const callback = (button, data) => console.log(button, data);
window.buttonHandler.on('click', callback);
window.buttonHandler.off('click', callback);
```

### Properties

#### handlers

Object yang berisi semua registered handlers.

**Type:** Object<String, Function>

**Example:**
```javascript
console.log(window.buttonHandler.handlers);
// { save: Function, delete: Function, ... }
```

#### debug

Enable/disable debug mode.

**Type:** Boolean

**Example:**
```javascript
window.buttonHandler.debug = true;
```

---

## StandardButton

Component untuk membuat button dengan styling dan behavior konsisten.

### Constructor

```javascript
new StandardButton(options)
```

**Parameters:**
- `options` (Object)
  - `text` (String): Button text
  - `icon` (String, optional): Lucide icon name
  - `variant` (String, optional): 'primary', 'secondary', 'danger', 'success' (default: 'primary')
  - `size` (String, optional): 'sm', 'md', 'lg' (default: 'md')
  - `action` (String): Action name
  - `data` (Object, optional): Additional data attributes
  - `disabled` (Boolean, optional): Initial disabled state
  - `tooltip` (String, optional): Tooltip text

**Example:**
```javascript
const button = new StandardButton({
  text: 'Simpan',
  icon: 'save',
  variant: 'primary',
  size: 'md',
  action: 'save',
  data: { id: 123 },
  tooltip: 'Simpan perubahan'
});
```

### Methods

#### render()

Render button ke DOM.

**Returns:** HTMLButtonElement

**Example:**
```javascript
const button = new StandardButton({ text: 'Save', action: 'save' });
const element = button.render();
document.body.appendChild(element);
```

#### setLoading(isLoading)

Set loading state.

**Parameters:**
- `isLoading` (Boolean): Loading state

**Returns:** void

**Example:**
```javascript
button.setLoading(true);  // Show loading
button.setLoading(false); // Hide loading
```

#### setDisabled(isDisabled)

Set disabled state.

**Parameters:**
- `isDisabled` (Boolean): Disabled state

**Returns:** void

**Example:**
```javascript
button.setDisabled(true);  // Disable
button.setDisabled(false); // Enable
```

#### setText(text)

Update button text.

**Parameters:**
- `text` (String): New text

**Returns:** void

**Example:**
```javascript
button.setText('Menyimpan...');
```

#### setIcon(iconName)

Update button icon.

**Parameters:**
- `iconName` (String): Lucide icon name

**Returns:** void

**Example:**
```javascript
button.setIcon('check');
```

#### destroy()

Remove button dari DOM dan cleanup.

**Returns:** void

**Example:**
```javascript
button.destroy();
```

---

## Common Action Handlers

Pre-registered handlers untuk action umum.

### edit

Handler untuk edit button.

**Data Attributes:**
- `data-id` (required): ID item yang akan diedit
- `data-entity` (optional): Entity type

**Example:**
```html
<button data-action="edit" data-id="123" data-entity="user">
  Edit
</button>
```

### delete

Handler untuk delete button dengan konfirmasi.

**Data Attributes:**
- `data-id` (required): ID item yang akan dihapus
- `data-name` (optional): Nama item untuk konfirmasi

**Example:**
```html
<button data-action="delete" data-id="123" data-name="John Doe">
  Hapus
</button>
```

### download

Handler untuk download button.

**Data Attributes:**
- `data-url` (required): URL untuk download
- `data-filename` (optional): Nama file

**Example:**
```html
<button data-action="download" data-url="/api/file/123" data-filename="report.pdf">
  Download
</button>
```

### export

Handler untuk export button.

**Data Attributes:**
- `data-format` (required): Format export ('excel', 'pdf', 'csv')
- `data-entity` (required): Entity yang akan diexport

**Example:**
```html
<button data-action="export" data-format="excel" data-entity="users">
  Export Excel
</button>
```

### import

Handler untuk import button.

**Data Attributes:**
- `data-entity` (required): Entity yang akan diimport
- `data-accept` (optional): File types yang diterima

**Example:**
```html
<button data-action="import" data-entity="users" data-accept=".xlsx,.xls">
  Import
</button>
```

### filter-apply

Handler untuk apply filter.

**Data Attributes:**
- `data-form` (optional): Form ID yang berisi filter

**Example:**
```html
<button data-action="filter-apply" data-form="filterForm">
  Terapkan Filter
</button>
```

### filter-reset

Handler untuk reset filter.

**Example:**
```html
<button data-action="filter-reset">
  Reset Filter
</button>
```

### modal-close

Handler untuk close modal.

**Data Attributes:**
- `data-modal` (required): Modal ID

**Example:**
```html
<button data-action="modal-close" data-modal="myModal">
  Tutup
</button>
```

### modal-save

Handler untuk save modal.

**Data Attributes:**
- `data-modal` (required): Modal ID
- `data-form` (required): Form ID

**Example:**
```html
<button data-action="modal-save" data-modal="myModal" data-form="myForm">
  Simpan
</button>
```

---

## Error Handler

System untuk menangani errors dari button handlers.

### handleError(error, button, data)

Handle error dari button handler.

**Parameters:**
- `error` (Error): Error object
- `button` (HTMLButtonElement): Button yang error
- `data` (Object): Data dari button

**Returns:** void

**Example:**
```javascript
try {
  await apiService.save(data);
} catch (error) {
  window.buttonErrorHandler.handleError(error, button, data);
}
```

### categorizeError(error)

Kategorisasi error berdasarkan type.

**Parameters:**
- `error` (Error): Error object

**Returns:** Object
- `category` (String): Error category
- `message` (String): User-friendly message
- `retryable` (Boolean): Apakah bisa diretry

**Example:**
```javascript
const errorInfo = window.buttonErrorHandler.categorizeError(error);
console.log(errorInfo);
// { category: 'API_ERROR', message: 'Gagal menyimpan data', retryable: true }
```

### showErrorMessage(message, options)

Tampilkan error message ke user.

**Parameters:**
- `message` (String): Error message
- `options` (Object, optional)
  - `retryable` (Boolean): Show retry button
  - `helpLink` (String): Link ke help documentation

**Returns:** Promise<Boolean> (true jika user click retry)

**Example:**
```javascript
const retry = await window.buttonErrorHandler.showErrorMessage(
  'Gagal menyimpan data',
  { retryable: true, helpLink: '/help/save-error' }
);

if (retry) {
  // Retry operation
}
```

---

## Utility Functions

Helper functions untuk button operations.

### debounce(func, wait)

Debounce function untuk prevent rapid calls.

**Parameters:**
- `func` (Function): Function yang akan didebounce
- `wait` (Number): Wait time dalam ms

**Returns:** Function

**Example:**
```javascript
const debouncedSave = debounce(saveData, 300);
button.addEventListener('click', debouncedSave);
```

### showNotification(message, type)

Tampilkan notification ke user.

**Parameters:**
- `message` (String): Notification message
- `type` (String): 'success', 'error', 'warning', 'info'

**Returns:** void

**Example:**
```javascript
showNotification('Data berhasil disimpan', 'success');
showNotification('Terjadi kesalahan', 'error');
```

### showConfirmDialog(title, message)

Tampilkan confirmation dialog.

**Parameters:**
- `title` (String): Dialog title
- `message` (String): Dialog message

**Returns:** Promise<Boolean> (true jika user confirm)

**Example:**
```javascript
const confirmed = await showConfirmDialog(
  'Konfirmasi Hapus',
  'Apakah Anda yakin ingin menghapus data ini?'
);

if (confirmed) {
  // Delete data
}
```

### getButtonData(button)

Extract semua data attributes dari button.

**Parameters:**
- `button` (HTMLButtonElement): Button element

**Returns:** Object

**Example:**
```javascript
const button = document.querySelector('[data-action="save"]');
const data = getButtonData(button);
console.log(data);
// { action: 'save', id: '123', entity: 'user' }
```

---

## Events

Button system emit events yang bisa disubscribe.

### click

Triggered saat button diklik.

**Callback Parameters:**
- `button` (HTMLButtonElement): Button yang diklik
- `data` (Object): Button data

**Example:**
```javascript
window.buttonHandler.on('click', (button, data) => {
  console.log('Button clicked:', button.dataset.action);
});
```

### complete

Triggered saat handler selesai dijalankan.

**Callback Parameters:**
- `button` (HTMLButtonElement): Button
- `data` (Object): Button data
- `result` (Any): Handler result

**Example:**
```javascript
window.buttonHandler.on('complete', (button, data, result) => {
  console.log('Handler complete:', result);
});
```

### error

Triggered saat handler error.

**Callback Parameters:**
- `error` (Error): Error object
- `button` (HTMLButtonElement): Button
- `data` (Object): Button data

**Example:**
```javascript
window.buttonHandler.on('error', (error, button, data) => {
  console.error('Handler error:', error);
});
```

---

## Type Definitions

### ButtonOptions

```typescript
interface ButtonOptions {
  text: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  action: string;
  data?: Record<string, any>;
  disabled?: boolean;
  tooltip?: string;
}
```

### HandlerFunction

```typescript
type HandlerFunction = (
  button: HTMLButtonElement,
  data: Record<string, any>
) => Promise<void> | void;
```

### ErrorInfo

```typescript
interface ErrorInfo {
  category: string;
  message: string;
  retryable: boolean;
  helpLink?: string;
}
```

