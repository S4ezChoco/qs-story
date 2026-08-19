/* ============================================================
   config.js — site settings
   ============================================================ */

window.QS = window.QS || {};

QS.config = {
  /* Wordmark used in the tab title and the top bar. */
  name: "qs-story",

  /* ----------------------------------------------------------
     Passphrase
     ----------------------------------------------------------
     The current passphrase is:  tobleronewhite

     It is stored as a hash so it is not sitting in plain sight in
     the source. Be clear about what this is: a soft gate that keeps
     casual visitors out. Anyone determined enough can read the
     JavaScript, so do not treat this as real security — do not put
     anything here you would be hurt to have leaked.

     To change it: open the browser console on the site and run
        QS.util.digest("your new phrase")
     then paste the result below.

     Input is trimmed and lowercased before hashing, so "Tobleronewhite"
     and " tobleronewhite " both work.
     ---------------------------------------------------------- */
  passHash: "7ccf8ef1b34d336f",

  /* Where the unlock is remembered.
     "session" → re-asks every time the tab is closed (recommended)
     "local"   → stays unlocked on this device until Lock is pressed */
  unlockScope: "session",

  /* Reading speed used to estimate "x min read". */
  wordsPerMinute: 200,

  /* localStorage keys. */
  keys: {
    unlock: "qs.unlocked",
    theme: "qs.theme",
    progress: "qs.progress"
  }
};
