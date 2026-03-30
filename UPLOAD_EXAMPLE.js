// SUPABASE UPLOAD EXAMPLE - Add this to your add-reports.html script section
// This replaces the Firebase upload code

import { supabase } from './supabase.js';
import { listenToAuthState, getCurrentUser } from './auth-supabase.js';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE_MB = 10;

let currentUser = null;
let tags = [];

// Listen to auth state
listenToAuthState((authState) => {
    if (authState.isAuthenticated) {
        currentUser = authState.user;
        console.log('User logged in:', currentUser);
    } else {
        currentUser = null;
        console.log('No user logged in');
    }
});

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        showToast('Your session has expired. Please login again.', 'error');
        window.location.href = 'login2.html';
        return;
    }

    const fileInput = document.getElementById('reportFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a report file to upload.', 'warning');
        return;
    }

    // Validate file size
    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > MAX_SIZE_MB) {
        showToast(`File is too large. Max size is ${MAX_SIZE_MB} MB.`, 'warning');
        return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        showToast('Unsupported file type. Please upload a PDF or image.', 'warning');
        return;
    }

    // Get form data
    const title = document.getElementById('reportTitle').value.trim();
    const type = document.getElementById('reportType').value;
    const reportDate = document.getElementById('reportDate').value;

    if (!title || !type || !reportDate) {
        showToast('Please fill in all required fields (marked with *).', 'warning');
        return;
    }

    const hospital = document.getElementById('hospital').value.trim();
    const doctor = document.getElementById('doctor').value.trim();
    const testLab = document.getElementById('testLab').value.trim();
    const notes = document.getElementById('reportNotes').value.trim();
    const status = document.querySelector('input[name="reportStatus"]:checked')?.value || 'normal';

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';

    try {
        // STEP 1: Upload file to Supabase Storage
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${currentUser.id}/${timestamp}_${safeFileName}`;
        
        console.log('Uploading file to:', storagePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(storagePath, file);

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(storagePath);

        console.log('File uploaded successfully. URL:', publicUrl);

        // STEP 2: Save report metadata to database
        const { data: reportData, error: dbError } = await supabase
            .from('reports')
            .insert([
                {
                    user_id: currentUser.id,
                    title,
                    type,
                    report_date: reportDate,
                    hospital,
                    doctor,
                    test_lab: testLab,
                    notes,
                    tags,
                    status,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    file_storage_path: storagePath,
                    reminder: {
                        enabled: false
                    },
                    created_at: new Date().toISOString(),
                }
            ]);

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        showToast('Report uploaded successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'view_reports.html';
        }, 1500);

    } catch (error) {
        console.error('Error uploading report:', error);
        
        let errorMessage = 'Failed to upload report. ';
        
        if (error.message.includes('not authenticated')) {
            errorMessage = 'You must be logged in to upload reports.';
        } else if (error.message.includes('PostgreSQL')) {
            errorMessage = 'Database error. Check your report data.';
        } else if (error.message.includes('Upload failed')) {
            errorMessage = 'Storage upload failed. Check file size and type.';
        }

        showToast(errorMessage, 'error');

    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-upload me-2"></i>Upload Report';
    }
});

// Toast notification function (reuse from utils.js)
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;";
        document.body.appendChild(container);
    }

    const icons = { 
        success: "fa-check-circle", 
        error: "fa-exclamation-circle", 
        warning: "fa-exclamation-triangle", 
        info: "fa-info-circle" 
    };
    const alertClass = `alert-${type}`;

    const toast = document.createElement("div");
    toast.className = `alert ${alertClass} alert-dismissible fade show`;
    toast.style.minWidth = "280px";
    toast.style.marginBottom = "10px";
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info} me-2"></i>${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 150);
    }, 4000);
}
