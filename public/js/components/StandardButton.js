/**
 * StandardButton Component
 * Komponen tombol standar dengan behavior konsisten
 * 
 * Features:
 * - Multiple variants (primary, secondary, danger, success)
 * - Multiple sizes (sm, md, lg)
 * - Icon support
 * - Tooltip support
 * - Loading state management
 * - Disabled state management
 * - Keyboard navigation support
 * 
 * @class StandardButton
 */
class StandardButton {
  /**
   * @param {Object} options - Konfigurasi button
   * @param {string} options.text - Text button
   * @param {string} [options.variant='primary'] - Variant: primary, secondary, danger, success
   * @param {string} [options.size='md'] - Size: sm, md, lg
   * @param {string} [options.icon] - Icon class (lucide icon)
   * @param {string} [options.iconPosition='left'] - Icon position: left, right
   * @param {string} [options.tooltip] - Tooltip text
   * @param {Function} [options.onClick] - Click handler
   * @param {boolean} [options.disabled=false] - Disabled state
   * @param {string} [options.ariaLabel] - Aria label untuk accessibility
   * @param {string} [options.className] - Additional CSS classes
   */
  constructor(options = {}) {
    this.options = {
      text: options.text || '',
      variant: options.variant || 'primary',
      size: options.size || 'md',
      icon: options.icon || null,
      iconPosition: options.iconPosition || 'left',
      tooltip: options.tooltip || null,
      onClick: options.onClick || null,
      disabled: options.disabled || false,
      ariaLabel: options.ariaLabel || null,
      className: options.className || ''
    };

    this.element = null;
    this.isLoading = false;
    this.isDisabled = this.options.disabled;
    
    this._createButton();
  }

  /**
   * Create button element
   * @private
   */
  _createButton() {
    // Create button element
    this.element = document.createElement('button');
    this.element.type = 'button';
    
    // Add base classes
    this.element.className = this._getButtonClasses();
    
    // Add aria-label
    if (this.options.ariaLabel) {
      this.element.setAttribute('aria-label', this.options.ariaLabel);
    } else if (this.options.text) {
      this.element.setAttribute('aria-label', this.options.text);
    }
    
    // Add tooltip
    if (this.options.tooltip) {
      this.element.title = this.options.tooltip;
    }
    
    // Set disabled state
    if (this.isDisabled) {
      this.element.disabled = true;
      this.element.setAttribute('aria-disabled', 'true');
    }
    
    // Add content
    this._updateButtonContent();
    
    // Add event listeners
    this._attachEventListeners();
  }

  /**
   * Get button CSS classes
   * @private
   * @returns {string}
   */
  _getButtonClasses() {
    const classes = ['standard-button'];
    
    // Add variant class
    classes.push(`standard-button--${this.options.variant}`);
    
    // Add size class
    classes.push(`standard-button--${this.options.size}`);
    
    // Add icon-only class if no text
    if (this.options.icon && !this.options.text) {
      classes.push('standard-button--icon-only');
    }
    
    // Add loading class
    if (this.isLoading) {
      classes.push('standard-button--loading');
    }
    
    // Add custom classes
    if (this.options.className) {
      classes.push(this.options.className);
    }
    
    return classes.join(' ');
  }

  /**
   * Update button content
   * @private
   */
  _updateButtonContent() {
    this.element.innerHTML = '';
    
    // Add loading spinner if loading
    if (this.isLoading) {
      const spinner = document.createElement('span');
      spinner.className = 'standard-button__spinner';
      spinner.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i>';
      this.element.appendChild(spinner);
    }
    
    // Add icon (left position)
    if (this.options.icon && this.options.iconPosition === 'left' && !this.isLoading) {
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', this.options.icon);
      icon.className = 'standard-button__icon standard-button__icon--left';
      this.element.appendChild(icon);
    }
    
    // Add text
    if (this.options.text) {
      const textSpan = document.createElement('span');
      textSpan.className = 'standard-button__text';
      textSpan.textContent = this.options.text;
      this.element.appendChild(textSpan);
    }
    
    // Add icon (right position)
    if (this.options.icon && this.options.iconPosition === 'right' && !this.isLoading) {
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', this.options.icon);
      icon.className = 'standard-button__icon standard-button__icon--right';
      this.element.appendChild(icon);
    }
    
    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    if (this.options.onClick) {
      this.element.addEventListener('click', (e) => {
        if (!this.isDisabled && !this.isLoading) {
          this.options.onClick(e, this);
        }
      });
    }
    
    // Keyboard navigation support
    this.element.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.isDisabled && !this.isLoading) {
        e.preventDefault();
        this.element.click();
      }
    });
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    if (loading) {
      this.element.disabled = true;
      this.element.classList.add('standard-button--loading');
    } else {
      this.element.disabled = this.isDisabled;
      this.element.classList.remove('standard-button--loading');
    }
    
    this._updateButtonContent();
  }

  /**
   * Set disabled state
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    this.isDisabled = disabled;
    
    if (disabled) {
      this.element.disabled = true;
      this.element.setAttribute('aria-disabled', 'true');
      this.element.classList.add('standard-button--disabled');
    } else {
      this.element.disabled = false;
      this.element.removeAttribute('aria-disabled');
      this.element.classList.remove('standard-button--disabled');
    }
  }

  /**
   * Set text
   * @param {string} text - New text
   */
  setText(text) {
    this.options.text = text;
    this._updateButtonContent();
  }

  /**
   * Set icon
   * @param {string} icon - New icon class
   */
  setIcon(icon) {
    this.options.icon = icon;
    this._updateButtonContent();
  }

  /**
   * Set variant
   * @param {string} variant - New variant
   */
  setVariant(variant) {
    this.element.classList.remove(`standard-button--${this.options.variant}`);
    this.options.variant = variant;
    this.element.classList.add(`standard-button--${this.options.variant}`);
  }

  /**
   * Get button element
   * @returns {HTMLButtonElement}
   */
  getElement() {
    return this.element;
  }

  /**
   * Render button to container
   * @param {HTMLElement|string} container - Container element or selector
   */
  render(container) {
    const containerElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (containerElement) {
      containerElement.appendChild(this.element);
    }
  }

  /**
   * Destroy button
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StandardButton;
}
