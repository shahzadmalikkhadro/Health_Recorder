// SUPABASE DATABASE QUERY EXAMPLES
// Use these snippets in your view_reports.html and profile.html

import { supabase } from './supabase.js';
import { listenToAuthState } from './auth-supabase.js';

let currentUser = null;

// Get current user
listenToAuthState((authState) => {
    if (authState.isAuthenticated) {
        currentUser = authState.user;
        loadReports();
    }
});

/**
 * Fetch all reports for current user
 */
async function loadReports() {
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading reports:', error);
            showToast('Failed to load reports.', 'error');
            return;
        }

        displayReports(reports);
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Get a single report by ID
 */
async function getReport(reportId) {
    try {
        const { data: report, error } = await supabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .eq('user_id', currentUser.id)
            .single();

        if (error) {
            console.error('Error loading report:', error);
            return null;
        }

        return report;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Delete a report and its file
 */
async function deleteReport(reportId, storageePath) {
    try {
        // Delete file from storage
        if (storageePath) {
            const { error: deleteFileError } = await supabase.storage
                .from('reports')
                .remove([storageePath]);

            if (deleteFileError) {
                console.warn('Could not delete file:', deleteFileError);
            }
        }

        // Delete report from database
        const { error: deleteRecordError } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId)
            .eq('user_id', currentUser.id);

        if (deleteRecordError) {
            throw deleteRecordError;
        }

        showToast('Report deleted successfully!', 'success');
        loadReports(); // Refresh list
    } catch (error) {
        console.error('Error deleting report:', error);
        showToast('Failed to delete report.', 'error');
    }
}

/**
 * Update a report
 */
async function updateReport(reportId, updates) {
    try {
        const { error } = await supabase
            .from('reports')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', reportId)
            .eq('user_id', currentUser.id);

        if (error) {
            throw error;
        }

        showToast('Report updated successfully!', 'success');
        loadReports(); // Refresh list
    } catch (error) {
        console.error('Error updating report:', error);
        showToast('Failed to update report.', 'error');
    }
}

/**
 * Search reports by title or type
 */
async function searchReports(searchTerm) {
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', currentUser.id)
            .or(`title.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        displayReports(reports);
    } catch (error) {
        console.error('Error searching reports:', error);
        showToast('Search failed.', 'error');
    }
}

/**
 * Filter reports by type
 */
async function filterReportsByType(type) {
    try {
        const query = supabase
            .from('reports')
            .select('*')
            .eq('user_id', currentUser.id);

        if (type && type !== 'all') {
            query.eq('type', type);
        }

        const { data: reports, error } = await query
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        displayReports(reports);
    } catch (error) {
        console.error('Error filtering reports:', error);
        showToast('Filter failed.', 'error');
    }
}

/**
 * Get user profile
 */
async function getUserProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.warn('Profile not found:', error);
            return null;
        }

        return profile;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

/**
 * Update user profile
 */
async function updateUserProfile(updates) {
    try {
        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', currentUser.id);

        if (error) {
            throw error;
        }

        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile.', 'error');
    }
}

/**
 * Upload profile avatar
 */
async function uploadProfileAvatar(file) {
    try {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showToast('Please upload a valid image file.', 'warning');
            return null;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB.', 'warning');
            return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-avatar.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Delete old avatar if exists
        const profile = await getUserProfile();
        if (profile?.avatar_url) {
            await supabase.storage
                .from('avatars')
                .remove([profile.avatar_url.split('/avatars/')[1]]);
        }

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile
        await updateUserProfile({ avatar_url: publicUrl });

        return publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showToast('Failed to upload avatar.', 'error');
        return null;
    }
}

/**
 * Display reports in UI (example)
 */
function displayReports(reports) {
    const container = document.getElementById('reports-container');
    if (!container) return;

    container.innerHTML = '';

    if (reports.length === 0) {
        container.innerHTML = '<p class="text-muted">No reports uploaded yet.</p>';
        return;
    }

    reports.forEach(report => {
        const reportCard = document.createElement('div');
        reportCard.className = 'card mb-3';
        reportCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${report.title}</h5>
                <p class="card-text text-muted">${report.type} • ${new Date(report.report_date).toLocaleDateString()}</p>
                <p class="card-text">${report.notes || 'No notes'}</p>
                <button onclick="viewFile('${report.file_url}')" class="btn btn-sm btn-primary">View File</button>
                <button onclick="deleteReport('${report.id}', '${report.file_storage_path}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        container.appendChild(reportCard);
    });
}

// ALLOWED FILE TYPES
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Helper function
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
    toast.innerHTML = `<i class="fas ${icons[type]} me-2"></i>${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 150);
    }, 4000);
}
