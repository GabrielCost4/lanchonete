/**
 * checkout.js
 * Formulário de finalização de pedido com validação e máscaras.
 */

function openCheckout() {
  const panel = document.getElementById("checkout-panel");
  const overlay = document.getElementById("checkout-overlay");
  if (!panel || !overlay) return;

  renderCheckoutOrder();
  panel.classList.add("open");
  overlay.classList.add("visible");
  document.body.classList.add("checkout-open");

  overlay.onclick = () => closeCheckout();
  document.getElementById("checkout-close")?.addEventListener("click", closeCheckout);
  document.addEventListener("keydown", handleCheckoutKey);
}

function closeCheckout() {
  const panel = document.getElementById("checkout-panel");
  const overlay = document.getElementById("checkout-overlay");
  panel?.classList.remove("open");
  overlay?.classList.remove("visible");
  document.body.classList.remove("checkout-open");
  document.removeEventListener("keydown", handleCheckoutKey);
}

function handleCheckoutKey(e) {
  if (e.key === "Escape") closeCheckout();
}

/**
 * Renderiza resumo do pedido no checkout.
 */
function renderCheckoutOrder() {
  const list = document.getElementById("checkout-order-list");
  const total = document.getElementById("checkout-total-value");
  if (!list) return;

  const items = Cart.items;

  list.innerHTML = items
    .map(
      (item) => `
      <div class="checkout-item">
        <span class="checkout-item-qty">${item.quantity}x</span>
        <div class="checkout-item-info">
  <span class="checkout-item-name">${item.name}</span>

  ${item.category === 'burgers' ? `<span class="checkout-item-bread">
    Pão: ${item.bread}
  </span>` : ''}

  ${item.observation && item.category === 'burgers'
    ? `<span class="checkout-item-obs">${item.observation}</span>`
    : ""}
</div>
        <span class="checkout-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
      </div>
    `
    )
    .join("");

  const DELIVERY_FEE = 5;

const subtotal = Cart.getTotal();
const finalTotal = subtotal + DELIVERY_FEE;

if (total) {
  total.textContent =
    `R$ ${finalTotal.toFixed(2).replace(".", ",")}`;
}
}

/**
 * Máscara de telefone.
 */
