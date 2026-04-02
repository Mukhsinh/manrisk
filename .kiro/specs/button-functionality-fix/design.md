# Design Document: Perbaikan Fungsi Tombol Aplikasi

## Overview

Design ini menyediakan solusi komprehensif untuk memperbaiki semua tombol yang tidak berfungsi di aplikasi Manajemen Risiko. Solusi ini mencakup identifikasi otomatis tombol bermasalah, perbaikan event handler, standardisasi button component, dan testing menyeluruh.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Button Audit System                       │
├─────────────────────────────────────────────────────────────┤
│  1. Scanner Module                                           │
│     - HTML Parser                                            │
│     - JavaScript Analyzer                                    │
│     - Event Handler Validator                                │
│                                                              │
│  2. Fix Module                                               │
│     - Event Handler Generator                                │
│     - Error Handler Wrapper                                  │
│     - Loading State Manager                                  │
│                                                              │
│  3. Button Component Library                                 │
│     - Standard Button                                        │
│     - Icon Button                                            │
│     - Action Button                                          │
│     - Modal Button                                           │
│                                                              │
│  4. Testing Module                                           │
│     - Automated Click Test                                   │
│     - Event Handler Test                                     │
│     - Accessibility Test                                     │
│                                                              │
│  5. Monitoring Module                                        │
│     - Click Logger                                           │
│     - Error Logger                                           │
│     - Performance Monitor                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
User Click → Button Component → Event Handler → API Call → Response Handler → UI Update
                    ↓                  ↓              ↓              ↓
                 Logger          Error Handler   Loading State   Success/Error Message
```

## Components and Interfaces

### 1. Scanner Module

#### ButtonScanner Class

```javascript
class ButtonScanner {
    constructor(options = {}) {
        this.htmlFiles = [];
        this.jsFiles = [];
        this.buttons = [];
        this.issues = [];
        this.options = {
            scanPath: options.scanPath || 'public',
            excludePatterns: options.excludePatterns || ['node_modules', 'test'],
            ...options
        };
    }

    /**
     * Scan semua file HTML untuk menemukan tombol
     * @returns {Promise<Array>} Array of button objects
     */
    async scanHTMLFiles() {
        // Implementation
    }

    /**
     * Scan semua file JavaScript untuk menemukan fungsi event handler
     * @returns {Promise<Array>} Array of function names
     */
    async scanJavaScriptFiles() {
        // Implementation
    }

    /**
     * Validasi bahwa setiap tombol memiliki event handler yang valid
     * @returns {Promise<Array>} Array of issues
     */
    async validateEventHandlers() {
        // Implementation
    }

    /**
     * Generate laporan audit
     * @returns {Object} Audit report
     */
    generateReport() {
        // Implementation
    }
}
```

#### Button Object Structure

```javascript
{
    id: 'unique-button-id',
    file: 'path/to/file.html',
    line: 123,
    type: 'button|input|a',
    classes: ['btn', 'btn-primary'],
    text: 'Button Text',
    onclick: 'functionName()',
    dataAction: 'actionName',
    ariaLabel: 'Descriptive Label',
    issues: [
        {
            severity: 'ERROR|WARNING|INFO',
            message: 'Issue description',
            fix: 'Suggested fix'
        }
    ]
}
```

### 2. Fix Module

#### EventHandlerFixer Class

```javascript
class EventHandlerFixer {
    constructor(scanner) {
        this.scanner = scanner;
        this.fixes = [];
    }

    /**
     * Generate stub function untuk event handler yang tidak ada
     * @param {String} functionName - Nama fungsi
     * @returns {String} Generated function code
     */
    generateStubFunction(functionName) {
        return `
function ${functionName}(element) {
    console.warn('${functionName} is not implemented yet');
    // TODO: Implement ${functionName}
}
        `.trim();
    }

