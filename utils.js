/**
 * UI utilities
 */
export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;";
    document.body.appendChild(container);
  }

  const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", warning: "fa-exclamation-triangle", info: "fa-info-circle" };
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
