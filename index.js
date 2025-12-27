const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");

let products = [];

const apiUrls = {
  phones: "https://dummyjson.com/products/category/smartphones",
  laptops: "https://dummyjson.com/products/category/laptops",
  airbuds: "https://dummyjson.com/products/category/mobile-accessories",
  all: "https://dummyjson.com/products?limit=30"
};



function loadProducts(category = "all") {
  fetch(apiUrls[category])
    .then(res => res.json())
    .then(data => {
      products = data.products;
      filterAndRender();
    });
}

function renderProducts(list) {
  if (!productGrid) return;

  productGrid.innerHTML = list.map(p => `
    <div class="product-card">
      <img src="${p.thumbnail}">
      <h4>${p.title}</h4>
      <p>$${p.price}</p>

      <button class="buy-btn"
        data-id="${p.id}"
        data-name="${p.title}"
        data-price="${p.price}"
        data-image="${p.thumbnail}">
        Add to Cart
      </button>
    </div>
  `).join("");

  bindBuyButtons();
}

function bindBuyButtons() {
  document.querySelectorAll(".buy-btn").forEach(btn => {
    btn.onclick = () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: +btn.dataset.price,
        image: btn.dataset.image
      });
    };
  });
}

function filterAndRender() {
  let filtered = [...products];

  if (priceFilter && priceFilter.value !== "all") {
    filtered = filtered.filter(p => p.price <= +priceFilter.value);
  }

  renderProducts(filtered);
}


function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

function addToCart(product) {
  const cart = getCart();
  const found = cart.find(p => p.id == product.id);

  if (found) found.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart(cart);
  alert("Product Added to Successfully to Your Cart")
}

function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const count = getCart().reduce((s, i) => s + i.quantity, 0);
  badge.textContent = count;
}

function loadCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartTotal) return;

  const cart = getCart();
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("tr");
row.innerHTML = `
  <td data-label="Product">
    <img src="${item.image}" width="60">
  </td>

  <td data-label="Name">${item.name}</td>

  <td data-label="Price">$${item.price}</td>

  <td data-label="Quantity">
    <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
    <span class="qty-value">${item.quantity}</span>
    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
  </td>

  <td data-label="Subtotal">$${subtotal.toFixed(2)}</td>

  <td data-label="Action">
    <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
  </td>
`;


    cartItems.appendChild(row);
  });

  cartTotal.textContent = total.toFixed(2);
}


function changeQty(index, delta) {
  const cart = getCart();
  cart[index].quantity += delta;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}



document.addEventListener("DOMContentLoaded", () => {
  if (productGrid) loadProducts();
  updateCartCount();
  loadCart();
});

if (categoryFilter)
  categoryFilter.onchange = e => loadProducts(e.target.value);

if (priceFilter)
  priceFilter.onchange = filterAndRender;
