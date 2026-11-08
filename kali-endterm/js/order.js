$(function () {
  const $cartList = $("#cartList");
  const $form = $("#orderForm");
  const $success = $("#successBox");

  function renderCart() {
    $cartList.empty();

    if (Cart.items.length === 0) {
      const empty = el("div", "cart-empty");
      const link1 = el("a", "button button-dark", "Open the catalog");
      link1.href = "catalog.html";
      const link2 = el("a", "button button-line", "Design your door");
      link2.href = "design.html";
      empty.append(
        el("p", "mb-3", "Your order is empty. Choose a door from the catalog or design your own. You can also send the form without a door to book a free measurement."),
        link1, document.createTextNode(" "), link2
      );
      $cartList.append(empty);
      return;
    }

    Cart.items.forEach(function (item) {
      const row = el("div", "cart-item");
      const info = el("div", "cart-info");
      info.append(el("strong", "", item.name), el("span", "", item.details));

      const qty = el("div", "cart-qty");
      const minus = el("button", "qty-btn qty-minus", "−");
      const plus = el("button", "qty-btn qty-plus", "+");
      [minus, plus].forEach(b => { b.type = "button"; b.setAttribute("data-id", item.id); });
      minus.setAttribute("aria-label", "Fewer: " + item.name);
      plus.setAttribute("aria-label", "More: " + item.name);
      minus.disabled = item.qty <= 1;
      plus.disabled = item.qty >= 10;
      qty.append(minus, el("span", "qty-number", String(item.qty)), plus);

      const line = el("div", "cart-line");
      const remove = el("button", "remove-btn", "Remove");
      remove.type = "button";
      remove.setAttribute("data-id", item.id);
      remove.setAttribute("aria-label", "Remove " + item.name);
      line.append(el("span", "cart-price", formatPrice(item.price * item.qty)), remove);

      row.append(info, qty, line);
      $cartList.append(row);
    });

    const total = el("div", "cart-total");
    total.append(el("span", "", "Total for " + Cart.count() + " door(s)"), el("strong", "", formatPrice(Cart.total())));
    $cartList.append(total);
  }

  $cartList.on("click", ".qty-minus, .qty-plus, .remove-btn", function () {
    const id = $(this).attr("data-id");
    const item = Cart.items.find(i => i.id === id);
    if (!item) return;
    if ($(this).hasClass("remove-btn")) Cart.remove(id);
    else Cart.setQty(id, item.qty + ($(this).hasClass("qty-plus") ? 1 : -1));
    renderCart();
  });

  const rules = {
    name(value) {
      if (!value) return "Enter your name.";
      if (value.length < 2) return "The name must have at least 2 letters.";
      if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі'’\- ]+$/.test(value)) return "Use letters only, without digits or symbols.";
      return "";
    },
    phone(value) {
      if (!value) return "Enter your phone number.";
      if (!/^[78]\d{10}$/.test(value.replace(/\D/g, ""))) return "Enter a phone number like +7 702 102 74 18.";
      return "";
    },
    email(value) {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Enter an email like name@mail.com or leave the field empty.";
      return "";
    },
    address(value) {
      if (!value) return "Enter the address for the measurement.";
      if (value.length < 6) return "Write the street, the house and the flat.";
      return "";
    },
    date(value) {
      if (!value) return "Choose a date for the measurement.";
      const chosen = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(chosen)) return "Enter a real date.";
      if (chosen <= today) return "Choose a date from tomorrow.";
      if (chosen.getDay() === 1) return "We do not work on Mondays. Choose Tuesday to Sunday.";
      return "";
    },
    slot(value) {
      return value ? "" : "Choose a time for the master to come.";
    },
    comment(value) {
      return value.length > 200 ? "The comment is too long: 200 characters maximum." : "";
    },
    agree(checked) {
      return checked ? "" : "Please agree to be called back.";
    }
  };

  function getValue(id) {
    const $field = $("#" + id);
    return $field.is(":checkbox") ? $field.is(":checked") : $field.val().trim();
  }

  function validateField(id) {
    const error = rules[id](getValue(id));
    $("#" + id).toggleClass("is-invalid", error !== "").attr("aria-invalid", String(error !== ""));
    $("#" + id + "Error").text(error);
    return error === "";
  }

  const fieldIds = Object.keys(rules);

  $form.on("focusout", "input, select, textarea", function () {
    if (rules[this.id]) validateField(this.id);
  });

  $form.on("input change", "input, select, textarea", function () {
    if (rules[this.id] && $(this).hasClass("is-invalid")) validateField(this.id);
    if (this.id === "comment") $("#commentCount").text(this.value.length + " / 200");
  });

  $form.on("submit", function (event) {
    event.preventDefault();
    let firstInvalid = null;
    fieldIds.forEach(function (id) {
      if (!validateField(id) && !firstInvalid) firstInvalid = id;
    });

    if (firstInvalid) {
      $("#" + firstInvalid).trigger("focus");
      return;
    }

    const name = getValue("name");
    const date = new Date(getValue("date") + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    let text = "Thank you, " + name + ". The master will come on " + date + ", " + $("#slot option:selected").text() + ". We will call " + getValue("phone") + " to confirm.";
    if (Cart.count() > 0) {
      text += " Your order: " + Cart.count() + " door(s), total " + formatPrice(Cart.total()) + ".";
    }

    $form[0].reset();
    $form.find(".is-invalid").removeClass("is-invalid").removeAttr("aria-invalid");
    $form.find(".invalid-feedback").text("");
    $("#commentCount").text("0 / 200");
    Cart.clear();
    renderCart();

    $("#successText").text(text);
    $success.stop(true, true).hide().slideDown(400);
    $("html, body").stop(true).animate({ scrollTop: $success.offset().top - 90 }, 500);
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  $("#date").attr("min", tomorrow.getFullYear() + "-" + month + "-" + day);

  renderCart();
});