function phoneMask(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

/**
 * Máscara de valor monetário.
 */
function moneyMask(value) {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  const n = (parseInt(num, 10) / 100).toFixed(2);
  return "R$ " + n.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Inicializa formulário de checkout.
 */
document.addEventListener("DOMContentLoaded", () => {

  const phoneInput = document.getElementById("checkout-phone");
  const numberInput = document.getElementById("checkout-number");
  const changeInput = document.getElementById("checkout-change");

  const paymentRadios = document.querySelectorAll('input[name="payment"]');

  const changeWrapper = document.getElementById("change-wrapper");

  const changeNeedYes = document.getElementById("change-need-yes");
  const changeNeedNo = document.getElementById("change-need-no");

  const changeAmountWrapper = document.getElementById("change-amount-wrapper");

  const form = document.getElementById("checkout-form");

  /* =========================
     TELEFONE
  ========================= */

  phoneInput?.addEventListener("input", (e) => {
    e.target.value = phoneMask(e.target.value);
  });

  /* =========================
     NÚMERO SEM LETRAS
  ========================= */

  numberInput?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  /* =========================
     TROCO SOMENTE NÚMEROS
  ========================= */

  changeInput?.addEventListener("input", (e) => {

    let value = e.target.value.replace(/\D/g, "");

    if (!value) {
      e.target.value = "";
      return;
    }

    const number = (parseInt(value, 10) / 100).toFixed(2);

    e.target.value =
      "R$ " +
      number
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  });

  /* =========================
     MOSTRAR TROCO
  ========================= */

  paymentRadios.forEach((radio) => {

    radio.addEventListener("change", () => {

      if (!changeWrapper) return;

      changeWrapper.style.display =
        radio.value === "Dinheiro"
          ? "flex"
          : "none";

      // reset
      if (radio.value !== "Dinheiro") {

        if (changeInput) changeInput.value = "";

        if (changeAmountWrapper) {
          changeAmountWrapper.style.display = "none";
        }

        if (changeNeedYes) changeNeedYes.checked = false;
        if (changeNeedNo) changeNeedNo.checked = false;
      }
    });
  });

  /* =========================
     PRECISA DE TROCO?
  ========================= */

  changeNeedYes?.addEventListener("change", () => {

    if (changeAmountWrapper) {
      changeAmountWrapper.style.display = "block";
    }
  });

  changeNeedNo?.addEventListener("change", () => {

    if (changeAmountWrapper) {
      changeAmountWrapper.style.display = "none";
    }

    if (changeInput) {
      changeInput.value = "";
    }
  });

  /* =========================
     SUBMIT
  ========================= */

  form?.addEventListener("submit", (e) => {

    e.preventDefault();

    if (validateCheckoutForm()) {

      const data = collectFormData();

      sendToWhatsApp(data);
    }
  });
});

/**
 * Valida os campos obrigatórios do formulário.
 */
function validateCheckoutForm() {

  const fields = [
    { id: "checkout-name", label: "Nome completo" },
    { id: "checkout-phone", label: "Telefone" },
    { id: "checkout-address", label: "Endereço" },
    { id: "checkout-number", label: "Número" },
    { id: "checkout-neighborhood", label: "Bairro" },
  ];

  let valid = true;

  fields.forEach(({ id, label }) => {

    const el = document.getElementById(id);
    const errEl = document.getElementById(`${id}-error`);

    if (!el) return;

    el.classList.remove("input-error");

    if (errEl) {
      errEl.textContent = "";
    }

    if (!el.value.trim()) {

      el.classList.add("input-error");

      if (errEl) {
        errEl.textContent = `${label} é obrigatório`;
      }

      valid = false;
    }
  });

  /* =========================
     PAGAMENTO
  ========================= */

  const payment =
    document.querySelector('input[name="payment"]:checked');

  const payErr =
    document.getElementById("payment-error");

  if (!payment) {

    if (payErr) {
      payErr.textContent =
        "Selecione uma forma de pagamento";
    }

    valid = false;

  } else {

    if (payErr) {
      payErr.textContent = "";
    }
  }

  /* =========================
     TROCO
  ========================= */

  if (payment?.value === "Dinheiro") {

    const needChange =
      document.querySelector('input[name="need-change"]:checked');

    const changeErr =
      document.getElementById("change-need-error");

    if (!needChange) {

      if (changeErr) {
        changeErr.textContent =
          "Informe se precisa de troco";
      }

      valid = false;

    } else {

      if (changeErr) {
        changeErr.textContent = "";
      }

      // se precisa de troco
if (needChange.value === "sim") {

  const changeInput =
    document.getElementById("checkout-change");

  const changeErr =
    document.getElementById("change-need-error");

  const orderTotal =
    Cart.getTotal() + 5;

  // valor digitado no input
  const changeValue =
    parseFloat(
      changeInput.value
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );

  // campo vazio
  if (!changeInput?.value.trim()) {

    changeInput?.classList.add("input-error");

    if (changeErr) {
      changeErr.textContent =
        "Insira o valor para troco!";
    }

    valid = false;

  }
  // troco menor que total
  else if (changeValue < orderTotal) {

    changeInput?.classList.add("input-error");

    if (changeErr) {
      changeErr.textContent =
        `O valor deve ser maior ou igual a R$ ${orderTotal.toFixed(2).replace(".", ",")}`;
    }

    valid = false;

  } else {

    changeInput?.classList.remove("input-error");

    if (changeErr) {
      changeErr.textContent = "";
    }
  }
}
    }
  }

  /* =========================
     SCROLL ATÉ ERRO
  ========================= */

  if (!valid) {


    const firstError =
      document.querySelector(".input-error");

    firstError?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  return valid;
}
/**
 * Coleta todos os dados do formulário.
 */
function collectFormData() {
  const payment = document.querySelector('input[name="payment"]:checked')?.value || "";
  const needChange = document.querySelector('input[name="need-change"]:checked')?.value;
  const changeFor = document.getElementById("checkout-change")?.value || "";

  return {
    name: document.getElementById("checkout-name")?.value.trim() || "",
    phone: document.getElementById("checkout-phone")?.value.trim() || "",
    address: document.getElementById("checkout-address")?.value.trim() || "",
    number: document.getElementById("checkout-number")?.value.trim() || "",
    neighborhood: document.getElementById("checkout-neighborhood")?.value.trim() || "",
    complement: document.getElementById("checkout-complement")?.value.trim() || "",
    reference: document.getElementById("checkout-reference")?.value.trim() || "",
    payment,
    needChange: needChange === "sim",
    changeFor,
    items: Cart.items,
    deliveryFee: 5,
subtotal: Cart.getTotal(),
total: Cart.getTotal() + 5,
  };
}

window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.collectFormData = collectFormData;
