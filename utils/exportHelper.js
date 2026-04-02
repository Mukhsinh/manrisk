// Helper untuk export data ke Excel/CSV/PDF
const XLSX = require('xlsx');

/**
 * Convert data array ke Excel buffer dengan kop dan footer profesional
 */
function exportToExcel(data, sheetName = 'Data', options = {}) {
  try {
    const {
      organizationName = 'PINTAR MR - Manajemen Risiko Terpadu',
      reportTitle = sheetName,
      reportType = 'Laporan Manajemen Risiko',
      generatedBy = 'System Administrator',
      showHeader = true,
      showFooter = true
    } = options;

    // Ensure data is an array
    if (!Array.isArray(data)) {
      data = [];
    }

    // If no data, create a simple message
    if (data.length === 0) {
      data = [{ 'Pesan': 'Tidak ada data tersedia', 'Tanggal': new Date().toLocaleDateString('id-ID') }];
    }

    // Prepare header data
    const headerData = [];
    if (showHeader) {
      headerData.push([organizationName]);
      headerData.push([reportType]);
      headerData.push([reportTitle]);
      headerData.push(['']);
      headerData.push([`Tanggal: ${new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`]);
      headerData.push([`Total Records: ${data.length}`]);
      headerData.push([`Dibuat oleh: ${generatedBy}`]);
      headerData.push(['']);
    }

    // Get column headers
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    
    // Add table headers
    headerData.push(['No', ...columns]);

    // Add data rows with numbering
    const dataRows = data.map((row, index) => [
      index + 1,
      ...columns.map(col => {
        let value = row[col];
        if (typeof value === 'object' && value !== null) {
          value = value.name || JSON.stringify(value);
        }
        return value || '-';
      })
    ]);

    // Combine all data
    const allData = [...headerData, ...dataRows];

    // Add footer if enabled
    if (showFooter) {
      allData.push(['']);
      allData.push(['']);
      allData.push(['Informasi Laporan:']);
      allData.push([`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`]);
      allData.push([`Jumlah data: ${data.length} records`]);
      allData.push(['Email: admin@pintarmr.com']);
      allData.push([`© ${new Date().getFullYear()} PINTAR MR`]);
    }

    // Create worksheet from array of arrays
    const worksheet = XLSX.utils.aoa_to_sheet(allData);

    // Style the header
    if (showHeader) {
      // Organization name - large, bold, centered
      worksheet['A1'] = { 
        v: organizationName, 
        t: 's',
        s: {
          font: { bold: true, sz: 16, color: { rgb: "2C3E50" } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      };

      // Report type
      worksheet['A2'] = { 
        v: reportType, 
        t: 's',
        s: {
          font: { bold: true, sz: 12, color: { rgb: "34495E" } },
          alignment: { horizontal: 'center' }
        }
      };

      // Report title
      worksheet['A3'] = { 
        v: reportTitle, 
        t: 's',
        s: {
          font: { bold: true, sz: 14, color: { rgb: "2980B9" } },
          alignment: { horizontal: 'center' }
        }
      };
    }

    // Style table headers
    const headerRowIndex = showHeader ? 8 : 0;
    const headerRow = headerRowIndex + 1; // Excel is 1-indexed
    
    for (let col = 0; col <= columns.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2C3E50" } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      }
    }

    // Auto-size columns
    const cols = [];
    const maxCols = Math.max(columns.length + 1, organizationName.length / 2);
    
    for (let i = 0; i <= columns.length; i++) {
      let maxLength = 10;
      
      // Check header length
      if (i === 0) {
        maxLength = Math.max(maxLength, 5); // "No" column
      } else if (columns[i - 1]) {
        maxLength = Math.max(maxLength, columns[i - 1].length);
      }
      
      // Check data length
      data.forEach(row => {
        if (i === 0) {
          maxLength = Math.max(maxLength, 5);
        } else if (columns[i - 1]) {
          const value = String(row[columns[i - 1]] || '');
          maxLength = Math.max(maxLength, value.length);
        }
      });
      
      cols.push({ width: Math.min(Math.max(maxLength + 2, 12), 50) });
    }
    
    worksheet['!cols'] = cols;

    // Set row heights
    const rows = [];
    if (showHeader) {
      rows.push({ hpt: 25 }); // Organization name
      rows.push({ hpt: 20 }); // Report type
      rows.push({ hpt: 22 }); // Report title
      rows.push({ hpt: 15 }); // Empty row
      rows.push({ hpt: 15 }); // Date
      rows.push({ hpt: 15 }); // Total records
      rows.push({ hpt: 15 }); // Generated by
      rows.push({ hpt: 15 }); // Empty row
      rows.push({ hpt: 20 }); // Table header
    }
    
    // Data rows
    for (let i = 0; i < data.length; i++) {
      rows.push({ hpt: 18 });
    }
    
    worksheet['!rows'] = rows;

    // Merge cells for header
    if (showHeader) {
      const merges = [];
      const colCount = columns.length + 1;
      
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }); // Organization name
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } }); // Report type
      merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } }); // Report title
      
      worksheet['!merges'] = merges;
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Set workbook properties
    workbook.Props = {
      Title: reportTitle,
      Subject: reportType,
      Author: organizationName,
      Company: organizationName,
      CreatedDate: new Date(),
      Keywords: 'Risk Management, Report, PINTAR MR'
    };

    // Write buffer with proper options
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true,
      bookSST: false
    });
    
    console.log(`Excel file generated: ${buffer.length} bytes for ${data.length} records`);
    return buffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
}

