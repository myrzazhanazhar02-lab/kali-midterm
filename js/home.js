$(function () {
  const $scene = $("#doorScene");
  const $toggle = $("#doorToggle");

  function setOpen(isOpen) {
    $scene.toggleClass("is-open", isOpen);
    $toggle.attr("aria-pressed", String(isOpen)).text(isOpen ? "Close the door" : "Open the door");
  }

  $toggle.on("click", function () {
    setOpen(!$scene.hasClass("is-open"));
  });

  $scene.on("click", function () {
    setOpen(!$scene.hasClass("is-open"));
  });

  $scene.on("pointerenter", function (event) {
    if (event.originalEvent.pointerType === "mouse") setOpen(true);
  });

  $scene.on("pointerleave", function (event) {
    if (event.originalEvent.pointerType === "mouse") setOpen(false);
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(function () {
      setOpen(true);
    }, 900);
  }

  const $compare = $("#compare");
  $("#compareRange").on("input", function () {
    $compare.css("--pos", this.value + "%");
  });
});
