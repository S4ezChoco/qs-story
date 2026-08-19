/* ============================================================
   data.js — the cover of the book
   ============================================================

   This file holds the front page copy and an empty chapter list.
   The chapters themselves live in assets/js/chapters/, one file each,
   and they push into QS.book.chapters in the order the <script> tags
   appear in index.html. Reorder those tags to reorder the book.

   HOW TO ADD A CHAPTER
   Copy a file in assets/js/chapters/, edit it, then add a matching
   <script> line in index.html.

     slug   unique id, used in the URL: #/chapter/<slug>
     title  chapter title
     dek    one line under the title
     date   "2026-01-16" | "2026-01" | any free text like "Jan – Feb 2026"
     blocks the chapter body, top to bottom

   BLOCK TYPES
     { type: "lede",  text: "..." }                        opening paragraph
     { type: "p",     text: "..." }                        paragraph
     { type: "h",     text: "..." }                        small section label
     { type: "quote", text: "...", cite: "optional" }      pull quote
     { type: "message", from: "", via: "", text: "" }      a message, quoted whole
     { type: "note",  text: "..." }                        tinted aside
     { type: "break" }                                     * * * divider
     { type: "image", src, alt, caption, wide: true }       one photo
     { type: "gallery", items: [{ src, alt }], caption }    photo row
     { type: "audio", src, title, label, caption }          audio player
     { type: "video", src, poster, caption, wide: true }    video player

   MEDIA
   Every src below points at a file that does not exist yet. Until you
   save it, the page shows a dashed frame with the exact filename it is
   waiting for. Drop the file in assets/media/ using that name and it
   appears on its own — no code change needed.

   Text supports a little inline HTML: <em>, <strong>, <br>.
   In a "message" block, leave the words exactly as they were sent.
   A blank line inside the text starts a new paragraph.
   ============================================================ */

(function (QS) {
  "use strict";

  QS.book = {
    meta: {
      eyebrow: "August 2024 — March 2026",
      title: "Kwento ni chocs</em>",
      intro:
        "6 chapters onti lang yan HAHAHAHA ",
      indexLabel: "The chapters",
      author: "sean"
    },

    /* Filled in by the files in assets/js/chapters/. */
    chapters: []
  };
})(window.QS);