    /**
     * Wrap event handler dengan error handling
     * @param {String} functionName - Nama fungsi
     * @param {Function} originalFunction - Fungsi asli
     * @returns {Function} Wrapped function
     */
    wrapWithErrorHandling(functionName, originalFunction) {
        return async function(...args) {
            try {
                // Show loading state
                const button = args[0];
                if (button && button.classList) {
                    button.classList.add('loading');
                    button.disabled = true;
                }

                // Call original function
                const result = await originalFunction.apply(this, args);

                // Hide loading state
                if (button && button.classList) {
                    button.classList.remove('loading');
                    button.disabled = false;
                }

                return result;
            } catch (error) {
                console.error(`Error in ${functionName}:`, error);
                
                // Hide loading state
                const button = args[0];
                if (button && button.classList) {
                    button.classList.remove('loading');
                    button.disabled = false;
                }

                // Show error message
                showErrorMessage(`Terjadi kesalahan: ${error.message}`);
                
                throw error;
            }
        };
    }

    /**
     * Apply fixes ke semua tombol bermasalah
     * @returns {Promise<Array>} Array of applied fixes
     */
    async applyFixes() {
        // Implementation
    }
}
```

### 3. Button Component Library

#### StandardButton Component

```javascript
class StandardButton {
    constructor(options = {}) {
        this.element = null;
        this.options = {
            text: options.text || '',
            icon: options.icon || null,
            variant: options.variant || 'primary', // primary, secondary, danger, success
            size: options.size || 'md', // sm, md, lg
            disabled: options.disabled || false,
            loading: options.loading || false,
            onClick: options.onClick || null,
            ariaLabel: options.ariaLabel || options.text,
            ...options
        };
    }

    /**
     * Render button element
     * @returns {HTMLElement} Button element
     */
    render() {
        const button = document.createElement('button');
        button.className = `btn btn-${this.options.variant} btn-${this.options.size} text-truncate`;
        button.setAttribute('aria-label', this.options.ariaLabel);
        
        if (this.options.disabled) {
            button.disabled = true;
        }

        if (this.options.loading) {
            button.classList.add('loading');
            button.disabled = true;
        }

        // Add icon if provided
        if (this.options.icon) {
            const icon = document.createElement('i');
            icon.className = this.options.icon;
            button.appendChild(icon);
        }

        // Add text
        if (this.options.text) {
            const text = document.createTextNode(this.options.text);
            button.appendChild(text);
        }

        // Add click handler
        if (this.options.onClick) {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                this.setLoading(true);
                try {
                    await this.options.onClick(e);
                } catch (error) {
                    console.error('Button click error:', error);
                    showErrorMessage(error.message);
                } finally {
                    this.setLoading(false);
                }
            });
        }

        this.element = button;
        return button;
    }

    /**
     * Set loading state
     * @param {Boolean} loading - Loading state
     */
    setLoading(loading) {
        if (!this.element) return;
        
        if (loading) {
            this.element.classList.add('loading');
            this.element.disabled = true;
        } else {
            this.element.classList.remove('loading');
            this.element.disabled = this.options.disabled;
        }
    }

    /**
     * Set disabled state
     * @param {Boolean} disabled - Disabled state
     */
    setDisabled(disabled) {
        this.options.disabled = disabled;
        if (this.element) {
            this.element.disabled = disabled;
        }
    }
}
```

### 4. Global Event Delegation System

```javascript
class GlobalButtonHandler {
    constructor() {
        this.handlers = new Map();
        this.init();
    }

    /**
     * Initialize global event delegation
     */
    init() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const handler = this.handlers.get(action);

            if (handler) {
                e.preventDefault();
                this.executeHandler(button, handler);
            } else {
                console.warn(`No handler registered for action: ${action}`);
            }
        });
    }

    /**
     * Register action handler
     * @param {String} action - Action name
     * @param {Function} handler - Handler function
     */
    register(action, handler) {
        this.handlers.set(action, handler);
    }

    /**
     * Execute handler with error handling and loading state
     * @param {HTMLElement} button - Button element
     * @param {Function} handler - Handler function
     */
    async executeHandler(button, handler) {
        try {
            // Set loading state
            button.classList.add('loading');
            button.disabled = true;

            // Execute handler
            await handler(button);

            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;
        } catch (error) {
            console.error('Handler execution error:', error);
            
            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;

            // Show error message
            showErrorMessage(`Terjadi kesalahan: ${error.message}`);
        }
    }
}