/**
 * Generate PDF from data using Puppeteer
 * @param {Array} data - Data to include in PDF
 * @param {Object} options - PDF options
 * @returns {Promise<Buffer>} PDF buffer
 */
async function exportToPDF(data, options = {}) {
  const {
    title = 'Report',
    columns = null,
    orientation = 'landscape',
    showStats = false,
    statsConfig = null,
    organizationName = 'PINTAR MR - Manajemen Risiko Terpadu',
    organizationLogo = null,
    reportType = 'Laporan Manajemen Risiko',
    generatedBy = 'System Administrator'
  } = options;

  // Check if puppeteer is disabled (serverless environment)
  if (process.env.DISABLE_PUPPETEER === 'true' || process.env.VERCEL) {
    throw new Error('PDF export tidak tersedia di serverless environment. Gunakan Excel export sebagai alternatif.');
  }

  try {
    const puppeteer = require('puppeteer');
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      data = data ? [data] : [];
    }

    // Auto-detect columns if not provided
    const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : ['No Data']);
    
    // Generate HTML content
    const htmlContent = generatePDFHTML(data, {
      title,
      columns: tableColumns,
      showStats,
      statsConfig,
      organizationName,
      organizationLogo,
      reportType,
      generatedBy
    });

    // Generate PDF with Puppeteer
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });

      const page = await browser.newPage();
      
      // Suppress console warnings
      page.on('console', () => {});
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: orientation === 'landscape',
        margin: {
          top: '15mm',
          right: '10mm',
          bottom: '15mm',
          left: '10mm'
        },
        printBackground: true
      });

      await browser.close();
      browser = null;

      console.log(`PDF generated: ${pdfBuffer.length} bytes for ${data.length} records`);
      return pdfBuffer;

    } catch (pdfError) {
      if (browser) {
        try { await browser.close(); } catch (e) {}
      }
      throw pdfError;
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
}

/**
 * Generate HTML content for PDF
 */
