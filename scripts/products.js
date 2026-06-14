/**
 * products.js
 * Carrega, renderiza e gerencia os cards de produto.
 */

let allProducts = [];
let currentCategory = "all";
let searchQuery = "";

/**
 * Gera HTML de estrelas para avaliação.
 */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let stars = "";
  for (let i = 0; i < full; i++) stars += '<i class="icon-star filled"></i>';
  if (half) stars += '<i class="icon-star half"></i>';
  const empty = 5 - full - half;
  for (let i = 0; i < empty; i++) stars += '<i class="icon-star"></i>';
  return stars;
}

/**
 * Cria o HTML de um card de produto.
 */
function createProductCard(product) {
  const badgeHTML = product.badge
    ? `<span class="product-badge badge-${product.category}">${product.badge}</span>`
    : "";

  const imgSrc = getProductImage(product);

  return `
    <article class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="card-image-wrapper">
        ${badgeHTML}
        <div class="card-img-container">
          <img 
            src="${imgSrc}" 
            alt="${product.name}" 
            class="card-image"
            loading="lazy"
            onerror="this.src='${getFallbackImage(product.category)}'"
          />
          <div class="card-overlay"></div>
        </div>
        <button class="btn-quick-view" data-id="${product.id}" aria-label="Ver detalhes de ${product.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Ver detalhes
        </button>
      </div>

      <div class="card-info">
        <div class="card-category-tag">
          <span>${product.category === "burgers" ? "Hambúrguer" : "Bebida"}</span>
        </div>

        <h3 class="card-name">${product.name}</h3>

        <div class="card-ingredients">
          ${product.ingredients.slice(0, 3).join(" · ")}${product.ingredients.length > 3 ? ` · +${product.ingredients.length - 3}` : ""}
        </div>

        <div class="card-footer">
          <div class="card-price-row">
            <span class="card-price">R$ ${product.price.toFixed(2).replace(".", ",")}</span>
          </div>
          
          <button 
            class="btn-see-more" 
            data-id="${product.id}"
            aria-label="Ver mais detalhes de ${product.name}"
          >
            Ver mais
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Retorna imagem do produto (URL externa baseada no ID).
 */
function getProductImage(product) {
  const images = {
    1: "assets/x-bacon.png",
    2: "assets/x-calabresa.png",
    // X-Salada uses an external image fallback
    3: "https://static.wixstatic.com/media/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg/v1/fill/w_2500,h_2500,al_c/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg",
    4: "assets/hamburguer.png",
    5: "assets/hamburguer-duplo.jpeg",
    6: "assets/x-burguer.png",
    7: "assets/x-egg.png",
    8: "assets/misto-quente.png",
    // Cachorros-quentes (novos produtos)
    9: "assets/cachorro-quente-simples.png",
    10: "assets/cachorro-quente-especial.png",
    // Bebidas renumeradas
    11: "https://tauste.com.br/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/8/4/84351777340059.jpg",
    12: "https://andinacocacola.vtexassets.com/arquivos/ids/158758/Coca-Cola-Original-_110440.jpg?v=639156020671730000",
    13: "https://carrefourbrfood.vtexassets.com/arquivos/ids/18900713/fanta-laranja-2-litros-1.jpg?v=637590176098330000"
  };
  return images[product.id] || getFallbackImage(product.category);
}

function getFallbackImage(category) {
  return category === "burgers"
    ? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"
    : "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&q=80";
}

/**
 * Filtra produtos por categoria e busca.
 */
function getFilteredProducts() {
  return allProducts.filter((p) => {
    const matchCategory = currentCategory === "all" || p.category === currentCategory;
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });
}

/**
 * Renderiza os produtos filtrados na grid.
 */
function renderProducts() {
  const grid = document.getElementById("products-grid");
  const emptyState = document.getElementById("empty-state");
  if (!grid) return;

  const filtered = getFilteredProducts();

  // Skeleton → limpa
  grid.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  filtered.forEach((product, i) => {
    const card = document.createElement("div");
    card.innerHTML = createProductCard(product);
    const el = card.firstElementChild;
    el.style.animationDelay = `${i * 0.07}s`;
    el.classList.add("card-animate-in");
    grid.appendChild(el);
  });

  attachCardEvents();
  if (typeof applyStoreStatus === "function") applyStoreStatus();
}

/**
 * Mostra skeletons de loading.
 */
function showSkeletons(count = 6) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = Array(count)
    .fill(0)
    .map(
      () => `
      <div class="product-card skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="card-info">
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-text long"></div>
          <div class="skeleton skeleton-text medium"></div>
        </div>
      </div>
    `
    )
    .join("");
}

/**
 * Associa eventos nos cards renderizados.
 */
function attachCardEvents() {
  // Botão ver mais
  document.querySelectorAll(".btn-see-more").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      openProductModal(id);
    });
  });

  // Botão ver detalhes
  document.querySelectorAll(".btn-quick-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      openProductModal(id);
    });
  });

  // Clique no card
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      openProductModal(id);
    });
  });
}

/**
 * Anima o badge do carrinho.
 */
function animateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  badge.classList.remove("badge-pop");
  void badge.offsetWidth;
  badge.classList.add("badge-pop");
}

/**
 * Exibe toast de produto adicionado.
 */
function showToast(productName) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span><strong>${productName}</strong> adicionado ao carrinho</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-show"));

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/**
 * Inicializa o módulo de produtos.
 */
async function initProducts() {
  showSkeletons(6);

  try {
    const res = await fetch("data/products.json");
    allProducts = await res.json();
  } catch {
    // fallback inline
    allProducts = [];
  }

  setTimeout(() => {
    renderProducts();
  }, 600);
}

// Expor globalmente
window.allProducts = allProducts;
window.renderProducts = renderProducts;
window.showToast = showToast;
window.animateCartBadge = animateCartBadge;
window.getProductById = (id) => allProducts.find((p) => p.id === id);

window.setCategory = (cat) => {
  currentCategory = cat;
  renderProducts();
};

window.setSearch = (q) => {
  searchQuery = q;
  renderProducts();
};

document.addEventListener("DOMContentLoaded", initProducts);
