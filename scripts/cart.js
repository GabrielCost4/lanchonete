/**
 * cart.js
 * Gerencia o carrinho lateral: adicionar, remover, alterar quantidade, totais.
 */

const Cart = {
  items: [],
  deliveryMode: "",

  /**
   * Inicializa carrinho a partir do localStorage.
   */
  init() {
    this.items = Storage.getCart().map((item) => ({
      ...item,
      addons: Array.isArray(item.addons)
        ? item.addons.map((addon) =>
            typeof addon === "string"
              ? { name: addon, quantity: 1 }
              : { name: addon.name, quantity: Number(addon.quantity || 1) }
          )
        : [],
      observation: item.observation || "",
      bread: item.bread || "",
      category: item.category,
    }));
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
  addons: [],
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
   * Retorna o valor dos acréscimos de um item.
   */
  getItemAddonsPrice(item) {
    if (item.category !== "burgers") return 0;

    const addons = Array.isArray(item.addons) ? item.addons : [];
    if (!addons.length) return 0;

    const addonPrices = {
      Bacon: 4,
      Carne: 4,
      Salsicha: 3,
      Presunto: 3,
      Muçarela: 3,
      Calabresa: 4,
      Mostarda: 1.5,
    };

    return addons.reduce((sum, addon) => {
      const name = typeof addon === "string" ? addon : addon.name;
      const quantity = typeof addon === "string" ? 1 : Number(addon.quantity || 1);
      return sum + (addonPrices[name] || 0) * quantity;
    }, 0);
  },

  /**
   * Retorna o total de um item com acréscimos.
   */
  getItemTotal(item) {
    return item.price * item.quantity + this.getItemAddonsPrice(item);
  },

  /**
   * Adiciona ou remove um acréscimo de um item.
   */
  updateAddonQuantity(id, addonName, delta) {
    const item = this.items.find((i) => i.id === id);
    if (!item || item.category !== "burgers") return;

    const addons = Array.isArray(item.addons) ? item.addons : [];
    const existing = addons.find((addon) => addon.name === addonName);

    if (existing) {
      const nextQuantity = Math.max(0, existing.quantity + delta);
      if (nextQuantity === 0) {
        item.addons = addons.filter((addon) => addon.name !== addonName);
      } else {
        existing.quantity = nextQuantity;
        item.addons = [...addons];
      }
    } else if (delta > 0) {
      item.addons = [...addons, { name: addonName, quantity: 1 }];
    }

    this.save();
    this.render();
  },

  /**
   * Define o modo de recebimento.
   */
  setDeliveryMode(mode) {
    this.deliveryMode = mode;
    this.render();
  },

  /**
   * Retorna o modo de recebimento.
   */
  getDeliveryMode() {
    return this.deliveryMode;
  },

  /**
   * Retorna a taxa de entrega aplicável.
   */
  getDeliveryFee() {
    return this.getDeliveryMode() === "Entregar" ? 5 : 0;
  },

  /**
   * Retorna o total do carrinho.
   */
  getTotal() {
    return this.items.reduce((sum, i) => sum + this.getItemTotal(i), 0);
  },

  /**
   * Retorna o total final com a taxa de entrega, quando aplicável.
   */
  getFinalTotal() {
    return this.getTotal() + this.getDeliveryFee();
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
    this.deliveryMode = "";
    document.querySelectorAll('input[name="delivery-mode"]').forEach((input) => {
      input.checked = false;
    });
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

    const addonOptions = [
      { name: "Bacon", price: 4 },
      { name: "Carne", price: 4 },
      { name: "Salsicha", price: 3 },
      { name: "Presunto", price: 3 },
      { name: "Muçarela", price: 3 },
      { name: "Calabresa", price: 4 },
      { name: "Mostarda", price: 1.5 },
    ];

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
            <div class="cart-item-price">R$ ${this.getItemTotal(item).toFixed(2).replace(".", ",")}</div>
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

            ${item.category === 'burgers' ? `
            <div class="cart-item-addons">
              <div class="cart-item-addons-title">Acréscimos:</div>
              <div class="cart-item-addons-list">
                ${addonOptions.map((addon) => {
                  const current = Array.isArray(item.addons)
                    ? item.addons.find((entry) => entry.name === addon.name)
                    : null;
                  const quantity = current ? current.quantity : 0;

                  return `
                    <div class="cart-item-addon">
                      <span>${addon.name}</span>
                      <span class="cart-item-addon-price">+R$ ${addon.price.toFixed(2).replace(".", ",")}</span>
                      <div class="cart-item-addon-controls">
                        <button type="button" class="addon-btn" data-id="${item.id}" data-addon="${addon.name}" data-delta="-1">-</button>
                        <span class="addon-quantity">${quantity}</span>
                        <button type="button" class="addon-btn" data-id="${item.id}" data-addon="${addon.name}" data-delta="1">+</button>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
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
    const deliveryInfo = document.getElementById("cart-delivery-info");
    const DELIVERY_FEE = 5;

    const subtotalValue = this.getTotal();
    const deliverySelected = this.getDeliveryMode() === "Entregar";
    const totalValue = subtotalValue + (deliverySelected ? DELIVERY_FEE : 0);

    const subtotalFormatted =
      `R$ ${subtotalValue.toFixed(2).replace(".", ",")}`;

    if (subtotal) subtotal.textContent = subtotalFormatted;

    if (deliveryInfo) {
      deliveryInfo.style.display = deliverySelected ? "block" : "none";
      deliveryInfo.innerHTML = deliverySelected
        ? `<div class="cart-delivery-line">Subtotal: <strong>${subtotalFormatted}</strong></div><div class="cart-delivery-line">Taxa de entrega: <strong>R$ 5,00</strong></div><div class="cart-delivery-line">Valor total: <strong>R$ ${totalValue.toFixed(2).replace(".", ",")}</strong></div>`
        : "";
    }

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

    body.querySelectorAll(".cart-item-addon .addon-btn").forEach((button) => {
      button.addEventListener("click", () => {
        this.updateAddonQuantity(
          parseInt(button.dataset.id),
          button.dataset.addon,
          parseInt(button.dataset.delta, 10)
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
    10: "assets/coca-lata.jpg",
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

  document.querySelectorAll('input[name="delivery-mode"]').forEach((input) => {
    input.addEventListener("change", () => Cart.setDeliveryMode(input.value));
  });

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
