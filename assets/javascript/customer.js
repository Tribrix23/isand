/**
 * customer.js – iSand Store Customer Page Logic
 * Handles: product catalog, filtering/sorting, product detail view,
 *          cart management, coupons, reviews, and checkout.
 */

// ═══════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════

const COUPONS = {
  SAVE10:  { type: 'percent', value: 10, label: '10% off' },
  SAVE20:  { type: 'percent', value: 20, label: '20% off' },
  FREE50:  { type: 'flat',    value: 50, label: '$50 off' },
  ISAND5:  { type: 'flat',    value: 5,  label: '$5 off'  },
};

// Product emoji avatars (no external image dependency)
const PRODUCT_EMOJIS = {
  electronics:  ['🎧','📱','💻','🖥️','⌚','🎮','📷','🔊'],
  fashion:      ['👟','👜','🧥','👗','🕶️','🧢','👠','💍'],
  accessories:  ['⌚','💎','👒','🧣','💼','🎒','🕶️','📿'],
  home:         ['🛋️','🪴','🕯️','🍳','☕','🛁','🖼️','🧺'],
  sports:       ['⚽','🏋️','🎾','🧘','🚴','🏊','⛷️','🥊'],
};

const PRODUCTS = [
  // Electronics
  { id:1,  name:'Pro Wireless Headphones', store:'SoundWave Studio', category:'electronics', price:149.99, originalPrice:199.99, rating:4.7, reviews:284, stock:23, emoji:'🎧',
    description:'Premium over-ear wireless headphones with 40-hour battery life, active noise cancellation, and Hi-Res audio certification. Featuring memory foam ear cushions and foldable design for portability. Connect to 2 devices simultaneously via Bluetooth 5.3.', tags:['wireless','audio','noise-cancelling'] },
  { id:2,  name:'UltraBook Pro 14"', store:'TechPeak Electronics', category:'electronics', price:1299.00, originalPrice:1499.00, rating:4.9, reviews:512, stock:8, emoji:'💻',
    description:'Razor-thin ultrabook powered by the latest 12-core processor with 32GB RAM and 1TB NVMe SSD. The 14" OLED display delivers stunning 2.8K resolution at 120Hz refresh rate. All-day battery with 80W fast charging.', tags:['laptop','ultrabook','oled'] },
  { id:3,  name:'Smart Watch Series X', store:'WristTech', category:'electronics', price:299.00, originalPrice:349.00, rating:4.5, reviews:173, stock:41, emoji:'⌚',
    description:'Advanced health monitoring smartwatch with ECG, SpO2, and continuous glucose monitoring. Bright AMOLED display, 7-day battery, 50m water resistance. Works with iOS and Android.', tags:['smartwatch','health','fitness'] },
  { id:4,  name:'4K Gaming Monitor 27"', store:'ViewPro Displays', category:'electronics', price:549.00, originalPrice:699.00, rating:4.6, reviews:98, stock:15, emoji:'🖥️',
    description:'27" IPS gaming monitor with 4K UHD resolution, 165Hz refresh rate, 1ms response time, and HDR600 support. G-Sync compatible with rich 99% DCI-P3 color coverage for stunning visuals.', tags:['monitor','gaming','4k'] },
  // Fashion
  { id:5,  name:'Air Runner Elite Sneakers', store:'StrideUp Sports', category:'fashion', price:129.99, originalPrice:170.00, rating:4.8, reviews:621, stock:57, emoji:'👟',
    description:'Engineered mesh upper with adaptive fit system. Carbon-fiber plate for explosive energy return. Ideal for road running and gym workouts. Available in 12 colorways.', tags:['sneakers','running','sport'] },
  { id:6,  name:'Urban Minimal Backpack', store:'CarryAll Co.', category:'fashion', price:89.00, originalPrice:110.00, rating:4.4, reviews:203, stock:33, emoji:'🎒',
    description:'Sleek 22L capacity backpack crafted from water-resistant recycled polyester. Hidden anti-theft pocket, padded 16" laptop sleeve, and USB-A pass-through port. Carry everything in style.', tags:['backpack','travel','minimal'] },
  { id:7,  name:'Luxe Leather Sunglasses', store:'VisionMood', category:'fashion', price:79.99, originalPrice:100.00, rating:4.3, reviews:87, stock:20, emoji:'🕶️',
    description:'Handcrafted acetate frames with polarized UV400 lenses. Spring-loaded hinges and custom carry case included. Timeless design that elevates any outfit.', tags:['sunglasses','fashion','uv'] },
  { id:8,  name:'Merino Wool Hoodie', store:'NordicThread', category:'fashion', price:119.00, originalPrice:149.00, rating:4.7, reviews:312, stock:45, emoji:'🧥',
    description:'Ultra-soft 100% Merino wool hoodie that regulates temperature naturally. Odor-resistant, machine washable, and sustainably sourced. Perfect for year-round wear.', tags:['hoodie','wool','sustainable'] },
  // Accessories
  { id:9,  name:'Titanium Minimalist Watch', store:'ChronoEdge', category:'accessories', price:249.00, originalPrice:320.00, rating:4.9, reviews:154, stock:12, emoji:'⌚',
    description:'Feather-light titanium case with sapphire crystal glass and Swiss quartz movement. Water-resistant to 100m with interchangeable Milanese loop and rubber strap.', tags:['watch','titanium','minimalist'] },
  { id:10, name:'Genuine Leather Wallet', store:'Heritage Goods', category:'accessories', price:59.99, originalPrice:80.00, rating:4.6, reviews:432, stock:78, emoji:'💼',
    description:'Full-grain vegetable-tanned leather bifold wallet. RFID-blocking technology, 8 card slots, 2 bill compartments. Gets better with age and develops a unique patina.', tags:['wallet','leather','rfid'] },
  // Home
  { id:11, name:'Smart Air Purifier Pro', store:'PureBreeze', category:'home', price:199.00, originalPrice:249.00, rating:4.8, reviews:267, stock:19, emoji:'🌬️',
    description:'HEPA H13 filter removes 99.97% of particles down to 0.3 microns. Covers 600 sq ft in 30 minutes. Auto mode adjusts fan speed based on real-time AQI. Ultra-quiet at 25dB.', tags:['air purifier','smart','hepa'] },
  { id:12, name:'Ceramic Pour-Over Set', store:'BrewCraft', category:'home', price:44.99, originalPrice:60.00, rating:4.5, reviews:88, stock:62, emoji:'☕',
    description:'Hand-thrown ceramic dripper with matching carafe and bamboo serving tray. The gooseneck pour delivers precise control for cafe-quality coffee at home. Dishwasher safe.', tags:['coffee','ceramic','pour-over'] },
  // Sports
  { id:13, name:'Pro Yoga Mat 6mm', store:'ZenFlow Studio', category:'sports', price:69.99, originalPrice:90.00, rating:4.7, reviews:398, stock:85, emoji:'🧘',
    description:'Non-slip natural rubber yoga mat with alignment lines and microfiber top layer. 6mm cushioning protects joints. Comes with carry strap and includes 30-day guided class access.', tags:['yoga','fitness','non-slip'] },
  { id:14, name:'Smart Jump Rope', store:'FitPulse', category:'sports', price:39.99, originalPrice:55.00, rating:4.4, reviews:142, stock:50, emoji:'🏋️',
    description:'Digital jump rope tracks jumps, calories, and workout duration on built-in LED display. Adjustable cable length, 360° ball bearing system, and memory foam handles.', tags:['fitness','cardio','smart'] },
];