function generatePDFHTML(data, options) {
  const { 
    title, 
    columns, 
    showStats, 
    statsConfig,
    organizationName = 'PINTAR MR - Manajemen Risiko Terpadu',
    organizationLogo = null,
    reportType = 'Laporan Manajemen Risiko',
    generatedBy = 'System Administrator'
  } = options;
  
  // Calculate stats if needed
  let statsHTML = '';
  if (showStats && statsConfig) {
    const stats = calculateStats(data, statsConfig);
    statsHTML = `
      <div class="stats-container">
        ${stats.map(s => `
          <div class="stat-box">
            <div class="stat-value">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Generate table rows
  const tableRows = data.map((row, index) => {
    const cells = columns.map(col => {
      let value = row[col];
      if (typeof value === 'object' && value !== null) {
        value = value.name || JSON.stringify(value);
      }
      return `<td>${escapeHtml(String(value || '-'))}</td>`;
    }).join('');
    return `<tr><td>${index + 1}</td>${cells}</tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0;
          font-size: 10px;
          line-height: 1.4;
          color: #333;
        }
        
        .page-header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          margin-bottom: 25px;
          position: relative;
          overflow: hidden;
        }
        
        .page-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .organization-name { 
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .report-type {
          font-size: 12px;
          opacity: 0.9;
          margin: 0 0 15px 0;
          font-weight: 300;
        }
        
        .report-title { 
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          display: inline-block;
          backdrop-filter: blur(10px);
        }
        
        .report-meta {
          font-size: 10px;
          opacity: 0.8;
          margin-top: 10px;
        }
        
        .content-wrapper {
          padding: 0 20px;
        }
        
        .stats-container { 
          display: flex; 
          justify-content: space-around; 
          margin: 20px 0; 
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .stat-box { 
          text-align: center; 
          padding: 15px 20px; 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6; 
          border-radius: 12px; 
          min-width: 120px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .stat-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .stat-value { 
          font-size: 20px; 
          font-weight: bold; 
          color: #2c3e50; 
          margin-bottom: 5px;
        }
        
        .stat-label { 
          font-size: 10px; 
          color: #6c757d; 
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          margin: 20px 0;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        
        th, td { 
          padding: 8px 10px; 
          text-align: left; 
          font-size: 9px;
          word-wrap: break-word;
          border-bottom: 1px solid #e9ecef;
        }
        
        th { 
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white; 
          font-weight: 600; 
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
        }
        
        tr:nth-child(even) { 
          background-color: #f8f9fa; 
        }
        
        tr:hover { 
          background-color: #e3f2fd; 
        }
        
        .risk-low { 
          background-color: #d4edda !important; 
          color: #155724;
        }
        
        .risk-medium { 
          background-color: #fff3cd !important; 
          color: #856404;
        }
        
        .risk-high { 
          background-color: #f8d7da !important; 
          color: #721c24;
        }
        
        .risk-extreme { 
          background-color: #f5c6cb !important; 
          color: #491217;
        }
        
        .page-footer { 
          margin-top: 30px; 
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-top: 3px solid #667eea;
          border-radius: 12px 12px 0 0;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .footer-left {
          flex: 1;
        }
        
        .footer-right {
          text-align: right;
        }
        
        .footer-title {
          font-size: 11px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        
        .footer-text {
          font-size: 9px; 
          color: #6c757d;
          line-height: 1.3;
        }
        
        .signature-section {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }
        
        .signature-box {
          text-align: center;
          flex: 1;
          padding: 15px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: white;
        }
        
        .signature-title {
          font-size: 10px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 40px;
        }
        
        .signature-line {
          border-top: 1px solid #2c3e50;
          margin: 0 20px;
          padding-top: 8px;
        }
        
        .signature-name {
          font-size: 9px;
          color: #6c757d;
        }
        
        @media print {
          .page-header {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .stat-box::before {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          th {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(0,0,0,0.05);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="watermark">PINTAR MR</div>
      
      <div class="page-header">
        <div class="header-content">
          <div class="organization-name">${escapeHtml(organizationName)}</div>
          <div class="report-type">${escapeHtml(reportType)}</div>
          <div class="report-title">${escapeHtml(title)}</div>
          <div class="report-meta">
            <div>Tanggal: ${new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div>Total Records: ${data.length} | Dibuat oleh: ${escapeHtml(generatedBy)}</div>
          </div>
        </div>
      </div>
      
      <div class="content-wrapper">
        ${statsHTML}
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">No</th>
                ${columns.map(col => `<th>${escapeHtml(formatColumnName(col))}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="' + (columns.length + 1) + '" style="text-align: center; padding: 20px; color: #6c757d;">Tidak ada data tersedia</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="page-footer">
        <div class="footer-content">
          <div class="footer-left">
            <div class="footer-title">Informasi Laporan</div>
            <div class="footer-text">
              Laporan ini dibuat secara otomatis oleh sistem PINTAR MR<br>
              Tanggal pembuatan: ${new Date().toLocaleDateString('id-ID')}<br>
              Jumlah data: ${data.length} records
            </div>
          </div>
          <div class="footer-right">
            <div class="footer-title">Kontak</div>
            <div class="footer-text">
              Email: admin@pintarmr.com<br>
              Website: www.pintarmr.com<br>
              © ${new Date().getFullYear()} PINTAR MR
            </div>
          </div>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-title">Dibuat Oleh</div>
            <div class="signature-line">
              <div class="signature-name">${escapeHtml(generatedBy)}</div>
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Disetujui Oleh</div>
            <div class="signature-line">
              <div class="signature-name">Manager Risiko</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Calculate statistics from data
 */
function calculateStats(data, config) {
  const stats = [];
  
  if (config.total !== false) {
    stats.push({ label: 'Total Records', value: data.length });
  }
  
  if (config.avgField) {
    const avg = data.reduce((sum, d) => sum + (parseFloat(d[config.avgField]) || 0), 0) / (data.length || 1);
    stats.push({ label: config.avgLabel || 'Average', value: avg.toFixed(2) });
  }
  
  if (config.countByField) {
    const counts = {};
    data.forEach(d => {
      const val = d[config.countByField] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });
    Object.entries(counts).forEach(([key, count]) => {
      stats.push({ label: key, value: count });
    });
  }
  
  return stats;
}

/**
 * Format column name for display
 */
function formatColumnName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generate template Excel untuk import
 */
function generateTemplate(columns, sheetName = 'Template') {
  const templateData = [columns];
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * Generate template Excel dengan contoh data untuk import
 */
function generateTemplateWithSamples(columns, sampleData, sheetName = 'Template') {
  try {
    // Create worksheet with headers and sample data
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Auto-size columns
    const cols = [];
    columns.forEach(col => {
      const maxLength = Math.max(
        col.length,
        ...sampleData.map(row => String(row[col] || '').length)
      );
      cols.push({ width: Math.min(Math.max(maxLength + 2, 15), 50) });
    });
    worksheet['!cols'] = cols;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Set workbook properties
    workbook.Props = {
      Title: `Template ${sheetName}`,
      Subject: 'Import Template with Sample Data',
      Author: 'Risk Management System',
      CreatedDate: new Date()
    };

    // Write buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });
    
    console.log(`Template with samples generated: ${buffer.length} bytes for ${sampleData.length} sample records`);
    return buffer;
  } catch (error) {
    console.error('Error generating template with samples:', error);
    throw new Error('Failed to generate template: ' + error.message);
  }
}

module.exports = {
  exportToExcel,
  exportToPDF,
  generateTemplate,
  generateTemplateWithSamples,
  generatePDFHTML,
  escapeHtml,
  formatColumnName
};

