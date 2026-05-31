/**
 * seller.js – iSand Seller Dashboard Logic
 * Handles: dashboard analytics (chart + stats), product catalog management,
 *          add/delete products, search, pagination, and product detail popup.
 */

// ═══════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════

const SELLER_PRODUCTS = [
  { id: 1,  name: "Pro Wireless Headphones",    category: "electronics", price: 149.99, stock: 23,  sales: 284, emoji: "🎧", description: "Premium over-ear wireless headphones with 40-hour battery life and ANC." },
  { id: 2,  name: 'UltraBook Pro 14"',           category: "electronics", price: 1299.0, stock: 8,   sales: 512, emoji: "💻", description: "Razor-thin ultrabook with 12-core CPU, 32GB RAM and 1TB NVMe SSD." },
  { id: 3,  name: "Smart Watch Series X",        category: "electronics", price: 299.0,  stock: 41,  sales: 173, emoji: "⌚", description: "Advanced health monitoring smartwatch with ECG and SpO2." },
  { id: 4,  name: '4K Gaming Monitor 27"',       category: "electronics", price: 549.0,  stock: 15,  sales: 98,  emoji: "🖥️", description: "27\" IPS gaming monitor, 165Hz, 1ms response, HDR600." },
  { id: 5,  name: "Air Runner Elite Sneakers",   category: "fashion",     price: 129.99, stock: 57,  sales: 621, emoji: "👟", description: "Engineered mesh upper with carbon-fiber plate for explosive energy return." },
  { id: 6,  name: "Urban Minimal Backpack",      category: "fashion",     price: 89.0,   stock: 33,  sales: 203, emoji: "🎒", description: "Sleek 22L water-resistant backpack with hidden anti-theft pocket." },
  { id: 7,  name: "Luxe Leather Sunglasses",     category: "fashion",     price: 79.99,  stock: 20,  sales: 87,  emoji: "🕶️", description: "Handcrafted acetate frames with polarized UV400 lenses." },
  { id: 8,  name: "Merino Wool Hoodie",          category: "fashion",     price: 119.0,  stock: 45,  sales: 312, emoji: "🧥", description: "Ultra-soft 100% Merino wool hoodie, odor-resistant and machine washable." },
  { id: 9,  name: "Titanium Minimalist Watch",   category: "accessories", price: 249.0,  stock: 12,  sales: 154, emoji: "⌚", description: "Feather-light titanium case, sapphire glass, Swiss quartz movement." },
  { id: 10, name: "Genuine Leather Wallet",      category: "accessories", price: 59.99,  stock: 78,  sales: 432, emoji: "💼", description: "Full-grain vegetable-tanned leather bifold with RFID blocking." },
  { id: 11, name: "Smart Air Purifier Pro",      category: "home",        price: 199.0,  stock: 19,  sales: 267, emoji: "🌬️", description: "HEPA H13 filter, covers 600 sq ft, auto AQI adjustment, 25dB quiet." },
  { id: 12, name: "Ceramic Pour-Over Set",       category: "home",        price: 44.99,  stock: 62,  sales: 88,  emoji: "☕", description: "Hand-thrown ceramic dripper, carafe and bamboo tray. Dishwasher safe." },
  { id: 13, name: "Pro Yoga Mat 6mm",            category: "sports",      price: 69.99,  stock: 85,  sales: 398, emoji: "🧘", description: "Non-slip natural rubber yoga mat with alignment lines and microfiber top." },
  { id: 14, name: "Smart Jump Rope",             category: "sports",      price: 39.99,  stock: 50,  sales: 142, emoji: "🏋️", description: "Digital jump rope with LED counter, adjustable cable and ball bearing." },
];

// Revenue per period (mock)
const REVENUE_DATA = {
  "7d":  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],   values: [1200, 980, 1540, 870, 2100, 1760, 1330] },
  "30d": { labels: ["W1","W2","W3","W4"],                         values: [8400, 11200, 9700, 13500] },
  "90d": { labels: ["Jan","Feb","Mar"],                           values: [32000, 27500, 41000] },
  "1y":  { labels: ["Q1","Q2","Q3","Q4"],                         values: [88000, 104000, 97000, 130000] },
};

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════

let products = [...SELLER_PRODUCTS];
let searchQuery = "";
let currentPage = 1;
const PAGE_SIZE = 6;
let selectedPeriod = "30d";
let chartInstance = null;
let deleteMode = false;
let selectedForDelete = new Set();
let nextId = 100;