const REVIEWS_DB = {
  1: [
    { name:'Alex M.', rating:5, date:'May 2026', text:'Absolutely love these headphones! The noise cancellation is incredible.' },
    { name:'Sarah K.', rating:4, date:'Apr 2026', text:'Great sound quality. Build feels premium but slightly heavy for long sessions.' },
    { name:'James T.', rating:5, date:'Mar 2026', text:'Best headphones I\'ve ever owned. 40h battery is not a lie!' },
  ],
  2: [{ name:'Priya R.', rating:5, date:'May 2026', text:'Blazing fast, gorgeous display. Worth every penny!' }],
  5: [
    { name:'Mike O.', rating:5, date:'May 2026', text:'Ran a half-marathon in these. Zero blisters, insane energy return.' },
    { name:'Lena B.', rating:4, date:'Apr 2026', text:'Super comfortable. Love the colorways available!' },
  ],
};

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════

let cart = [];
let currentFilter   = 'all';
let currentSort     = 'default';
let currentSearch   = '';
let currentProduct  = null;
let detailQty       = 1;
let reviewStarValue = 5;
let appliedCoupon   = null;
let mobileCartOpen  = false;

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryList();
  renderProducts();
  updateCartUI();

  // Search with debounce
  const searchInput = document.getElementById('search-input');
  let searchTimer;
  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderProducts();
    }, 300);
  });

  // Cart icon button in header
  document.getElementById('cart-icon-btn').addEventListener('click', toggleMobileCart);
});

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.classList.add('hidden');
  });
  const target = document.getElementById(viewId);
  target.classList.remove('hidden');
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  showView('view-landing');
  currentProduct = null;
}

