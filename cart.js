/* =============================================
   SAMARA'S SHOP — Cart Manager
   ============================================= */

const Cart = {
  STORAGE_KEY: "samara_cart",

  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateBadge();
    document.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { items } })
    );
  },

  addItem(product, qty = 1) {
    const items = this.getItems();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        brand: product.brand || "",
        qty,
      });
    }
    this.saveItems(items);
    showToast("Added to Cart", `${product.title} has been added to your cart.`);
  },

  removeItem(productId) {
    const items = this.getItems().filter((i) => i.id !== productId);
    this.saveItems(items);
  },

  updateQty(productId, qty) {
    const items = this.getItems();
    const item = items.find((i) => i.id === productId);
    if (item) {
      item.qty = Math.max(1, Math.min(qty, 99));
      this.saveItems(items);
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateBadge();
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  updateBadge() {
    const count = this.getCount();
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  },
};

function showToast(title, message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const id = "toast-" + Date.now();
  const html = `
      <div id="${id}" class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" class="me-2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="${
                type === "success"
                  ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              }"/>
          </svg>
          <strong class="me-auto">${title}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>`;
  container.insertAdjacentHTML("beforeend", html);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// Star rating helper
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = "";
  for (let i = 0; i < full; i++) stars += "★";
  if (half) stars += "½";
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) stars += "☆";
  return stars;
}

// Scroll reveal
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// Navbar scroll
function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Cart.updateBadge();
  initReveal();
  initNavbar();
});
