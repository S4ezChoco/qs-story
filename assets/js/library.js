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

    if (stats.photos) {
      out.push(
        el("span", { class: "chip" }, [
          icon("photo"),
          stats.photos + (stats.photos > 1 ? " photos" : " photo")
        ])
      );
    }
    if (stats.audio) {
      out.push(el("span", { class: "chip" }, [icon("audio"), "Audio"]));
    }
    if (stats.video) {
      out.push(el("span", { class: "chip" }, [icon("video"), "Video"]));
    }
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

  /* — the "how to use this" card. Delete the block below (and the
       .note-card rules in library.css) once the real story is in. — */

  function noteCard() {
    if (util.store.get(QS.config.keys.noteDismissed, false)) return null;

    var card = el("div", { class: "note-card", "data-rise": "120" }, [
      el("h2", { text: "Placeholder build" }),
      el("p", {
        html:
          "Everything you see is filler. Three files decide what shows up here:"
      }),
      el("ul", {}, [
        el("li", {
          html:
            "<code>assets/js/data.js</code> — chapters, paragraphs, quotes, and " +
            "which photo, audio or video sits where."
        }),
        el("li", {
          html:
            "<code>assets/media/</code> — drop your real photos, mp3s and mp4s " +
            "in here, then point <code>src</code> at them."
        }),
        el("li", {
          html:
            "<code>assets/js/config.js</code> — the passphrase hash and reading " +
            "settings."
        })
      ])
    ]);

    card.appendChild(
      el(
        "button",
        {
          class: "note-card__x",
          type: "button",
          "aria-label": "Dismiss this note",
          onclick: function () {
            util.store.set(QS.config.keys.noteDismissed, true);
            card.style.transition = "opacity 200ms";
            card.style.opacity = "0";
            window.setTimeout(function () {
              card.remove();
            }, 220);
          }
        },
        [icon("x")]
      )
    );

    return card;
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
      noteCard(),
      el("p", { class: "eyebrow index__head", text: "The chapters" }),
      list
    ]);

    var frag = document.createDocumentFragment();
    frag.appendChild(hero);
    frag.appendChild(index);
    return frag;
  };

  QS.library = library;
})(window.QS);