function setActiveNav(el) {
  document.querySelectorAll('.nav-link').forEach(n => {
    n.classList.remove('nav-active', 'text-white');
    n.classList.add('text-slate-500');
  });
  el.classList.add('nav-active', 'text-white');
  el.classList.remove('text-slate-500');
}

function showRecommendations() {
  currentFilter = 'recommended';
  renderProducts();
}

// ═══════════════════════════════════════════════
//  CATEGORY LIST (sidebar)
// ═══════════════════════════════════════════════

function renderCategoryList() {
  const categories = ['electronics','fashion','accessories','home','sports'];
  const icons      = { electronics:'microchip', fashion:'shirt', accessories:'gem', home:'house-chimney', sports:'dumbbell' };
  const container  = document.getElementById('category-list');
  container.innerHTML = categories.map(cat => `
    <button onclick="filterFromSidebar('${cat}', this)"
      class="sidebar-cat flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-card transition w-full text-left">
      <i class="fa-solid fa-${icons[cat]} w-4 text-brand-500"></i>
      <span class="capitalize">${cat}</span>
    </button>
  `).join('');
}

function filterFromSidebar(cat, el) {
  document.querySelectorAll('.sidebar-cat').forEach(b => {
    b.classList.remove('text-white','bg-card');
    b.classList.add('text-slate-400');
  });
  el.classList.add('text-white','bg-card');
  el.classList.remove('text-slate-400');
  currentFilter = cat;
  renderProducts();
  // Also sync filter pills
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
}

// ═══════════════════════════════════════════════
//  PRODUCT RENDERING
// ═══════════════════════════════════════════════

function getFilteredProducts() {
  let list = [...PRODUCTS];

  if (currentFilter === 'recommended') {
    list = list.filter(p => p.rating >= 4.7).sort((a,b) => b.rating - a.rating);
  } else if (currentFilter !== 'all') {
    list = list.filter(p => p.category === currentFilter);
  }

  if (currentSearch) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.store.toLowerCase().includes(currentSearch) ||
      p.category.toLowerCase().includes(currentSearch) ||
      (p.tags && p.tags.some(t => t.includes(currentSearch)))
    );
  }

  switch (currentSort) {
    case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
    case 'newest':     list.sort((a,b) => b.id - a.id); break;
  }
  return list;
}

