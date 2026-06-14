/**
 * opening-hours.js
 * Sistema de horário de funcionamento — configuração centralizada.
 * Para alterar horários, dias ou status, edite apenas o objeto storeSettings abaixo.
 */

const storeSettings = {
  // true = aberto normalmente por horário | false = fechado manualmente (override)
  manualOpen: true,

  // Horário de abertura e fechamento (formato 24h "HH:MM")
  openingTime: "18:00",
  closingTime: "22:00",

  // Dias da semana que o estabelecimento funciona
  // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
  // 4 = Quinta, 5 = Sexta, 6 = Sábado
  workingDays: [0],

  // Mensagem de fechamento exibida ao usuário
  closedMessage: "Estamos fechados no momento. Volte em breve!",

  // Mensagem de horário de funcionamento
  scheduleMessage: "Aberto até às 22h00",
};

/**
 * Verifica se a loja está aberta agora.
 * @returns {boolean}
 */
function isStoreOpen() {
  if (!storeSettings.manualOpen) return false;

  const now = new Date();
  const day = now.getDay();

  if (!storeSettings.workingDays.includes(day)) return false;

  const [openH, openM] = storeSettings.openingTime.split(":").map(Number);
  const [closeH, closeM] = storeSettings.closingTime.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Aplica o estado de abertura/fechamento na interface.
 */
function applyStoreStatus() {
  const open = isStoreOpen();
  const banner = document.getElementById("store-status-banner");
  const addBtns = document.querySelectorAll(".btn-add-cart");
  const checkoutBtn = document.getElementById("btn-checkout");
  const heroBtn = document.getElementById("hero-cta-btn");

  if (banner) {
    if (!open) {
      banner.classList.add("store-closed");
      banner.querySelector(".status-dot")?.classList.remove("open");
      banner.querySelector(".status-text").textContent = storeSettings.closedMessage;
    } else {
      banner.classList.remove("store-closed");
      banner.querySelector(".status-dot")?.classList.add("open");
      banner.querySelector(".status-text").textContent = `Aberto agora · ${storeSettings.scheduleMessage}`;
    }
  }

  addBtns.forEach((btn) => {
    btn.disabled = !open;
    btn.classList.toggle("disabled-btn", !open);
  });

  if (checkoutBtn) {
    checkoutBtn.disabled = !open;
    checkoutBtn.classList.toggle("disabled-btn", !open);
  }

  if (heroBtn) {
    heroBtn.disabled = !open;
    heroBtn.classList.toggle("disabled-btn", !open);
  }

  // Expor globalmente para uso em outros scripts
  window.storeIsOpen = open;
  window.storeSettings = storeSettings;
}

// Inicializa ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  applyStoreStatus();
  // Re-verifica a cada minuto
  setInterval(applyStoreStatus, 60000);
});

window.isStoreOpen = isStoreOpen;
window.applyStoreStatus = applyStoreStatus;
