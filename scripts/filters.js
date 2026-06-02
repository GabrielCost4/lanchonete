/**
 * filters.js
 * Gerencia filtros por categoria e busca por nome.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Filtros de categoria
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      setCategory(cat);
    });
  });

  // Busca
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      setSearch(q);
      if (searchClear) {
        searchClear.style.opacity = q ? "1" : "0";
        searchClear.style.pointerEvents = q ? "auto" : "none";
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      setSearch("");
      searchClear.style.opacity = "0";
      searchClear.style.pointerEvents = "none";
      searchInput?.focus();
    });
  }
});