function renderProducts() {
  const grid    = document.getElementById('product-grid');
  const filtered = getFilteredProducts();

  document.getElementById('product-count').innerHTML =
    `<span class="text-white font-semibold">${filtered.length}</span> products found`;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-slate-500 animate-fade-in">
        <i class="fa-solid fa-magnifying-glass text-4xl mb-3 block text-slate-600"></i>
        <p class="text-lg font-semibold text-white">No products found</p>
        <p class="text-sm mt-1">Try adjusting your search or filters</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, idx) => {
    const discountPct = Math.round((1 - p.price / p.originalPrice) * 100);
    const stars       = renderStarsHTML(p.rating);
    const cartItem    = cart.find(c => c.id === p.id);
    const inCart      = cartItem ? cartItem.qty : 0;

    return `
      <article class="product-card glass rounded-2xl overflow-hidden flex flex-col animate-slide-up"
        style="animation-delay:${idx * 60}ms"
        onclick="openProduct(${p.id})"
        id="product-card-${p.id}"
        role="button"
        tabindex="0"
        aria-label="View ${p.name}"
        onkeydown="if(event.key==='Enter') openProduct(${p.id})">

        <!-- Product image area -->
        <div class="relative h-44 flex items-center justify-center text-7xl select-none rounded-t-2xl"
          style="background: linear-gradient(160deg,#1a1642 0%,#12103a 100%)">
          ${p.emoji}
          <span class="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full" style="background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.2)">
            -${discountPct}%
          </span>
          ${inCart > 0 ? `<span class="absolute top-3 right-3 btn-gradient text-white text-[11px] font-bold px-2.5 py-1 rounded-full">${inCart} in cart</span>` : ''}
        </div>

        <!-- Card body -->
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[11px] text-accent-400 font-semibold uppercase tracking-wide">${p.category}</p>
              <h3 class="font-bold text-brand-100 text-sm leading-snug line-clamp-2">${p.name}</h3>
            </div>
          </div>

          <p class="text-xs text-brand-300 flex items-center gap-1"><i class="fa-solid fa-store text-[10px] text-accent-500"></i> ${p.store}</p>

          <div class="flex items-center gap-1.5 mt-0.5">
            <div class="flex gap-0.5 text-xs">${stars}</div>
            <span class="text-xs text-brand-300">${p.rating} <span class="text-brand-400">(${p.reviews.toLocaleString()})</span></span>
          </div>

          <div class="flex items-baseline gap-2 mt-auto pt-2">
            <span class="text-lg font-black grad-text">$${p.price.toFixed(2)}</span>
            <span class="text-xs text-brand-400 line-through">$${p.originalPrice.toFixed(2)}</span>
          </div>

          <!-- Add to Cart button -->
          <button
            id="atc-${p.id}"
            class="mt-1 w-full btn-gradient text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
            onclick="event.stopPropagation(); quickAddToCart(${p.id})"
            aria-label="Add ${p.name} to cart">
            <i class="fa-solid fa-cart-plus text-sm"></i> Add to Cart
          </button>
        </div>
      </article>`;
  }).join('');
}

function renderStarsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += `<i class="fa-solid fa-star text-yellow-400"></i>`;
    } else if (i - rating < 1) {
      html += `<i class="fa-solid fa-star-half-stroke text-yellow-400"></i>`;
    } else {
      html += `<i class="fa-regular fa-star text-slate-600"></i>`;
    }
  }
  return html;
}

// ═══════════════════════════════════════════════
//  FILTER & SORT
// ═══════════════════════════════════════════════

function filterProducts(cat, el) {
  currentFilter = cat;
  // sync pills
  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.remove('active','text-white');
    p.classList.add('text-slate-400');
  });
  el.classList.add('active');
  el.classList.remove('text-slate-400');
  // deselect sidebar
  document.querySelectorAll('.sidebar-cat').forEach(b => {
    b.classList.remove('text-white','bg-card');
    b.classList.add('text-slate-400');
  });
  renderProducts();
}

function sortProducts(val) {
  currentSort = val;
  renderProducts();
}

// ═══════════════════════════════════════════════
//  PRODUCT DETAIL
// ═══════════════════════════════════════════════

