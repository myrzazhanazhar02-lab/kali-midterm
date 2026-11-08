function showToast(message) {
  $("#toast").text(message).stop(true, true).fadeTo(200, 1).delay(1800).fadeTo(300, 0);
}

$(function () {
  $('a[href^="#"]').on("click", function (event) {
    const hash = this.getAttribute("href");
    if (hash.length < 2 || !$(hash).length) return;
    event.preventDefault();
    $("html, body").stop(true).animate({ scrollTop: $(hash).offset().top - 70 }, 600);
  });

  const $toTop = $("#toTop");
  let toTopVisible = false;
  $(window).on("scroll", function () {
    const shouldShow = $(window).scrollTop() > 400;
    if (shouldShow === toTopVisible) return;
    toTopVisible = shouldShow;
    $toTop.stop(true, true)[shouldShow ? "fadeIn" : "fadeOut"](250);
  });
  $toTop.on("click", function () {
    $("html, body").stop(true).animate({ scrollTop: 0 }, 600);
  });

  $(".faq-question").on("click", function () {
    const $button = $(this);
    const wasOpen = $button.attr("aria-expanded") === "true";

    $(".faq-question").not($button).attr("aria-expanded", "false").each(function () {
      $("#" + $(this).attr("aria-controls")).stop(true, true).slideUp(250);
    });

    $button.attr("aria-expanded", String(!wasOpen));
    $("#" + $button.attr("aria-controls")).stop(true, true)[wasOpen ? "slideUp" : "slideDown"](250);
  });
});
