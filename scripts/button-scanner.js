/**
 * Button Scanner - Comprehensive Button Audit Tool
 * 
 * Scans all HTML files to find buttons and validates their event handlers
 */

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

class ButtonScanner {
  constructor(options = {}) {
    this.options = {
      scanPath: options.scanPath || 'public',
      excludePatterns: options.excludePatterns || ['node_modules', 'test', 'backup'],
      verbose: options.verbose || false,
      ...options
    };
    
    this.htmlFiles = [];
    this.jsFiles = [];
    this.buttons = [];
    this.issues = [];
    this.functionNames = new Set();
  }

  /**
   * Main scan method
   */
  async scan() {
    console.log('🔍 Starting Button Scanner...\n');
    
    // Step 1: Find all HTML and JS files
    await this.findFiles(this.options.scanPath);
    console.log(`📄 Found ${this.htmlFiles.length} HTML files`);
    console.log(`📜 Found ${this.jsFiles.length} JavaScript files\n`);
    
    // Step 2: Scan JavaScript files for function names
    await this.scanJavaScriptFiles();
    console.log(`✅ Found ${this.functionNames.size} JavaScript functions\n`);
    
    // Step 3: Scan HTML files for buttons
    await this.scanHTMLFiles();
    console.log(`🔘 Found ${this.buttons.length} buttons\n`);
    
    // Step 4: Validate event handlers
    await this.validateEventHandlers();
    console.log(`⚠️  Found ${this.issues.length} issues\n`);
    
    // Step 5: Generate report
    const report = this.generateReport();
    
    return report;
  }

