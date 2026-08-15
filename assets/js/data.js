/* ============================================================
   data.js — the whole book lives here
   ============================================================

   HOW TO ADD A CHAPTER
   Copy one of the objects in `chapters` and edit it. Order in this
   array is the order on the site.

     slug   unique id, used in the URL: #/chapter/<slug>
     title  chapter title
     dek    one line under the title
     date   "YYYY-MM-DD"
     blocks the chapter body, top to bottom

   BLOCK TYPES
     { type: "p",     text: "..." }                        paragraph
     { type: "lede",  text: "..." }                        opening paragraph
     { type: "h",     text: "..." }                        small section label
     { type: "quote", text: "...", cite: "optional" }      pull quote
     { type: "note",  text: "..." }                        tinted aside
     { type: "break" }                                     * * * divider
     { type: "image", src, alt, caption, wide: true }       one photo
     { type: "gallery", items: [{ src, alt, caption }] }    photo row
     { type: "audio", src, title, label, caption }          audio player
     { type: "video", src, poster, caption, wide: true }    video player

   MEDIA
   Drop your files in assets/media/ and point `src` at them, e.g.
   "assets/media/her-voice.mp3" or "assets/media/rooftop.mp4".
   Until a file exists the page shows a small placeholder card
   instead of a broken player, so nothing looks broken while you write.

   Text supports a little inline HTML: <em>, <strong>, <br>.
   ============================================================ */

(function (QS) {
  "use strict";

  var LOREM_A =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod " +
    "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim " +
    "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea " +
    "commodo consequat.";

  var LOREM_B =
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum " +
    "dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non " +
    "proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  var LOREM_C =
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem " +
    "accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab " +
    "illo inventore veritatis et quasi architecto beatae vitae dicta sunt " +
    "explicabo.";

  var LOREM_D =
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut " +
    "fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem " +
    "sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor " +
    "sit amet.";

  QS.book = {
    meta: {
      eyebrow: "A collection, unlisted",
      title: "Some of it was<br><em>real enough to keep.</em>",
      intro:
        "Placeholder introduction. This is where the collection gets its " +
        "opening note — a few lines about what these chapters are and why " +
        "they were written down instead of forgotten. Replace this text in " +
        "<code>assets/js/data.js</code>.",
      author: "qs"
    },

    chapters: [
      {
        slug: "the-first-time",
        title: "The First Time I Noticed",
        dek: "Placeholder subtitle for the opening chapter.",
        date: "2024-01-14",
        blocks: [
          { type: "lede", text: LOREM_A },
          { type: "p", text: LOREM_B },
          {
            type: "image",
            src: "assets/media/placeholder-1.svg",
            alt: "Placeholder photograph",
            caption: "Photo placeholder. Swap in a real picture later."
          },
          { type: "p", text: LOREM_C },
          {
            type: "quote",
            text: "A single line that carried more weight than the paragraph around it.",
            cite: "Placeholder quote"
          },
          { type: "p", text: LOREM_D },
          {
            type: "audio",
            src: "assets/media/voice-note-01.mp3",
            label: "Voice note",
            title: "Untitled, 2:14 in the morning",
            caption: "Audio placeholder — the player appears once the file exists."
          },
          { type: "p", text: LOREM_A }
        ]
      },

      {
        slug: "ordinary-days",
        title: "Ordinary Days, In Order",
        dek: "Placeholder subtitle. Small things, listed carefully.",
        date: "2024-02-08",
        blocks: [
          { type: "lede", text: LOREM_C },
          { type: "h", text: "Placeholder section" },
          { type: "p", text: LOREM_A },
          {
            type: "gallery",
            items: [
              {
                src: "assets/media/placeholder-2.svg",
                alt: "Placeholder photograph one"
              },
              {
                src: "assets/media/placeholder-3.svg",
                alt: "Placeholder photograph two"
              },
              {
                src: "assets/media/placeholder-1.svg",
                alt: "Placeholder photograph three"
              }
            ],
            caption: "Three placeholders. Add or remove items freely."
          },
          { type: "p", text: LOREM_B },
          { type: "break" },
          { type: "p", text: LOREM_D },
          {
            type: "audio",
            src: "assets/media/song-01.mp3",
            label: "The song",
            title: "Placeholder track title",
            caption: "This one was playing the whole time."
          },
          { type: "p", text: LOREM_C }
        ]
      },

      {
        slug: "the-night-you-said-maybe",
        title: "The Night You Said Maybe",
        dek: "Placeholder subtitle for the chapter with the video in it.",
        date: "2024-03-22",
        blocks: [
          { type: "lede", text: LOREM_B },
          { type: "p", text: LOREM_A },
          {
            type: "video",
            src: "assets/media/clip-01.mp4",
            poster: "assets/media/placeholder-3.svg",
            wide: true,
            caption: "Video placeholder. Point src at your own clip."
          },
          { type: "p", text: LOREM_D },
          {
            type: "note",
            text:
              "Aside placeholder — use this for a small detail that does not " +
              "belong in the main flow. Timestamps, a translation, a footnote."
          },
          { type: "p", text: LOREM_C },
          {
            type: "quote",
            text: "Maybe is the longest word in any language."
          },
          { type: "p", text: LOREM_B }
        ]
      },

      {
        slug: "how-it-ended",
        title: "How It Ended, Quietly",
        dek: "Placeholder subtitle. No shouting, no scene.",
        date: "2024-05-30",
        blocks: [
          { type: "lede", text: LOREM_D },
          { type: "p", text: LOREM_C },
          {
            type: "image",
            src: "assets/media/placeholder-2.svg",
            alt: "Placeholder photograph",
            wide: true,
            caption: "Wide photo placeholder — set wide: true on the block."
          },
          { type: "p", text: LOREM_A },
          { type: "break" },
          { type: "p", text: LOREM_B },
          {
            type: "quote",
            text: "It did not break. It just stopped being held.",
            cite: "Placeholder"
          },
          { type: "p", text: LOREM_C }
        ]
      },

      {
        slug: "what-i-kept",
        title: "What I Kept",
        dek: "Placeholder subtitle for the short closing chapter.",
        date: "2024-07-11",
        blocks: [
          { type: "lede", text: LOREM_A },
          {
            type: "audio",
            src: "assets/media/voice-note-02.mp3",
            label: "Last recording",
            title: "Placeholder recording",
            caption: "Kept for no practical reason."
          },
          { type: "p", text: LOREM_D },
          { type: "p", text: LOREM_B }
        ]
      }
    ]
  };
})(window.QS);
