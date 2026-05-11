    function renderStars(rating) {
        const full = Math.floor(rating);
        let s = "★".repeat(full);
        if (rating % 1 >= 0.5) s += "½";
        s += "☆".repeat(5 - Math.ceil(rating));
        return s;
      }

      function showToast(title, message) {
        const c = document.getElementById("toastContainer");
        if (!c) return;
        const t = document.createElement("div");
        t.className = "toast-custom";
        t.innerHTML = `<div style="font-weight:600;font-size:.9rem;margin-bottom:.2rem;">${title}</div>
                       <div style="font-size:.82rem;color:var(--text-mid);">${message}</div>`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3500);
      }

      function addToCart(product) {
        try {
          const KEY = "samara_cart";
          const items = JSON.parse(localStorage.getItem(KEY)) || [];
          const existing = items.find((i) => i.id === product.id);
          if (existing) existing.qty = Math.min(existing.qty + 1, 99);
          else items.push({ ...product, qty: 1 });
          localStorage.setItem(KEY, JSON.stringify(items));

          const count = items.reduce((s, i) => s + i.qty, 0);
          document.querySelectorAll(".cart-badge").forEach((el) => {
            el.textContent = count;
            el.style.display = count > 0 ? "flex" : "none";
          });
          showToast("Added to Cart", `${product.title} has been added.`);
        } catch (e) {
          console.error(e);
        }
      }

      function initReveal() {
        const els = document.querySelectorAll(".reveal:not(.in)");
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
      }

      async function loadAboutProducts() {
        try {
          const res = await fetch(
            "https://dummyjson.com/products?limit=30&select=id,title,price,thumbnail,rating,description,brand"
          );
          const data = await res.json();
          const picks = data.products
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          const container = document.getElementById("aboutProducts");
          container.innerHTML = picks
            .map((p, i) => {
              const safeP = JSON.stringify(p).replace(/"/g, "&quot;");
              return `
                <div class="col-md-4 reveal" style="transition-delay:${i * 0.1}s">
                  <div class="product-card">
                    <div class="card-img-wrapper">
                      <img src="${p.thumbnail}" alt="${p.title}" loading="lazy"
                        onerror="this.src='https://picsum.photos/seed/${p.id + 100}/400/500'" />
                      <div class="card-overlay">
                        <button onclick='addToCart(${safeP})'
                          class="btn-primary-custom"
                          style="padding:.6rem 1.2rem;font-size:.7rem;">Add to Cart</button>
                      </div>
                    </div>
                    <div class="card-body">
                      <div style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-light);margin-bottom:.3rem;">
                        ${p.brand || "Samara's Pick"}
                      </div>
                      <div class="card-title">${p.title}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1">
                        <div class="card-price">$${p.price.toFixed(2)}</div>
                        <span class="rating-stars">${renderStars(p.rating)}</span>
                      </div>
                      <p class="card-text mt-2">${p.description}</p>
                    </div>
                  </div>
                </div>`;
            })
            .join("");
          initReveal();
        } catch (err) {
          console.error("Failed to load products:", err);
          document.getElementById("aboutProducts").innerHTML =
            '<div class="col-12 text-center py-4"><p style="color:var(--text-light)">Unable to load products. <a href="Product.html">Browse all products</a></p></div>';
        }
      }

      function handleNewsletter(e) {
        e.preventDefault();
        showToast("Subscribed!", "Thanks! You're now on our list.");
        e.target.reset();
      }

      document.addEventListener("DOMContentLoaded", () => {
        // Sync cart badge from localStorage on load
        try {
          const items = JSON.parse(localStorage.getItem("samara_cart")) || [];
          const count = items.reduce((s, i) => s + i.qty, 0);
          document.querySelectorAll(".cart-badge").forEach((el) => {
            el.textContent = count;
            el.style.display = count > 0 ? "flex" : "none";
          });
        } catch {}

        // Navbar scroll effect
        window.addEventListener("scroll", () => {
          document.querySelector(".navbar")?.classList.toggle("scrolled", window.scrollY > 50);
        });

        initReveal();
        loadAboutProducts();
      });