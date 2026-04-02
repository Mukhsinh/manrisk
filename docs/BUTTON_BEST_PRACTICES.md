# Best Practices untuk Button Handling

Panduan ini berisi best practices untuk implementasi dan pengelolaan tombol dalam aplikasi Manajemen Risiko.

## Daftar Isi

1. [Prinsip Umum](#prinsip-umum)
2. [Naming Conventions](#naming-conventions)
3. [Event Handling](#event-handling)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Accessibility](#accessibility)
7. [Performance](#performance)
8. [Testing](#testing)
9. [Common Pitfalls](#common-pitfalls)

---

## Prinsip Umum

### 1. Gunakan Data Attributes untuk Actions

✅ **BAIK:**
```html
<button class="btn btn-primary" data-action="save" data-id="123">
  Simpan
</button>
```

❌ **BURUK:**
```html
<button class="btn btn-primary" onclick="saveData(123)">
  Simpan
</button>
```

**Alasan:** Data attributes memisahkan markup dari logic, memudahkan maintenance, dan mendukung event delegation.

### 2. Selalu Berikan Feedback Visual

✅ **BAIK:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  // Loading state otomatis dikelola oleh GlobalButtonHandler
  await apiService.save(data);
  showNotification('Data berhasil disimpan', 'success');
});
```

❌ **BURUK:**
```javascript
function saveData() {
  apiService.save(data); // Tidak ada feedback
}
```

**Alasan:** User perlu tahu bahwa action mereka sedang diproses dan hasilnya.

### 3. Prevent Double Submission

✅ **BAIK:**
```javascript
// GlobalButtonHandler otomatis mencegah double click
window.buttonHandler.register('submit', async function(button, data) {
  await apiService.submit(data);
});
```

❌ **BURUK:**
```javascript
function submit() {
  // Tidak ada proteksi double click
  apiService.submit(data);
}
```

**Alasan:** Mencegah duplicate operations dan data corruption.

---

## Naming Conventions

### Action Names

Gunakan naming yang konsisten dan deskriptif:

✅ **BAIK:**
- `data-action="add"`
- `data-action="edit"`
- `data-action="delete"`
- `data-action="download-pdf"`
- `data-action="export-excel"`
- `data-action="filter-apply"`

❌ **BURUK:**
- `data-action="btn1"`
- `data-action="do-something"`
- `data-action="click-me"`

### Data Attributes

Gunakan naming yang jelas untuk data attributes:

✅ **BAIK:**
```html
<button 
  data-action="edit" 
  data-id="123" 
  data-entity="user">
  Edit
</button>
```

❌ **BURUK:**
```html
<button 
  data-action="edit" 
  data-val="123" 
  data-type="u">
  Edit
</button>
```

---

## Event Handling

### 1. Gunakan Event Delegation

✅ **BAIK:**
```javascript
// GlobalButtonHandler menggunakan event delegation
window.buttonHandler.register('delete', async function(button, data) {
  await apiService.delete(data.id);
});
```

❌ **BURUK:**
```javascript
// Attach event listener ke setiap button
document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    apiService.delete(this.dataset.id);
  });
});
```

**Alasan:** Event delegation lebih efisien, mendukung dynamic content, dan mengurangi memory usage.

### 2. Async/Await untuk Async Operations

✅ **BAIK:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  try {
    await apiService.save(data);
    showNotification('Berhasil', 'success');
  } catch (error) {
    showNotification('Gagal: ' + error.message, 'error');
  }
});
```

❌ **BURUK:**
```javascript
window.buttonHandler.register('save', function(button, data) {
  apiService.save(data).then(() => {
    showNotification('Berhasil', 'success');
  }).catch(error => {
    showNotification('Gagal', 'error');
  });
});
```

**Alasan:** Async/await lebih readable dan mudah di-maintain.

### 3. Cleanup Event Listeners

✅ **BAIK:**
```javascript
// GlobalButtonHandler otomatis cleanup
// Untuk custom listeners:
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });

// Cleanup
controller.abort();
```

❌ **BURUK:**
```javascript
element.addEventListener('click', handler);
// Tidak ada cleanup
```

---

## State Management

### 1. Loading State

✅ **BAIK:**
```javascript
// GlobalButtonHandler otomatis mengelola loading state
window.buttonHandler.register('save', async function(button, data) {
  // Button otomatis disabled dan menampilkan loading
  await apiService.save(data);
  // Button otomatis enabled kembali
});
```

### 2. Disabled State

✅ **BAIK:**
```html
<!-- Disabled dengan alasan yang jelas -->
<button 
  class="btn btn-primary" 
  data-action="submit" 
  disabled
  title="Lengkapi form terlebih dahulu">
  Submit
</button>
```

❌ **BURUK:**
```html
<!-- Disabled tanpa penjelasan -->
<button class="btn btn-primary" disabled>
  Submit
</button>
```

### 3. Visual Feedback

✅ **BAIK:**
```css
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn:active {
  transform: translateY(0);
}

.btn.loading {
  opacity: 0.7;
  cursor: wait;
}
```

---

## Error Handling

### 1. Comprehensive Error Handling

