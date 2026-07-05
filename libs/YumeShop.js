const STATE_KEY = "YUME_SHOP_STATE";
const MAX_ORDERS = 100;

function createState() {
  return {
    products: [],
    usedCodes: {},
    orders: []
  };
}

function normalizeState(state) {
  const normalized = state && typeof state === "object" ? state : createState();
  if (!Array.isArray(normalized.products)) normalized.products = [];
  if (!normalized.usedCodes || typeof normalized.usedCodes !== "object") normalized.usedCodes = {};
  if (!Array.isArray(normalized.orders)) normalized.orders = [];

  normalized.products.forEach((product) => {
    if (!Array.isArray(product.stock)) product.stock = [];
    if (!Number.isFinite(Number(product.price))) product.price = 0;
    product.price = Number(product.price);
    product.sold = Number(product.sold) || 0;
    if (product.active !== false) product.active = true;
  });

  return normalized;
}

function slugify(title) {
  return String(title || "")
    .trim()
    .replace(/月/g, "-yue-")
    .replace(/年/g, "-nian-")
    .replace(/周/g, "-zhou-")
    .replace(/日/g, "-ri-")
    .replace(/卡/g, "-ka-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
}

function makeUniqueProductId(state, title) {
  const base = slugify(title);
  let id = base;
  let index = 2;
  while (state.products.some((product) => product.id === id && product.title !== title)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function findProduct(state, titleOrId) {
  const key = String(titleOrId || "").trim();
  return state.products.find((product) => product.title === key || product.id === key);
}

function cleanCodes(codes) {
  return (codes || [])
    .map((code) => String(code || "").trim())
    .filter(Boolean);
}

function importCards(state, title, price, codes, now) {
  state = normalizeState(state);
  title = String(title || "").trim();
  price = Number(price);
  now = now || Date.now();

  if (!title || !Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "bad_input", added: 0, skipped: 0, stock: 0 };
  }

  let product = findProduct(state, title);
  if (!product) {
    product = {
      id: makeUniqueProductId(state, title),
      title,
      price,
      stock: [],
      sold: 0,
      active: true,
      created_at: now,
      updated_at: now
    };
    state.products.push(product);
  }

  product.price = price;
  product.updated_at = now;

  let added = 0;
  let skipped = 0;
  const seenInBatch = {};

  cleanCodes(codes).forEach((code) => {
    if (state.usedCodes[code] || seenInBatch[code]) {
      skipped += 1;
      return;
    }
    seenInBatch[code] = true;
    state.usedCodes[code] = true;
    product.stock.push({ code, created_at: now });
    added += 1;
  });

  return { ok: true, product, added, skipped, stock: product.stock.length };
}

function visibleProducts(state) {
  state = normalizeState(state);
  return state.products.filter((product) => product.active !== false && product.stock.length > 0);
}

function buyProduct(state, productId, buyer, balance, now) {
  state = normalizeState(state);
  now = now || Date.now();
  const product = findProduct(state, productId);

  if (!product) return { ok: false, error: "not_found" };
  if (product.active === false) return { ok: false, error: "inactive" };
  if (product.stock.length === 0) return { ok: false, error: "sold_out" };
  if (Number(balance) < product.price) return { ok: false, error: "insufficient_balance" };

  const card = product.stock.shift();
  product.sold = (Number(product.sold) || 0) + 1;
  product.updated_at = now;

  const order = {
    id: `${now}:${buyer.telegramid}:${product.id}:${product.sold}`,
    user_id: buyer.telegramid,
    user_name: buyer.first_name || buyer.username || "用户",
    product_id: product.id,
    product_title: product.title,
    price: product.price,
    code: card.code,
    created_at: now
  };

  state.orders.unshift(order);
  if (state.orders.length > MAX_ORDERS) state.orders = state.orders.slice(0, MAX_ORDERS);

  return {
    ok: true,
    product,
    card: { code: card.code, title: product.title, created_at: now },
    order,
    newBalance: Number(balance) - product.price
  };
}

function offProduct(state, titleOrId) {
  state = normalizeState(state);
  const product = findProduct(state, titleOrId);
  if (!product) return { ok: false, error: "not_found" };
  product.active = false;
  product.updated_at = Date.now();
  return { ok: true, product };
}

function onProduct(state, titleOrId) {
  state = normalizeState(state);
  const product = findProduct(state, titleOrId);
  if (!product) return { ok: false, error: "not_found" };
  product.active = true;
  product.updated_at = Date.now();
  return { ok: true, product };
}

function formatStock(state) {
  state = normalizeState(state);
  if (state.products.length === 0) return "还没有商品库存，喵~";

  return state.products.map((product, index) => {
    const status = product.active === false ? "下架" : "上架";
    return `${index + 1}. ${product.title}\n价格：${product.price} 积分\n库存：${product.stock.length}\n已卖：${product.sold}\n状态：${status}`;
  }).join("\n\n");
}

function formatOrders(state, limit) {
  state = normalizeState(state);
  limit = limit || 20;
  const orders = state.orders.slice(0, limit);
  if (orders.length === 0) return "还没有兑换订单，喵~";

  return orders.map((order, index) => {
    const time = new Date(order.created_at).toLocaleString("zh-CN", { hour12: false });
    return `${index + 1}. ${order.user_name} (${order.user_id})\n商品：${order.product_title}\n积分：${order.price}\n卡密：${order.code}\n时间：${time}`;
  }).join("\n\n");
}

function loadState() {
  if (typeof Bot === "undefined") return createState();
  return normalizeState(Bot.getProperty(STATE_KEY, createState()));
}

function saveState(state) {
  state = normalizeState(state);
  if (typeof Bot !== "undefined") Bot.setProperty(STATE_KEY, state, "json");
  return state;
}

const api = {
  createState,
  loadState,
  saveState,
  importCards,
  visibleProducts,
  buyProduct,
  offProduct,
  onProduct,
  formatStock,
  formatOrders,
  slugify,
  findProduct,
  _test: {
    createState,
    importCards,
    visibleProducts,
    buyProduct,
    offProduct,
    onProduct,
    formatStock,
    formatOrders,
    slugify
  }
};

if (typeof publish === "function") publish(api);
if (typeof module !== "undefined") module.exports = api;
