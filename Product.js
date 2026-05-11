let allProducts = [];
let currentSort = "default";

function renderStars(rating) {
  const full = Math.floor(rating);
  let s = "★".repeat(full);
  if (rating % 1 >= 0.5) s += "½";
  s += "☆".repeat(5 - Math.ceil(rating));
  return s;
}

function updateStatus(count, query = "") {
  const el = document.getElementById("searchStatus");
  if (!el) return;
  if (query) {
    el.innerHTML = `<strong>${count}</strong> result${
      count !== 1 ? "s" : ""
    } for "<em>${query}</em>"`;
  } else {
    el.innerHTML = `Showing <strong>${count}</strong> product${
      count !== 1 ? "s" : ""
    }`;
  }
}

function getRandomProducts(products, n) {
  return [...products].sort(() => Math.random() - 0.5).slice(0, n);
}

function applySort(products) {
  const p = [...products];
  if (currentSort === "price-asc") return p.sort((a, b) => a.price - b.price);
  if (currentSort === "price-desc") return p.sort((a, b) => b.price - a.price);
  if (currentSort === "rating") return p.sort((a, b) => b.rating - a.rating);
  return p;
}

function buildCard(product, index) {
  const safeP = JSON.stringify(product).replace(/"/g, "&quot;");
  const col = document.createElement("div");
  col.className = "col-6 col-md-4 col-lg-3 reveal";
  col.style.transitionDelay = `${(index % 8) * 0.05}s`;

  col.innerHTML = `
    <div class="product-card">
      <div class="card-img-wrapper">
        ${
          product.stock < 10 ? '<span class="label-badge">Low Stock</span>' : ""
        }
        <img
          src="${product.thumbnail}"
          alt="${product.title}"
          loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${product.id}/400/500'"
        />
        <div class="card-overlay">
          <button
            class="btn-primary-custom"
            style="padding:.6rem 1.2rem;font-size:.7rem;"
            onclick='addToCart(${safeP})'
          >Add to Cart</button>
        </div>
      </div>
      <div class="card-body">
        <div style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-light);margin-bottom:.3rem;">
          ${product.brand || product.category || ""}
        </div>
        <div class="card-title">${product.title}</div>
        <div class="d-flex justify-content-between align-items-center mt-1">
          <div class="card-price">$${product.price.toFixed(2)}</div>
          <div>
            <span class="rating-stars">${renderStars(product.rating)}</span>
          </div>
        </div>
        <p class="card-text mt-1">${product.description}</p>
      </div>
    </div>
  `;
  return col;
}

function displayProducts(products, query = "") {
  const row = document.getElementById("product-row");
  if (!row) return;
  row.innerHTML = "";
  updateStatus(products.length, query);

  if (products.length === 0) {
    row.innerHTML = `
      <div class="col-12 no-results">
        <svg width="64" height="64" fill="none" stroke="var(--blush)" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
        </svg>
        <h3 style="color:var(--espresso);margin-top:1rem;">No products found</h3>
        <p style="color:var(--text-light)">Try a different search term or clear the search.</p>
        <button onclick="clearSearch()" class="btn-primary-custom mt-3" style="display:inline-block;">
          Clear Search
        </button>
      </div>`;
    return;
  }

  products.forEach((product, i) => row.appendChild(buildCard(product, i)));

  if (typeof initReveal === "function") initReveal();
}

async function fetchProducts() {
  try {
    const res = await fetch(
      "https://dummyjson.com/products?limit=1000&select=id,title,price,thumbnail,rating,description,brand,category,stock"
    );
    const data = await res.json();
    allProducts = data.products;
    displayProducts(applySort(getRandomProducts(allProducts, 8)));
  } catch (err) {
    console.error("Failed to load products:", err);
    const row = document.getElementById("product-row");
    if (row)
      row.innerHTML = `<div class="col-12 text-center py-5" style="color:var(--text-light)">Unable to load products. Please refresh.</div>`;
  }
}

async function searchProducts(query) {
  const q = query.trim();

  if (!q) {
    displayProducts(applySort(getRandomProducts(allProducts, 8)));
    updateStatus(allProducts.length);
    return;
  }

  const row = document.getElementById("product-row");
  if (row) {
    row.innerHTML = Array(3)
      .fill(
        '<div class="col-6 col-md-4 col-lg-3"><div class="skeleton" style="height:360px"></div></div>'
      )
      .join("");
  }

  try {
    const res = await fetch(
      `https://dummyjson.com/products/search?q=${encodeURIComponent(
        q
      )}&limit=1000&select=id,title,price,thumbnail,rating,description,brand,category,stock`
    );
    const data = await res.json();

    const results = applySort(getRandomProducts(data.products, 4));
    displayProducts(results, q);
  } catch (err) {
    console.error("Search failed:", err);
    if (row)
      row.innerHTML = `<div class="col-12 text-center py-4" style="color:var(--text-light)">Search failed. Please try again.</div>`;
  }
}

function clearSearch() {
  const input = document.getElementById("search-input");
  if (input) input.value = "";
  displayProducts(applySort(getRandomProducts(allProducts, 8)));
}

function addToCart(product) {
  try {
    const STORAGE_KEY = "samara_cart";
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      items.push({ ...product, qty: 1 });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    const count = items.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll(".cart-badge").forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });

    if (typeof showToast === "function") {
      showToast(
        "Added to Cart",
        `${product.title} has been added to your cart.`
      );
    }
  } catch (e) {
    console.error("Cart error:", e);
  }
}

function sortProducts(value) {
  currentSort = value;
  const query = document.getElementById("search-input")?.value.trim() || "";
  if (query) {
    searchProducts(query);
  } else {
    displayProducts(applySort(getRandomProducts(allProducts, 4)));
  }
}

function filterCategory(btn, category) {
  document
    .querySelectorAll(".filter-pill")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");

  const filtered = category
    ? allProducts.filter((p) => p.category === category)
    : allProducts;

  displayProducts(
    applySort(getRandomProducts(filtered, Math.min(filtered.length, 4)))
  );
}

function quickSearch(e, term) {
  e.preventDefault();
  const input = document.getElementById("search-input");
  if (input) input.value = term;
  searchProducts(term);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search-btn")?.addEventListener("click", () => {
    const query = document.getElementById("search-input").value;
    searchProducts(query);
  });

  document.getElementById("search-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchProducts(e.target.value);
  });

  document.getElementById("search-input")?.addEventListener("search", (e) => {
    if (e.target.value === "") clearSearch();
  });

  fetchProducts();
});
