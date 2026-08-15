/* ============================================================
   theme.js — light / dark. Light is the default.
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var KEY = QS.config.keys.theme;

  var COLORS = { light: "#faf9f7", dark: "#100f11" };

  var theme = {};
  var button = null;

  theme.current = function () {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  };

  theme.set = function (name, remember) {
    var next = name === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);

    var meta = document.getElementById("metaThemeColor");
    if (meta) meta.setAttribute("content", COLORS[next]);

    if (remember !== false) util.store.set(KEY, next);
    sync();
  };

  theme.toggle = function () {
    var next = theme.current() === "dark" ? "light" : "dark";

    /* Use the platform's view transition when it exists — it cross-fades
       the whole page instead of animating a dozen properties. */
    if (document.startViewTransition && !util.reducedMotion()) {
      document.startViewTransition(function () {
        theme.set(next);
      });
      return;
    }
    theme.set(next);
  };

  function sync() {
    if (!button) return;
    var goingTo = theme.current() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", "Switch to " + goingTo + " mode");
    button.setAttribute("title", goingTo === "dark" ? "Dark mode" : "Light mode");
  }

  theme.init = function () {
    /* The inline script in <head> already applied the stored theme so
       there is no flash. This only wires up the control. */
    theme.set(util.store.get(KEY, "light"), false);

    button = document.getElementById("themeToggle");
    if (button) button.addEventListener("click", theme.toggle);

    /* Shortcut: press "t" (outside of inputs) to flip the theme. */
    document.addEventListener("keydown", function (event) {
      if (event.key !== "t" && event.key !== "T") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = (event.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || event.target.isContentEditable)
        return;
      theme.toggle();
    });
  };

  QS.theme = theme;
})(window.QS);
