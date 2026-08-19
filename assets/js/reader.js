/* ============================================================
   reader.js — one chapter: prose, media, progress, pager
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var el = util.el;
  var icon = util.icon;

  var reader = {};
  var active = null; /* the chapter being read right now */
  var onScroll = null;

  /* — blocks ————————————————————————————————————— */

  function block(node) {
    switch (node.type) {
      case "lede":
        return el("p", { class: "lede", html: node.text });

      case "p":
        return el("p", { html: node.text });

      case "h":
        return el("h2", { text: node.text });

      case "quote":
        return el("blockquote", {}, [
          el("p", { html: node.text }),
          node.cite ? el("cite", { text: node.cite }) : null
        ]);

      case "note":
        return el("aside", { class: "aside", html: node.text });

      case "message":
        return letter(node);

      case "break":
        return el("p", { class: "dinkus", text: "***", "aria-hidden": "true" });

      case "image":
        return QS.media.figure(node);

      case "gallery":
        return QS.media.gallery(node);

      case "audio":
        return QS.media.audio(node);

      case "video":
        return QS.media.video(node);

      default:
        return null;
    }
  }

  /* A message quoted in full. Blank lines in `text` become paragraphs;
     the words themselves are left exactly as they were sent. */
  function letter(node) {
    var byline = [node.from, node.via].filter(Boolean).join(" \u00b7 ");

    var paragraphs = String(node.text || "")
      .split(/\n\s*\n/)
      .map(function (part) {
        return el("p", { html: part.trim() });
      });

    var children = byline
      ? [el("p", { class: "letter__head", text: byline })]
      : [];

    return el("blockquote", { class: "letter" }, children.concat(paragraphs));
  }

  /* — masthead ——————————————————————————————————— */

  function head(chapter, position, stats) {
    var meta = [
      el("span", { text: util.longDate(chapter.date) }),
      el("span", { text: "\u00b7" }),
      el("span", { text: stats.minutes + " min read" }),
      el("span", { text: "\u00b7" }),
      el("span", { text: stats.words + " words" })
    ];

    return el("header", { class: "chapter__head shell" }, [
      el(
        "a",
        { class: "chapter__back", href: "#/", "data-link": true },
        [icon("arrowLeft"), "All chapters"]
      ),
      el("p", {
        class: "chapter__num",
        text: "Chapter " + util.pad2(position + 1)
      }),
      el("h1", { class: "display chapter__title", text: chapter.title }),
      chapter.dek ? el("p", { class: "chapter__dek", text: chapter.dek }) : null,
      el("p", { class: "chapter__meta" }, meta)
    ]);
  }

  /* — prev / next ————————————————————————————————— */

  function pagerItem(chapter, direction) {
    if (!chapter) {
      return el("p", {
        class: "pager__empty",
        text:
          direction === "next"
            ? "That is everything, for now."
            : "This is where it starts."
      });
    }

    return el(
      "a",
      {
        class: "pager__item pager__item--" + direction,
        href: "#/chapter/" + chapter.slug,
        "data-link": true
      },
      [
        el("span", {
          class: "pager__dir",
          text: direction === "next" ? "Next" : "Previous"
        }),
        el("span", { class: "pager__title", text: chapter.title })
      ]
    );
  }

  function tail(prev, next) {
    return el("footer", { class: "chapend shell", "data-rise": "0" }, [
      el("p", { class: "chapend__mark", text: "End of chapter" }),
      el("div", { class: "pager" }, [
        pagerItem(prev, "prev"),
        pagerItem(next, "next")
      ])
    ]);
  }

  /* — render ————————————————————————————————————— */

  /* Look up a chapter without building anything. */
  reader.find = function (slug) {
    var chapters = QS.book.chapters || [];
    var position = -1;

    chapters.forEach(function (chapter, index) {
      if (chapter.slug === slug) position = index;
    });

    return position < 0 ? null : { chapter: chapters[position], position: position };
  };

  reader.render = function (slug) {
    var chapters = QS.book.chapters || [];
    var found = reader.find(slug);
    if (!found) return null;

    var chapter = found.chapter;
    var position = found.position;
    var stats = util.chapterStats(chapter);

    var prose = el(
      "div",
      { class: "prose shell" },
      (chapter.blocks || []).map(block)
    );

    var article = el("article", { class: "chapter" }, [
      head(chapter, position, stats),
      prose,
      tail(chapters[position - 1], chapters[position + 1])
    ]);

    return { node: article, chapter: chapter, position: position };
  };

  /* — progress + shortcuts while reading ————————————— */

  reader.activate = function (chapter, position) {
    active = { chapter: chapter, position: position };

    var track = document.getElementById("readProgress");
    var bar = document.getElementById("readProgressBar");
    var now = document.getElementById("topbarNow");

    if (track) track.hidden = false;
    if (now) {
      now.textContent = chapter.title;
      now.setAttribute("aria-hidden", "true");
    }

    onScroll = util.throttleFrame(function () {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      pct = util.clamp(pct, 0, 100);

      /* A chapter that fits on one screen has nothing to track. */
      if (track) track.hidden = scrollable <= 40;

      if (bar) bar.style.width = pct.toFixed(1) + "%";
      if (track) track.setAttribute("aria-valuenow", String(Math.round(pct)));
      if (now) now.classList.toggle("is-in", window.scrollY > 120);

      util.progress.set(chapter.slug, pct);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  };

  reader.deactivate = function () {
    if (onScroll) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      onScroll = null;
    }

    var track = document.getElementById("readProgress");
    var bar = document.getElementById("readProgressBar");
    var now = document.getElementById("topbarNow");

    if (track) {
      track.hidden = true;
      track.setAttribute("aria-valuenow", "0");
    }
    if (bar) bar.style.width = "0%";
    if (now) {
      now.textContent = "";
      now.classList.remove("is-in");
    }

    active = null;
  };

  /* Left / right arrows move between chapters. */
  reader.initShortcuts = function () {
    document.addEventListener("keydown", function (event) {
      if (!active) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      var tag = (event.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (!document.getElementById("lightbox").hidden) return;

      var chapters = QS.book.chapters || [];
      var target = null;

      if (event.key === "ArrowRight") target = chapters[active.position + 1];
      else if (event.key === "ArrowLeft") target = chapters[active.position - 1];
      else return;

      if (target) {
        event.preventDefault();
        window.location.hash = "#/chapter/" + target.slug;
      }
    });
  };

  QS.reader = reader;
})(window.QS);
