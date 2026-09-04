/* Raha Restaurant — client-side cart (localStorage only, no backend). */

(function () {
  const KEY = "raha_cart_v1";
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — cart still works for this session */
    }
  }

  let state = load();

  function product(id) {
    return RAHA.products.find((p) => p.id === id);
  }

  function emit() {
    save(state);
    const snap = Cart.lines();
    listeners.forEach((fn) => fn(snap));
  }

  const Cart = {
    onChange(fn) {
      listeners.push(fn);
      fn(Cart.lines());
    },
    lines() {
      return Object.keys(state)
        .map((id) => {
          const p = product(id);
          if (!p) return null;
          return { ...p, qty: state[id], lineTotal: p.price * state[id] };
        })
        .filter(Boolean);
    },
    count() {
      return Cart.lines().reduce((s, l) => s + l.qty, 0);
    },
    total() {
      return Cart.lines().reduce((s, l) => s + l.lineTotal, 0);
    },
    add(id, qty) {
      if (!product(id)) return;
      state[id] = (state[id] || 0) + (qty || 1);
      emit();
    },
    setQty(id, qty) {
      if (qty <= 0) delete state[id];
      else state[id] = qty;
      emit();
    },
    change(id, delta) {
      Cart.setQty(id, (state[id] || 0) + delta);
    },
    remove(id) {
      delete state[id];
      emit();
    },
    clear() {
      state = {};
      emit();
    },
    whatsappUrl() {
      const lines = Cart.lines();
      if (!lines.length) return null;
      const body = lines
        .map((l) => `${l.qty} × ${l.name} — ${RAHA.money(l.lineTotal)}`)
        .join("\n");
      const msg =
        "Hello Raha 👋\n\nI'd like to order:\n\n" +
        body +
        `\n\nTotal: ${RAHA.money(Cart.total())}\n\nPlease confirm my order.\n\nThank you!`;
      return `https://wa.me/${RAHA.contact.whatsapp}?text=${encodeURIComponent(msg)}`;
    },
  };

  RAHA.Cart = Cart;
})();
