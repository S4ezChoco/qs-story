/* ============================================================
   media.js — audio player, video, photos, lightbox
   ============================================================ */

(function (QS) {
  "use strict";

  var util = QS.util;
  var el = util.el;
  var icon = util.icon;

  var media = {};
  var players = [];
  var lb = {};
  var lastFocus = null;

  /* — the file is not in assets/media yet ————————————
     Two shapes for the same idea. A note sits under an audio player;
     a slot stands in for a picture or a video so the empty state looks
     like a frame waiting to be filled instead of an error. */

  function fileName(path) {
    return String(path || "").split("/").pop();
  }

  function slot(kind, path) {
    return el("div", { class: "slot slot--" + kind }, [
      icon(kind === "video" ? "video" : "photo"),
      el("p", { class: "slot__name", text: fileName(path) }),
      el("p", { class: "slot__hint", text: "not in assets/media yet" })
    ]);
  }

  function caption(text) {
    return text ? el("p", { class: "media__cap", text: text }) : null;
  }

  function wrap(cls, block, children) {
    var classes = "media " + cls + (block.wide ? " media--wide" : "");
    return el("div", { class: classes }, children);
  }

  /* ============================================================
     photos
     ============================================================ */

  function frame(item, tile) {
    var img = el("img", {
      src: item.src,
      alt: item.alt || "",
      loading: "lazy",
      decoding: "async"
    });

    var button = el(
      "button",
      {
        class: "figure__frame",
        type: "button",
        "aria-label": "Open photo" + (item.alt ? ": " + item.alt : ""),
        onclick: function () {
          media.openLightbox(item.src, item.alt || "", item.caption || "");
        }
      },
      [img, el("span", { class: "figure__zoom" }, [icon("zoom")])]
    );

    img.addEventListener("error", function () {
      var stand = slot(tile ? "tile" : "photo", item.src);
      if (button.parentNode) button.parentNode.replaceChild(stand, button);
    });

    return button;
  }

  media.figure = function (block) {
    return wrap("figure", block, [
      el("figure", {}, [frame(block, false), caption(block.caption)])
    ]);
  };

  media.gallery = function (block) {
    var items = (block.items || []).map(function (item) {
      return frame(item, true);
    });

    return wrap("figure", block, [
      el("figure", {}, [
        el("div", { class: "gallery" }, items),
        caption(block.caption)
      ])
    ]);
  };

  /* ============================================================
     audio
     ============================================================ */

  media.audio = function (block) {
    var audio = el("audio", { src: block.src, preload: "metadata" });

    var play = el(
      "button",
      { class: "player__play", type: "button", "aria-label": "Play audio" },
      [icon("play", "ico-play"), icon("pause", "ico-pause")]
    );

    var now = el("span", { class: "player__time", text: "0:00" });
    var end = el("span", { class: "player__time", text: "\u2013:\u2013\u2013" });

    var seek = el("input", {
      class: "seek",
      type: "range",
      min: "0",
      max: "1000",
      value: "0",
      step: "1",
      "aria-label": "Seek",
      disabled: true
    });

    var player = el("div", { class: "player" }, [
      play,
      el("div", { class: "player__body" }, [
        el("p", { class: "player__label" }, [
          icon("audio"),
          block.label || "Audio"
        ]),
        block.title ? el("p", { class: "player__title", text: block.title }) : null,
        el("div", { class: "player__row" }, [now, seek, end])
      ]),
      audio
    ]);

    var box = wrap("audioblock", block, [player, caption(block.caption)]);
    var seeking = false;

    function paint() {
      var d = audio.duration;
      if (!isFinite(d) || d <= 0) return;
      var ratio = util.clamp(audio.currentTime / d, 0, 1);
      if (!seeking) seek.value = String(Math.round(ratio * 1000));
      seek.style.setProperty("--played", (ratio * 100).toFixed(2) + "%");
      now.textContent = util.clock(audio.currentTime);
    }

    audio.addEventListener("loadedmetadata", function () {
      seek.disabled = false;
      end.textContent = util.clock(audio.duration);
    });

    audio.addEventListener("timeupdate", paint);

    audio.addEventListener("play", function () {
      players.forEach(function (other) {
        if (other !== audio) other.pause();
      });
      player.classList.add("is-playing");
      play.setAttribute("aria-label", "Pause audio");
    });

    audio.addEventListener("pause", function () {
      player.classList.remove("is-playing");
      play.setAttribute("aria-label", "Play audio");
    });

    audio.addEventListener("ended", function () {
      player.classList.remove("is-playing");
      seek.value = "0";
      seek.style.setProperty("--played", "0%");
      now.textContent = "0:00";
    });

    /* No file behind it yet: keep the player, swap the transport for the
       filename it is waiting for. One box, no duplicate warning. */
    audio.addEventListener("error", function () {
      var row = player.querySelector(".player__row");

      player.classList.add("is-pending");
      play.disabled = true;
      play.setAttribute("aria-label", "Audio not available yet");

      if (row) {
        row.innerHTML = "";
        row.appendChild(
          el("span", {
            class: "player__waiting",
            text: "waiting for " + fileName(block.src)
          })
        );
      }
    });

    play.addEventListener("click", function () {
      if (audio.paused) {
        var maybe = audio.play();
        if (maybe && maybe.catch) maybe.catch(function () {});
      } else {
        audio.pause();
      }
    });

    seek.addEventListener("pointerdown", function () {
      seeking = true;
    });

    seek.addEventListener("input", function () {
      var d = audio.duration;
      if (!isFinite(d) || d <= 0) return;
      var ratio = Number(seek.value) / 1000;
      seek.style.setProperty("--played", (ratio * 100).toFixed(2) + "%");
      now.textContent = util.clock(ratio * d);
    });

    function commit() {
      var d = audio.duration;
      if (isFinite(d) && d > 0) audio.currentTime = (Number(seek.value) / 1000) * d;
      seeking = false;
    }

    seek.addEventListener("change", commit);
    seek.addEventListener("pointerup", commit);

    players.push(audio);
    return box;
  };

  /* ============================================================
     video
     ============================================================ */

  media.video = function (block) {
    var video = el("video", {
      src: block.src,
      poster: block.poster || null,
      controls: true,
      playsinline: true,
      preload: "metadata"
    });

    var shell = el("div", { class: "videoframe" }, [video]);
    var box = wrap("videoblock", block, [shell, caption(block.caption)]);

    video.addEventListener("play", function () {
      players.forEach(function (other) {
        if (other !== video) other.pause();
      });
    });

    video.addEventListener("error", function () {
      var stand = slot("video", block.src);
      if (shell.parentNode) shell.parentNode.replaceChild(stand, shell);
    });

    players.push(video);
    return box;
  };

  /* — pause everything (used when leaving a chapter) ————— */

  media.stopAll = function () {
    players.forEach(function (node) {
      try {
        node.pause();
      } catch (err) {}
    });
    players = [];
  };

  /* ============================================================
     lightbox
     ============================================================ */

  media.openLightbox = function (src, alt, cap) {
    if (!lb.root) return;
    lastFocus = document.activeElement;

    lb.img.setAttribute("src", src);
    lb.img.setAttribute("alt", alt || "");
    lb.cap.textContent = cap || "";
    lb.cap.hidden = !cap;

    lb.root.hidden = false;
    lb.root.classList.remove("is-out");
    document.body.style.overflow = "hidden";
    lb.close.focus({ preventScroll: true });
  };

  media.closeLightbox = function () {
    if (!lb.root || lb.root.hidden) return;
    lb.root.classList.add("is-out");
    document.body.style.overflow = "";

    window.setTimeout(function () {
      lb.root.hidden = true;
      lb.root.classList.remove("is-out");
      lb.img.removeAttribute("src");
    }, 160);

    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  media.initLightbox = function () {
    lb.root = document.getElementById("lightbox");
    if (!lb.root) return;
    lb.img = document.getElementById("lightboxImg");
    lb.cap = document.getElementById("lightboxCap");
    lb.close = document.getElementById("lightboxClose");

    lb.close.addEventListener("click", media.closeLightbox);

    lb.root.addEventListener("click", function (event) {
      if (event.target === lb.root || event.target.tagName === "FIGURE") {
        media.closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (lb.root.hidden) return;
      if (event.key === "Escape") media.closeLightbox();
      if (event.key === "Tab") {
        event.preventDefault();
        lb.close.focus();
      }
    });
  };

  QS.media = media;
})(window.QS);
