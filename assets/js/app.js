/* =========================================================
   app.js
   Lógica principal del proyecto.
   Este archivo centraliza:
   - catálogo de productos
   - renderizado del home
   - renderizado del detalle
   - carrito simulado con localStorage
   - contador del navbar
   Buenas prácticas aplicadas:
   - funciones pequeñas y con propósito claro
   - nombres descriptivos
   - separación entre datos, render y eventos
   ========================================================= */

// Arreglo de objetos: cumple con el requisito de usar arrays/objetos en JS.
const products = [
  {
    id: 1,
    name: "Kit de Ilumicacón led",
    price: 69990,
    description:
      "Iluminación profesional para fotos y videos. Luz LED ajustable (fría y cálidad), altura regulable, control de intensidad. Logra la ilumación perfecta en cualquier momento.",
    image: "assets/img/aros de luz.jpg",
  },
  {
    id: 2,
    name: "Cámara para creación de contenido",
    price: 595990,
    description:
      "Cámara ideal para fotografía y video tipo vlog. Perfecta para quienes quieren comenzar en la creación de contenido con calidad profesional.",
    image: "assets/img/camara.jpg",
  },
  {
    id: 3,
    name: "Microfóno DJI Mic Mini ",
    price: 229990,
    description:
      "Audio profesional sin cables. Captura tu voz con claridad en cualquier lugar, incluye filtros antiviento (perfecto para exterior).",
    image: "assets/img/microfonos.jpg",
  },
  {
    id: 4,
    name: "Trípode Profesional",
    price: 129990,
    description:
      "Estabilidad total para fotos y videos perfectos. Compatible con cámara y celular,incluye bolso de transporte.",
    image: "assets/img/tripode.jpg",
  },
];

// Claves reutilizables para no escribir strings mágicos en varias partes.
const CART_STORAGE_KEY = "obscuralab_cart";

// Función utilitaria: entrega el carrito actual o un arreglo vacío.
function getCart() {
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
}

// Guarda el carrito actualizado en localStorage.
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Formatea números a moneda chilena para una mejor UX.
function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

// Actualiza el badge del navbar en cualquier página.
function updateCartCount() {
  const cart = getCart();
  const cartCountElement = document.querySelector("#cart-count");

  if (cartCountElement) {
    cartCountElement.textContent = cart.length;
  }
}

// Marca el link activo para mejorar navegación y UX.
function setActiveNavLink() {
  const currentPage = document.body.dataset.page;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      (currentPage === "home" && href === "index.html") ||
      (currentPage === "cart" && href === "carrito.html")
    ) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

// Agrega un producto al carrito y actualiza interfaz.
function addToCart(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  updateCartCount();
  alert(`Producto agregado: ${product.name}`);
}

// Genera las cards del home dinámicamente.
function renderProducts() {
  const productList = document.querySelector("#product-list");

  if (!productList) {
    return;
  }

  productList.innerHTML = products
    .map(
      (product) => `
    <div class="col-12 col-sm-6 col-lg-3">
      <article class="card product-card border-0 shadow-sm h-100">
        <img src="${product.image}" class="product-image" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h3 class="h5 card-title">${product.name}</h3>
          <p class="card-text text-secondary flex-grow-1">${product.description}</p>
          <p class="fw-bold fs-5 mb-3">${formatCurrency(product.price)}</p>
          <div class="d-grid gap-2">
            <a class="btn btn-outline-primary" href="detalle.html?id=${product.id}">Ver más</a>
            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Agregar al carrito</button>
          </div>
        </div>
      </article>
    </div>
  `,
    )
    .join("");

  // Después de renderizar el HTML, recién podemos asociar eventos.
  const addButtons = document.querySelectorAll(".add-to-cart-btn");
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      addToCart(productId);
    });
  });
}

// Renderiza el detalle usando el parámetro id de la URL.
function renderProductDetail() {
  const detailContainer = document.querySelector("#product-detail");

  if (!detailContainer) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get("id"));
  const product = products.find((item) => item.id === productId);

  if (!product) {
    detailContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">Producto no encontrado.</div>
      </div>
    `;
    return;
  }

  detailContainer.innerHTML = `
    <div class="col-12 col-lg-6">
      <img src="${product.image}" alt="${product.name}" class="detail-image shadow-sm">
    </div>
    <div class="col-12 col-lg-6">
      <article class="bg-white rounded-4 shadow-sm p-4">
        <p class="text-uppercase text-secondary fw-semibold mb-2">Detalle del producto</p>
        <h1 class="mb-3">${product.name}</h1>
        <p class="fs-4 fw-bold">${formatCurrency(product.price)}</p>
        <p class="text-secondary">${product.description}</p>
        <button class="btn btn-primary btn-lg mt-3" id="detail-add-btn">Agregar al carrito</button>
      </article>
    </div>
  `;

  const detailAddButton = document.querySelector("#detail-add-btn");
  detailAddButton.addEventListener("click", () => addToCart(product.id));
}

// Muestra los productos agregados en la tabla del carrito.
function renderCart() {
  const cartItemsContainer = document.querySelector("#cart-items");
  const cartTotalItems = document.querySelector("#cart-total-items");
  const cartTotalPrice = document.querySelector("#cart-total-price");
  const clearCartButton = document.querySelector("#btn-clear-cart");

  if (
    !cartItemsContainer ||
    !cartTotalItems ||
    !cartTotalPrice ||
    !clearCartButton
  ) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-secondary py-4">Tu carrito está vacío.</td>
      </tr>
    `;
    cartTotalItems.textContent = "0";
    cartTotalPrice.textContent = formatCurrency(0);
  } else {
    cartItemsContainer.innerHTML = cart
      .map(
        (product, index) => `
      <tr>
        <td>${product.name}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">Eliminar</button>
        </td>
      </tr>
    `,
      )
      .join("");

    const total = cart.reduce(
      (accumulator, product) => accumulator + product.price,
      0,
    );
    cartTotalItems.textContent = cart.length;
    cartTotalPrice.textContent = formatCurrency(total);
  }

  // Evento para vaciar completamente el carrito.
  clearCartButton.addEventListener("click", () => {
    saveCart([]);
    renderCart();
    updateCartCount();
  });

  // Evento para eliminar productos individuales.
  const removeButtons = document.querySelectorAll(".remove-item-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemIndex = Number(button.dataset.index);
      const updatedCart = getCart().filter((_, index) => index !== itemIndex);
      saveCart(updatedCart);
      renderCart();
      updateCartCount();
    });
  });
}

// Punto de entrada: se ejecuta cuando el DOM ya está cargado.
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setActiveNavLink();
  renderProducts();
  renderProductDetail();
  renderCart();
});