// ═══════════════════════════════════════════════
//  VIEWS
// ═══════════════════════════════════════════════

function showView(id) {
  document.querySelectorAll(".seller-view").forEach(v => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });
  const el = document.getElementById(id);
  if (el) { el.classList.remove("hidden"); el.classList.add("active"); }
  // sync nav
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("nav-active"));
  const navMap = { "view-dashboard": "nav-home-btn", "view-products": "nav-products-btn" };
  const navEl = document.getElementById(navMap[id]);
  if (navEl) navEl.classList.add("nav-active");
}

function showDashboard() { showView("view-dashboard"); }
function showProducts()  { showView("view-products"); }

// ═══════════════════════════════════════════════
//  DASHBOARD – STATS
// ═══════════════════════════════════════════════

function computeStats() {
  const totalProducts = products.length;
  const totalSales    = products.reduce((s, p) => s + p.sales, 0);
  const revenue       = products.reduce((s, p) => s + p.price * p.sales, 0);
  return { totalProducts, totalSales, revenue };
}

function renderStats() {
  const { totalProducts, totalSales, revenue } = computeStats();
  el("stat-total-products").textContent = totalProducts.toLocaleString();
  el("stat-total-sales").textContent    = totalSales.toLocaleString();
  el("stat-revenue").textContent        = "$" + revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ═══════════════════════════════════════════════
//  DASHBOARD – CHART
// ═══════════════════════════════════════════════

function renderChart(period) {
  selectedPeriod = period;

  // sync dropdown UI
  el("period-dropdown").value = period;

  const { labels, values } = REVENUE_DATA[period];

  const ctx = el("revenue-chart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue ($)",
        data: values,
        borderColor: "#7c3aed",
        backgroundColor: (ctx) => {
          const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
          grad.addColorStop(0, "rgba(124,58,237,0.35)");
          grad.addColorStop(1, "rgba(6,175,208,0.02)");
          return grad;
        },
        borderWidth: 2.5,
        pointBackgroundColor: "#7c3aed",
        pointBorderColor: "#e2dff5",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(28,26,60,0.95)",
          borderColor: "rgba(124,58,237,0.4)",
          borderWidth: 1,
          titleColor: "#a78bfa",
          bodyColor: "#e2dff5",
          padding: 12,
          callbacks: {
            label: ctx => " $" + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(46,43,85,0.5)" },
          ticks: { color: "#6b65a0", font: { family: "Inter", size: 11 } }
        },
        y: {
          grid: { color: "rgba(46,43,85,0.5)" },
          ticks: {
            color: "#6b65a0",
            font: { family: "Inter", size: 11 },
            callback: v => "$" + v.toLocaleString()
          },
          beginAtZero: true,
        }
      }
    }
  });
}

// ═══════════════════════════════════════════════
//  PRODUCTS – RENDER
// ═══════════════════════════════════════════════

function getFilteredProducts() {
  let list = [...products];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  return list;
}

