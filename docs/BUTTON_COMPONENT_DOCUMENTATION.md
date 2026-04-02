# Button Component Documentation

## Overview

Sistem button component yang komprehensif untuk aplikasi Manajemen Risiko. Sistem ini menyediakan komponen button yang konsisten, accessible, dan mudah digunakan dengan fitur error handling, loading states, dan monitoring terintegrasi.

## Table of Contents

1. [StandardButton Component](#standardbutton-component)
2. [GlobalButtonHandler](#globalbuttonhandler)
3. [Button Error Handler](#button-error-handler)
4. [Logging & Monitoring](#logging--monitoring)
5. [Alert System](#alert-system)

---

## StandardButton Component

### Description

`StandardButton` adalah komponen button yang dapat digunakan kembali dengan berbagai variant, size, dan state.

### Location

`public/js/components/StandardButton.js`

### API Reference

#### Constructor

```javascript
new StandardButton(options)
```

**Parameters:**

- `options` (Object):
  - `text` (String): Text yang ditampilkan di button
  - `variant` (String): Variant button - `'primary'`, `'secondary'`, `'danger'`, `'success'` (default: `'primary'`)
  - `size` (String): Ukuran button - `'sm'`, `'md'`, `'lg'` (default: `'md'`)
  - `icon` (String): Nama icon dari Lucide Icons (optional)
  - `iconPosition` (String): Posisi icon - `'left'`, `'right'` (default: `'left'`)
  - `onClick` (Function): Handler function saat button diklik
  - `disabled` (Boolean): Apakah button disabled (default: `false`)
  - `tooltip` (String): Tooltip text (optional)
  - `ariaLabel` (String): ARIA label untuk accessibility (optional)

#### Methods

##### `render()`

Render button element dan return DOM element.

```javascript
const button = new StandardButton({
  text: 'Save',
  variant: 'primary',
  onClick: () => console.log('Saved!')
});

const element = button.render();
document.body.appendChild(element);
```

##### `setLoading(isLoading)`

Set loading state button.

```javascript
button.setLoading(true);  // Show loading
button.setLoading(false); // Hide loading
```

##### `setDisabled(isDisabled)`

Set disabled state button.

```javascript
button.setDisabled(true);  // Disable button
button.setDisabled(false); // Enable button
```

##### `setText(text)`

Update text button.

```javascript
button.setText('Updated Text');
```

##### `destroy()`

Cleanup button dan remove event listeners.

```javascript
button.destroy();
```

### Usage Examples

#### Basic Button

```javascript
const saveButton = new StandardButton({
  text: 'Save',
  variant: 'primary',
  onClick: handleSave
});

document.getElementById('container').appendChild(saveButton.render());
```

#### Button with Icon

```javascript
const deleteButton = new StandardButton({
  text: 'Delete',
  variant: 'danger',
  icon: 'trash-2',
  onClick: handleDelete
});
```

#### Button with Loading State

```javascript
const submitButton = new StandardButton({
  text: 'Submit',
  variant: 'primary',
  onClick: async () => {
    submitButton.setLoading(true);
    try {
      await submitData();
      alert('Success!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      submitButton.setLoading(false);
    }
  }
});
```

#### Icon-Only Button

```javascript
const editButton = new StandardButton({
  text: '',
  icon: 'edit',
  variant: 'secondary',
  size: 'sm',
  ariaLabel: 'Edit item',
  tooltip: 'Edit',
  onClick: handleEdit
});
```

---

## GlobalButtonHandler

### Description

Sistem global untuk handle button clicks menggunakan event delegation pattern.

### Location

`public/js/GlobalButtonHandler.js`

### API Reference

#### Methods

##### `registerHandler(action, handler)`

Register handler untuk action tertentu.

```javascript
window.globalButtonHandler.registerHandler('save', async (button, event) => {
  // Handle save action
  console.log('Save clicked', button);
});
```

##### `unregisterHandler(action)`

Unregister handler untuk action tertentu.

```javascript
window.globalButtonHandler.unregisterHandler('save');
```

##### `handleClick(button, event)`

Handle button click (dipanggil otomatis oleh event listener).

### Usage Examples

#### Register Custom Handler

```javascript
// Register handler untuk action 'export'
window.globalButtonHandler.registerHandler('export', async (button, event) => {
  const format = button.dataset.format || 'pdf';
  const data = await fetchData();
  downloadFile(data, format);
});
```

#### Use Data-Action Attribute

```html
<!-- Button akan otomatis menggunakan registered handler -->
<button data-action="export" data-format="excel">
  Export to Excel
</button>
```

---

## Button Error Handler

### Description

Sistem untuk handle dan display error yang terjadi pada button operations.

### Location

`public/js/button-error-handler.js`

### API Reference

#### Methods

##### `handleError(error, button)`

Handle error dan display user-friendly message.

```javascript
try {
  await riskyOperation();
} catch (error) {
  window.buttonErrorHandler.handleError(error, buttonElement);
}
```

##### `categorizeError(error)`

Categorize error berdasarkan type.

Returns: `{ category, userMessage, canRetry, helpLink }`

##### `showErrorMessage(message, button)`

Display error message ke user.

### Error Categories

1. **Handler Not Found**: Function handler tidak ditemukan
2. **API Error**: Error dari API call
3. **Validation Error**: Error validasi data
4. **Network Error**: Error koneksi network
5. **Permission Error**: Error permission/authorization

### Usage Examples

```javascript
async function saveData(button) {
  try {
    button.setLoading(true);
    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data');
    }
    
    alert('Data saved successfully!');
  } catch (error) {
    window.buttonErrorHandler.handleError(error, button);
  } finally {
    button.setLoading(false);
  }
}
```

---

## Logging & Monitoring

### Button Click Logger

#### Description

Mencatat setiap button click untuk analisis dan monitoring.

#### Location

`public/js/button-click-logger.js`

#### API Reference

##### `logClick(buttonInfo)`

Log button click.

```javascript
window.buttonClickLogger.logClick({
  id: 'save-button',
  text: 'Save',
  action: 'save',
  clickPosition: { x: 100, y: 200 }
});
```

##### `getStatistics()`

Get click statistics.

```javascript
const stats = window.buttonClickLogger.getStatistics();
console.log('Total clicks:', stats.totalClicks);
console.log('Clicks by action:', stats.clicksByAction);
```

##### `exportLogs()`

Export logs as JSON string.

```javascript
const json = window.buttonClickLogger.exportLogs();
console.log(json);
```

##### `downloadLogs()`

Download logs as file.

```javascript
window.buttonClickLogger.downloadLogs();
```

### Button Error Logger

#### Description

Mencatat semua error yang terjadi pada button handlers.

#### Location

`public/js/button-error-logger.js`

#### API Reference

##### `logError(errorInfo)`

Log error.

```javascript
window.buttonErrorLogger.logError({
  type: 'APIError',
  message: 'Failed to fetch data',
  stack: error.stack,
  buttonId: 'fetch-button',
  severity: 'error'
});
```

##### `getStatistics()`

Get error statistics.

```javascript
const stats = window.buttonErrorLogger.getStatistics();
console.log('Total errors:', stats.totalErrors);
console.log('Error rate:', stats.errorRate);
```

##### `calculateErrorRate()`

Calculate current error rate (errors per minute).

```javascript
const rate = window.buttonErrorLogger.calculateErrorRate();
console.log('Current error rate:', rate);
```

---

## Alert System

### Description

Sistem alerting untuk mengirim notifikasi jika error rate tinggi atau button tidak berfungsi.

### Location

`public/js/button-alert-system.js`

### API Reference

#### Methods

##### `addAlertHandler(handler)`

Add custom alert handler.

```javascript
window.buttonAlertSystem.addAlertHandler((alert) => {
  console.log('Alert:', alert.title);
  // Send to monitoring service
  sendToMonitoring(alert);
});
```

##### `triggerAlert(alert)`

Trigger alert manually.

```javascript
window.buttonAlertSystem.triggerAlert({
  type: 'CUSTOM_ALERT',
  severity: 'warning',
  title: 'Custom Alert',
  message: 'Something needs attention',
  data: { customData: 'value' }
});
```

##### `getAlertSummary()`

Get alert summary.

```javascript
const summary = window.buttonAlertSystem.getAlertSummary();
console.log('Unacknowledged alerts:', summary.unacknowledged);
```

### Alert Types

1. **HIGH_ERROR_RATE**: Error rate sangat tinggi
2. **ELEVATED_ERROR_RATE**: Error rate tinggi
3. **BUTTON_CONSECUTIVE_FAILURES**: Button gagal berturut-turut
4. **CRITICAL_BUTTON_ERROR**: Critical error pada button
5. **HIGH_BUTTON_FAILURE_RATE**: Button failure rate tinggi
6. **CRITICAL_ERRORS_DETECTED**: Critical error terdeteksi

### Alert Thresholds

```javascript
{
  errorRate: 5,              // errors per minute
  criticalErrorRate: 10,     // errors per minute
  consecutiveErrors: 3,      // consecutive failures
  buttonFailureRate: 0.5     // 50% failure rate
}
```

---

## Monitoring Dashboard

### Description

Dashboard untuk monitoring button usage dan error rates secara real-time.

### Location

`public/test-button-monitoring-dashboard.html`

### Features

1. **Statistics Cards**: Total clicks, total errors, error rate, success rate
2. **Charts**: Clicks by action, errors by type
3. **Tables**: Recent errors, top clicked buttons
4. **Actions**: Refresh, export data, clear data
5. **Auto-refresh**: Update setiap 5 detik

### Usage

Buka dashboard di browser:

```
http://localhost:3000/test-button-monitoring-dashboard.html
```

---

## Best Practices

### 1. Always Use StandardButton for Consistency

```javascript
// ✓ Good
const button = new StandardButton({
  text: 'Save',
  variant: 'primary',
  onClick: handleSave
});

// ✗ Bad
const button = document.createElement('button');
button.textContent = 'Save';
button.onclick = handleSave;
```

### 2. Always Handle Errors

```javascript
// ✓ Good
async function handleSave(button) {
  try {
    button.setLoading(true);
    await saveData();
  } catch (error) {
    window.buttonErrorHandler.handleError(error, button);
  } finally {
    button.setLoading(false);
  }
}

// ✗ Bad
async function handleSave(button) {
  await saveData(); // No error handling
}
```

### 3. Use Data-Action for Common Actions

```html
<!-- ✓ Good -->
<button data-action="delete" data-id="123">Delete</button>

<!-- ✗ Bad -->
<button onclick="deleteItem(123)">Delete</button>
```

### 4. Provide Accessibility Labels

```javascript
// ✓ Good
new StandardButton({
  text: '',
  icon: 'edit',
  ariaLabel: 'Edit item',
  tooltip: 'Edit'
});

// ✗ Bad
new StandardButton({
  text: '',
  icon: 'edit'
  // No aria-label for icon-only button
});
```

### 5. Monitor Error Rates

```javascript
// Check error rate periodically
setInterval(() => {
  const rate = window.buttonErrorLogger.calculateErrorRate();
  if (rate > 5) {
    console.warn('High error rate detected:', rate);
  }
}, 60000); // Every minute
```

---

## Troubleshooting

### Button Not Working

1. Check console untuk error messages
2. Verify handler is registered: `window.globalButtonHandler.handlers`
3. Check button has correct data-action attribute
4. Verify button is not disabled

### High Error Rate

1. Open monitoring dashboard
2. Check "Recent Errors" table
3. Identify common error patterns
4. Fix underlying issues

### Logging Not Working

1. Verify logger scripts are loaded
2. Check localStorage is available
3. Check console for initialization messages
4. Verify global instances exist: `window.buttonClickLogger`, `window.buttonErrorLogger`

---

## Support

Untuk pertanyaan atau issues, silakan hubungi tim development atau buka issue di repository.
