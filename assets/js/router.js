/* ============================================================
   router.js — hash routes
     #/                     the library
     #/chapter/<slug>       one chapter
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var router = {};
  var view = null;
  var started = false;

  function parse() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);

    if (parts[0] === "chapter" && parts[1]) {
      return { name: "chapter", slug: decodeURIComponent(parts[1]) };
    }
    return { name: "library" };
  }

  function toTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  }

  function swap(content, title) {
    view.innerHTML = "";
    view.appendChild(content);
    document.title = title;
    toTop();
    util.rise(view);
  }

  function paint() {
    var route = parse();

    /* Anything playing belongs to the view we are leaving. */
    QS.media.stopAll();
    QS.reader.deactivate();

    if (route.name === "chapter") {
      var built = QS.reader.render(route.slug);
      swap(built.node, built.chapter.title + " \u2014 " + QS.config.name);
      QS.reader.activate(built.chapter, built.position);
      return;
    }

    swap(QS.library.render(), QS.config.name);
  }

  function render() {
    var route = parse();

    /* Unknown chapter — bounce to the library before anything animates. */
    if (route.name === "chapter" && !QS.reader.find(route.slug)) {
      window.location.replace("#/");
      return;
    }

    if (
      document.startViewTransition &&
      !util.reducedMotion() &&
      started /* skip the transition on first paint */
    ) {
      document.startViewTransition(paint);
      return;
    }

    if (!started) {
      paint();
      started = true;
      return;
    }

    /* Fallback: fade the old view out, then draw the new one. */
    view.classList.add("is-leaving");
    window.setTimeout(function () {
      paint();
      view.classList.remove("is-leaving");
    }, 140);
  }

  router.start = function () {
    view = document.getElementById("view");

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/");
    }

    window.addEventListener("hashchange", render);
    render();
    started = true;
  };

  QS.router = router;
})(window.QS);
