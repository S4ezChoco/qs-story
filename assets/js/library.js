/* ============================================================
   library.js — the home view: intro + chapter index
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var el = util.el;
  var icon = util.icon;

  var library = {};

  /* — media badges for one chapter ————————————————— */

  function chips(stats) {
    var out = [];

    function chip(name, count, one, many) {
      if (!count) return;
      out.push(
        el("span", { class: "chip" }, [
          icon(name),
          count > 1 ? count + " " + many : one
        ])
      );
    }

    chip("photo", stats.photos, "1 photo", "photos");
    chip("audio", stats.audio, "Audio", "audio");
    chip("video", stats.video, "Video", "videos");

    return out;
  }

  /* — one row in the index ——————————————————————— */

  function entry(chapter, index) {
    var stats = util.chapterStats(chapter);
    var pct = util.progress.get(chapter.slug);
    var href = "#/chapter/" + chapter.slug;

    var meta = [
      el("span", { class: "entry__stat", text: util.longDate(chapter.date) }),
      el("span", { class: "entry__stat", text: stats.minutes + " min read" })
    ].concat(chips(stats));

    if (pct >= 3) {
      meta.push(
        el("span", { class: "entry__read" }, [
          el("span", { class: "entry__readbar" }, [
            el("i", { style: "width:" + pct + "%" })
          ]),
          pct > 97 ? "Read" : pct + "%"
        ])
      );
    }

    return el(
      "li",
      { class: "entry", "data-rise": String(Math.min(index, 6) * 70) },
      [
        el("p", { class: "entry__num", text: util.pad2(index + 1) }),
        el("div", { class: "entry__body" }, [
          el("a", { class: "entry__link", href: href, "data-link": true }, [
            el("h2", { class: "entry__title", text: chapter.title })
          ]),
          chapter.dek ? el("p", { class: "entry__dek", text: chapter.dek }) : null,
          el("div", { class: "entry__meta" }, meta)
        ]),
        el("span", { class: "entry__go", "aria-hidden": "true" }, [
          icon("arrowRight")
        ])
      ]
    );
  }

  /* — continue reading ————————————————————————— */

  function resumeCard(chapters) {
    var found = util.progress.resume(chapters);
    if (!found) return null;

    var R = 12;
    var circumference = 2 * Math.PI * R;
    var offset = circumference * (1 - found.percent / 100);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 28 28");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<circle class="resume__track" cx="14" cy="14" r="' +
      R +
      '"/><circle class="resume__fill" cx="14" cy="14" r="' +
      R +
      '" stroke-dasharray="' +
      circumference.toFixed(2) +
      '" stroke-dashoffset="' +
      offset.toFixed(2) +
      '"/>';

    return el(
      "a",
      {
        class: "resume",
        href: "#/chapter/" + found.chapter.slug,
        "data-link": true,
        "data-rise": "0"
      },
      [
        el("span", { class: "resume__ring" }, [svg]),
        el("span", { class: "resume__body" }, [
          el("span", { class: "resume__kicker", text: "Continue reading" }),
          el("span", { class: "resume__title", text: found.chapter.title })
        ]),
        el("span", { class: "resume__pct", text: found.percent + "%" })
      ]
    );
  }

  /* — render ————————————————————————————————————— */

  library.render = function () {
    var book = QS.book;
    var chapters = book.chapters || [];
    var meta = book.meta || {};

    var totals = chapters.reduce(
      function (acc, chapter) {
        var stats = util.chapterStats(chapter);
        acc.minutes += stats.minutes;
        acc.media += stats.audio + stats.video + stats.photos;
        return acc;
      },
      { minutes: 0, media: 0 }
    );

    var hero = el("header", { class: "hero shell" }, [
      el("p", { class: "eyebrow", text: meta.eyebrow || "" , "data-rise": "0" }),
      el("h1", {
        class: "display hero__title",
        html: meta.title || "",
        "data-rise": "60"
      }),
      el("p", { class: "hero__intro", html: meta.intro || "", "data-rise": "120" }),
      el("div", { class: "hero__meta", "data-rise": "180" }, [
        el("span", { text: chapters.length + " chapters" }),
        el("span", { text: "~" + totals.minutes + " min total" }),
        el("span", { text: totals.media + " media pieces" })
      ])
    ]);

    var list = el(
      "ol",
      { class: "index__list" },
      chapters.map(function (chapter, index) {
        return entry(chapter, index);
      })
    );

    var index = el("section", { class: "index shell" }, [
      resumeCard(chapters),
      el("p", { class: "eyebrow index__head", text: meta.indexLabel || "Chapters" }),
      list
    ]);

    var frag = document.createDocumentFragment();
    frag.appendChild(hero);
    frag.appendChild(index);
    return frag;
  };

  QS.library = library;
})(window.QS);
