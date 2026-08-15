/* ============================================================
   gate.js — the passphrase screen

   A soft gate, not a vault. The passphrase is compared as a hash so
   it is not readable at a glance, but everything here runs in the
   browser: anyone who opens devtools can study it. Keep that in mind
   when deciding what to publish.
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var cfg = QS.config;
  var scoped = cfg.unlockScope === "local" ? util.store : util.store.session;

  var gate = {};
  var onUnlock = null;
  var attempts = 0;

  var nodes = {};

  var WRONG = [
    "MALII",
    "Wrong",
    "lower case lahat walang space.",
    "Tanong nyo nalang sakin HAHAHA"
  ];

  function isUnlocked() {
    return scoped.get(cfg.keys.unlock, false) === true;
  }

  function hint(message, state) {
    if (!nodes.hint) return;
    nodes.hint.textContent = message;
    nodes.hint.className = "field__hint" + (state ? " is-" + state : "");
  }

  /* — open ————————————————————————————————————— */

  function open(animated) {
    document.body.classList.remove("is-locked");
    nodes.app.hidden = false;

    if (animated) {
      nodes.gate.classList.add("is-open");
      nodes.app.classList.add("is-in");
      window.setTimeout(function () {
        if (nodes.gate && nodes.gate.parentNode) nodes.gate.remove();
      }, 700);
    } else {
      nodes.gate.remove();
      nodes.app.style.opacity = "1";
    }

    if (typeof onUnlock === "function") onUnlock();

    if (animated) {
      window.setTimeout(function () {
        nodes.app.classList.remove("is-in");
        nodes.app.style.opacity = "1";
        if (nodes.view) nodes.view.focus({ preventScroll: true });
      }, 700);
    }
  }

  /* — submit ————————————————————————————————— */

  function submit(event) {
    event.preventDefault();

    var raw = nodes.input.value;
    var value = String(raw).trim().toLowerCase();

    if (!value) {
      hint("Type the passphrase first.", "error");
      nodes.input.focus();
      return;
    }

    nodes.submit.disabled = true;
    hint("Checking\u2026");

    /* A short, deliberate pause. Feels considered and takes the sting
       out of rapid-fire guessing. */
    window.setTimeout(function () {
      nodes.submit.disabled = false;

      if (util.digest(value) === cfg.passHash) {
        scoped.set(cfg.keys.unlock, true);
        hint("Come in.", "ok");
        nodes.input.blur();
        window.setTimeout(function () {
          open(true);
        }, 260);
        return;
      }

      attempts++;
      hint(WRONG[Math.min(attempts - 1, WRONG.length - 1)], "error");
      nodes.gate.classList.remove("is-wrong");
      void nodes.gate.offsetWidth; /* restart the shake */
      nodes.gate.classList.add("is-wrong");
      nodes.input.value = "";
      nodes.input.focus();
    }, 380);
  }

  /* — show / hide the characters ————————————————— */

  function toggleReveal() {
    var shown = nodes.reveal.getAttribute("aria-pressed") === "true";
    nodes.reveal.setAttribute("aria-pressed", shown ? "false" : "true");
    nodes.reveal.setAttribute(
      "aria-label",
      shown ? "Show passphrase" : "Hide passphrase"
    );
    nodes.input.type = shown ? "password" : "text";
    nodes.input.focus();
  }

  /* — lock again ————————————————————————————— */

  gate.lock = function () {
    scoped.remove(cfg.keys.unlock);
    util.store.remove(cfg.keys.unlock);
    window.location.reload();
  };

  /* — init ————————————————————————————————————— */

  gate.init = function (callback) {
    onUnlock = callback;

    nodes.gate = document.getElementById("gate");
    nodes.app = document.getElementById("app");
    nodes.view = document.getElementById("view");
    nodes.form = document.getElementById("gateForm");
    nodes.input = document.getElementById("gatePass");
    nodes.submit = document.getElementById("gateSubmit");
    nodes.reveal = document.getElementById("gateReveal");
    nodes.hint = document.getElementById("gateHint");

    var lockBtn = document.getElementById("lockBtn");
    if (lockBtn) lockBtn.addEventListener("click", gate.lock);

    if (isUnlocked()) {
      open(false);
      return;
    }

    nodes.form.addEventListener("submit", submit);
    nodes.reveal.addEventListener("click", toggleReveal);
    nodes.input.addEventListener("input", function () {
      if (nodes.hint.classList.contains("is-error")) hint("");
      nodes.gate.classList.remove("is-wrong");
    });

    /* Autofocus after the entrance animation so it does not fight it. */
    window.setTimeout(function () {
      nodes.input.focus({ preventScroll: true });
    }, util.reducedMotion() ? 0 : 620);
  };

  QS.gate = gate;
})(window.QS);
