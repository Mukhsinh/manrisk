/**
 * Verifikasi Button Overflow Fix
 * Memeriksa apakah semua tombol sudah diperbaiki dengan benar
 */

const puppeteer = require('puppeteer');

async function verifyButtonOverflowFix() {
  console.log('🔍 Memulai verifikasi button overflow fix...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Test 1: Halaman Test
    console.log('📋 Test 1: Halaman Test Button Overflow Fix');
    await page.goto('http://localhost:3002/test-button-overflow-fix.html', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Periksa apakah CSS dimuat
    const cssLoaded = await page.evaluate(() => {
      const link = document.querySelector('link[href*="button-overflow-fix.css"]');
      return link !== null;
    });

    console.log(`   CSS dimuat: ${cssLoaded ? '✅' : '❌'}`);

    // Periksa apakah JS dimuat
    const jsLoaded = await page.evaluate(() => {
      return typeof window.ButtonOverflowHandler !== 'undefined';
    });

    console.log(`   JS handler dimuat: ${jsLoaded ? '✅' : '❌'}`);

    // Dapatkan statistik
    const stats = await page.evaluate(() => {
      if (window.ButtonOverflowHandler) {
        return window.ButtonOverflowHandler.getStats();
      }
      return null;
    });

    if (stats) {
      console.log(`   Total tombol: ${stats.total}`);
      console.log(`   Tombol diperbaiki: ${stats.fixed}`);
      console.log(`   Tombol overflow: ${stats.overflowing}`);
      console.log(`   Persentase fix: ${stats.percentage}%`);
    }

    // Test 2: Halaman Utama (Dashboard)
    console.log('\n📋 Test 2: Halaman Utama (Dashboard)');
    await page.goto('http://localhost:3002/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Login jika diperlukan
    const loginVisible = await page.evaluate(() => {
      const loginScreen = document.getElementById('login-screen');
      return loginScreen && loginScreen.style.display !== 'none';
    });

    if (loginVisible) {
      console.log('   Login diperlukan...');
      await page.type('#login-email', 'admin@example.com');
      await page.type('#login-password', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // Periksa tombol di dashboard
    const dashboardButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .btn');
      let overflowing = 0;
      let total = buttons.length;

      buttons.forEach(btn => {
        if (btn.scrollWidth > btn.clientWidth || btn.scrollHeight > btn.clientHeight) {
          overflowing++;
        }
      });

      return { total, overflowing };
    });

    console.log(`   Total tombol: ${dashboardButtons.total}`);
    console.log(`   Tombol overflow: ${dashboardButtons.overflowing}`);
    console.log(`   Status: ${dashboardButtons.overflowing === 0 ? '✅ Semua OK' : '⚠️ Ada overflow'}`);

    // Test 3: Halaman dengan Tabel (Rencana Strategis)
    console.log('\n📋 Test 3: Halaman Rencana Strategis');
    await page.evaluate(() => {
      const menuItem = document.querySelector('[data-page="rencana-strategis"]');
      if (menuItem) menuItem.click();
    });

    await page.waitForTimeout(3000);

    const tableButtons = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      let totalButtons = 0;
      let overflowingButtons = 0;

      tables.forEach(table => {
        const buttons = table.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
          totalButtons++;
          if (btn.scrollWidth > btn.clientWidth || btn.scrollHeight > btn.clientHeight) {
            overflowingButtons++;
          }
        });
      });

      return { total: totalButtons, overflowing: overflowingButtons };
    });

    console.log(`   Tombol dalam tabel: ${tableButtons.total}`);
    console.log(`   Tombol overflow: ${tableButtons.overflowing}`);
    console.log(`   Status: ${tableButtons.overflowing === 0 ? '✅ Semua OK' : '⚠️ Ada overflow'}`);

    // Test 4: Halaman Pengaturan
    console.log('\n📋 Test 4: Halaman Pengaturan');
    await page.evaluate(() => {
      const menuItem = document.querySelector('[data-page="pengaturan"]');
      if (menuItem) menuItem.click();
    });

    await page.waitForTimeout(3000);

    const pengaturanButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('#pengaturan-content button, #pengaturan-content .btn');
      let overflowing = 0;
      let total = buttons.length;

      buttons.forEach(btn => {
        if (btn.scrollWidth > btn.clientWidth || btn.scrollHeight > btn.clientHeight) {
          overflowing++;
        }
      });

      return { total, overflowing };
    });

    console.log(`   Total tombol: ${pengaturanButtons.total}`);
    console.log(`   Tombol overflow: ${pengaturanButtons.overflowing}`);
    console.log(`   Status: ${pengaturanButtons.overflowing === 0 ? '✅ Semua OK' : '⚠️ Ada overflow'}`);

    // Test 5: Responsive Test
    console.log('\n📋 Test 5: Responsive Test (Mobile)');
    await page.setViewport({ width: 375, height: 667 }); // iPhone size
    await page.waitForTimeout(1000);

    const mobileButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .btn');
      let overflowing = 0;
      let total = buttons.length;

      buttons.forEach(btn => {
        if (btn.scrollWidth > btn.clientWidth || btn.scrollHeight > btn.clientHeight) {
          overflowing++;
        }
      });

      return { total, overflowing };
    });

    console.log(`   Total tombol (mobile): ${mobileButtons.total}`);
    console.log(`   Tombol overflow: ${mobileButtons.overflowing}`);
    console.log(`   Status: ${mobileButtons.overflowing === 0 ? '✅ Semua OK' : '⚠️ Ada overflow'}`);

    // Ringkasan
    console.log('\n' + '='.repeat(50));
    console.log('📊 RINGKASAN VERIFIKASI');
    console.log('='.repeat(50));

    const allTests = [
      { name: 'CSS & JS Loading', passed: cssLoaded && jsLoaded },
      { name: 'Dashboard Buttons', passed: dashboardButtons.overflowing === 0 },
      { name: 'Table Buttons', passed: tableButtons.overflowing === 0 },
      { name: 'Pengaturan Buttons', passed: pengaturanButtons.overflowing === 0 },
      { name: 'Mobile Responsive', passed: mobileButtons.overflowing === 0 }
    ];

    allTests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
    });

    const allPassed = allTests.every(test => test.passed);
    console.log('\n' + '='.repeat(50));
    console.log(allPassed ? '✅ SEMUA TEST BERHASIL!' : '⚠️ ADA TEST YANG GAGAL');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Jalankan verifikasi
verifyButtonOverflowFix().catch(console.error);
