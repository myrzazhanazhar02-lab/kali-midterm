function formatPrice(number) {
  return new Intl.NumberFormat("ru-RU").format(number) + " ₸";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const Cart = {
  key: "kaliCart",
  items: [],

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key));
      this.items = Array.isArray(saved)
        ? saved.filter(i => i && typeof i.price === "number" && typeof i.qty === "number")
        : [];
    } catch (error) {
      this.items = [];
    }
  },

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.items));
    } catch (error) {
      console.warn("The cart cannot be saved in this browser.");
    }
    this.updateBadge(true);
  },

  add(item) {
    const found = this.items.find(i => i.id === item.id);
    if (found) {
      found.qty = Math.min(found.qty + 1, 10);
    } else {
      this.items.push({ ...item, qty: 1 });
    }
    this.save();
  },

  setQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(qty, 10));
    this.save();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  count() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  total() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  updateBadge(pulse) {
    const count = this.count();
    const $badge = $(".cart-count");
    $badge.text(count).toggleClass("d-none", count === 0);
    if (pulse && count > 0) {
      $badge.stop(true, true).fadeTo(120, 0.3).fadeTo(220, 1);
    }
  }
};

Cart.load();
$(function () {
  Cart.updateBadge(false);
});
