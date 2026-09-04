/* Raha Restaurant — UI wiring: hero carousel, menu rendering, filters,
   cart drawer, product modal, sticky bar, WhatsApp handoff.
   Static site, vanilla JS, no backend. */

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const Cart = RAHA.Cart;
  const money = RAHA.money;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function imgFallback(img) {
    img.addEventListener(
      "error",
      () => {
        img.style.visibility = "hidden";
      },
      { once: true },
    );
  }

  /* ---------------- Hero carousel ---------------- */
  function initHero() {
    const track = $("#heroSlides");
    const dotsWrap = $("#heroDots");
    const content = $("#heroContent");
    const pauseBtn = $("#heroPause");
    if (!track) return;

    const slides = RAHA.heroSlides;
    let index = 0;
    let timer = null;
    let playing = !reduceMotion;

    track.innerHTML = slides
      .map(
        (s, i) => `
      <div class="hero-slide" data-active="${i === 0}">
        <img src="${s.image}" alt="${s.alt}" width="1200" height="800"
             ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </div>`,
      )
      .join("");
    $$("#heroSlides img").forEach(imgFallback);

    dotsWrap.innerHTML = slides
      .map(
        (s, i) =>
          `<button class="hero-dot" type="button" data-i="${i}" aria-current="${i === 0}">
             <span class="sr-only">Show slide ${i + 1}</span></button>`,
      )
      .join("");

    function paint() {
      $$("#heroSlides .hero-slide").forEach((el, i) =>
        el.setAttribute("data-active", String(i === index)),
      );
      $$("#heroDots .hero-dot").forEach((el, i) =>
        el.setAttribute("aria-current", String(i === index)),
      );
      const s = slides[index];
      content.innerHTML = `
        <p class="hero-eyebrow">${s.eyebrow}</p>
        <h1>${s.title}</h1>
        <p class="hero-sub">${s.sub}</p>
        <div class="hero-meta">
          <span>Nyali · Mombasa</span><span>Since 2010</span><span>WhatsApp ordering</span>
        </div>
        <div class="hero-cta">
          <a class="btn btn-gold" href="#menu">Order Now</a>
          <a class="btn btn-outline on-dark" href="#menu">View Menu</a>
        </div>`;
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      paint();
    }

    function play() {
      stop();
      if (reduceMotion) return;
      timer = setInterval(() => go(index + 1), 6500);
      playing = true;
      pauseBtn.textContent = "Pause slideshow";
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      playing = false;
      pauseBtn.textContent = "Play slideshow";
    }

    dotsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".hero-dot");
      if (!btn) return;
      go(Number(btn.dataset.i));
      stop();
    });
    pauseBtn.addEventListener("click", () => (playing ? stop() : play()));

    paint();
    if (reduceMotion) {
      stop();
    } else {
      play();
    }
  }

  /* ---------------- Product cards ---------------- */
  function cardHTML(p) {
    return `
      <article class="card reveal">
        <button class="card-media" type="button" data-open="${p.id}">
          <img src="${p.image}" alt="${p.name}" width="600" height="450" loading="lazy" decoding="async">
          ${p.bestseller ? '<span class="badge">★ Bestseller</span>' : ""}
          <span class="sr-only">View details for ${p.name}</span>
        </button>
        <div class="card-body">
          <h3 class="card-name">${p.name}</h3>
          <p class="card-desc">${p.desc}</p>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="add-btn" type="button" data-add="${p.id}">+ Add</button>
          </div>
        </div>
      </article>`;
  }

  function renderGrid(el, items) {
    el.innerHTML = items.map(cardHTML).join("");
    $$("img", el).forEach(imgFallback);
    observeReveals(el);
  }

  function initBestSellers() {
    const el = $("#bestSellersGrid");
    if (!el) return;
    renderGrid(
      el,
      RAHA.products.filter((p) => p.bestseller),
    );
  }

  function initMenu() {
    const grid = $("#menuGrid");
    const tabs = $("#menuTabs");
    if (!grid) return;

    tabs.innerHTML = RAHA.categories
      .map(
        (c, i) =>
          `<button class="tab" type="button" role="tab" data-cat="${c.id}" aria-selected="${i === 0}">${c.label}</button>`,
      )
      .join("");

    function show(cat) {
      const items =
        cat === "all" ? RAHA.products : RAHA.products.filter((p) => p.cats.includes(cat));
      renderGrid(grid, items);
      $("#menuCount").textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
    }

    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      $$(".tab", tabs).forEach((t) => t.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      show(btn.dataset.cat);
    });

    show("all");
  }

  /* ---------------- Deals ---------------- */
  function initDeals() {
    const el = $("#dealsGrid");
    if (!el) return;
    el.innerHTML = RAHA.deals
      .map((d) => {
        const items = d.items.map((id) => RAHA.products.find((p) => p.id === id)).filter(Boolean);
        const total = items.reduce((s, p) => s + p.price, 0);
        const counts = {};
        items.forEach((p) => (counts[p.name] = (counts[p.name] || 0) + 1));
        return `
        <article class="deal reveal">
          <p class="deal-kicker">${d.kicker}</p>
          <h3>${d.name}</h3>
          <ul>${Object.entries(counts)
            .map(([n, q]) => `<li>${q} × ${n}</li>`)
            .join("")}</ul>
          <p class="price">${money(total)} <small>bundle total</small></p>
          <button class="btn btn-primary" type="button" data-deal="${d.id}">Add deal</button>
        </article>`;
      })
      .join("");
    observeReveals(el);
  }

  /* ---------------- Cart UI ---------------- */
  const drawer = $("#cartDrawer");
  const overlay = $("#overlay");
  let lastFocused = null;

  function openCart() {
    lastFocused = document.activeElement;
    drawer.setAttribute("data-open", "true");
    overlay.setAttribute("data-open", "true");
    drawer.removeAttribute("inert");
    document.body.style.overflow = "hidden";
    $("#cartClose").focus();
  }
  function closeCart() {
    drawer.setAttribute("data-open", "false");
    overlay.setAttribute("data-open", "false");
    drawer.setAttribute("inert", "");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function renderCart(lines) {
    const list = $("#cartItems");
    const foot = $("#cartFoot");
    const count = Cart.count();
    const total = Cart.total();

    $("#cartPillText").textContent = count
      ? `${count} item${count === 1 ? "" : "s"} · ${money(total)}`
      : "Cart";
    $("#cartPill").setAttribute(
      "aria-label",
      count ? `View cart, ${count} items, ${money(total)}` : "View cart, empty",
    );

    const bar = $("#stickyBar");
    bar.setAttribute("data-visible", String(count > 0));
    document.body.setAttribute("data-cart-active", String(count > 0));
    if (count > 0) {
      $("#sbInfo").innerHTML = `${count} item${count === 1 ? "" : "s"}<span>${money(total)}</span>`;
    }

    if (!lines.length) {
      list.innerHTML = `
        <div class="cart-empty">
          <strong>Your cart is empty.</strong>
          <p>Add something delicious from the menu.</p>
          <a class="btn btn-primary" href="#menu" data-close-cart>View menu</a>
        </div>`;
      foot.hidden = true;
      return;
    }

    list.innerHTML = lines
      .map(
        (l) => `
      <div class="cart-item">
        <img src="${l.image}" alt="" width="60" height="60" loading="lazy">
        <div>
          <div class="cart-item-name">${l.name}</div>
          <div class="cart-item-price">${money(l.lineTotal)}</div>
        </div>
        <div class="qty">
          <button type="button" data-dec="${l.id}" aria-label="Decrease quantity of ${l.name}">−</button>
          <output aria-label="Quantity of ${l.name}">${l.qty}</output>
          <button type="button" data-inc="${l.id}" aria-label="Increase quantity of ${l.name}">+</button>
        </div>
      </div>`,
      )
      .join("");
    $$("img", list).forEach(imgFallback);

    foot.hidden = false;
    $("#cartTotal").textContent = money(total);
    $("#whatsappBtn").href = Cart.whatsappUrl();
  }

  /* ---------------- Product modal ---------------- */
  const modal = $("#productModal");
  let modalQty = 1;
  let modalProduct = null;

  function openProduct(id) {
    const p = RAHA.products.find((x) => x.id === id);
    if (!p) return;
    modalProduct = p;
    modalQty = 1;
    $("#modalImg").src = p.image;
    $("#modalImg").alt = p.name;
    $("#modalName").textContent = p.name;
    $("#modalDesc").textContent = p.desc;
    $("#modalPrice").textContent = money(p.price);
    $("#modalQty").textContent = "1";
    if (typeof modal.showModal === "function") modal.showModal();
  }

  /* ---------------- Reveal on scroll ---------------- */
  let observer = null;
  function observeReveals(root) {
    if (reduceMotion) {
      $$(".reveal", root).forEach((el) => el.classList.add("in-view"));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in-view");
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
    }
    $$(".reveal:not(.in-view)", root).forEach((el) => observer.observe(el));
  }

  /* ---------------- Toast ---------------- */
  function toast(msg) {
    const region = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    region.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  /* ---------------- Mobile nav ---------------- */
  function initNav() {
    const toggle = $("#navToggle");
    const menu = $("#mobileMenu");
    toggle.addEventListener("click", () => {
      const open = menu.getAttribute("data-open") === "true";
      menu.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        menu.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- Global events ---------------- */
  function initEvents() {
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        Cart.add(add.dataset.add, 1);
        const p = RAHA.products.find((x) => x.id === add.dataset.add);
        toast(`✓ ${p.name} added`);
        return;
      }
      const open = e.target.closest("[data-open]");
      if (open && open.dataset.open) {
        openProduct(open.dataset.open);
        return;
      }
      const deal = e.target.closest("[data-deal]");
      if (deal) {
        const d = RAHA.deals.find((x) => x.id === deal.dataset.deal);
        d.items.forEach((id) => Cart.add(id, 1));
        toast(`✓ ${d.name} added`);
        return;
      }
      const dec = e.target.closest("[data-dec]");
      if (dec) return Cart.change(dec.dataset.dec, -1);
      const inc = e.target.closest("[data-inc]");
      if (inc) return Cart.change(inc.dataset.inc, 1);
      if (e.target.closest("[data-close-cart]")) closeCart();
    });

    $("#cartPill").addEventListener("click", openCart);
    $("#stickyView").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    $("#clearCart").addEventListener("click", () => {
      Cart.clear();
      toast("Cart cleared");
    });
    $("#whatsappBtn").addEventListener("click", (e) => {
      const url = Cart.whatsappUrl();
      if (!url) {
        e.preventDefault();
        return;
      }
      e.currentTarget.href = url;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (drawer.getAttribute("data-open") === "true") closeCart();
    });

    // Focus trap for the cart drawer
    drawer.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        drawer,
      ).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Product modal controls
    $("#modalClose").addEventListener("click", () => modal.close());
    $("#modalDec").addEventListener("click", () => {
      modalQty = Math.max(1, modalQty - 1);
      $("#modalQty").textContent = String(modalQty);
    });
    $("#modalInc").addEventListener("click", () => {
      modalQty += 1;
      $("#modalQty").textContent = String(modalQty);
    });
    $("#modalAdd").addEventListener("click", () => {
      if (!modalProduct) return;
      Cart.add(modalProduct.id, modalQty);
      toast(`✓ ${modalQty} × ${modalProduct.name} added`);
      modal.close();
    });
  }
window.addEventListener("scroll", () => {
  document.querySelector(".nav")?.classList.toggle(
    "scrolled",
    window.scrollY > 30
  );
});
  /* ---------------- Contact links ---------------- */
  function initContact() {
    const c = RAHA.contact;
    $$("[data-tel]").forEach((a) => (a.href = c.orderPhoneHref));
    $$("[data-maps]").forEach((a) => (a.href = c.maps));
    $$("[data-wa-plain]").forEach(
      (a) =>
        (a.href = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Hello Raha 👋 I'd like to place an order.")}`),
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initHero();
    initBestSellers();
    initDeals();
    initMenu();
    initContact();
    initEvents();
    Cart.onChange(renderCart);
    observeReveals(document);
    drawer.setAttribute("inert", "");
  });
})();
