/**
 * Monitoring & Evaluasi - Force Fix
 * Memastikan tombol dan form edit berfungsi dengan benar
 */

(function() {
    'use strict';
    
    console.log('🔧 Loading Monitoring Evaluasi Force Fix...');
    
    // Load CSS fix
    const loadCSS = () => {
        if (!document.querySelector('link[href*="monitoring-evaluasi-buttons-fix.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/monitoring-evaluasi-buttons-fix.css';
            document.head.appendChild(link);
            console.log('✅ CSS fix loaded');
        }
    };
    
    // Override loadForEdit function
    const fixLoadForEdit = () => {
        if (typeof MonitoringEvaluasi !== 'undefined') {
            const originalLoadForEdit = MonitoringEvaluasi.loadForEdit;
            
            MonitoringEvaluasi.loadForEdit = async function(id) {
                try {
                    console.log('🔄 Loading data for edit (FIXED), ID:', id);
                    const data = await apiCall(`/api/monitoring-evaluasi/${id}`);
                    console.log('📦 Loaded data:', data);
                    
                    if (data) {
                        // Wait for DOM to be ready
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Set risk dropdown
                        const riskSelect = document.getElementById('monitoring-risk');
                        if (riskSelect && data.risk_input_id) {
                            let optionExists = false;
                            for (let option of riskSelect.options) {
                                if (option.value == data.risk_input_id) {
                                    optionExists = true;
                                    break;
                                }
                            }
                            if (!optionExists && data.risk_inputs) {
                                const newOption = document.createElement('option');
                                newOption.value = data.risk_input_id;
                                newOption.textContent = `${data.risk_inputs.kode_risiko || 'Unknown'} - ${(data.risk_inputs.sasaran || '').substring(0, 40)}`;
                                riskSelect.appendChild(newOption);
                            }
                            riskSelect.value = data.risk_input_id;
                            console.log('✅ Risk dropdown set:', data.risk_input_id);
                        }
                        
                        // Set tanggal
                        const tanggalInput = document.getElementById('monitoring-tanggal');
                        if (tanggalInput && data.tanggal_monitoring) {
                            const dateValue = data.tanggal_monitoring.split('T')[0];
                            tanggalInput.value = dateValue;
                            console.log('✅ Tanggal set:', dateValue);
                        }
                        
                        // Set status risiko
                        const statusSelect = document.getElementById('monitoring-status');
                        if (statusSelect) {
                            statusSelect.value = data.status_risiko || 'Stabil';
                            console.log('✅ Status set:', data.status_risiko);
                        }
                        
                        // Set probabilitas
                        const probabilitasInput = document.getElementById('monitoring-probabilitas');
                        if (probabilitasInput) {
                            probabilitasInput.value = data.tingkat_probabilitas || '';
                            console.log('✅ Probabilitas set:', data.tingkat_probabilitas);
                        }
                        
                        // Set dampak
                        const dampakInput = document.getElementById('monitoring-dampak');
                        if (dampakInput) {
                            dampakInput.value = data.tingkat_dampak || '';
                            console.log('✅ Dampak set:', data.tingkat_dampak);
                        }
                        
                        // Set nilai
                        const nilaiInput = document.getElementById('monitoring-nilai');
                        if (nilaiInput) {
                            nilaiInput.value = data.nilai_risiko || '';
                            console.log('✅ Nilai set:', data.nilai_risiko);
                        }
                        
                        // Set tindakan
                        const tindakanTextarea = document.getElementById('monitoring-tindakan');
                        if (tindakanTextarea) {
                            tindakanTextarea.value = data.tindakan_mitigasi || '';
                            console.log('✅ Tindakan set:', data.tindakan_mitigasi ? 'Yes' : 'No');
                        }
                        
                        // Set progress
                        const progressInput = document.getElementById('monitoring-progress');
                        if (progressInput) {
                            progressInput.value = data.progress_mitigasi || 0;
                            console.log('✅ Progress set:', data.progress_mitigasi);
                        }
                        
                        // Set evaluasi - PENTING!
                        const evaluasiTextarea = document.getElementById('monitoring-evaluasi-text');
                        if (evaluasiTextarea) {
                            evaluasiTextarea.value = data.evaluasi || '';
                            console.log('✅ Evaluasi set:', data.evaluasi ? 'Yes' : 'No');
                        }
                        
                        // Set status data
                        const statusDataSelect = document.getElementById('monitoring-status-data');
                        if (statusDataSelect) {
                            statusDataSelect.value = data.status || 'Aktif';
                            console.log('✅ Status data set:', data.status);
                        }
                        
                        console.log('✅✅✅ Form populated successfully!');
                    } else {
                        console.error('❌ No data returned from API');
                        alert('Data tidak ditemukan');
                    }
                } catch (error) {
                    console.error('❌ Error loading data for edit:', error);
                    alert('Gagal memuat data: ' + error.message);
                }
            };
            
            console.log('✅ loadForEdit function overridden');
        }
    };
    
    // Override render function to ensure buttons are visible
    const fixRender = () => {
        if (typeof MonitoringEvaluasi !== 'undefined') {
            const originalRender = MonitoringEvaluasi.render;
            
            MonitoringEvaluasi.render = function(data) {
                // Call original render
                originalRender.call(this, data);
                
                // Force re-initialize Lucide icons
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                        console.log('✅ Lucide icons re-initialized');
                    }
                }, 100);
            };
            
            console.log('✅ render function overridden');
        }
    };
    
    // Initialize
    const init = () => {
        loadCSS();
        
        // Wait for MonitoringEvaluasi to be available
        const checkInterval = setInterval(() => {
            if (typeof MonitoringEvaluasi !== 'undefined') {
                clearInterval(checkInterval);
                fixLoadForEdit();
                fixRender();
                console.log('✅ Monitoring Evaluasi Force Fix applied!');
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 5000);
    };
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
