/**
 * Form Button Handler
 * Menangani semua tombol submit form dengan validation dan error handling
 */

class FormButtonHandler {
  constructor() {
    this.submittingForms = new Set();
    this.validators = new Map();
    this.init();
  }

  init() {
    // Setup global form submit handler
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        e.preventDefault();
        this.handleFormSubmit(form);
      }
    });

    // Setup button click handler untuk form submit buttons
    document.addEventListener('click', (e) => {
      const submitBtn = e.target.closest('button[type="submit"], input[type="submit"]');
      if (submitBtn && submitBtn.form) {
        e.preventDefault();
        this.handleFormSubmit(submitBtn.form);
      }
    });

    // Register default validators
    this.registerDefaultValidators();
  }

  /**
   * Handle form submit
   */
  async handleFormSubmit(form) {
    try {
      // Prevent double submission
      if (this.submittingForms.has(form)) {
        console.warn('Form already submitting');
        return;
      }

      // Validate form
      const validation = this.validateForm(form);
      if (!validation.valid) {
        this.showValidationErrors(form, validation.errors);
        return;
      }

      // Mark as submitting
      this.submittingForms.add(form);

      // Get submit button
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      
      // Set loading state
      if (submitBtn) {
        this.setButtonLoading(submitBtn, true);
      }

      // Get submit handler
      const submitHandler = form.dataset.submitHandler || form.getAttribute('onsubmit');
      
      if (submitHandler && typeof window[submitHandler] === 'function') {
        // Execute custom handler
        const formData = new FormData(form);
        const result = await window[submitHandler](formData);
        
        if (result && result.success !== false) {
          this.handleSubmitSuccess(form, result);
        } else {
          this.handleSubmitError(form, result?.message || 'Gagal menyimpan data');
        }
      } else {
        // Default submit behavior
        await this.defaultSubmitHandler(form);
      }
    } catch (error) {
      console.error('Form submit error:', error);
      this.handleSubmitError(form, 'Terjadi kesalahan saat menyimpan data');
    } finally {
      // Reset loading state
      this.submittingForms.delete(form);
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        this.setButtonLoading(submitBtn, false);
      }
    }
  }

  /**
   * Submit form (alias for handleFormSubmit)
   */
  submitForm(form) {
    return this.handleFormSubmit(form);
  }

  /**
   * Validate form
   */
  validateForm(form) {
    const errors = [];
    
    // HTML5 validation
    if (!form.checkValidity()) {
      const invalidFields = form.querySelectorAll(':invalid');
      invalidFields.forEach(field => {
        errors.push({
          field: field.name,
          message: field.validationMessage || 'Field tidak valid'
        });
      });
    }

    // Custom validators
    const fields = form.querySelectorAll('[data-validate]');
    fields.forEach(field => {
      const validatorName = field.dataset.validate;
      const validator = this.validators.get(validatorName);
      
      if (validator) {
        const result = validator(field.value, field);
        if (!result.valid) {
          errors.push({
            field: field.name,
            message: result.message
          });
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Show validation errors
   */
  showValidationErrors(form, errors) {
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Show new errors
    errors.forEach(error => {
      const field = form.querySelector(`[name="${error.field}"]`);
      if (field) {
        // Add error class
        field.classList.add('is-invalid');

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger small mt-1';
        errorDiv.textContent = error.message;
        field.parentElement.appendChild(errorDiv);

        // Focus first error field
        if (errors.indexOf(error) === 0) {
          field.focus();
        }
      }
    });

    // Show summary error
    this.showError('Mohon perbaiki field yang tidak valid');
  }

  /**
   * Handle submit success
   */
  handleSubmitSuccess(form, result) {
    // Show success message
    this.showSuccess(result?.message || 'Data berhasil disimpan');

    // Reset form
    form.reset();

    // Clear validation errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Close modal if form is in modal
    const modal = form.closest('.modal');
    if (modal && window.modalButtonHandler) {
      window.modalButtonHandler.closeModal(modal);
    }

    // Trigger refresh if needed
    if (typeof window.refreshData === 'function') {
      window.refreshData();
    }

    // Trigger custom success event
    form.dispatchEvent(new CustomEvent('form:success', {
      detail: { result }
    }));
  }

  /**
   * Handle submit error
   */
  handleSubmitError(form, message) {
    this.showError(message);

    // Trigger custom error event
    form.dispatchEvent(new CustomEvent('form:error', {
      detail: { message }
    }));
  }

  /**
   * Default submit handler
   */
  async defaultSubmitHandler(form) {
    const formData = new FormData(form);
    const action = form.action || window.location.href;
    const method = form.method || 'POST';

    const response = await fetch(action, {
      method: method.toUpperCase(),
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Set button loading state
   */
  setButtonLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      button.dataset.originalText = button.textContent;
      button.textContent = 'Menyimpan...';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  /**
   * Register validator
   */
  registerValidator(name, validator) {
    this.validators.set(name, validator);
  }

  /**
   * Register default validators
   */
  registerDefaultValidators() {
    // Email validator
    this.registerValidator('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        valid: emailRegex.test(value),
        message: 'Format email tidak valid'
      };
    });

    // Phone validator
    this.registerValidator('phone', (value) => {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      return {
        valid: phoneRegex.test(value) && value.length >= 10,
        message: 'Format nomor telepon tidak valid'
      };
    });

    // URL validator
    this.registerValidator('url', (value) => {
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return {
          valid: false,
          message: 'Format URL tidak valid'
        };
      }
    });

    // Number validator
    this.registerValidator('number', (value) => {
      return {
        valid: !isNaN(value) && value !== '',
        message: 'Harus berupa angka'
      };
    });

    // Min length validator
    this.registerValidator('minlength', (value, field) => {
      const minLength = parseInt(field.dataset.minlength || field.minLength);
      return {
        valid: value.length >= minLength,
        message: `Minimal ${minLength} karakter`
      };
    });

    // Max length validator
    this.registerValidator('maxlength', (value, field) => {
      const maxLength = parseInt(field.dataset.maxlength || field.maxLength);
      return {
        valid: value.length <= maxLength,
        message: `Maksimal ${maxLength} karakter`
      };
    });

    // Min value validator
    this.registerValidator('min', (value, field) => {
      const min = parseFloat(field.dataset.min || field.min);
      return {
        valid: parseFloat(value) >= min,
        message: `Nilai minimal ${min}`
      };
    });

    // Max value validator
    this.registerValidator('max', (value, field) => {
      const max = parseFloat(field.dataset.max || field.max);
      return {
        valid: parseFloat(value) <= max,
        message: `Nilai maksimal ${max}`
      };
    });

    // Pattern validator
    this.registerValidator('pattern', (value, field) => {
      const pattern = new RegExp(field.dataset.pattern || field.pattern);
      return {
        valid: pattern.test(value),
        message: field.dataset.patternMessage || 'Format tidak valid'
      };
    });
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'success');
    } else {
      alert(message);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Initialize form button handler
if (typeof window !== 'undefined') {
  window.formButtonHandler = new FormButtonHandler();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormButtonHandler;
}
