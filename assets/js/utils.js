/* ============================================================
   utils.js — small helpers shared by every other file
   ============================================================ */

(function (QS) {
  "use strict";

  var util = {};

  /* — DOM ————————————————————————————————————— */

  util.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  util.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* Build an element from a tag, attribute map and children. */
  util.el = function (tag, attrs, children) {
    var node = document.createElement(tag);
    var key;

    for (key in attrs || {}) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
      var val = attrs[key];
      if (val === null || val === false || val === undefined) continue;
      if (key === "class") node.className = val;
      else if (key === "text") node.textContent = val;
      else if (key === "html") node.innerHTML = val;
      else if (key === "style") node.setAttribute("style", val);
      else if (key.indexOf("on") === 0 && typeof val === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), val);
      } else node.setAttribute(key, val === true ? "" : val);
    }

    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      );
    });

    return node;
  };

  /* Inline SVG icon set. Stroke styling comes from CSS. */
  var paths = {
    arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H5M11 18l-6-6 6-6"/>',
    play: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
    pause: '<path d="M9.5 5.5v13M14.5 5.5v13"/>',
    audio:
      '<path d="M11 5.5 6.5 9.2H3.5v5.6h3L11 18.5zM15.2 9.4a3.7 3.7 0 0 1 0 5.2M17.9 6.8a7.4 7.4 0 0 1 0 10.4"/>',
    video:
      '<rect x="3" y="6" width="12.5" height="12" rx="2.2"/><path d="M15.5 12l5.5-3.4v6.8z"/>',
    photo:
      '<rect x="3.2" y="4.8" width="17.6" height="14.4" rx="2.2"/><circle cx="8.6" cy="10" r="1.6"/><path d="M4 17.2l4.9-4.3 4.2 3.6 2.6-2.3 4.3 3.8"/>',
    zoom:
      '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 21 21M11 8.6v4.8M8.6 11h4.8"/>',
    clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3 2"/>',
    warn: '<path d="M12 4.5 21 19.5H3ZM12 10v4M12 16.6v.1"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    book:
      '<path d="M4 5.2h6a3 3 0 0 1 3 3v10.6a2.4 2.4 0 0 0-2.4-2.4H4zM20 5.2h-6a3 3 0 0 0-3 3v10.6a2.4 2.4 0 0 1 2.4-2.4H20z"/>'
  };

  util.icon = function (name, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    if (cls) svg.setAttribute("class", cls);
    svg.innerHTML = paths[name] || "";
    return svg;
  };

  /* — storage (never throws, even with cookies blocked) ————— */

  util.store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* private mode / quota — reading still works, just no memory */
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {}
    },
    session: {
      get: function (key, fallback) {
        try {
          var raw = sessionStorage.getItem(key);
          return raw === null ? fallback : JSON.parse(raw);
        } catch (err) {
          return fallback;
        }
      },
      set: function (key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch (err) {}
      },
      remove: function (key) {
        try {
          sessionStorage.removeItem(key);
        } catch (err) {}
      }
    }
  };

  /* — hashing —————————————————————————————————
     Two 32-bit hashes (FNV-1a + djb2) glued together. Enough to keep
     the passphrase out of plain view. Not a security boundary. */

  util.digest = function (value) {
    var s = "qs-story::v1::" + String(value == null ? "" : value);
    var a = 0x811c9dc5;
    var b = 5381;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193) >>> 0;
      b = ((Math.imul(b, 33) >>> 0) ^ c) >>> 0;
    }
    return (
      ("00000000" + a.toString(16)).slice(-8) +
      ("00000000" + b.toString(16)).slice(-8)
    );
  };

  /* — formatting ——————————————————————————————— */

  util.pad2 = function (n) {
    return (n < 10 ? "0" : "") + n;
  };

  /* seconds → m:ss */
  util.clock = function (seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var total = Math.floor(seconds);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + util.pad2(s);
  };

  /* "2024-03-12" → "12 March 2024" */
  util.longDate = function (iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    var date = new Date(
      Number(parts[0]),
      Number(parts[1] || 1) - 1,
      Number(parts[2] || 1)
    );
    if (isNaN(date.getTime())) return iso;
    try {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (err) {
      return iso;
    }
  };

  util.words = function (text) {
    var trimmed = String(text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  util.clamp = function (value, min, max) {
    return Math.min(max, Math.max(min, value));
  };

  util.throttleFrame = function (fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  };

  util.reducedMotion = function () {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };

  /* — entrance animation ————————————————————————
     Reveal [data-rise] elements as they scroll into view. */

  util.rise = function (root) {
    var items = util.$$("[data-rise]", root || document);
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || util.reducedMotion()) {
      items.forEach(function (node) {
        node.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var node = entry.target;
          var delay = Number(node.getAttribute("data-rise")) || 0;
          node.style.setProperty("--rise-delay", delay + "ms");
          node.classList.add("is-in");
          io.unobserve(node);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    items.forEach(function (node) {
      io.observe(node);
    });

    /* Failsafe: text must never stay invisible because an observer
       callback did not arrive. Anything still hidden after 2s is shown. */
    window.setTimeout(function () {
      items.forEach(function (node) {
        if (!node.classList.contains("is-in")) {
          node.style.setProperty("--rise-delay", "0ms");
          node.classList.add("is-in");
        }
      });
    }, 2000);
  };

  QS.util = util;
})(window.QS);

/* ============================================================
   utils.js (part 2) — chapter stats + reading progress
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;

  /* Word count, reading time and which media a chapter contains. */
  util.chapterStats = function (chapter) {
    var stats = { words: 0, minutes: 1, audio: 0, video: 0, photos: 0 };

    (chapter.blocks || []).forEach(function (block) {
      if (block.text) stats.words += util.words(block.text);

      if (block.type === "audio") stats.audio++;
      else if (block.type === "video") stats.video++;
      else if (block.type === "image") stats.photos++;
      else if (block.type === "gallery") {
        stats.photos += (block.items || []).length;
      }
    });

    stats.minutes = Math.max(
      1,
      Math.round(stats.words / (QS.config.wordsPerMinute || 200))
    );
    return stats;
  };

  /* Per-chapter scroll position, kept as a 0–100 percentage. */
  var KEY = QS.config.keys.progress;

  util.progress = {
    all: function () {
      var map = util.store.get(KEY, {});
      return map && typeof map === "object" ? map : {};
    },

    get: function (slug) {
      var value = util.progress.all()[slug];
      return typeof value === "number" ? value : 0;
    },

    set: function (slug, percent) {
      var map = util.progress.all();
      var next = Math.round(util.clamp(percent, 0, 100));
      /* Only ever move forward, and ignore noise below 3%. */
      if (next <= (map[slug] || 0) || next < 3) return;
      map[slug] = next;
      util.store.set(KEY, map);
    },

    /* The furthest-along chapter that is started but not finished. */
    resume: function (chapters) {
      var map = util.progress.all();
      var best = null;

      chapters.forEach(function (chapter, index) {
        var pct = map[chapter.slug] || 0;
        if (pct < 3 || pct > 97) return;
        if (!best || index > best.index) {
          best = { chapter: chapter, index: index, percent: pct };
        }
      });

      return best;
    }
  };
})(window.QS);