✅ **BAIK:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  try {
    await apiService.save(data);
    showNotification('Data berhasil disimpan', 'success');
  } catch (error) {
    console.error('Save error:', error);
    
    if (error.status === 401) {
      showNotification('Sesi Anda telah berakhir', 'error');
      redirectToLogin();
    } else if (error.status === 403) {
      showNotification('Anda tidak memiliki akses', 'error');
    } else if (error.status === 422) {
      showNotification('Data tidak valid: ' + error.message, 'error');
    } else {
      showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
    }
  }
});
```

### 2. User-Friendly Error Messages

✅ **BAIK:**
```javascript
showNotification('Gagal menyimpan data. Periksa koneksi internet Anda.', 'error');
```

❌ **BURUK:**
```javascript
showNotification('Error 500: Internal Server Error', 'error');
```

### 3. Retry Functionality

✅ **BAIK:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  try {
    await apiService.save(data);
  } catch (error) {
    const retry = await showConfirmDialog(
      'Gagal Menyimpan',
      'Terjadi kesalahan. Coba lagi?'
    );
    
    if (retry) {
      // Retry
      await this(button, data);
    }
  }
});
```

---

## Accessibility

### 1. Keyboard Navigation

✅ **BAIK:**
```html
<!-- Button dapat di-focus dan di-activate dengan keyboard -->
<button 
  class="btn btn-primary" 
  data-action="save"
  tabindex="0">
  Simpan
</button>
```

### 2. ARIA Labels

✅ **BAIK:**
```html
<!-- Icon-only button dengan aria-label -->
<button 
  class="btn btn-primary" 
  data-action="edit"
  aria-label="Edit data">
  <i data-lucide="edit"></i>
</button>
```

❌ **BURUK:**
```html
<!-- Icon-only button tanpa aria-label -->
<button class="btn btn-primary" data-action="edit">
  <i data-lucide="edit"></i>
</button>
```

### 3. Focus Indicators

✅ **BAIK:**
```css
.btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.btn:focus:not(:focus-visible) {
  outline: none;
}
```

---

## Performance

### 1. Debouncing

✅ **BAIK:**
```javascript
// GlobalButtonHandler otomatis debounce
window.buttonHandler.register('search', async function(button, data) {
  await apiService.search(data.query);
});
```

### 2. Lazy Loading

✅ **BAIK:**
```javascript
// Load handler hanya saat dibutuhkan
window.buttonHandler.register('advanced-feature', async function(button, data) {
  const module = await import('./advanced-feature.js');
  await module.execute(data);
});
```

### 3. Minimize Reflows

✅ **BAIK:**
```javascript
// Batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const button = createButton(item);
  fragment.appendChild(button);
});
container.appendChild(fragment);
```

---

## Testing

### 1. Unit Tests

✅ **BAIK:**
```javascript
describe('Button Handler', () => {
  it('should call handler when button clicked', async () => {
    const handler = jest.fn();
    window.buttonHandler.register('test', handler);
    
    const button = document.createElement('button');
    button.dataset.action = 'test';
    button.click();
    
    expect(handler).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests

✅ **BAIK:**
```javascript
describe('Save Button', () => {
  it('should save data and show notification', async () => {
    // Setup
    const button = document.querySelector('[data-action="save"]');
    
    // Execute
    button.click();
    await waitFor(() => expect(apiService.save).toHaveBeenCalled());
    
    // Verify
    expect(showNotification).toHaveBeenCalledWith('Data berhasil disimpan', 'success');
  });
});
```

---

## Common Pitfalls

### 1. Inline Event Handlers

❌ **HINDARI:**
```html
<button onclick="saveData()">Simpan</button>
```

**Masalah:** Sulit di-maintain, tidak mendukung event delegation, mixing concerns.

### 2. Tidak Ada Error Handling

❌ **HINDARI:**
```javascript
function saveData() {
  apiService.save(data); // Tidak ada try-catch
}
```

**Masalah:** Errors tidak tertangani, user tidak tahu apa yang terjadi.

### 3. Tidak Ada Loading State

❌ **HINDARI:**
```javascript
function saveData() {
  apiService.save(data); // Tidak ada loading indicator
}
```

**Masalah:** User tidak tahu apakah action sedang diproses.

### 4. Memory Leaks

❌ **HINDARI:**
```javascript
// Event listener tidak di-cleanup
modal.addEventListener('click', handler);
// Modal dihapus tapi listener masih ada
```

**Masalah:** Memory leaks, performance degradation.

### 5. Tidak Accessible

❌ **HINDARI:**
```html
<div onclick="doSomething()">Click me</div>
```

**Masalah:** Tidak dapat di-access dengan keyboard, tidak semantic.

---

## Checklist

Sebelum deploy, pastikan:

- [ ] Semua button memiliki event handler
- [ ] Semua async operations menampilkan loading state
- [ ] Semua errors tertangani dengan baik
- [ ] Semua button accessible (keyboard navigation, aria-labels)
- [ ] Tidak ada inline event handlers
- [ ] Event listeners di-cleanup dengan benar
- [ ] User mendapat feedback untuk setiap action
- [ ] Double submission dicegah
- [ ] Tests sudah ditulis dan passing

