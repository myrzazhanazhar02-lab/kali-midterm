$(function () {
  const models = {
    Classic: {
      sizes: [{ label: "960 × 2060", price: 90941 }, { label: "860 × 2060", price: 92885 }],
      street: "Graphite",
      home: "White"
    },
    Modern: {
      sizes: [{ label: "860 × 2050", price: 140000 }, { label: "960 × 2050", price: 155000 }],
      street: "Walnut",
      home: "White"
    }
  };

  const streetColours = [
    { name: "Graphite", hex: "#2b2b2b" },
    { name: "Walnut", hex: "#8a5a2b" },
    { name: "Oak", hex: "#b9895b" },
    { name: "Forest", hex: "#3f5a47" },
    { name: "White", hex: "#f1ece2" }
  ];
  const homeColours = [
    { name: "White", hex: "#f1ece2" },
    { name: "Light grey", hex: "#d3d0ca" },
    { name: "Oak", hex: "#b9895b" },
    { name: "Walnut", hex: "#8a5a2b" }
  ];
  const handleColours = [
    { name: "Brass", hex: "#c9a227" },
    { name: "Graphite", hex: "#2b2b2b" },
    { name: "Steel", hex: "#b8bcc2" }
  ];

  const state = {
    model: "Classic",
    sizeIndex: 0,
    street: "Graphite",
    home: "White",
    handle: "Brass",
    handleSide: "left"
  };

  const $door = $("#cfgDoor");

  function findColour(list, name) {
    return list.find(colour => colour.name === name);
  }

  function renderSwatches(containerId, groupName, list, selected) {
    const $container = $("#" + containerId).empty();
    list.forEach(function (colour) {
      const label = el("label", "choice swatch");
      const input = el("input");
      input.type = "radio";
      input.name = groupName;
      input.value = colour.name;
      input.checked = colour.name === selected;

      const dot = el("span", "swatch-dot");
      dot.style.backgroundColor = colour.hex;
      label.append(input, dot, el("span", "swatch-name", colour.name));
      $container.append(label);
    });
  }

  function renderSizes() {
    const $select = $("#sizeSelect").empty();
    models[state.model].sizes.forEach(function (size, index) {
      const option = el("option", "", size.label + " mm");
      option.value = index;
      $select.append(option);
    });
    $select.val(state.sizeIndex);
  }

  function getPrice() {
    return models[state.model].sizes[state.sizeIndex].price;
  }

  function isStandard() {
    return state.street === models[state.model].street && state.home === models[state.model].home;
  }

  function update() {
    const size = models[state.model].sizes[state.sizeIndex];

    $door.toggleClass("is-modern", state.model === "Modern");
    $door.toggleClass("handle-right", state.handleSide === "right");
    $door[0].style.setProperty("--street", findColour(streetColours, state.street).hex);
    $door[0].style.setProperty("--home", findColour(homeColours, state.home).hex);
    $door[0].style.setProperty("--handle", findColour(handleColours, state.handle).hex);

    $("#sumModel").text(state.model);
    $("#sumSize").text(size.label + " mm");
    $("#sumStreet").text(state.street);
    $("#sumHome").text(state.home);
    $("#sumHandle").text(state.handle + ", on the " + state.handleSide);
    $("#sumPrice").text(formatPrice(size.price));
    $("#sumNote").text(isStandard()
      ? "Standard colours: this price is final."
      : "Custom colours: the master confirms the final price when he measures.");
  }

  function setView(view) {
    $door.toggleClass("show-home", view === "home");
    $(".view-btn").each(function () {
      $(this).attr("aria-pressed", String($(this).attr("data-view") === view));
    });
  }

  $("#modelChoices").on("change", "input", function () {
    state.model = this.value;
    state.sizeIndex = 0;
    state.street = models[state.model].street;
    state.home = models[state.model].home;
    renderSizes();
    renderSwatches("streetSwatches", "street", streetColours, state.street);
    renderSwatches("homeSwatches", "home", homeColours, state.home);
    update();
  });

  $("#sizeSelect").on("change", function () {
    state.sizeIndex = Number(this.value);
    update();
  });

  $("#streetSwatches").on("change", "input", function () {
    state.street = this.value;
    update();
    setView("street");
  });

  $("#homeSwatches").on("change", "input", function () {
    state.home = this.value;
    update();
    setView("home");
  });

  $("#handleSwatches").on("change", "input", function () {
    state.handle = this.value;
    update();
  });

  $("#handleSideChoices").on("change", "input", function () {
    state.handleSide = this.value;
    update();
  });

  $(".view-btn").on("click", function () {
    setView($(this).attr("data-view"));
  });

  $("#addConfig").on("click", function () {
    const size = models[state.model].sizes[state.sizeIndex];
    const key = [state.model, size.label, state.street, state.home, state.handle, state.handleSide].join("-").replace(/\s+/g, "");
    Cart.add({
      id: "cfg-" + key,
      name: state.model + " door, your design",
      details: size.label + " mm. Street: " + state.street + ", home: " + state.home + ". " + state.handle + " handle on the " + state.handleSide + ".",
      price: size.price
    });
    showToast("Your door is added to the order");
  });

  renderSizes();
  renderSwatches("streetSwatches", "street", streetColours, state.street);
  renderSwatches("homeSwatches", "home", homeColours, state.home);
  renderSwatches("handleSwatches", "handle", handleColours, state.handle);
  update();
});