function openProduct(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  currentProduct = product;
  detailQty = 1;

  // Fill details
  const discountPct = Math.round((1 - product.price / product.originalPrice) * 100);
  document.getElementById('detail-name').textContent           = product.name;
  document.getElementById('detail-store').querySelector('span').textContent = product.store;
  document.getElementById('detail-category-badge').textContent = product.category.toUpperCase();
  document.getElementById('detail-price').textContent          = `$${product.price.toFixed(2)}`;
  document.getElementById('detail-original-price').textContent = `$${product.originalPrice.toFixed(2)}`;
  document.getElementById('detail-discount-badge').textContent = `-${discountPct}% OFF`;
  document.getElementById('detail-description').textContent    = product.description;
  document.getElementById('detail-qty').textContent            = detailQty;

  // Emoji image substitute
  const emojiContainer = document.getElementById('detail-image');
  emojiContainer.style.display = 'none';
  const emojiEl = document.getElementById('detail-image');
  // Replace with emoji display
  emojiEl.parentElement.innerHTML = `
    <div class="w-full h-full flex items-center justify-center text-9xl select-none bg-gradient-to-br from-brand-900/60 to-card">
      ${product.emoji}
    </div>`;
  document.getElementById('detail-thumb-img') && (document.getElementById('detail-thumb-img').style.display='none');
  const thumbEl = document.getElementById('detail-img-thumb');
  if(thumbEl) thumbEl.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${product.emoji}</div>`;

  // Stock
  const stockEl = document.getElementById('detail-stock');
  if (product.stock <= 5) {
    stockEl.innerHTML = `<span class="text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Only ${product.stock} left!</span>`;
  } else {
    stockEl.innerHTML = `<span class="text-green-400"><i class="fa-solid fa-circle-check mr-1"></i> In Stock (${product.stock} available)</span>`;
  }

  // Stars
  document.getElementById('detail-stars').innerHTML        = renderStarsHTML(product.rating);
  document.getElementById('detail-rating-text').textContent = product.rating.toFixed(1);
  document.getElementById('detail-review-count').textContent = `(${product.reviews.toLocaleString()} reviews)`;

  // Breadcrumb
  document.getElementById('detail-breadcrumb').innerHTML =
    `Store / <span class="text-white">${product.name}</span>`;

  // Reviews
  renderReviews(product.id);

  // Reset review form
  document.getElementById('review-form-panel').classList.add('hidden');
  reviewStarValue = 5;
  document.getElementById('review-text').value = '';
  document.getElementById('review-name').value = '';

  // Update detail cart
  updateDetailCart();

  showView('view-detail');
}

function changeDetailQty(delta) {
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById('detail-qty').textContent = detailQty;
}

function addCurrentToCart() {
  if (!currentProduct) return;
  for (let i = 0; i < detailQty; i++) addToCart(currentProduct.id);
  showToast(`${detailQty}× ${currentProduct.name} added to cart`, 'cart-shopping');
}

// ═══════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════

