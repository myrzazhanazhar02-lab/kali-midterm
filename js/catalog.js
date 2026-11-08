$(function () {
  const $grid = $("#doorGrid");
  const $info = $("#resultInfo");
  const $empty = $("#emptyState");

  function getFilteredDoors() {
    const query = $("#search").val().trim().toLowerCase();
    const model = $("#modelFilter").val();
    const width = $("#sizeFilter").val();

    return doors.filter(function (door) {
      const text = [door.name, door.model, door.look, door.size, door.side].join(" ").toLowerCase();
      return (!query || text.includes(query)) &&
             (model === "all" || door.model === model) &&
             (width === "all" || String(door.width) === width);
    });
  }

  function sortDoors(list) {
    const order = $("#sortBy").val();
    const sorted = list.slice();
    if (order === "low") sorted.sort((a, b) => a.price - b.price);
    if (order === "high") sorted.sort((a, b) => b.price - a.price);
    if (order === "name") sorted.sort((a, b) => a.name.localeCompare(b.name) || a.width - b.width);
    return sorted;
  }

  function makeCard(door) {
    const col = el("div", "col-12 col-md-6 col-lg-3");
    const card = el("article", "card door-card h-100");

    const image = el("img", "card-img-top");
    image.src = door.image;
    image.alt = door.alt;
    image.loading = "lazy";

    const body = el("div", "card-body d-flex flex-column");
    const button = el("button", "button button-dark add-btn", "Add to order");
    button.type = "button";
    button.setAttribute("data-id", door.id);

    body.append(
      el("p", "kicker mb-1", door.side),
      el("h3", "h5", door.name),
      el("p", "mb-2", door.text),
      el("p", "door-size", "Size: " + door.size + " mm"),
      el("p", "door-price mt-auto", formatPrice(door.price)),
      button
    );

    card.append(image, body);
    col.append(card);
    return col;
  }

  function render() {
    const list = sortDoors(getFilteredDoors());
    $grid.empty();
    list.forEach(door => $grid.append(makeCard(door)));

    if (list.length === 0) {
      $info.text("0 doors found");
      $empty.removeClass("d-none");
      return;
    }

    const average = Math.round(list.reduce((sum, door) => sum + door.price, 0) / list.length);
    $empty.addClass("d-none");
    $info.text(list.length + " of " + doors.length + " doors. Average price: " + formatPrice(average));
  }

  function resetFilters() {
    $("#search").val("");
    $("#modelFilter, #sizeFilter").val("all");
    $("#sortBy").val("low");
    render();
  }

  $("#search, #modelFilter, #sizeFilter, #sortBy").on("input change", render);
  $("#resetFilters, #emptyReset").on("click", resetFilters);

  $grid.on("click", ".add-btn", function () {
    const id = Number($(this).attr("data-id"));
    const door = doors.find(d => d.id === id);
    if (!door) return;
    Cart.add({
      id: "door-" + door.id,
      name: door.name,
      details: door.size + " mm",
      price: door.price
    });
    showToast(door.name + " (" + door.size + ") added to your order");
  });

  render();
});
