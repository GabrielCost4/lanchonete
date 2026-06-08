/**
 * modal.js
 * Abre e gerencia o modal de detalhes do produto.
 */

function openProductModal(id) {
  const product = window.getProductById ? window.getProductById(id) : null;
  if (!product) return;

  const modal = document.getElementById("product-modal");
  const overlay = document.getElementById("modal-overlay");
  if (!modal || !overlay) return;

  const imgSrc = window.getProductImageUrl
    ? window.getProductImageUrl(id)
    : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80";

  // Versão full da imagem
  const fullImages = {
    1: "assets/x-bacon.png",
    2: "https://media-cdn.tripadvisor.com/media/photo-s/06/c2/f9/ff/alex-silva-lanches.jpg",
    3: "https://static.wixstatic.com/media/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg/v1/fill/w_2500,h_2500,al_c/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg",
    4: "assets/hamburguer.png",
    5: "assets/x-burguer.png",
    6: "https://tauste.com.br/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/8/4/84351777340059.jpg",
    7: "https://andinacocacola.vtexassets.com/arquivos/ids/158758/Coca-Cola-Original-_110440.jpg?v=639156020671730000",
    8: "https://carrefourbrfood.vtexassets.com/arquivos/ids/18900713/fanta-laranja-2-litros-1.jpg?v=637590176098330000"
  };

  const fullImg = fullImages[id] || imgSrc;
  const starsHTML = renderModalStars(product.rating);
  const badgeHTML = product.badge
    ? `<span class="modal-badge">${product.badge}</span>`
    : "";

  modal.innerHTML = `
    <div class="modal-inner">
      <button class="modal-close" id="modal-close-btn" aria-label="Fechar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-img-wrapper">
        <img src="${fullImg}" alt="${product.name}" class="modal-img" 
          onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=85'"
        />
        <div class="modal-img-overlay"></div>
        ${badgeHTML}
      </div>

      <div class="modal-content">
        <div class="modal-category">${product.category === "burgers" ? "Hambúrguer" : "Bebida"}</div>
        <h2 class="modal-title">${product.name}</h2>

        <p class="modal-description">${product.description}</p>

        <div class="modal-ingredients">
          <h4 class="modal-ingredients-title">Ingredientes</h4>
          <div class="modal-tags">
            ${product.ingredients.map((ing) => `<span class="modal-tag">${ing}</span>`).join("")}
          </div>
        </div>

        <div class="modal-footer">
          <div class="modal-price">R$ ${product.price.toFixed(2).replace(".", ",")}</div>
          <button class="btn-modal-add btn-add-cart" data-id="${product.id}" ${!window.storeIsOpen ? "disabled" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart-plus" viewBox="0 0 16 16">
  <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
  <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add("visible");
  modal.classList.add("open");
  document.body.classList.add("modal-open");

  // Fechar
  document.getElementById("modal-close-btn")?.addEventListener("click", closeProductModal);
  overlay.addEventListener("click", closeProductModal);

  // Adicionar ao carrinho via modal
  modal.querySelector(".btn-modal-add")?.addEventListener("click", () => {
    if (!window.storeIsOpen) return;
    Cart.addItem(product);
    if (typeof showToast === "function") showToast(product.name);
    if (typeof animateCartBadge === "function") animateCartBadge();
    closeProductModal();
  });

  // Fechar com ESC
  document.addEventListener("keydown", handleModalKey);
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  const overlay = document.getElementById("modal-overlay");
  modal?.classList.remove("open");
  overlay?.classList.remove("visible");
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleModalKey);
}

function handleModalKey(e) {
  if (e.key === "Escape") closeProductModal();
}

function renderModalStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="icon-star filled"></i>';
    else if (i === Math.ceil(rating) && rating % 1 >= 0.5) html += '<i class="icon-star half"></i>';
    else html += '<i class="icon-star"></i>';
  }
  return html;
}

window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