// Initialize global handler
const globalButtonHandler = new GlobalButtonHandler();
```

## Data Models

### Button Issue Model

```javascript
{
    severity: 'ERROR' | 'WARNING' | 'INFO',
    type: 'NO_HANDLER' | 'MISSING_FUNCTION' | 'OVERFLOW' | 'NO_ARIA_LABEL' | 'INLINE_ONCLICK',
    message: String,
    file: String,
    line: Number,
    button: {
        id: String,
        text: String,
        classes: Array<String>,
        onclick: String,
        dataAction: String
    },
    suggestedFix: String,
    autoFixable: Boolean
}
```

### Button Analytics Model

```javascript
{
    buttonId: String,
    action: String,
    timestamp: Date,
    userId: String,
    duration: Number, // milliseconds
    success: Boolean,
    error: String | null,
    metadata: Object
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: All Buttons Have Event Handlers

*For any* button element in the application, it must have either an onclick attribute, a data-action attribute, or an event listener attached.

**Validates: Requirements 1.2, 2.1**

**Test Strategy:**
```javascript
// Generate random HTML pages
// For each button found:
//   - Check if onclick exists
//   - Check if data-action exists
//   - Check if event listener is attached
// Assert: At least one handler exists
```

### Property 2: Event Handlers Reference Valid Functions

*For any* button with an onclick handler, the function referenced must exist in the loaded JavaScript files.

**Validates: Requirements 2.2, 2.3**

**Test Strategy:**
```javascript
// Generate random button with onclick="functionName()"
// Parse all loaded JavaScript files
// Assert: functionName exists in global scope or loaded modules
```

### Property 3: Button Click Does Not Throw Uncaught Errors

*For any* button click, if an error occurs, it must be caught and handled gracefully without crashing the application.

**Validates: Requirements 3.2, 13.3**

**Test Strategy:**
```javascript
// Generate random buttons with various handlers
// Simulate click on each button
// Assert: No uncaught errors in console
// Assert: Application remains functional after error
```

### Property 4: Loading State Is Consistent

*For any* async button operation, the button must show loading state during execution and remove it after completion or error.

**Validates: Requirements 3.4, 12.2**

**Test Strategy:**
```javascript
// Generate random async button operations
// Click button
// Assert: Loading class is added immediately
// Wait for operation to complete
// Assert: Loading class is removed
// Assert: Button is re-enabled
```

### Property 5: Modal Buttons Close Modal Correctly

*For any* modal close button (Batal, X, or backdrop click), clicking it must close the modal and clean up event listeners.

**Validates: Requirements 6.2, 6.5**

**Test Strategy:**
```javascript
// Generate random modals with close buttons
// Open modal
// Click close button
// Assert: Modal is removed from DOM
// Assert: No memory leaks (event listeners cleaned up)
```

### Property 6: Form Submit Validates Before Submission

*For any* form submit button, clicking it must validate all required fields before attempting to submit.

**Validates: Requirements 7.1, 7.2**

**Test Strategy:**
```javascript
// Generate random forms with required fields
// Leave some required fields empty
// Click submit button
// Assert: Validation errors are shown
// Assert: Form is not submitted
// Assert: Error messages are clear
```

### Property 7: Delete Buttons Show Confirmation

*For any* delete button, clicking it must show a confirmation dialog before performing the delete operation.

**Validates: Requirements 8.2**

**Test Strategy:**
```javascript
// Generate random delete buttons
// Click delete button
// Assert: Confirmation dialog appears
// Assert: Delete is not executed until confirmed
```

### Property 8: Download Buttons Generate Correct Files

*For any* download button, clicking it must generate and download a file with the correct content and format.

**Validates: Requirements 8.3**

**Test Strategy:**
```javascript
// Generate random download buttons
// Click download button
// Assert: File download is triggered
// Assert: File has correct MIME type
// Assert: File content matches expected data
```

### Property 9: Filter Buttons Update URL Parameters

*For any* filter button, applying a filter must update the URL with the filter parameters.

**Validates: Requirements 9.2, 9.3**

**Test Strategy:**
```javascript
// Generate random filter buttons
// Apply filter
// Assert: URL contains filter parameters
// Refresh page
// Assert: Filter is still applied
```

### Property 10: Buttons Are Keyboard Accessible

*For any* button, it must be accessible via keyboard (Tab to focus, Enter/Space to activate).

**Validates: Requirements 11.1, 11.3**

**Test Strategy:**
```javascript
// Generate random buttons
// Simulate Tab key to focus button
// Assert: Button receives focus
// Assert: Focus indicator is visible
// Simulate Enter key
// Assert: Button click handler is called
```

### Property 11: Buttons Have Descriptive Aria Labels

*For any* button without visible text (icon-only buttons), it must have an aria-label attribute.

**Validates: Requirements 11.2, 11.4**

**Test Strategy:**
```javascript
// Generate random icon-only buttons
// For each button:
//   - Check if it has visible text
//   - If no text, check if aria-label exists
// Assert: All icon-only buttons have aria-label
```

### Property 12: Button Response Time Is Fast

*For any* button click, the initial response (loading state or action start) must occur within 100ms.

**Validates: Requirements 12.1**

**Test Strategy:**
```javascript
// Generate random buttons
// Record timestamp before click
// Click button
// Record timestamp when loading state appears
// Assert: Time difference < 100ms
```

### Property 13: Double Click Is Prevented

*For any* button that triggers an async operation, clicking it multiple times rapidly must not trigger multiple operations.

**Validates: Requirements 12.3**

**Test Strategy:**
```javascript
// Generate random async buttons
// Click button rapidly 5 times
// Assert: Operation is triggered only once
// Assert: Subsequent clicks are ignored while loading
```

### Property 14: Error Messages Are Informative

*For any* button operation that fails, the error message must be informative and actionable.

**Validates: Requirements 13.1, 13.5**

**Test Strategy:**
```javascript
// Generate random buttons that will fail
// Click button
// Assert: Error message is displayed
// Assert: Error message contains useful information
// Assert: Error message suggests next steps
```

### Property 15: Button Clicks Are Logged

*For any* button click, the event must be logged with timestamp, user info, and action name.

**Validates: Requirements 14.1**

**Test Strategy:**
```javascript
// Generate random buttons
// Click button
// Assert: Log entry is created
// Assert: Log contains timestamp
// Assert: Log contains user info
// Assert: Log contains action name
```

## Error Handling

### Error Categories

1. **Handler Not Found Error**
   - Cause: onclick references non-existent function
   - Handling: Generate stub function, log warning
   - User Message: "Fitur ini sedang dalam pengembangan"

2. **API Error**
   - Cause: Backend API returns error
   - Handling: Show error message, enable retry
   - User Message: "Terjadi kesalahan saat menghubungi server. Silakan coba lagi."

3. **Validation Error**
   - Cause: Form validation fails
   - Handling: Show field-specific errors
   - User Message: "Mohon lengkapi semua field yang required"

4. **Network Error**
   - Cause: No internet connection
   - Handling: Show offline message, queue action
   - User Message: "Tidak ada koneksi internet. Aksi akan dijalankan saat koneksi kembali."

5. **Permission Error**
   - Cause: User doesn't have permission
   - Handling: Show permission denied message
   - User Message: "Anda tidak memiliki izin untuk melakukan aksi ini"

### Error Handling Strategy

```javascript
async function handleButtonClick(button, handler) {
    try {
        // Set loading state
        button.classList.add('loading');
        button.disabled = true;

        // Execute handler
        const result = await handler(button);

        // Success handling
        button.classList.remove('loading');
        button.disabled = false;
        
        return result;
    } catch (error) {
        // Error handling
        button.classList.remove('loading');
        button.disabled = false;

        // Categorize error
        const errorCategory = categorizeError(error);

        // Log error
        logError({
            category: errorCategory,
            error: error,
            button: button,
            timestamp: new Date()
        });

        // Show user-friendly message
        showErrorMessage(getUserFriendlyMessage(errorCategory, error));

        // Offer retry if applicable
        if (isRetryable(errorCategory)) {
            showRetryButton(button, handler);
        }

        throw error;
    }
}
```

## Testing Strategy

### Unit Tests

1. **Button Scanner Tests**
   - Test HTML parsing
   - Test JavaScript function detection
   - Test event handler validation

2. **Event Handler Fixer Tests**
   - Test stub function generation
   - Test error handler wrapping
   - Test loading state management

3. **Button Component Tests**
   - Test button rendering
   - Test click handling
   - Test loading state
   - Test disabled state

### Property-Based Tests

Each correctness property will be implemented as a property-based test using a JavaScript property testing library (fast-check or jsverify).

**Configuration:**
- Minimum 100 iterations per test
- Random data generation for buttons, handlers, and user interactions
- Tag format: **Feature: button-functionality-fix, Property {number}: {property_text}**

### Integration Tests

1. **End-to-End Button Flow**
   - Test complete user journey
   - Test modal open → action → close
   - Test form fill → validate → submit
   - Test filter apply → data update → URL update

2. **Cross-Browser Tests**
   - Test on Chrome, Firefox, Edge, Safari
   - Test keyboard navigation
   - Test screen reader compatibility

### Manual Testing Checklist

- [ ] Test all buttons on Dashboard
- [ ] Test all buttons on Master Data
- [ ] Test all buttons on Risk Input
- [ ] Test all buttons on Risk Profile
- [ ] Test all buttons on KRI
- [ ] Test all buttons on Residual Risk
- [ ] Test all buttons on Analisis SWOT
- [ ] Test all buttons on Rencana Strategis
- [ ] Test all buttons on Monitoring & Evaluasi
- [ ] Test all buttons on Laporan
- [ ] Test all buttons on Pengaturan
- [ ] Test all buttons on Visi Misi

## Implementation Notes

### Phase 1: Audit and Analysis (Week 1)
- Run button scanner on all HTML files
- Generate comprehensive audit report
- Prioritize issues by severity
- Create fix plan

### Phase 2: Critical Fixes (Week 2)
- Fix all ERROR severity issues
- Add missing event handlers
- Wrap existing handlers with error handling
- Add loading states

### Phase 3: Standardization (Week 3)
- Implement button component library
- Migrate existing buttons to use components
- Implement global event delegation
- Add accessibility features

### Phase 4: Testing and Verification (Week 4)
- Write and run property-based tests
- Perform manual testing
- Fix any regressions
- Generate final report

### Phase 5: Monitoring and Documentation (Week 5)
- Implement logging and monitoring
- Write comprehensive documentation
- Create developer guide
- Set up automated testing in CI/CD

## Performance Considerations

1. **Event Delegation**: Use global event delegation to reduce memory usage
2. **Lazy Loading**: Lazy load button handlers that are not immediately needed
3. **Debouncing**: Debounce button clicks to prevent double-submission
4. **Caching**: Cache button state to avoid unnecessary DOM queries
5. **Virtual Scrolling**: For pages with many buttons, use virtual scrolling

## Security Considerations

1. **XSS Prevention**: Sanitize all user input in button labels
2. **CSRF Protection**: Include CSRF token in all form submissions
3. **Permission Checks**: Verify user permissions before executing actions
4. **Rate Limiting**: Implement rate limiting for button actions
5. **Audit Logging**: Log all button actions for security audit

## Accessibility Considerations

1. **Keyboard Navigation**: All buttons must be keyboard accessible
2. **Screen Reader Support**: All buttons must have descriptive aria-labels
3. **Focus Indicators**: Clear focus indicators for keyboard navigation
4. **Color Contrast**: Ensure sufficient color contrast for button text
5. **Touch Targets**: Ensure buttons are large enough for touch interaction (min 44x44px)
