/**
 * storage.js
 * Gerencia persistência de dados no localStorage.
 */

const CART_KEY = "burgerhouse_cart";

const Storage = {
  /**
   * Retorna o carrinho salvo ou array vazio.
   */
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  /**
   * Salva o carrinho no localStorage.
   * @param {Array} cart
   */
  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  /**
   * Limpa o carrinho do localStorage.
   */
  clearCart() {
    localStorage.removeItem(CART_KEY);
  },
};

window.Storage = Storage;
