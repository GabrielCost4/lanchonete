/**
 * cart.js
 * Gerencia o carrinho lateral: adicionar, remover, alterar quantidade, totais.
 */

const Cart = {
  items: [],

  /**
   * Inicializa carrinho a partir do localStorage.
   */
  init() {
    this.items = Storage.getCart();
    this.render();
    this.updateBadge();
  },

  /**
   * Adiciona produto ao carrinho.
   */
  addItem(product) {
    const existing = this.items.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({
  ...product,
  quantity: 1,
  observation: "",
  bread: "",
  category: product.category,
});
    }
    this.save();
    this.render();
    this.updateBadge();
    this.openCart();
  },

  /**
   * Remove produto do carrinho.
   */
  removeItem(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this.save();
    this.render();
    this.updateBadge();
  },

  /**
   * Altera quantidade de um item.
   */
  updateQuantity(id, qty) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      this.removeItem(id);
      return;
    }
    item.quantity = qty;
    this.save();
    this.render();
    this.updateBadge();
  },

  /**
 * Atualiza observação de um item.
 */
updateObservation(id, obs) {
  const item = this.items.find((i) => i.id === id);
  if (item) item.observation = obs;
  this.save();
},

/**
 * Atualiza tipo de pão.
 */
updateBread(id, bread) {
  const item = this.items.find((i) => i.id === id);

  if (item) {
    item.bread = bread;
  }

  this.save();
},

  /**
   * Retorna o total do carrinho.
   */
  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  /**
   * Retorna total de itens no carrinho.
   */
  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  },

  /**
   * Limpa o carrinho.
   */
  clear() {
    this.items = [];
    this.save();
    this.render();
    this.updateBadge();
  },

  /**
   * Salva no localStorage.
   */
  save() {
    Storage.saveCart(this.items);
  },

  /**
   * Abre o painel do carrinho.
   */
  openCart() {
    const panel = document.getElementById("cart-panel");
    const overlay = document.getElementById("cart-overlay");
    panel?.classList.add("open");
    overlay?.classList.add("visible");
    document.body.classList.add("cart-open");
  },

  /**
   * Fecha o painel do carrinho.
   */
  closeCart() {
    const panel = document.getElementById("cart-panel");
    const overlay = document.getElementById("cart-overlay");
    panel?.classList.remove("open");
    overlay?.classList.remove("visible");
    document.body.classList.remove("cart-open");
  },

  /**
   * Atualiza o badge de quantidade no ícone.
   */
  updateBadge() {
    const badge = document.getElementById("cart-badge");
    const count = this.getCount();
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  },

  /**
   * Renderiza o carrinho lateral.
   */
  render() {
    const body = document.getElementById("cart-body");
    const footer = document.getElementById("cart-footer");
    const empty = document.getElementById("cart-empty");
    if (!body) return;

    if (this.items.length === 0) {
      body.innerHTML = "";
      if (empty) empty.style.display = "flex";
      if (footer) footer.style.display = "none";
      return;
    }

    if (empty) empty.style.display = "none";
    if (footer) footer.style.display = "block";

    body.innerHTML = this.items
      .map(
        (item) => `
        <div class="cart-item" data-id="${item.id}">
          <img 
            src="${getProductImageUrl(item.id)}" 
            alt="${item.name}" 
            class="cart-item-img"
            onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=60'"
          />
          <div class="cart-item-details">
            <div class="cart-item-top">
              <span class="cart-item-name">${item.name}</span>
              <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover ${item.name}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</div>
            ${item.category === 'burgers' ? `
            <div class="cart-item-bread-wrapper">
  <select 
    class="cart-item-bread"
    data-id="${item.id}"
  >
    <option 
  value="" 
  disabled 
  ${!item.bread ? "selected" : ""}
>
  Selecione o tipo de pão
</option>

<option 
  value="Hambúrguer"
  ${item.bread === "Hambúrguer" ? "selected" : ""}
>
  Pão de Hambúrguer
</option>

<option 
  value="Francês"
  ${item.bread === "Francês" ? "selected" : ""}
>
  Pão Francês
</option>
  </select>
</div>

<div class="cart-item-obs-wrapper">
  <input 
    type="text" 
    class="cart-item-obs" 
    placeholder="Observação (ex: sem cebola)" 
    value="${item.observation || ""}"
    data-id="${item.id}"
    maxlength="80"
  />
</div>
            ` : ''}
            <div class="cart-item-qty">
              <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Diminuir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Aumentar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    // Totais
    const subtotal = document.getElementById("cart-subtotal");
    const total = document.getElementById("cart-total");
    const DELIVERY_FEE = 5;

const subtotalValue = this.getTotal();
const totalValue = subtotalValue + DELIVERY_FEE;

const subtotalFormatted =
  `R$ ${subtotalValue.toFixed(2).replace(".", ",")}`;

const totalFormatted =
  `R$ ${totalValue.toFixed(2).replace(".", ",")}`;

if (subtotal) subtotal.textContent = subtotalFormatted;
if (total) total.textContent = totalFormatted;

    // Eventos dos itens
    body.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => this.removeItem(parseInt(btn.dataset.id)));
    });

    body.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = this.items.find((i) => i.id === id);
        if (item) this.updateQuantity(id, item.quantity - 1);
      });
    });

    body.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = this.items.find((i) => i.id === id);
        if (item) this.updateQuantity(id, item.quantity + 1);
      });
    });

    body.querySelectorAll(".cart-item-obs").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.updateObservation(parseInt(input.dataset.id), e.target.value);
      });
    });

    body.querySelectorAll(".cart-item-bread").forEach((select) => {
  select.addEventListener("change", (e) => {
    this.updateBread(
      parseInt(select.dataset.id),
      e.target.value
    );
  });
});
  },
};

function getProductImageUrl(id) {
  const images = {
    1: "assets/x-bacon.png",
    2: "assets/x-calabresa.png",
    3: "https://static.wixstatic.com/media/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg/v1/fill/w_2500,h_2500,al_c/426382_b4e2e7aa9a284d3ebb7489df5fee4d55~mv2.jpg",
    4: "assets/hamburguer.png",
    5: "assets/hamburguer-duplo.jpeg",
    6: "assets/x-burguer.png",
    7: "assets/x-egg.png",
    8: "assets/misto-quente.png",
    // Cachorros-quentes
    9: "assets/cachorro-quente-simples.png",
    10: "assets/cachorro-quente-especial.png",
    // Bebidas renumeradas
    11: "https://tauste.com.br/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/8/4/84351777340059.jpg",
    12: "https://andinacocacola.vtexassets.com/arquivos/ids/158758/Coca-Cola-Original-_110440.jpg?v=639156020671730000",
    13: "https://carrefourbrfood.vtexassets.com/arquivos/ids/18900713/fanta-laranja-2-litros-1.jpg?v=637590176098330000"
  };
  return images[id] || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=60";
}

// Expor globalmente
window.Cart = Cart;
window.getProductImageUrl = getProductImageUrl;

document.addEventListener("DOMContentLoaded", () => {
  Cart.init();

  // Fechar carrinho
  document.getElementById("cart-close")?.addEventListener("click", () => Cart.closeCart());
  document.getElementById("cart-overlay")?.addEventListener("click", () => Cart.closeCart());

  // Abrir carrinho pelo ícone
  document.getElementById("cart-toggle")?.addEventListener("click", () => Cart.openCart());

  // Finalizar pedido
  document.getElementById("btn-checkout")?.addEventListener("click", () => {
    if (!window.storeIsOpen) {
      showStoreClosedAlert();
      return;
    }
    if (Cart.items.length === 0) {
      showEmptyCartAlert();
      return;
    }

const invalidBread = Cart.items.some((item) => item.category === 'burgers' && !item.bread);

if (invalidBread) {
  showCustomAlert(
    "Selecione o tipo de pão de todos os hambúrgueres.",
    "warning"
  );
  return;
}
    
    Cart.closeCart();
    openCheckout();
  });
});

function showStoreClosedAlert() {
  const msg = window.storeSettings?.closedMessage || "Estabelecimento fechado no momento.";
  showCustomAlert(msg, "closed");
}

function showEmptyCartAlert() {
  showCustomAlert("Adicione itens ao carrinho antes de finalizar.", "warning");
}

function showCustomAlert(message, type = "info") {
  const existing = document.querySelector(".custom-alert");
  if (existing) existing.remove();

  const alert = document.createElement("div");
  alert.className = `custom-alert alert-${type}`;
  alert.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(alert);
  requestAnimationFrame(() => alert.classList.add("alert-show"));
  setTimeout(() => {
    alert.classList.remove("alert-show");
    setTimeout(() => alert.remove(), 400);
  }, 4000);
}

window.showCustomAlert = showCustomAlert;
