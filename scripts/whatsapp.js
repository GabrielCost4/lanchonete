/**
 * whatsapp.js
 * Gera mensagem formatada e redireciona para WhatsApp.
 */

// =============================================
// CONFIGURE SEU NÚMERO AQUI (com DDI e DDD, sem espaços ou símbolos)
// Exemplo: "5514999999999" → Brasil, DDD 14
// =============================================
const WHATSAPP_NUMBER = "5514991190771";

/**
 * Formata e envia o pedido para o WhatsApp.
 * @param {Object} data - Dados coletados do formulário de checkout
 */
function sendToWhatsApp(data) {
  const lines = [];

  lines.push("*NOVO PEDIDO*");
  lines.push("─────────────────────────────");

  lines.push(`*Cliente:* ${data.name}`);
  lines.push(`*Telefone:* ${data.phone}`);

  lines.push("");
  lines.push("*Endereço de Entrega:*");
  lines.push(`${data.address}, Nº ${data.number}`);
  lines.push(`Bairro: ${data.neighborhood}`);
  if (data.complement) lines.push(`Complemento: ${data.complement}`);
  if (data.reference) lines.push(`Referência: ${data.reference}`);

  lines.push("");
  lines.push(`*Recebimento:* ${data.deliveryMode || "Não informado"}`);
  lines.push("");
  lines.push("*Itens do Pedido:*");
  lines.push("─────────────────────────────");

  data.items.forEach((item) => {
    lines.push(
  `*${item.quantity} ${item.name}* — R$ ${(Cart.getItemTotal(item))
    .toFixed(2)
    .replace(".", ",")}`
);

    // Mostrar tipo de pão e observação somente para hambúrgueres; acréscimos somente para hambúrgueres
    if (item.category === "burgers") {
      lines.push(`   ↳ _Pão: ${item.bread || ""}_`);

      if (item.observation && item.observation.trim()) {
        lines.push(`   ↳ _Obs: ${item.observation.trim()}_`);
      }

      if (Array.isArray(item.addons) && item.addons.length) {
        const addons = item.addons
          .map((addon) => {
            const name = typeof addon === "string" ? addon : addon.name;
            const quantity = typeof addon === "string" ? 1 : Number(addon.quantity || 1);
            const label = name.toLowerCase();
            return `${quantity} ${label}${quantity > 1 ? "s" : ""} a mais`;
          })
          .join(", ");
        lines.push(`   ↳ _Acréscimos: ${addons}_`);
      }
    }

  });

 lines.push("─────────────────────────────");

lines.push(
  `*Subtotal: R$ ${data.subtotal.toFixed(2).replace(".", ",")}*`
);

lines.push(
  `*Taxa de entrega: R$ ${data.deliveryFee.toFixed(2).replace(".", ",")}*`
);

lines.push(
  `*Total: R$ ${data.total.toFixed(2).replace(".", ",")}*`
);

  lines.push("");
  lines.push(`*Pagamento:* ${data.payment}`);

  if (data.payment === "Dinheiro") {
    if (data.needChange && data.changeFor) {
      lines.push(`*Troco para:* ${data.changeFor}`);
    } else {
      lines.push(`*Troco:* Não precisa`);
    }
  }

  lines.push("");
  lines.push("Pedido enviado pelo site.");

  const message = lines.join("\n");
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

  // Limpa carrinho após envio
  Cart.clear();
  closeCheckout();

  // Mostra confirmação antes de redirecionar
  showOrderConfirmation(() => {
    window.open(url, "_blank");
  });
}

/**
 * Exibe tela de confirmação do pedido.
 */
function showOrderConfirmation(onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "order-confirm-overlay";
  overlay.innerHTML = `
    <div class="order-confirm-box">
      <div class="confirm-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 class="confirm-title">Quase lá!</h2>
      <p class="confirm-text">Para finalizar seu pedido, você será redirecionado ao WhatsApp, onde poderá enviar os detalhes diretamente para nossa equipe.
</p>
      <button class="confirm-btn" id="confirm-whatsapp-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Confirmar no WhatsApp
      </button>
      <button class="confirm-cancel" id="confirm-cancel-btn">Fechar</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));

  document.getElementById("confirm-whatsapp-btn")?.addEventListener("click", () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 400);
    onConfirm();
  });

  document.getElementById("confirm-cancel-btn")?.addEventListener("click", () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 400);
  });
}

window.sendToWhatsApp = sendToWhatsApp;