function renderReviews(productId) {
  const list      = document.getElementById('reviews-list');
  const badge     = document.getElementById('review-total-badge');
  const reviews   = REVIEWS_DB[productId] || [];

  badge.textContent = reviews.length;

  if (!reviews.length) {
    list.innerHTML = `<p class="text-slate-500 text-sm py-4 text-center">No reviews yet. Be the first!</p>`;
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="rounded-xl p-4 border border-border animate-fade-in" style="background:rgba(18,17,42,0.7)">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-white text-xs font-bold">
            ${r.name[0]}
          </div>
          <div>
            <p class="text-sm font-semibold text-brand-100">${r.name}</p>
            <p class="text-xs text-brand-400">${r.date}</p>
          </div>
        </div>
        <div class="flex gap-0.5 text-xs">${renderStarsHTML(r.rating)}</div>
      </div>
      <p class="text-sm text-brand-200 leading-relaxed">${r.text}</p>
    </div>
  `).join('');
}

function toggleReviewForm() {
  const panel = document.getElementById('review-form-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function setReviewStar(val) {
  reviewStarValue = val;
  document.querySelectorAll('.review-star').forEach((s, i) => {
    s.style.color = i < val ? '#fbbf24' : '#4b5563';
  });
}

function submitReview() {
  const name = document.getElementById('review-name').value.trim() || 'Anonymous';
  const text = document.getElementById('review-text').value.trim();
  if (!text) { showToast('Please write a review first', 'triangle-exclamation', true); return; }
  if (!currentProduct) return;

  if (!REVIEWS_DB[currentProduct.id]) REVIEWS_DB[currentProduct.id] = [];
  REVIEWS_DB[currentProduct.id].unshift({
    name, rating: reviewStarValue, date: 'Just now', text
  });
  renderReviews(currentProduct.id);
  toggleReviewForm();
  showToast('Review submitted! Thank you 🙏');
}

// ═══════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════

function quickAddToCart(id) {
  addToCart(id);
  const product = PRODUCTS.find(p => p.id === id);
  showToast(`${product.name} added to cart`);
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const item = cart.find(c => c.id === id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id, qty: 1, product });
  }
  updateCartUI();
  animateBadge();
  renderProducts(); // refresh "in cart" badges on cards
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  appliedCoupon = null;
  updateCartUI();
  renderProducts();
  updateDetailCart();
}

function changeCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartUI();
  renderProducts();
  updateDetailCart();
}

function clearCart() {
  cart = [];
  appliedCoupon = null;
  updateCartUI();
  updateDetailCart();
  renderProducts();
}

function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping  = subtotal > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
  let discount    = 0;
  if (appliedCoupon) {
    const c = COUPONS[appliedCoupon];
    discount = c.type === 'percent' ? subtotal * c.value / 100 : Math.min(c.value, subtotal);
  }
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, shipping, discount, total };
}

function renderCartItems(listEl, emptyEl) {
  if (!listEl) return;
  const existing = listEl.querySelectorAll('.cart-item');
  existing.forEach(e => e.remove());

  if (!cart.length) {
    if (emptyEl) emptyEl.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item flex items-center gap-3 rounded-xl p-2.5 border border-border animate-fade-in';
    el.style.background = 'rgba(18,17,42,0.7)';
    el.innerHTML = `
      <div class="text-2xl w-9 h-9 flex items-center justify-center rounded-lg shrink-0" style="background:rgba(109,40,217,0.2)">${item.product.emoji}</div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-brand-100 truncate">${item.product.name}</p>
        <p class="text-xs text-brand-400">$${item.product.price.toFixed(2)}</p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button class="qty-btn w-6 h-6 rounded-lg flex items-center justify-center text-brand-300 transition text-xs" style="background:rgba(109,40,217,0.25)"
          onclick="changeCartQty(${item.id}, -1)"><i class="fa-solid fa-minus" style="font-size:9px"></i></button>
        <span class="text-xs font-bold text-white w-4 text-center">${item.qty}</span>
        <button class="qty-btn w-6 h-6 rounded-lg flex items-center justify-center text-brand-300 transition text-xs" style="background:rgba(109,40,217,0.25)"
          onclick="changeCartQty(${item.id}, 1)"><i class="fa-solid fa-plus" style="font-size:9px"></i></button>
        <button class="ml-1 text-brand-400 hover:text-red-400 transition" onclick="removeFromCart(${item.id})">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>`;
    listEl.appendChild(el);
  });
}

function updateCartUI() {
  const { subtotal, shipping, discount, total } = getCartTotals();
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const deliveryText = cart.length ? (shipping === 0 ? 'Free (Est. 2–4 days)' : 'Est. 3–5 days') : '—';

  // ── Landing cart ──
  renderCartItems(document.getElementById('cart-items'), document.getElementById('cart-empty'));
  setTextContent('subtotal',       `$${subtotal.toFixed(2)}`);
  setTextContent('discount-amount',`-$${discount.toFixed(2)}`);
  setTextContent('shipping-cost',  shipping === 0 && cart.length ? 'FREE' : `$${shipping.toFixed(2)}`);
  setTextContent('total-price',    `$${total.toFixed(2)}`);
  setTextContent('delivery-estimate', deliveryText);

  // ── Detail cart ──
  updateDetailCart();

  // ── Mobile cart ──
  renderCartItems(document.getElementById('mobile-cart-items'), document.getElementById('mobile-cart-empty'));
  setTextContent('m-subtotal',       `$${subtotal.toFixed(2)}`);
  setTextContent('m-discount-amount',`-$${discount.toFixed(2)}`);
  setTextContent('m-shipping-cost',  shipping === 0 && cart.length ? 'FREE' : `$${shipping.toFixed(2)}`);
  setTextContent('m-total-price',    `$${total.toFixed(2)}`);
  setTextContent('m-delivery-estimate', deliveryText);

  // Badges
  const badge    = document.getElementById('cart-badge');
  const fabBadge = document.getElementById('fab-badge');
  const detailBadge = document.getElementById('detail-cart-badge');
  [badge, fabBadge, detailBadge].forEach(b => {
    if (!b) return;
    b.textContent = totalItems;
    b.classList.toggle('hidden', totalItems === 0);
  });
}

function updateDetailCart() {
  const { subtotal, shipping, discount, total } = getCartTotals();
  const deliveryText = cart.length ? (shipping === 0 ? 'Free (Est. 2–4 days)' : 'Est. 3–5 days') : '—';

  renderCartItems(document.getElementById('d-cart-items'), document.getElementById('d-cart-empty'));
  setTextContent('d-subtotal',       `$${subtotal.toFixed(2)}`);
  setTextContent('d-discount-amount',`-$${discount.toFixed(2)}`);
  setTextContent('d-shipping-cost',  shipping === 0 && cart.length ? 'FREE' : `$${shipping.toFixed(2)}`);
  setTextContent('d-total-price',    `$${total.toFixed(2)}`);
  setTextContent('d-delivery-estimate', deliveryText);
}

function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function animateBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.classList.remove('badge-pulse');
  void badge.offsetWidth;
  badge.classList.add('badge-pulse');
}

// ═══════════════════════════════════════════════
//  COUPON
// ═══════════════════════════════════════════════

function applyCouponCode(code) {
  const upper = code.trim().toUpperCase();
  const status = document.getElementById('coupon-status');
  if (COUPONS[upper]) {
    appliedCoupon = upper;
    updateCartUI();
    showToast(`Coupon applied: ${COUPONS[upper].label} 🎉`);
    if (status) {
      status.textContent = `✓ ${COUPONS[upper].label} applied`;
      status.classList.remove('hidden','text-red-400');
      status.classList.add('text-green-400');
    }
  } else {
    showToast('Invalid coupon code', 'triangle-exclamation', true);
    if (status) {
      status.textContent = '✗ Invalid coupon code';
      status.classList.remove('hidden','text-green-400');
      status.classList.add('text-red-400');
    }
  }
}

function applyCoupon()       { applyCouponCode(document.getElementById('coupon-input').value); }
function applyMobileCoupon() { applyCouponCode(document.getElementById('m-coupon-input').value); }
function applyDetailCoupon() { applyCouponCode(document.getElementById('d-coupon-input').value); }

// ═══════════════════════════════════════════════
//  MOBILE CART DRAWER
// ═══════════════════════════════════════════════

function toggleMobileCart() {
  mobileCartOpen = !mobileCartOpen;
  const drawer  = document.getElementById('mobile-cart-drawer');
  const overlay = document.getElementById('mobile-cart-overlay');

  if (mobileCartOpen) {
    overlay.classList.remove('hidden');
    drawer.classList.remove('translate-y-full');
    updateCartUI();
  } else {
    overlay.classList.add('hidden');
    drawer.classList.add('translate-y-full');
  }
}

// ═══════════════════════════════════════════════
//  CHECKOUT
// ═══════════════════════════════════════════════

function checkout() {
  if (!cart.length) {
    showToast('Your cart is empty!', 'triangle-exclamation', true);
    return;
  }
  if (mobileCartOpen) toggleMobileCart();
  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
  clearCart();
  if (currentProduct) goBack();
}

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════

let toastTimer;
function showToast(msg, icon = 'circle-check', isError = false) {
  const toast   = document.getElementById('toast');
  const toastMsg  = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  toastMsg.textContent = msg;
  toastIcon.className  = `fa-solid fa-${icon} ${isError ? 'text-red-400' : 'text-green-400'}`;

  toast.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2800);
}
