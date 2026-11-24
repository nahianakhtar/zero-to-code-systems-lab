/* ==========================================================================
   js/telemetry.js — Strict Scoped Keystroke Telemetry & LocalStorage Vault
   PRIVACY GUARANTEE:
   - Attaches keydown/keyup ONLY to explicitly bound practice/answer inputs.
   - Never attaches global window/document keyloggers.
   - Stores 100% of data locally in browser localStorage ('cs_trainer_vault_v1').
   ========================================================================== */

(function () {
  "use strict";

  window.CSTrainer = window.CSTrainer || {};

  var STORAGE_KEY = "cs_trainer_vault_v1";
  var SCHEMA_VERSION = 1;

  // Complete ANSI Visual Keyboard Layout & Ergonomic Finger Mapping
  var KEYBOARD_ROWS = [
    [
      { code: "Backquote", main: "`", shift: "~", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", row: 0, col: 0 },
      { code: "Digit1", main: "1", shift: "!", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", row: 0, col: 1 },
      { code: "Digit2", main: "2", shift: "@", finger: "L-Ring", hand: "left", zone: "zone-l-ring", row: 0, col: 2 },
      { code: "Digit3", main: "3", shift: "#", finger: "L-Middle", hand: "left", zone: "zone-l-middle", row: 0, col: 3 },
      { code: "Digit4", main: "4", shift: "$", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 0, col: 4 },
      { code: "Digit5", main: "5", shift: "%", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 0, col: 5 },
      { code: "Digit6", main: "6", shift: "^", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 0, col: 6 },
      { code: "Digit7", main: "7", shift: "&", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 0, col: 7 },
      { code: "Digit8", main: "8", shift: "*", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 0, col: 8 },
      { code: "Digit9", main: "9", shift: "(", finger: "R-Ring", hand: "right", zone: "zone-r-ring", row: 0, col: 9 },
      { code: "Digit0", main: "0", shift: ")", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 0, col: 10 },
      { code: "Minus", main: "-", shift: "_", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 0, col: 11 },
      { code: "Equal", main: "=", shift: "+", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 0, col: 12 },
      { code: "Backspace", main: "Bksp", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", width: "w-200", row: 0, col: 13 }
    ],
    [
      { code: "Tab", main: "Tab", shift: "", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", width: "w-150", row: 1, col: 0 },
      { code: "KeyQ", main: "q", shift: "Q", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", row: 1, col: 1 },
      { code: "KeyW", main: "w", shift: "W", finger: "L-Ring", hand: "left", zone: "zone-l-ring", row: 1, col: 2 },
      { code: "KeyE", main: "e", shift: "E", finger: "L-Middle", hand: "left", zone: "zone-l-middle", row: 1, col: 3 },
      { code: "KeyR", main: "r", shift: "R", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 1, col: 4 },
      { code: "KeyT", main: "t", shift: "T", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 1, col: 5 },
      { code: "KeyY", main: "y", shift: "Y", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 1, col: 6 },
      { code: "KeyU", main: "u", shift: "U", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 1, col: 7 },
      { code: "KeyI", main: "i", shift: "I", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 1, col: 8 },
      { code: "KeyO", main: "o", shift: "O", finger: "R-Ring", hand: "right", zone: "zone-r-ring", row: 1, col: 9 },
      { code: "KeyP", main: "p", shift: "P", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 1, col: 10 },
      { code: "BracketLeft", main: "[", shift: "{", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 1, col: 11 },
      { code: "BracketRight", main: "]", shift: "}", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 1, col: 12 },
      { code: "Backslash", main: "\\", shift: "|", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", width: "w-150", row: 1, col: 13 }
    ],
    [
      { code: "CapsLock", main: "Caps", shift: "", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", width: "w-175", row: 2, col: 0 },
      { code: "KeyA", main: "a", shift: "A", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", row: 2, col: 1 },
      { code: "KeyS", main: "s", shift: "S", finger: "L-Ring", hand: "left", zone: "zone-l-ring", row: 2, col: 2 },
      { code: "KeyD", main: "d", shift: "D", finger: "L-Middle", hand: "left", zone: "zone-l-middle", row: 2, col: 3 },
      { code: "KeyF", main: "f", shift: "F", finger: "L-Index", hand: "left", zone: "zone-l-index", bump: true, row: 2, col: 4 },
      { code: "KeyG", main: "g", shift: "G", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 2, col: 5 },
      { code: "KeyH", main: "h", shift: "H", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 2, col: 6 },
      { code: "KeyJ", main: "j", shift: "J", finger: "R-Index", hand: "right", zone: "zone-r-index", bump: true, row: 2, col: 7 },
      { code: "KeyK", main: "k", shift: "K", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 2, col: 8 },
      { code: "KeyL", main: "l", shift: "L", finger: "R-Ring", hand: "right", zone: "zone-r-ring", row: 2, col: 9 },
      { code: "Semicolon", main: ";", shift: ":", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 2, col: 10 },
      { code: "Quote", main: "'", shift: "\"", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 2, col: 11 },
      { code: "Enter", main: "Enter", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", width: "w-225", row: 2, col: 12 }
    ],
    [
      { code: "ShiftLeft", main: "Shift", shift: "", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", width: "w-225", row: 3, col: 0 },
      { code: "KeyZ", main: "z", shift: "Z", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", row: 3, col: 1 },
      { code: "KeyX", main: "x", shift: "X", finger: "L-Ring", hand: "left", zone: "zone-l-ring", row: 3, col: 2 },
      { code: "KeyC", main: "c", shift: "C", finger: "L-Middle", hand: "left", zone: "zone-l-middle", row: 3, col: 3 },
      { code: "KeyV", main: "v", shift: "V", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 3, col: 4 },
      { code: "KeyB", main: "b", shift: "B", finger: "L-Index", hand: "left", zone: "zone-l-index", row: 3, col: 5 },
      { code: "KeyN", main: "n", shift: "N", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 3, col: 6 },
      { code: "KeyM", main: "m", shift: "M", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 3, col: 7 },
      { code: "Comma", main: ",", shift: "<", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 3, col: 8 },
      { code: "Period", main: ".", shift: ">", finger: "R-Ring", hand: "right", zone: "zone-r-ring", row: 3, col: 9 },
      { code: "Slash", main: "/", shift: "?", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 3, col: 10 },
      { code: "ShiftRight", main: "Shift", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", width: "w-225", row: 3, col: 11 }
    ],
    [
      { code: "ControlLeft", main: "Ctrl", shift: "", finger: "L-Pinky", hand: "left", zone: "zone-l-pinky", width: "w-125", row: 4, col: 0 },
      { code: "AltLeft", main: "Alt", shift: "", finger: "L-Thumb", hand: "left", zone: "zone-thumb", width: "w-125", row: 4, col: 1 },
      { code: "Space", main: "Space", shift: "", finger: "R-Thumb", hand: "right", zone: "zone-thumb", width: "w-600", row: 4, col: 2 },
      { code: "AltRight", main: "Alt", shift: "", finger: "R-Thumb", hand: "right", zone: "zone-thumb", width: "w-125", row: 4, col: 3 },
      { code: "ControlRight", main: "Ctrl", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", width: "w-125", row: 4, col: 4 },
      { code: "Home", main: "Home", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 4, col: 5 },
      { code: "End", main: "End", shift: "", finger: "R-Pinky", hand: "right", zone: "zone-r-pinky", row: 4, col: 6 },
      { code: "ArrowLeft", main: "\u2190", shift: "", finger: "R-Index", hand: "right", zone: "zone-r-index", row: 4, col: 7 },
      { code: "ArrowUp", main: "\u2191", shift: "", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 4, col: 8 },
      { code: "ArrowDown", main: "\u2193", shift: "", finger: "R-Middle", hand: "right", zone: "zone-r-middle", row: 4, col: 9 },
      { code: "ArrowRight", main: "\u2192", shift: "", finger: "R-Ring", hand: "right", zone: "zone-r-ring", row: 4, col: 10 }
    ]
  ];

  var FINGER_LABELS = {
    "L-Pinky": "Left Pinky",
    "L-Ring": "Left Ring",
    "L-Middle": "Left Middle",
    "L-Index": "Left Index (F Anchor)",
    "L-Thumb": "Left Thumb",
    "R-Thumb": "Right Thumb",
    "R-Index": "Right Index (J Anchor)",
    "R-Middle": "Right Middle",
    "R-Ring": "Right Ring",
    "R-Pinky": "Right Pinky"
  };

  // Build fast lookup tables for characters & physical key codes
  var CHAR_MAP = {};
  var CODE_MAP = {};

  (function buildLookupMaps() {
    for (var r = 0; r < KEYBOARD_ROWS.length; r++) {
      var row = KEYBOARD_ROWS[r];
      for (var c = 0; c < row.length; c++) {
        var k = row[c];
        CODE_MAP[k.code] = k;
        if (k.main && k.main.length === 1 && k.code.indexOf("Arrow") !== 0) {
          CHAR_MAP[k.main] = {
            char: k.main,
            code: k.code,
            needsShift: false,
            shiftCode: null,
            finger: k.finger,
            hand: k.hand,
            row: k.row,
            col: k.col
          };
        }
        if (k.shift && k.shift.length === 1) {
          var oppositeShift = k.hand === "left" ? "ShiftRight" : "ShiftLeft";
          var oppositeFinger = k.hand === "left" ? "R-Pinky" : "L-Pinky";
          CHAR_MAP[k.shift] = {
            char: k.shift,
            code: k.code,
            needsShift: true,
            shiftCode: oppositeShift,
            shiftFinger: oppositeFinger,
            finger: k.finger,
            hand: k.hand,
            row: k.row,
            col: k.col
          };
        }
      }
    }
    CHAR_MAP[" "] = {
      char: " ",
      code: "Space",
      needsShift: false,
      shiftCode: null,
      finger: "R-Thumb",
      hand: "right",
      row: 4,
      col: 2
    };
    CHAR_MAP["\n"] = {
      char: "\n",
      code: "Enter",
      needsShift: false,
      shiftCode: null,
      finger: "R-Pinky",
      hand: "right",
      row: 2,
      col: 12
    };
    CHAR_MAP["\t"] = {
      char: "\t",
      code: "Tab",
      needsShift: false,
      shiftCode: null,
      finger: "L-Pinky",
      hand: "left",
      row: 1,
      col: 0
    };
  })();

  function createFreshVault() {
    return {
      schemaVersion: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: "dark",
        keyboardVisible: true,
        showHeatmap: true,
        macMode: false
      },
      lifetimeTyping: {
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        errorKeystrokes: 0,
        backspaces: 0,
        activeTypingMs: 0,
        latencySamples: [],
        keyStats: {},
        bigramStats: {},
        slipMatrix: {}
      },
      moduleMastery: {},
      conceptState: {},
      mistakeHistory: [],
      shortcutStats: {},
      drillHistory: [],
      benchmarkHistory: []
    };
  }

  // Safe localStorage wrapper with in-memory fallback
  var memoryFallback = null;
  function readStorageRaw() {
    try {
      if (window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
    } catch (err) {
      // Restricted file/sandbox fallback
    }
    return memoryFallback;
  }

  function writeStorageRaw(str) {
    memoryFallback = str;
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, str);
      }
    } catch (err) {
      // Keep memoryFallback synchronized
    }
  }

  function clearStorageRaw() {
    memoryFallback = null;
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      // Ignore storage error
    }
  }

  var vault = (function loadVault() {
    var raw = readStorageRaw();
    if (!raw) {
      return createFreshVault();
    }
    try {
      var parsed = JSON.parse(raw);
      var fresh = createFreshVault();
      // Merge top-level keys defensively
      for (var key in fresh) {
        if (Object.prototype.hasOwnProperty.call(fresh, key) && parsed[key] === undefined) {
          parsed[key] = fresh[key];
        }
      }
      return parsed;
    } catch (err) {
      return createFreshVault();
    }
  })();

  var listeners = [];
  function subscribe(fn) {
    if (typeof fn === "function") {
      listeners.push(fn);
    }
  }

  function notify(eventType, payload) {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](eventType, payload);
      } catch (err) {
        // Prevent listener error from breaking input handling
      }
    }
  }

  function saveVault() {
    vault.updatedAt = new Date().toISOString();
    writeStorageRaw(JSON.stringify(vault));
    notify("vault-updated", vault);
  }

  function medianOf(arr) {
    if (!arr || arr.length === 0) {
      return 0;
    }
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return Math.round(sorted[mid]);
  }

  function percentileOf(arr, p) {
    if (!arr || arr.length === 0) {
      return 0;
    }
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
    return Math.round(sorted[idx]);
  }

  function classifySlip(expectedChar, typedChar) {
    var exp = CHAR_MAP[expectedChar];
    var act = CHAR_MAP[typedChar];
    if (!exp || !act) {
      return "Character substitution slip";
    }
    if (exp.code === act.code && exp.needsShift !== act.needsShift) {
      return exp.needsShift
        ? "Missed Shift modifier on '" + expectedChar + "'"
        : "Held Shift too long on '" + expectedChar + "'";
    }
    if (exp.row === act.row && Math.abs(exp.col - act.col) === 1) {
      return "Adjacent horizontal neighbor slip (" + FINGER_LABELS[act.finger] + ")";
    }
    if (exp.finger === act.finger && exp.row !== act.row) {
      return "Vertical row-reach slip on " + FINGER_LABELS[exp.finger];
    }
    if (exp.hand !== act.hand && exp.row === act.row) {
      return "Opposite-hand mirror confusion";
    }
    var symRegex = /[{}[\]()<>:;'"`|\\/?!@#$%^&*\-+=~]/;
    if (symRegex.test(expectedChar) || symRegex.test(typedChar)) {
      return "Developer symbol reach slip (" + FINGER_LABELS[exp.finger] + ")";
    }
    return "Finger coordination slip (" + FINGER_LABELS[exp.finger] + " \u2192 " + FINGER_LABELS[act.finger] + ")";
  }

  function ensureKeyStat(ch) {
    var ks = vault.lifetimeTyping.keyStats;
    if (!ks[ch]) {
      ks[ch] = {
        attempts: 0,
        hits: 0,
        misses: 0,
        latencySumMs: 0,
        latencyCount: 0,
        maxLatencyMs: 0,
        hesitations: 0,
        dwellSumMs: 0,
        dwellCount: 0,
        backspacesAfter: 0
      };
    }
    return ks[ch];
  }

  // Create an isolated session/round tracker (for 10-question round, drill, or benchmark)
  function createSessionTracker(contextLabel) {
    return {
      contextLabel: contextLabel || "practice",
      startedAt: null,
      lastEventAt: null,
      lastKeyDownAt: null,
      lastKeyUpAt: null,
      lastChar: null,
      activeTypingMs: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      errorKeystrokes: 0,
      backspaces: 0,
      latencies: [],
      keyLatencies: {},
      slips: [],
      downTimestampsByCode: {}
    };
  }

  function summarizeTracker(tracker) {
    var minutes = Math.max(tracker.activeTypingMs / 60000, 1 / 120); // floor 0.5s to prevent div-by-zero
    var grossWpm = tracker.totalKeystrokes > 0
      ? Math.round((tracker.totalKeystrokes / 5) / minutes)
      : 0;
    var netChars = Math.max(0, tracker.correctKeystrokes - Math.floor(tracker.errorKeystrokes * 0.5));
    var netWpm = tracker.totalKeystrokes > 0
      ? Math.round((netChars / 5) / minutes)
      : 0;
    var accuracyPct = tracker.totalKeystrokes > 0
      ? Math.round((tracker.correctKeystrokes / tracker.totalKeystrokes) * 1000) / 10
      : 100;
    var medLatency = medianOf(tracker.latencies);
    var p90Latency = percentileOf(tracker.latencies, 90);

    var hesitantList = [];
    for (var ch in tracker.keyLatencies) {
      if (Object.prototype.hasOwnProperty.call(tracker.keyLatencies, ch)) {
        var arr = tracker.keyLatencies[ch];
        var avg = Math.round(arr.reduce(function (s, v) { return s + v; }, 0) / arr.length);
        if (avg >= 250 || arr.some(function (v) { return v >= 340; })) {
          hesitantList.push({ char: ch, avgMs: avg, count: arr.length });
        }
      }
    }
    hesitantList.sort(function (a, b) { return b.avgMs - a.avgMs; });

    return {
      contextLabel: tracker.contextLabel,
      totalKeystrokes: tracker.totalKeystrokes,
      correctKeystrokes: tracker.correctKeystrokes,
      errorKeystrokes: tracker.errorKeystrokes,
      backspaces: tracker.backspaces,
      activeTypingMs: Math.round(tracker.activeTypingMs),
      grossWpm: grossWpm,
      netWpm: netWpm,
      accuracyPct: accuracyPct,
      medianLatencyMs: medLatency,
      p90LatencyMs: p90Latency,
      hesitantKeys: hesitantList.slice(0, 6),
      slips: tracker.slips.slice(0, 20)
    };
  }

  /**
   * STRICT SCOPED INPUT BINDING:
   * Captures keydown and keyup ONLY on `inputEl` while `document.activeElement === inputEl`.
   * config:
   *   - label: human-readable scope name (e.g., "Type-to-Lock-In Box")
   *   - getExpectedText: function() -> string target text
   *   - tracker: optional session tracker from createSessionTracker()
   *   - onProgress: function(currentValue, expectedText, matchInfo)
   *   - onComplete: function(summary)
   *   - allowNewlines: boolean (for multi-line code boxes)
   */
  function bindPracticeInput(inputEl, config) {
    if (!inputEl) {
      return function noop() {};
    }
    var opts = config || {};
    var tracker = opts.tracker || createSessionTracker(opts.label || "Scoped Input");
    var scopeLabel = opts.label || "Practice Input";
    var hadRecentError = false;
    var lastExpectedOnError = null;

    function updateNextKeyVisual() {
      if (document.activeElement !== inputEl) {
        return;
      }
      var target = typeof opts.getExpectedText === "function" ? (opts.getExpectedText() || "") : "";
      var val = inputEl.value || "";
      // Find first mismatch index or next required char index
      var idx = 0;
      while (idx < val.length && idx < target.length && val[idx] === target[idx]) {
        idx++;
      }
      if (val.length > idx) {
        // User has a typo in buffer: guide them to Backspace!
        notify("next-key-guidance", getKeyGuidance("Backspace", "Typo detected — tap Backspace (Right Pinky) without looking down"));
        return;
      }
      if (idx < target.length) {
        notify("next-key-guidance", getKeyGuidance(target[idx]));
      } else if (target.length > 0) {
        notify("next-key-guidance", getKeyGuidance("Enter", "Locked in! Press Enter to submit"));
      }
    }

    function onFocus() {
      notify("scope-status", { armed: true, label: scopeLabel });
      updateNextKeyVisual();
    }

    function onBlur() {
      notify("scope-status", { armed: false, label: "Outside Input" });
    }

    function onKeyDown(e) {
      // STRICT SCOPE GUARD: ignore anything if not directly focused on this exact input
      if (e.currentTarget !== inputEl || document.activeElement !== inputEl) {
        return;
      }

      var now = performance.now();
      tracker.downTimestampsByCode[e.code] = now;

      // Handle Tab indentation cleanly inside multiline code boxes
      if (e.key === "Tab" && opts.allowTabIndent) {
        e.preventDefault();
        var start = inputEl.selectionStart || 0;
        var end = inputEl.selectionEnd || 0;
        var cur = inputEl.value || "";
        inputEl.value = cur.slice(0, start) + "  " + cur.slice(end);
        inputEl.selectionStart = inputEl.selectionEnd = start + 2;
        inputEl.dispatchEvent(new Event("input", { bubbles: false }));
        return;
      }

      // Ignore pure modifier presses for WPM/accuracy counts, still flash keycap
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "CapsLock") {
        notify("key-flash", { code: e.code, ok: true });
        return;
      }

      // Handle Enter submission when locked in on single-line inputs
      if (e.key === "Enter" && !opts.allowNewlines) {
        if (typeof opts.onEnterSubmit === "function") {
          e.preventDefault();
          opts.onEnterSubmit();
        }
        return;
      }

      // Handle Backspace / Delete tracking
      if (e.key === "Backspace" || e.key === "Delete") {
        tracker.backspaces += 1;
        vault.lifetimeTyping.backspaces += 1;
        if (hadRecentError && lastExpectedOnError) {
          var errStat = ensureKeyStat(lastExpectedOnError);
          errStat.backspacesAfter += 1;
        }
        hadRecentError = false;
        notify("key-flash", { code: "Backspace", ok: true });
        saveVault();
        return;
      }

      // Only score printable characters (or Enter in multiline mode)
      var typedChar = e.key === "Enter" && opts.allowNewlines ? "\n" : e.key;
      if (!typedChar || typedChar.length !== 1) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Active typing elapsed accumulation (clamp idle pauses > 4.5s to 1.2s)
      if (tracker.lastEventAt !== null) {
        var delta = now - tracker.lastEventAt;
        var boundedDelta = Math.min(Math.max(delta, 0), delta > 4500 ? 1200 : delta);
        tracker.activeTypingMs += boundedDelta;
        vault.lifetimeTyping.activeTypingMs += boundedDelta;
      } else {
        tracker.startedAt = now;
        tracker.activeTypingMs += 180;
        vault.lifetimeTyping.activeTypingMs += 180;
      }
      tracker.lastEventAt = now;

      // Key-to-key hesitation latency (handles rollover typing cleanly)
      var latencyMs = null;
      if (tracker.lastKeyDownAt !== null) {
        var rawFlight = tracker.lastKeyUpAt !== null && tracker.lastKeyUpAt >= tracker.lastKeyDownAt
          ? now - tracker.lastKeyUpAt
          : now - tracker.lastKeyDownAt;
        if (rawFlight >= 0 && rawFlight <= 3500) {
          latencyMs = Math.round(Math.max(15, rawFlight));
          tracker.latencies.push(latencyMs);
          vault.lifetimeTyping.latencySamples.push(latencyMs);
          if (vault.lifetimeTyping.latencySamples.length > 600) {
            vault.lifetimeTyping.latencySamples.shift();
          }
        }
      }
      tracker.lastKeyDownAt = now;

      // Determine expected character at current cursor position
      var target = typeof opts.getExpectedText === "function" ? (opts.getExpectedText() || "") : "";
      var pos = typeof inputEl.selectionStart === "number" ? inputEl.selectionStart : (inputEl.value || "").length;
      var expectedChar = pos < target.length ? target[pos] : null;

      tracker.totalKeystrokes += 1;
      vault.lifetimeTyping.totalKeystrokes += 1;

      var statKey = expectedChar || typedChar;
      var kStat = ensureKeyStat(statKey);
      kStat.attempts += 1;

      if (latencyMs !== null) {
        kStat.latencySumMs += latencyMs;
        kStat.latencyCount += 1;
        if (latencyMs > kStat.maxLatencyMs) {
          kStat.maxLatencyMs = latencyMs;
        }
        if (latencyMs > 280) {
          kStat.hesitations += 1;
        }
        if (!tracker.keyLatencies[statKey]) {
          tracker.keyLatencies[statKey] = [];
        }
        tracker.keyLatencies[statKey].push(latencyMs);

        if (tracker.lastChar) {
          var bgKey = tracker.lastChar + "->" + statKey;
          var bg = vault.lifetimeTyping.bigramStats[bgKey] || { sumMs: 0, count: 0 };
          bg.sumMs += latencyMs;
          bg.count += 1;
          vault.lifetimeTyping.bigramStats[bgKey] = bg;
        }
      }

      var isCorrect = expectedChar === null ? true : typedChar === expectedChar;
      if (isCorrect) {
        tracker.correctKeystrokes += 1;
        vault.lifetimeTyping.correctKeystrokes += 1;
        kStat.hits += 1;
        hadRecentError = false;
        notify("key-flash", { code: e.code, ok: true });
      } else {
        tracker.errorKeystrokes += 1;
        vault.lifetimeTyping.errorKeystrokes += 1;
        kStat.misses += 1;
        hadRecentError = true;
        lastExpectedOnError = expectedChar;

        var reason = classifySlip(expectedChar, typedChar);
        var slipKey = expectedChar + "->" + typedChar;
        var existingSlip = vault.lifetimeTyping.slipMatrix[slipKey] || {
          expected: expectedChar,
          typed: typedChar,
          count: 0,
          reason: reason
        };
        existingSlip.count += 1;
        vault.lifetimeTyping.slipMatrix[slipKey] = existingSlip;

        tracker.slips.push({
          expected: expectedChar,
          typed: typedChar,
          reason: reason,
          latencyMs: latencyMs
        });
        notify("key-flash", { code: e.code, ok: false });
      }

      tracker.lastChar = statKey;
      saveVault();
    }

    function onKeyUp(e) {
      if (e.currentTarget !== inputEl || document.activeElement !== inputEl) {
        return;
      }
      var now = performance.now();
      tracker.lastKeyUpAt = now;
      var downAt = tracker.downTimestampsByCode[e.code];
      if (downAt) {
        var dwell = Math.round(Math.min(Math.max(now - downAt, 5), 1500));
        delete tracker.downTimestampsByCode[e.code];
        if (e.key && e.key.length === 1) {
          var st = ensureKeyStat(e.key);
          st.dwellSumMs += dwell;
          st.dwellCount += 1;
        }
      }
      updateNextKeyVisual();
    }

    function onInput() {
      var target = typeof opts.getExpectedText === "function" ? (opts.getExpectedText() || "") : "";
      var val = inputEl.value || "";
      var exactMatch = target.length > 0 && val === target;
      if (exactMatch) {
        inputEl.classList.add("locked-complete");
      } else {
        inputEl.classList.remove("locked-complete");
      }
      updateNextKeyVisual();
      if (typeof opts.onProgress === "function") {
        opts.onProgress(val, target, {
          exactMatch: exactMatch,
          summary: summarizeTracker(tracker)
        });
      }
      if (exactMatch && typeof opts.onComplete === "function") {
        opts.onComplete(summarizeTracker(tracker));
      }
    }

    inputEl.addEventListener("focus", onFocus);
    inputEl.addEventListener("blur", onBlur);
    inputEl.addEventListener("keydown", onKeyDown);
    inputEl.addEventListener("keyup", onKeyUp);
    inputEl.addEventListener("input", onInput);

    return function unbind() {
      inputEl.removeEventListener("focus", onFocus);
      inputEl.removeEventListener("blur", onBlur);
      inputEl.removeEventListener("keydown", onKeyDown);
      inputEl.removeEventListener("keyup", onKeyUp);
      inputEl.removeEventListener("input", onInput);
    };
  }

  function getKeyGuidance(targetSpec, overrideHint) {
    if (!targetSpec) {
      return {
        codes: [],
        fingers: [],
        badgeText: "Ready",
        fingerText: "Anchor Left Index on F & Right Index on J"
      };
    }

    // Special named keys or chords (e.g. "Backspace", "Enter", "Ctrl+ArrowRight")
    if (targetSpec.length > 1) {
      var parts = targetSpec.split("+");
      var codes = [];
      var fingers = [];
      for (var i = 0; i < parts.length; i++) {
        var token = parts[i].trim();
        if (token === "Ctrl" || token === "Cmd") {
          codes.push("ControlLeft");
          fingers.push("L-Pinky");
        } else if (token === "Alt" || token === "Opt") {
          codes.push("AltLeft");
          fingers.push("L-Thumb");
        } else if (token === "Shift") {
          codes.push("ShiftLeft");
          fingers.push("L-Pinky");
        } else if (CODE_MAP[token]) {
          codes.push(token);
          fingers.push(CODE_MAP[token].finger);
        } else if (token.length === 1 && CHAR_MAP[token.toLowerCase()]) {
          var cm = CHAR_MAP[token.toLowerCase()];
          codes.push(cm.code);
          fingers.push(cm.finger);
        } else if (token === "Left") {
          codes.push("ArrowLeft");
          fingers.push("R-Index");
        } else if (token === "Right") {
          codes.push("ArrowRight");
          fingers.push("R-Ring");
        } else if (token === "Up") {
          codes.push("ArrowUp");
          fingers.push("R-Middle");
        } else if (token === "Down") {
          codes.push("ArrowDown");
          fingers.push("R-Middle");
        }
      }
      return {
        codes: codes,
        fingers: fingers,
        badgeText: "Next Key: " + targetSpec,
        fingerText: overrideHint || ("Use " + fingers.map(function (f) { return FINGER_LABELS[f] || f; }).join(" + "))
      };
    }

    var entry = CHAR_MAP[targetSpec];
    if (!entry) {
      return {
        codes: [],
        fingers: [],
        badgeText: "Next: " + JSON.stringify(targetSpec),
        fingerText: overrideHint || "Keep hands on home row F & J"
      };
    }

    var displayChar = targetSpec === " " ? "Space" : (targetSpec === "\n" ? "Enter" : targetSpec);
    var activeCodes = [entry.code];
    var activeFingers = [entry.finger];
    var fingerDesc = FINGER_LABELS[entry.finger];

    if (entry.needsShift && entry.shiftCode) {
      activeCodes.unshift(entry.shiftCode);
      activeFingers.unshift(entry.shiftFinger);
      fingerDesc = FINGER_LABELS[entry.shiftFinger] + " (Shift) + " + FINGER_LABELS[entry.finger] + " ('" + displayChar + "')";
    }

    return {
      codes: activeCodes,
      fingers: activeFingers,
      badgeText: "Next Key: " + displayChar,
      fingerText: overrideHint || (fingerDesc + " \u2022 Return to F/J bumps")
    };
  }

  function getWeakAndSlowKeys() {
    var ks = vault.lifetimeTyping.keyStats;
    var globalMedian = medianOf(vault.lifetimeTyping.latencySamples) || 210;
    var slowThreshold = Math.max(260, Math.round(globalMedian * 1.35));

    var byCode = {};
    var weakChars = [];
    var slowChars = [];

    for (var ch in ks) {
      if (!Object.prototype.hasOwnProperty.call(ks, ch)) {
        continue;
      }
      var st = ks[ch];
      if (st.attempts < 2) {
        continue;
      }
      var acc = (st.hits / st.attempts) * 100;
      var avgLat = st.latencyCount > 0 ? Math.round(st.latencySumMs / st.latencyCount) : 0;
      var spec = CHAR_MAP[ch];
      var isWeak = st.misses >= 2 || acc < 86;
      var isSlow = st.latencyCount >= 2 && avgLat >= slowThreshold;

      if (isWeak) {
        weakChars.push({ char: ch, accuracy: Math.round(acc), misses: st.misses, avgMs: avgLat });
      } else if (isSlow) {
        slowChars.push({ char: ch, accuracy: Math.round(acc), misses: st.misses, avgMs: avgLat });
      }

      if (spec && (isWeak || isSlow)) {
        var prev = byCode[spec.code];
        var level = isWeak ? "weak" : "slow";
        if (!prev || prev.level !== "weak") {
          byCode[spec.code] = {
            level: level,
            char: ch,
            accuracy: Math.round(acc),
            avgMs: avgLat,
            misses: st.misses
          };
        }
      }
    }

    weakChars.sort(function (a, b) { return a.accuracy - b.accuracy || b.misses - a.misses; });
    slowChars.sort(function (a, b) { return b.avgMs - a.avgMs; });

    return {
      byCode: byCode,
      weakChars: weakChars,
      slowChars: slowChars,
      slowThresholdMs: slowThreshold
    };
  }

  // Record individual concept outcome & adaptive state
  function recordConceptOutcome(item) {
    var cid = item.conceptId;
    var cs = vault.conceptState[cid] || {
      conceptId: cid,
      moduleId: item.moduleId,
      title: item.conceptTitle || cid,
      attempts: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      needsReview: false,
      lastVariantIdx: 0
    };

    cs.attempts += 1;
    cs.lastVariantIdx = (cs.lastVariantIdx + 1) % 1000;

    if (item.isCorrect) {
      cs.correct += 1;
      cs.streak += 1;
      if (cs.streak >= 1) {
        cs.needsReview = false;
      }
    } else {
      cs.wrong += 1;
      cs.streak = 0;
      cs.needsReview = true;
      vault.mistakeHistory.unshift({
        timestamp: new Date().toISOString(),
        moduleId: item.moduleId,
        conceptId: cid,
        conceptTitle: item.conceptTitle || cid,
        prompt: item.prompt,
        chosenText: item.chosenText,
        correctText: item.correctText,
        whyWrong: item.whyWrong
      });
      if (vault.mistakeHistory.length > 150) {
        vault.mistakeHistory.length = 150;
      }
    }

    vault.conceptState[cid] = cs;
    saveVault();
  }

  function recordModuleRound(moduleId, roundReport) {
    var m = vault.moduleMastery[moduleId] || {
      moduleId: moduleId,
      bestPct: 0,
      lastPct: 0,
      roundsCompleted: 0,
      mastered: false,
      history: []
    };
    m.roundsCompleted += 1;
    m.lastPct = roundReport.scorePct;
    if (roundReport.scorePct > m.bestPct) {
      m.bestPct = roundReport.scorePct;
    }
    if (m.bestPct >= 90) {
      m.mastered = true;
    }
    m.history.unshift({
      timestamp: new Date().toISOString(),
      roundNumber: m.roundsCompleted,
      scorePct: roundReport.scorePct,
      correctCount: roundReport.correctCount,
      totalCount: roundReport.totalCount,
      netWpm: roundReport.typingSummary ? roundReport.typingSummary.netWpm : 0,
      accuracyPct: roundReport.typingSummary ? roundReport.typingSummary.accuracyPct : 100,
      medianLatencyMs: roundReport.typingSummary ? roundReport.typingSummary.medianLatencyMs : 0,
      missedConcepts: roundReport.missedConceptIds || []
    });
    if (m.history.length > 25) {
      m.history.length = 25;
    }
    vault.moduleMastery[moduleId] = m;
    saveVault();
    return m;
  }

  function recordShortcutAttempt(shortcutId, ok, elapsedMs) {
    var st = vault.shortcutStats[shortcutId] || {
      shortcutId: shortcutId,
      attempts: 0,
      hits: 0,
      misses: 0,
      totalMs: 0
    };
    st.attempts += 1;
    if (ok) {
      st.hits += 1;
      if (elapsedMs > 0 && elapsedMs < 15000) {
        st.totalMs += Math.round(elapsedMs);
      }
    } else {
      st.misses += 1;
    }
    vault.shortcutStats[shortcutId] = st;
    saveVault();
  }

  function recordDrillResult(drillSummary) {
    vault.drillHistory.unshift({
      timestamp: new Date().toISOString(),
      drillId: drillSummary.drillId,
      title: drillSummary.title,
      netWpm: drillSummary.netWpm,
      accuracyPct: drillSummary.accuracyPct,
      medianLatencyMs: drillSummary.medianLatencyMs,
      backspaces: drillSummary.backspaces
    });
    if (vault.drillHistory.length > 60) {
      vault.drillHistory.length = 60;
    }
    saveVault();
  }

  function recordBenchmarkResult(entry) {
    var record = Object.assign({ timestamp: new Date().toISOString() }, entry);
    vault.benchmarkHistory.unshift(record);
    if (vault.benchmarkHistory.length > 50) {
      vault.benchmarkHistory.length = 50;
    }
    saveVault();
    return record;
  }

  function getGlobalHudStats(totalModulesCount) {
    var lt = vault.lifetimeTyping;
    var mins = Math.max(lt.activeTypingMs / 60000, 1 / 120);
    var netChars = Math.max(0, lt.correctKeystrokes - Math.floor(lt.errorKeystrokes * 0.5));
    var wpm = lt.totalKeystrokes > 0 ? Math.round((netChars / 5) / mins) : 0;
    var acc = lt.totalKeystrokes > 0 ? Math.round((lt.correctKeystrokes / lt.totalKeystrokes) * 1000) / 10 : 100;
    var medLat = medianOf(lt.latencySamples);

    var masteredCount = 0;
    for (var mid in vault.moduleMastery) {
      if (Object.prototype.hasOwnProperty.call(vault.moduleMastery, mid) && vault.moduleMastery[mid].mastered) {
        masteredCount += 1;
      }
    }

    return {
      wpm: wpm,
      accuracyPct: acc,
      medianLatencyMs: medLat,
      masteredCount: masteredCount,
      totalModules: totalModulesCount || 10,
      backspaces: lt.backspaces,
      totalKeystrokes: lt.totalKeystrokes
    };
  }

  function exportVaultJSON() {
    var payload = {
      exportedAt: new Date().toISOString(),
      app: "Zero-to-Code Systems Lab (100% Local)",
      privacyScope: "Scoped practice & answer inputs only; zero external network requests",
      vault: vault
    };
    return JSON.stringify(payload, null, 2);
  }

  function importVaultJSON(rawJsonString) {
    var parsed = JSON.parse(rawJsonString);
    var candidate = parsed && parsed.vault ? parsed.vault : parsed;
    if (!candidate || typeof candidate !== "object" || !candidate.lifetimeTyping) {
      throw new Error("Invalid telemetry JSON structure.");
    }
    vault = candidate;
    saveVault();
    return vault;
  }

  function resetVault() {
    clearStorageRaw();
    vault = createFreshVault();
    saveVault();
    return vault;
  }

  function setPreference(key, val) {
    vault.preferences[key] = val;
    saveVault();
  }

  window.CSTrainer.Telemetry = {
    KEYBOARD_ROWS: KEYBOARD_ROWS,
    FINGER_LABELS: FINGER_LABELS,
    CHAR_MAP: CHAR_MAP,
    CODE_MAP: CODE_MAP,
    getVault: function () { return vault; },
    subscribe: subscribe,
    createSessionTracker: createSessionTracker,
    summarizeTracker: summarizeTracker,
    bindPracticeInput: bindPracticeInput,
    getKeyGuidance: getKeyGuidance,
    getWeakAndSlowKeys: getWeakAndSlowKeys,
    recordConceptOutcome: recordConceptOutcome,
    recordModuleRound: recordModuleRound,
    recordShortcutAttempt: recordShortcutAttempt,
    recordDrillResult: recordDrillResult,
    recordBenchmarkResult: recordBenchmarkResult,
    getGlobalHudStats: getGlobalHudStats,
    exportVaultJSON: exportVaultJSON,
    importVaultJSON: importVaultJSON,
    resetVault: resetVault,
    setPreference: setPreference
  };
})();
