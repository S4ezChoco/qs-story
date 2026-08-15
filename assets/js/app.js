/* ============================================================
   app.js — boot order and the few global behaviours
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;

  /* The top bar only grows a border and a blur once the page moves. */
  function stickyTopbar() {
    var bar = document.getElementById("topbar");
    if (!bar) return;

    var update = util.throttleFrame(function () {
      bar.classList.toggle("is-stuck", window.scrollY > 8);
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function boot() {
    QS.theme.init();
    QS.media.initLightbox();
    QS.reader.initShortcuts();
    stickyTopbar();

    /* Nothing else runs until the passphrase is accepted. */
    QS.gate.init(function () {
      QS.router.start();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.QS);
