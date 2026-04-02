# Troubleshooting Guide untuk Button Issues

Panduan ini membantu Anda mendiagnosis dan memperbaiki masalah umum dengan tombol dalam aplikasi.

## Daftar Isi

1. [Button Tidak Merespon](#button-tidak-merespon)
2. [Loading State Tidak Muncul](#loading-state-tidak-muncul)
3. [Error Tidak Tertangani](#error-tidak-tertangani)
4. [Double Click Issues](#double-click-issues)
5. [Modal Tidak Menutup](#modal-tidak-menutup)
6. [Form Tidak Submit](#form-tidak-submit)
7. [Download Tidak Berfungsi](#download-tidak-berfungsi)
8. [Accessibility Issues](#accessibility-issues)
9. [Performance Issues](#performance-issues)
10. [Debugging Tips](#debugging-tips)

---

## Button Tidak Merespon

### Gejala
Button diklik tapi tidak ada yang terjadi.

### Diagnosis

1. **Cek apakah handler terdaftar:**
```javascript
// Di console browser
console.log(window.buttonHandler.handlers);
// Cari action name yang sesuai
```

2. **Cek apakah button memiliki data-action:**
```javascript
const button = document.querySelector('button');
console.log(button.dataset.action); // Harus ada value
```

3. **Cek console untuk errors:**
```javascript
// Buka DevTools > Console
// Lihat apakah ada error messages
```

### Solusi

**Jika handler tidak terdaftar:**
```javascript
// Daftarkan handler
window.buttonHandler.register('your-action', async function(button, data) {
  console.log('Handler called', data);
  // Implementasi logic
});
```

**Jika data-action tidak ada:**
```html
<!-- Tambahkan data-action -->
<button class="btn btn-primary" data-action="save">
  Simpan
</button>
```

**Jika button disabled:**
```javascript
// Enable button
button.disabled = false;
```

---

## Loading State Tidak Muncul

### Gejala
Button diklik tapi loading indicator tidak muncul.

### Diagnosis

1. **Cek apakah handler async:**
```javascript
// Handler harus async
window.buttonHandler.register('save', async function(button, data) {
  // async operation
});
```

2. **Cek CSS loading class:**
```javascript
// Di console
const button = document.querySelector('[data-action="save"]');
console.log(button.classList.contains('loading'));
```

### Solusi

**Pastikan handler async:**
```javascript
// ✅ BENAR
window.buttonHandler.register('save', async function(button, data) {
  await apiService.save(data);
});

// ❌ SALAH
window.buttonHandler.register('save', function(button, data) {
  apiService.save(data); // Tidak await
});
```

**Pastikan CSS loading class ada:**
```css
.btn.loading {
  opacity: 0.7;
  cursor: wait;
  position: relative;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

---

## Error Tidak Tertangani

### Gejala
Error terjadi tapi tidak ada pesan error yang ditampilkan.

### Diagnosis

1. **Cek console untuk uncaught errors:**
```javascript
// Buka DevTools > Console
// Lihat error stack trace
```

2. **Cek apakah handler memiliki try-catch:**
```javascript
// Handler harus memiliki error handling
window.buttonHandler.register('save', async function(button, data) {
  try {
    await apiService.save(data);
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### Solusi

**Tambahkan error handling:**
```javascript
window.buttonHandler.register('save', async function(button, data) {
  try {
    await apiService.save(data);
    showNotification('Berhasil', 'success');
  } catch (error) {
    console.error('Save error:', error);
    
    // Kategorisasi error
    if (error.status === 401) {
      showNotification('Sesi berakhir. Silakan login kembali.', 'error');
      redirectToLogin();
    } else if (error.status === 403) {
      showNotification('Anda tidak memiliki akses.', 'error');
    } else if (error.status === 422) {
      showNotification('Data tidak valid: ' + error.message, 'error');
    } else {
      showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
    }
  }
});
```

---

## Double Click Issues

### Gejala
Button diklik dua kali dan operation dijalankan dua kali.

### Diagnosis

1. **Cek apakah GlobalButtonHandler digunakan:**
```javascript
// GlobalButtonHandler otomatis mencegah double click
console.log(window.buttonHandler);
```

2. **Cek apakah button disabled saat loading:**
```javascript
const button = document.querySelector('[data-action="save"]');
console.log(button.disabled); // Harus true saat loading
```

### Solusi

**Gunakan GlobalButtonHandler:**
```javascript
// GlobalButtonHandler otomatis handle debouncing
window.buttonHandler.register('save', async function(button, data) {
  await apiService.save(data);
});
```

**Atau manual debounce:**
```javascript
let isProcessing = false;

async function saveData() {
  if (isProcessing) return;
  
  isProcessing = true;
  try {
    await apiService.save(data);
  } finally {
    isProcessing = false;
  }
}
```

---

## Modal Tidak Menutup

### Gejala
Modal tetap terbuka setelah button close diklik.

### Diagnosis

1. **Cek apakah close handler terdaftar:**
```javascript
console.log(window.buttonHandler.handlers['modal-close']);
```

2. **Cek apakah data-modal attribute ada:**
```html
<button data-action="modal-close" data-modal="myModal">
  Tutup
</button>
```

### Solusi

**Daftarkan close handler:**
```javascript
window.buttonHandler.register('modal-close', function(button, data) {
  const modal = document.getElementById(data.modal);
  if (modal) {
    modal.style.display = 'none';
    
    // Cleanup
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
});
```

**Pastikan data-modal ada:**
```html
<button 
  class="btn btn-secondary" 
  data-action="modal-close" 
  data-modal="myModal">
  Tutup
</button>
```

---

## Form Tidak Submit

### Gejala
Form submit button diklik tapi form tidak tersubmit.

### Diagnosis

1. **Cek apakah form validation pass:**
```javascript
const form = document.getElementById('myForm');
console.log(form.checkValidity()); // Harus true
```

2. **Cek console untuk validation errors:**
```javascript
// Buka DevTools > Console
// Lihat validation error messages
```

### Solusi

**Tambahkan validation:**
```javascript
window.buttonHandler.register('form-submit', async function(button, data) {
  const form = document.getElementById(data.form);
  
  // Validate
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Submit
  const formData = new FormData(form);
  await apiService.save(Object.fromEntries(formData));
});
```

**Pastikan required fields terisi:**
```html
<input 
  type="text" 
  name="name" 
  required 
  class="form-control">
```

---

## Download Tidak Berfungsi

### Gejala
Download button diklik tapi file tidak terdownload.

### Diagnosis

1. **Cek network tab:**
```
DevTools > Network > Cari request download
Lihat status code dan response
```

2. **Cek console untuk errors:**
```javascript
// Lihat error messages di console
```

### Solusi

**Pastikan response type benar:**
```javascript
window.buttonHandler.register('download-pdf', async function(button, data) {
  try {
    const response = await fetch(`/api/reports/${data.reportId}/pdf`);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${data.reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Download berhasil', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showNotification('Download gagal', 'error');
  }
});
```

---

## Accessibility Issues

### Gejala
Button tidak dapat diakses dengan keyboard atau screen reader.

### Diagnosis

1. **Test keyboard navigation:**
```
- Tekan Tab untuk focus button
- Tekan Enter/Space untuk activate
```

2. **Test dengan screen reader:**
```
- Aktifkan NVDA atau JAWS
- Navigate ke button
- Dengar apakah label dibaca
```

### Solusi

**Tambahkan aria-label:**
```html
<button 
  class="btn btn-primary" 
  data-action="edit"
  aria-label="Edit data">
  <i data-lucide="edit"></i>
</button>
```

**Pastikan tabindex benar:**
```html
<!-- Button harus dapat di-focus -->
<button tabindex="0" data-action="save">
  Simpan
</button>

<!-- Disabled button tidak dapat di-focus -->
<button tabindex="-1" disabled>
  Simpan
</button>
```

---

## Performance Issues

### Gejala
Button response lambat atau aplikasi lag.

### Diagnosis

1. **Cek Performance tab:**
```
DevTools > Performance > Record > Click button > Stop
Lihat flame graph untuk bottlenecks
```

2. **Cek Memory tab:**
```
DevTools > Memory > Take heap snapshot
Lihat memory usage
```

### Solusi

**Optimize event listeners:**
```javascript
// Gunakan event delegation
// GlobalButtonHandler sudah menggunakan ini
```

**Lazy load handlers:**
```javascript
window.buttonHandler.register('advanced-feature', async function(button, data) {
  // Load module hanya saat dibutuhkan
  const module = await import('./advanced-feature.js');
  await module.execute(data);
});
```

**Debounce rapid clicks:**
```javascript
// GlobalButtonHandler otomatis debounce
```

---

## Debugging Tips

### 1. Enable Debug Mode

```javascript
// Di console
window.buttonHandler.debug = true;

// Setiap button click akan log detail
```

### 2. Inspect Button State

```javascript
// Di console
const button = document.querySelector('[data-action="save"]');
console.log({
  action: button.dataset.action,
  disabled: button.disabled,
  classList: button.classList.toString(),
  handler: window.buttonHandler.handlers[button.dataset.action]
});
```

### 3. Monitor Button Clicks

```javascript
// Di console
window.buttonHandler.on('click', (button, data) => {
  console.log('Button clicked:', button, data);
});
```

### 4. Check Handler Registration

```javascript
// Di console
console.table(Object.keys(window.buttonHandler.handlers));
```

### 5. Test Handler Manually

```javascript
// Di console
const button = document.querySelector('[data-action="save"]');
const handler = window.buttonHandler.handlers['save'];
handler(button, button.dataset);
```

---

## Common Error Messages

### "Handler not found for action: xxx"

**Penyebab:** Handler belum didaftarkan.

**Solusi:**
```javascript
window.buttonHandler.register('xxx', async function(button, data) {
  // Implementasi
});
```

### "Button is disabled"

**Penyebab:** Button dalam state disabled.

**Solusi:**
```javascript
button.disabled = false;
```

### "Form validation failed"

**Penyebab:** Required fields tidak terisi atau format tidak valid.

**Solusi:**
```javascript
// Cek validation
const form = document.getElementById('myForm');
form.checkValidity();
form.reportValidity(); // Show validation messages
```

---

## Kontak Support

Jika masalah masih berlanjut:

1. Cek dokumentasi lengkap di `docs/BUTTON_COMPONENT_DOCUMENTATION.md`
2. Lihat contoh penggunaan di `docs/BUTTON_USAGE_EXAMPLES.md`
3. Baca best practices di `docs/BUTTON_BEST_PRACTICES.md`
4. Hubungi tim development