  /**
   * Recursively find all HTML and JS files
   */
  async findFiles(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip excluded patterns
        if (this.shouldExclude(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.findFiles(fullPath);
        } else if (entry.isFile()) {
          if (entry.name.endsWith('.html')) {
            this.htmlFiles.push(fullPath);
          } else if (entry.name.endsWith('.js')) {
            this.jsFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  /**
   * Check if path should be excluded
   */
  shouldExclude(filePath) {
    return this.options.excludePatterns.some(pattern => 
      filePath.includes(pattern)
    );
  }

  /**
   * Scan JavaScript files to find function names
   */
  async scanJavaScriptFiles() {
    for (const jsFile of this.jsFiles) {
      try {
        const content = await fs.readFile(jsFile, 'utf-8');
        
        // Find function declarations
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
          this.functionNames.add(match[1]);
        }
        
        // Find arrow functions assigned to variables
        const arrowFunctionRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
          this.functionNames.add(match[1]);
        }
        
        // Find class methods
        const methodRegex = /(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
        while ((match = methodRegex.exec(content)) !== null) {
          this.functionNames.add(match[1]);
        }
        
      } catch (error) {
        if (this.options.verbose) {
          console.error(`Error reading JS file ${jsFile}:`, error.message);
        }
      }
    }
  }

  /**
   * Scan HTML files for buttons
   */
  async scanHTMLFiles() {
    for (const htmlFile of this.htmlFiles) {
      try {
        const content = await fs.readFile(htmlFile, 'utf-8');
        const $ = cheerio.load(content);
        
        // Find all button elements
        const buttonSelectors = [
          'button',
          'input[type="button"]',
          'input[type="submit"]',
          'a.btn',
          '[role="button"]'
        ];
        
        buttonSelectors.forEach(selector => {
          $(selector).each((index, element) => {
            const $button = $(element);
            const button = this.extractButtonInfo($button, htmlFile, element);
            this.buttons.push(button);
          });
        });
        
      } catch (error) {
        if (this.options.verbose) {
          console.error(`Error reading HTML file ${htmlFile}:`, error.message);
        }
      }
    }
  }

  /**
   * Extract button information
   */
  extractButtonInfo($button, file, element) {
    const text = $button.text().trim();
    const onclick = $button.attr('onclick');
    const dataAction = $button.attr('data-action');
    const ariaLabel = $button.attr('aria-label');
    const classes = $button.attr('class') || '';
    const id = $button.attr('id');
    const type = element.name;
    const disabled = $button.attr('disabled') !== undefined;
    
    return {
      id: id || `button-${this.buttons.length}`,
      file: file,
      type: type,
      text: text,
      onclick: onclick,
      dataAction: dataAction,
      ariaLabel: ariaLabel,
      classes: classes.split(' ').filter(c => c),
      disabled: disabled,
      issues: []
    };
  }

  /**
   * Validate event handlers for all buttons
   */
  async validateEventHandlers() {
    for (const button of this.buttons) {
      // Check 1: Button has event handler
      if (!button.onclick && !button.dataAction) {
        this.addIssue(button, {
          severity: 'ERROR',
          type: 'NO_HANDLER',
          message: 'Button tidak memiliki event handler (onclick atau data-action)',
          suggestedFix: `Tambahkan onclick="handleClick()" atau data-action="handleClick"`,
          autoFixable: true
        });
      }
      
      // Check 2: onclick references valid function
      if (button.onclick) {
        const functionName = this.extractFunctionName(button.onclick);
        if (functionName && !this.functionNames.has(functionName)) {
          this.addIssue(button, {
            severity: 'ERROR',
            type: 'MISSING_FUNCTION',
            message: `Function '${functionName}' tidak ditemukan di JavaScript files`,
            suggestedFix: `Buat function ${functionName}() atau perbaiki nama function`,
            autoFixable: true
          });
        }
        
        // Check 3: Inline onclick (not best practice)
        this.addIssue(button, {
          severity: 'INFO',
          type: 'INLINE_ONCLICK',
          message: 'Button menggunakan inline onclick (tidak best practice)',
          suggestedFix: 'Gunakan event listener atau data-action pattern',
          autoFixable: false
        });
      }
      
      // Check 4: Overflow protection
      const hasOverflowProtection = 
        button.classes.includes('text-truncate') ||
        button.classes.includes('overflow-hidden');
      
      if (!hasOverflowProtection && button.text.length > 20) {
        this.addIssue(button, {
          severity: 'WARNING',
          type: 'OVERFLOW',
          message: 'Button mungkin mengalami overflow (text panjang tanpa proteksi)',
          suggestedFix: 'Tambahkan class text-truncate',
          autoFixable: true
        });
      }
      
      // Check 5: Aria label for icon-only buttons
      if (!button.text && !button.ariaLabel) {
        this.addIssue(button, {
          severity: 'WARNING',
          type: 'NO_ARIA_LABEL',
          message: 'Icon-only button tidak memiliki aria-label',
          suggestedFix: 'Tambahkan aria-label="Descriptive Label"',
          autoFixable: true
        });
      }
      
      // Check 6: Disabled without reason
      if (button.disabled && !button.classes.includes('loading')) {
        this.addIssue(button, {
          severity: 'INFO',
          type: 'DISABLED',
          message: 'Button disabled tanpa alasan yang jelas',
          suggestedFix: 'Pastikan ada alasan valid untuk disable button',
          autoFixable: false
        });
      }
    }
  }

  /**
   * Extract function name from onclick attribute
   */
  extractFunctionName(onclick) {
    // Extract function name from onclick="functionName()" or onclick="functionName(arg1, arg2)"
    const match = onclick.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
    return match ? match[1] : null;
  }

  /**
   * Add issue to button and global issues list
   */
  addIssue(button, issue) {
    button.issues.push(issue);
    this.issues.push({
      ...issue,
      button: {
        id: button.id,
        file: button.file,
        text: button.text,
        onclick: button.onclick,
        dataAction: button.dataAction
      }
    });
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      summary: {
        totalFiles: this.htmlFiles.length,
        totalButtons: this.buttons.length,
        totalIssues: this.issues.length,
        issuesBySeverity: {
          ERROR: this.issues.filter(i => i.severity === 'ERROR').length,
          WARNING: this.issues.filter(i => i.severity === 'WARNING').length,
          INFO: this.issues.filter(i => i.severity === 'INFO').length
        },
        issuesByType: {}
      },
      buttons: this.buttons,
      issues: this.issues,
      recommendations: []
    };
    
    // Count issues by type
    this.issues.forEach(issue => {
      if (!report.summary.issuesByType[issue.type]) {
        report.summary.issuesByType[issue.type] = 0;
      }
      report.summary.issuesByType[issue.type]++;
    });
    
    // Generate recommendations
    if (report.summary.issuesBySeverity.ERROR > 0) {
      report.recommendations.push({
        priority: 'HIGH',
        message: `Fix ${report.summary.issuesBySeverity.ERROR} ERROR issues immediately`,
        action: 'Run auto-fix script or manually fix missing event handlers'
      });
    }
    
    if (report.summary.issuesBySeverity.WARNING > 0) {
      report.recommendations.push({
        priority: 'MEDIUM',
        message: `Address ${report.summary.issuesBySeverity.WARNING} WARNING issues`,
        action: 'Add overflow protection and aria-labels'
      });
    }
    
    if (report.summary.issuesByType.INLINE_ONCLICK > 0) {
      report.recommendations.push({
        priority: 'LOW',
        message: `Refactor ${report.summary.issuesByType.INLINE_ONCLICK} inline onclick handlers`,
        action: 'Migrate to event listeners or data-action pattern'
      });
    }
    
    return report;
  }

  /**
   * Print report to console
   */
  printReport(report) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 BUTTON AUDIT REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📈 Summary:');
    console.log(`   Total HTML Files: ${report.summary.totalFiles}`);
    console.log(`   Total Buttons: ${report.summary.totalButtons}`);
    console.log(`   Total Issues: ${report.summary.totalIssues}\n`);
    
    console.log('⚠️  Issues by Severity:');
    console.log(`   🔴 ERROR: ${report.summary.issuesBySeverity.ERROR}`);
    console.log(`   🟡 WARNING: ${report.summary.issuesBySeverity.WARNING}`);
    console.log(`   🔵 INFO: ${report.summary.issuesBySeverity.INFO}\n`);
    
    console.log('📋 Issues by Type:');
    Object.entries(report.summary.issuesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
        console.log(`      → ${rec.action}`);
      });
      console.log();
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Save report to file
   */
  async saveReport(report, filename = 'button-audit-report.json') {
    try {
      await fs.writeFile(filename, JSON.stringify(report, null, 2));
      console.log(`✅ Report saved to ${filename}`);
    } catch (error) {
      console.error(`❌ Error saving report:`, error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const scanner = new ButtonScanner({
    scanPath: process.argv[2] || 'public',
    verbose: process.argv.includes('--verbose')
  });
  
  scanner.scan()
    .then(report => {
      scanner.printReport(report);
      return scanner.saveReport(report);
    })
    .catch(error => {
      console.error('❌ Scanner error:', error);
      process.exit(1);
    });
}

module.exports = ButtonScanner;