function renderProducts() {
  const list     = getFilteredProducts();
  const pages    = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  currentPage    = Math.min(currentPage, pages);
  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageList = list.slice(start, start + PAGE_SIZE);

  const grid = el("product-grid");

  if (!pageList.length) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 animate-fade-in">
        <i class="fa-solid fa-box-open text-4xl mb-3 block" style="color:#4c1d95"></i>
        <p class="text-lg font-semibold" style="color:#e2dff5">No products found</p>
        <p class="text-sm mt-1" style="color:#6b65a0">Try a different search or add a new product.</p>
      </div>`;
    renderPagination(0, 1);
    return;
  }

  grid.innerHTML = pageList.map(p => `
    <article class="product-card glass rounded-2xl overflow-hidden flex flex-col relative cursor-pointer animate-slide-up"
      id="pcard-${p.id}"
      onclick="${deleteMode ? `toggleDeleteSelect(${p.id})` : `openProductDetail(${p.id})`}"
      role="button" tabindex="0"
      aria-label="${deleteMode ? "Select" : "Preview"} ${p.name}">

      ${deleteMode ? `
        <div class="delete-check absolute top-3 right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all"
          id="chk-${p.id}"
          style="border-color:${selectedForDelete.has(p.id) ? "#7c3aed" : "rgba(139,92,246,0.4)"}; background:${selectedForDelete.has(p.id) ? "linear-gradient(135deg,#6d28d9,#06afd0)" : "rgba(18,17,42,0.7)"}">
          ${selectedForDelete.has(p.id) ? '<i class="fa-solid fa-check text-white text-xs"></i>' : ''}
        </div>` : ""}

      <div class="relative h-36 flex items-center justify-center text-6xl select-none"
        style="background: linear-gradient(160deg,#1a1642 0%,#12103a 100%)">
        ${p.emoji}
        <span class="absolute bottom-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
          style="background:rgba(124,58,237,0.2);color:#a78bfa;border:1px solid rgba(124,58,237,0.3)">${p.category}</span>
      </div>

      <div class="p-4 flex flex-col gap-1.5 flex-1">
        <h3 class="font-bold text-sm leading-snug line-clamp-2" style="color:#e2dff5">${p.name}</h3>
        <div class="flex items-center justify-between mt-auto pt-2">
          <span class="text-base font-black grad-text">$${p.price.toFixed(2)}</span>
          <span class="text-xs font-medium" style="color:#52dff6">
            <i class="fa-solid fa-chart-simple mr-1"></i>${p.sales.toLocaleString()} sold
          </span>
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <i class="fa-solid fa-boxes-stacked text-xs" style="color:#6b65a0"></i>
          <span class="text-xs" style="color:${p.stock <= 10 ? "#f87171" : "#6b65a0"}">${p.stock} in stock</span>
        </div>
      </div>
    </article>
  `).join("");

  renderPagination(list.length, pages);
}

function renderPagination(total, pages) {
  const pg = el("pagination");
  if (pages <= 1) { pg.innerHTML = ""; return; }

  let html = `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}
    class="pag-btn w-9 h-9 rounded-xl flex items-center justify-center transition border"
    style="background:rgba(28,26,58,0.7);border-color:rgba(46,43,85,0.8);color:${currentPage===1?"#3d3a70":"#a78bfa"}">
    <i class="fa-solid fa-chevron-left text-xs"></i></button>`;

  for (let i = 1; i <= pages; i++) {
    html += `<button onclick="changePage(${i})"
      class="pag-btn w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition border"
      style="background:${i===currentPage ? "linear-gradient(135deg,#6d28d9,#06afd0)" : "rgba(28,26,58,0.7)"};
             border-color:${i===currentPage ? "transparent" : "rgba(46,43,85,0.8)"};
             color:${i===currentPage ? "#fff" : "#a78bfa"};
             box-shadow:${i===currentPage ? "0 0 16px rgba(124,58,237,0.4)" : "none"}">${i}</button>`;
  }

  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === pages ? "disabled" : ""}
    class="pag-btn w-9 h-9 rounded-xl flex items-center justify-center transition border"
    style="background:rgba(28,26,58,0.7);border-color:rgba(46,43,85,0.8);color:${currentPage===pages?"#3d3a70":"#a78bfa"}">
    <i class="fa-solid fa-chevron-right text-xs"></i></button>`;

  pg.innerHTML = html;
}

function changePage(p) {
  const pages = Math.ceil(getFilteredProducts().length / PAGE_SIZE);
  if (p < 1 || p > pages) return;
  currentPage = p;
  renderProducts();
}

// ═══════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════

function onSearch(val) {
  searchQuery = val.toLowerCase().trim();
  currentPage = 1;
  renderProducts();
}

// ═══════════════════════════════════════════════
//  ADD PRODUCT
// ═══════════════════════════════════════════════

function openAddModal() {
  el("add-product-form").reset();
  el("add-modal").classList.remove("hidden");
  el("add-modal").classList.add("flex");
}

function closeAddModal() {
  el("add-modal").classList.add("hidden");
  el("add-modal").classList.remove("flex");
}

function submitAddProduct(e) {
  e.preventDefault();
  const name     = el("ap-name").value.trim();
  const category = el("ap-category").value;
  const price    = parseFloat(el("ap-price").value);
  const stock    = parseInt(el("ap-stock").value, 10);
  const description = el("ap-description").value.trim();

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    showToast("Please fill in all required fields.", "triangle-exclamation", true);
    return;
  }

  const CATEGORY_EMOJIS = {
    electronics: "📦", fashion: "👕", accessories: "💎", home: "🏠", sports: "🏅"
  };

  const newProduct = {
    id: nextId++,
    name,
    category,
    price,
    stock,
    sales: 0,
    emoji: CATEGORY_EMOJIS[category] || "📦",
    description: description || "No description provided.",
  };

  products.unshift(newProduct);
  currentPage = 1;
  renderProducts();
  renderStats();
  closeAddModal();
  showToast(`"${name}" added successfully!`, "circle-check");
}

// ═══════════════════════════════════════════════
//  DELETE PRODUCT
// ═══════════════════════════════════════════════

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  selectedForDelete.clear();

  const btn = el("delete-mode-btn");
  if (deleteMode) {
    btn.innerHTML = `<i class="fa-solid fa-xmark mr-2"></i>Cancel`;
    btn.style.background = "linear-gradient(135deg,#7f1d1d,#dc2626)";
    el("confirm-delete-bar").classList.remove("hidden");
  } else {
    btn.innerHTML = `<i class="fa-solid fa-trash-can mr-2"></i>Delete Products`;
    btn.style.background = "linear-gradient(135deg,#3b1c6e,#5b21b6)";
    el("confirm-delete-bar").classList.add("hidden");
  }
  renderProducts();
}

function toggleDeleteSelect(id) {
  if (selectedForDelete.has(id)) {
    selectedForDelete.delete(id);
  } else {
    selectedForDelete.add(id);
  }
  el("delete-count").textContent = selectedForDelete.size;
  renderProducts();
}

function confirmDelete() {
  if (!selectedForDelete.size) {
    showToast("No products selected.", "triangle-exclamation", true);
    return;
  }
  const count = selectedForDelete.size;
  products = products.filter(p => !selectedForDelete.has(p.id));
  selectedForDelete.clear();
  deleteMode = false;
  const btn = el("delete-mode-btn");
  btn.innerHTML = `<i class="fa-solid fa-trash-can mr-2"></i>Delete Products`;
  btn.style.background = "linear-gradient(135deg,#3b1c6e,#5b21b6)";
  el("confirm-delete-bar").classList.add("hidden");
  currentPage = 1;
  renderProducts();
  renderStats();
  showToast(`${count} product${count > 1 ? "s" : ""} deleted.`, "trash-can");
}

// ═══════════════════════════════════════════════
//  PRODUCT DETAIL POPUP
// ═══════════════════════════════════════════════

function openProductDetail(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  el("popup-emoji").textContent       = p.emoji;
  el("popup-name").textContent        = p.name;
  el("popup-category").textContent    = p.category.toUpperCase();
  el("popup-price").textContent       = "$" + p.price.toFixed(2);
  el("popup-stock").textContent       = p.stock + " in stock";
  el("popup-stock").style.color       = p.stock <= 10 ? "#f87171" : "#4ade80";
  el("popup-sales").textContent       = p.sales.toLocaleString() + " sold";
  el("popup-description").textContent = p.description;

  el("product-popup").classList.remove("hidden");
  el("product-popup").classList.add("flex");
}

function closeProductDetail() {
  el("product-popup").classList.add("hidden");
  el("product-popup").classList.remove("flex");
}

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════

let toastTimer;
function showToast(msg, icon = "circle-check", isError = false) {
  const t = el("toast");
  el("toast-msg").textContent = msg;
  el("toast-icon").className  = `fa-solid fa-${icon} ${isError ? "text-red-400" : "text-green-400"}`;
  t.style.opacity   = "1";
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity   = "0";
    t.style.transform = "translateX(-50%) translateY(8px)";
  }, 3000);
}

// ═══════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════

function el(id) { return document.getElementById(id); }

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  showView("view-dashboard");
  renderStats();
  renderChart("30d");
  renderProducts();

  // Period dropdown
  el("period-dropdown").addEventListener("change", e => renderChart(e.target.value));

  // Search
  let searchTimer;
  el("search-input").addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => onSearch(e.target.value), 280);
  });

  // Add product form
  el("add-product-form").addEventListener("submit", submitAddProduct);

  // Close popup on overlay click
  el("product-popup").addEventListener("click", e => {
    if (e.target === el("product-popup")) closeProductDetail();
  });
  el("add-modal").addEventListener("click", e => {
    if (e.target === el("add-modal")) closeAddModal();
  });
});
