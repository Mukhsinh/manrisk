const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Export Risk Profile to Excel
router.post('/excel', async (req, res) => {
  try {
    console.log('📊 Generating Excel export for Risk Profile...');
    
    const { data } = req.body;
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data to export' });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Risk Profile');

    // Define columns
    worksheet.columns = [
      { header: 'KODE RISIKO', key: 'kode_risiko', width: 15 },
      { header: 'UNIT KERJA', key: 'unit_kerja', width: 25 },
      { header: 'KATEGORI', key: 'kategori', width: 20 },
      { header: 'PROBABILITAS', key: 'probability', width: 15 },
      { header: 'DAMPAK', key: 'impact', width: 15 },
      { header: 'RISK VALUE', key: 'risk_value', width: 15 },
      { header: 'RISK LEVEL', key: 'risk_level', width: 20 },
      { header: 'PROB %', key: 'probability_percentage', width: 15 },
      { header: 'DAMPAK FINANSIAL', key: 'financial_impact', width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Add data rows
    data.forEach(item => {
      const risk = item.risk_inputs || {};
      const row = worksheet.addRow({
        kode_risiko: risk.kode_risiko || '-',
        unit_kerja: risk.master_work_units?.name || '-',
        kategori: risk.master_risk_categories?.name || '-',
        probability: item.probability || '-',
        impact: item.impact || '-',
        risk_value: item.risk_value || '-',
        risk_level: item.risk_level || '-',
        probability_percentage: item.probability_percentage ? `${item.probability_percentage}%` : '-',
        financial_impact: item.financial_impact ? `Rp ${item.financial_impact.toLocaleString('id-ID')}` : '-'
      });

      // Style risk level cell based on value
      const riskLevelCell = row.getCell('risk_level');
      const level = item.risk_level || '';
      
      if (level.includes('EXTREME') || level.includes('SANGAT TINGGI')) {
        riskLevelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDC2626' }
        };
        riskLevelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (level.includes('HIGH') || level.includes('TINGGI')) {
        riskLevelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF59E0B' }
        };
        riskLevelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (level.includes('MEDIUM') || level.includes('SEDANG')) {
        riskLevelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEAB308' }
        };
        riskLevelCell.font = { color: { argb: 'FF000000' }, bold: true };
      } else if (level.includes('LOW') || level.includes('RENDAH')) {
        riskLevelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        };
        riskLevelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=risk-profile-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    res.send(buffer);
    console.log('✅ Excel export completed');
  } catch (error) {
    console.error('❌ Error generating Excel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export Risk Profile to PDF
router.post('/pdf', async (req, res) => {
  try {
    console.log('📄 Generating PDF export for Risk Profile...');
    
    const { data } = req.body;
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data to export' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=risk-profile-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(18).font('Helvetica-Bold').text('PROFIL RISIKO INHEREN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    // Table settings
    const tableTop = doc.y;
    const colWidths = [60, 120, 80, 60, 60, 60, 80, 60, 80];
    const rowHeight = 25;
    let currentY = tableTop;

    // Draw header
    doc.fontSize(8).font('Helvetica-Bold');
    const headers = ['KODE', 'UNIT KERJA', 'KATEGORI', 'PROB', 'DAMPAK', 'VALUE', 'LEVEL', 'PROB %', 'FINANSIAL'];
    
    // Header background
    doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#1E40AF');
    
    // Header text
    doc.fillColor('white');
    let currentX = 50;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, currentY + 8, { width: colWidths[i] - 10, align: 'center' });
      currentX += colWidths[i];
    });
    
    currentY += rowHeight;

    // Draw data rows
    doc.font('Helvetica').fontSize(7);
    data.forEach((item, index) => {
      const risk = item.risk_inputs || {};
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#F9FAFB');
      }
      
      // Row data
      const rowData = [
        risk.kode_risiko || '-',
        (risk.master_work_units?.name || '-').substring(0, 20),
        (risk.master_risk_categories?.name || '-').substring(0, 15),
        item.probability || '-',
        item.impact || '-',
        item.risk_value || '-',
        (item.risk_level || '-').substring(0, 12),
        item.probability_percentage ? `${item.probability_percentage}%` : '-',
        item.financial_impact ? `${(item.financial_impact / 1000000).toFixed(1)}M` : '-'
      ];
      
      // Draw cells
      currentX = 50;
      doc.fillColor('black');
      rowData.forEach((text, i) => {
        doc.text(String(text), currentX + 5, currentY + 8, { width: colWidths[i] - 10, align: 'center' });
        currentX += colWidths[i];
      });
      
      currentY += rowHeight;
      
      // Add new page if needed
      if (currentY > 500) {
        doc.addPage();
        currentY = 50;
      }
    });

    // Add footer
    doc.fontSize(8).fillColor('gray').text(
      `Total: ${data.length} risiko | Generated by Risk Management System`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();
    console.log('✅ PDF export completed');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
