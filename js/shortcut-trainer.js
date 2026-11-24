/* ==========================================================================
   js/shortcut-trainer.js — No-Look Touch Typing, Heavy Developer Symbol Drills
   & Safe In-App Scoped Shortcut Sandbox (Word Nav, Line Edit, Selection, Shell)
   ========================================================================== */

(function () {
  "use strict";

  window.CSTrainer = window.CSTrainer || {};

  var TYPING_DRILLS = [
    {
      id: "drill_fj_home",
      category: "1. Home-Row Anchors (F & J Bumps)",
      title: "F & J Tactile Ridges + Full Home Row",
      focusKeys: "f j d k s l a ; g h",
      tip: "Close your eyes for two seconds and feel the physical bumps on F (Left Index) and J (Right Index). Keep wrists level and eyes strictly on the target tape.",
      text: "ff jj fj jf df jk sd kl as l; fghj jhgf asdf jkl; fall glad flask dash half flags; shall add;"
    },
    {
      id: "drill_alpha_cols",
      category: "2. Full Alphabet Vertical Columns",
      title: "Top & Bottom Row Reach Without Leaving F/J",
      focusKeys: "q..p, z..m",
      tip: "Reach one finger up or down along its column and snap right back to A-S-D-F / J-K-L-;.",
      text: "quick brown logic jumps over lazy wire frames; zero moving parts inside doped silicon crystal gates;"
    },
    {
      id: "drill_shift_identifiers",
      category: "3. Opposite-Hand Shift & Code Identifiers",
      title: "camelCase & PascalCase With Opposite Pinky Shift",
      focusKeys: "Left Shift + Right Hand, Right Shift + Left Hand",
      tip: "Never twist the same hand to hold Shift! Left-hand capitals use Right Shift; Right-hand capitals use Left Shift.",
      text: "let fetchCycle = true; const ControlUnit = ReadRegister; let HalfAdder = ComputeCarryBit;"
    },
    {
      id: "drill_numbers_hex",
      category: "4. Blind Number Row, Binary & Hex Addresses",
      title: "Powers of Two, Binary Masks & Hex Pointers",
      focusKeys: "1 2 3 4 5 6 7 8 9 0",
      tip: "Triangulate digits straight up two rows from your home-row columns: 1-5 Left Hand, 6-0 Right Hand.",
      text: "1 2 4 8 16 32 64 128 256 512 1024; 0b10110100 0x1004 0x2048 65536 8080 127.0.0.1;"
    },
    {
      id: "drill_brackets_braces",
      category: "5. Heavy Developer Symbols: {} [] () <>",
      title: "Braces, Brackets, Parentheses & Angle Comparisons",
      focusKeys: "{ } [ ] ( ) < >",
      tip: "[ and ] sit right of P (Right Pinky); add Left Shift for { and }. Use Left Shift + 9/0 for ( ) and Left Shift + ,/. for < >.",
      text: "if (i < arr.length && arr[i] > 0) { out.push({ idx: i, pair: [arr[0], arr[i]] }); }"
    },
    {
      id: "drill_quotes_delims",
      category: "6. Heavy Developer Symbols: ; : ' \" `",
      title: "Semicolons, Object Colons, Quotes & Template Literals",
      focusKeys: "; : ' \" ` $",
      tip: "; sits right under Right Pinky; ' is one key right; ` sits at top-left beside 1.",
      text: "const meta = { mode: 'strict', host: \"localhost\", tag: `slot_${id}` };"
    },
    {
      id: "drill_operators_pipes",
      category: "7. Heavy Developer Symbols: = === !== => && || / \\ | %",
      title: "Strict Equality, Fat Arrows, Boolean Pipes & Slashes",
      focusKeys: "= + ! & | / \\ % ~ ^",
      tip: "&& is Left Shift + 77 (Right Index); || is Left Shift + \\\\ (Right Pinky above Enter); => is = then >.",
      text: "const valid = (n) => (n % 2 === 0 && n !== 0) || (flag & 1) === 1; // path\\to\\bin"
    },
    {
      id: "drill_code_synthesis",
      category: "8. Full Blindfolded Code Snippet",
      title: "Complete Binary Adder & Array Reducer From Scratch",
      focusKeys: "Full keyboard + developer symbol fluency",
      tip: "Maintain calm, even cadence—aim for 98%+ accuracy before pushing raw WPM.",
      text: "function halfAdd(a, b) { return { sum: a ^ b, carry: a & b }; } const res = halfAdd(1, 1);"
    }
  ];

  function generateAdaptiveWeakKeyDrill() {
    var T = window.CSTrainer.Telemetry;
    var report = T.getWeakAndSlowKeys();
    var targets = [];
    for (var i = 0; i < report.weakChars.length; i++) {
      if (report.weakChars[i].char && report.weakChars[i].char !== "\n") {
        targets.push(report.weakChars[i].char);
      }
    }
    for (var j = 0; j < report.slowChars.length; j++) {
      var sc = report.slowChars[j].char;
      if (sc && sc !== "\n" && targets.indexOf(sc) === -1) {
        targets.push(sc);
      }
    }

    if (targets.length === 0) {
      return {
        id: "drill_adaptive_weak",
        category: "9. Adaptive Weak-Key Synthesizer",
        title: "Personalized Weak/Slow Key Drill (Default Symbol Warmup)",
        focusKeys: "{ } [ ] ( ) ; === => && ||",
        tip: "No weak keys recorded yet—complete a quiz round or drill and this generator will automatically weave your exact slow/missed keys into custom code blocks!",
        text: "const step = (pc, mem) => { const ir = mem[pc]; return ir !== 0 && (ir & 1) === 1 ? pc + 4 : 0; };"
      };
    }

    var focusList = targets.slice(0, 6);
    var snippetsByChar = {
      "{": "if (ok) { run(); }",
      "}": "else { halt(); }",
      "[": "mem[pc + 1]",
      "]": "arr[i - 1]",
      "(": "calc(a, b)",
      ")": "fn(x + y)",
      ";": "let x = 0; x += 1;",
      ":": "{ id: 1, ok: true }",
      "'": "const k = 'pc';",
      "\"": "const s = \"alu\";",
      "`": "const m = `v=${v}`;",
      "=": "a === b && c !== d",
      ">": "const fn = (x) => x >= 0;",
      "<": "for (let i = 0; i < n; i++)",
      "&": "if (ready && valid)",
      "|": "if (hit || miss)",
      "/": "// div = a / b;",
      "\\": "const nl = \"\\n\";",
      "%": "if (n % 2 === 0)"
    };

    var chunks = [];
    for (var k = 0; k < focusList.length; k++) {
      var ch = focusList[k];
      if (snippetsByChar[ch]) {
        chunks.push(snippetsByChar[ch]);
      } else if (ch === " ") {
        chunks.push("let bit = 0; const reg = 1;");
      } else {
        chunks.push(ch + ch + " " + "val_" + ch + " = '" + ch + "';");
      }
    }
    var joined = chunks.join(" ");
    while (joined.length < 95) {
      joined += " " + chunks[0];
    }

    return {
      id: "drill_adaptive_weak",
      category: "9. Adaptive Weak-Key Synthesizer",
      title: "Personalized Drill Targeting Your Missed & Hesitant Keys",
      focusKeys: focusList.join("  "),
      tip: "Generated locally from your keystroke slip matrix and hesitation latencies. Focus on smooth, unhurried finger returns to F & J.",
      text: joined.slice(0, 155)
    };
  }

  // ==========================================================================
  // SAFE IN-APP SHORTCUT LAB CHALLENGES
  // Intercepted strictly inside the focused #shortcut-sandbox element!
  // ==========================================================================

  var SHORTCUT_CHALLENGES = [
    {
      id: "sc_word_right",
      category: "Word Navigation",
      title: "Jump One Whole Word Right",
      acceptedChords: ["Ctrl+ArrowRight", "Alt+ArrowRight"],
      displayChord: "Ctrl + \u2192",
      macChord: "Opt + \u2192",
      visualHintKey: "Ctrl+Right",
      prompt: "Jump the cursor forward across an entire token (`const` \u2192 `packetSize`) in one keystroke instead of tapping Right Arrow six times.",
      initialLines: ["const packetSize = 1024;", "return packetSize * 2;"],
      initialLine: 0,
      initialCol: 0,
      applyEffect: function (state) {
        state.col = 6;
        state.statusMsg = "Jumped 1 word right (`const ` \u2192 `packetSize`)!";
      }
    },
    {
      id: "sc_word_left",
      category: "Word Navigation",
      title: "Jump One Whole Word Left",
      acceptedChords: ["Ctrl+ArrowLeft", "Alt+ArrowLeft"],
      displayChord: "Ctrl + \u2190",
      macChord: "Opt + \u2190",
      visualHintKey: "Ctrl+Left",
      prompt: "Jump the cursor backward one whole word from the semicolon onto the start of `1024`.",
      initialLines: ["const packetSize = 1024;", "return packetSize * 2;"],
      initialLine: 0,
      initialCol: 23,
      applyEffect: function (state) {
        state.col = 19;
        state.statusMsg = "Jumped 1 word left onto `1024`!";
      }
    },
    {
      id: "sc_line_end",
      category: "Word Navigation",
      title: "Teleport to End of Line",
      acceptedChords: ["End", "Ctrl+E", "Meta+ArrowRight"],
      displayChord: "End (or Ctrl + E)",
      macChord: "Cmd + \u2192 / Ctrl + E",
      visualHintKey: "End",
      prompt: "Your cursor is at column 4 and you need to append `;` at the end of the line. Teleport straight to line end!",
      initialLines: ["let clockHz = 4000000000", "let periodPs = 250;"],
      initialLine: 0,
      initialCol: 4,
      applyEffect: function (state) {
        state.col = state.lines[0].length;
        state.statusMsg = "Teleported straight to end of line!";
      }
    },
    {
      id: "sc_line_start",
      category: "Word Navigation",
      title: "Teleport to Start of Line",
      acceptedChords: ["Home", "Ctrl+A", "Meta+ArrowLeft"],
      displayChord: "Home (or Ctrl + A)",
      macChord: "Cmd + \u2190 / Ctrl + A",
      visualHintKey: "Home",
      prompt: "Teleport the cursor from the end of the expression straight back to column 0 at the start of the line.",
      initialLines: ["const carryOut = (a & b) | (cin & (a ^ b));", "return carryOut;"],
      initialLine: 0,
      initialCol: 42,
      applyEffect: function (state) {
        state.col = 0;
        state.statusMsg = "Teleported to start of line (column 0)!";
      }
    },
    {
      id: "sc_del_word_back",
      category: "Line Editing",
      title: "Delete Entire Previous Word",
      acceptedChords: ["Ctrl+Backspace", "Alt+Backspace"],
      displayChord: "Ctrl + Backspace",
      macChord: "Opt + Backspace",
      visualHintKey: "Ctrl+Backspace",
      prompt: "You mistyped `let couuntter`—delete the entire botched identifier in ONE chord without hammering Backspace!",
      initialLines: ["let couuntter = 0;", "couuntter += 1;"],
      initialLine: 0,
      initialCol: 13,
      applyEffect: function (state) {
        state.lines[0] = "let  = 0;";
        state.col = 4;
        state.statusMsg = "Deleted entire mistyped token `couuntter` in 1 chord!";
      }
    },
    {
      id: "sc_toggle_comment",
      category: "Line Editing",
      title: "Toggle Line Comment Anywhere on Line",
      acceptedChords: ["Ctrl+Slash", "Meta+Slash"],
      displayChord: "Ctrl + /",
      macChord: "Cmd + /",
      visualHintKey: "Ctrl+Slash",
      prompt: "Comment out the debug trace line (`// ...`) instantly WITHOUT moving your cursor to the beginning of the line.",
      initialLines: ["console.log('debug ALU state:', r1);", "return r1 + r2;"],
      initialLine: 0,
      initialCol: 18,
      applyEffect: function (state) {
        state.lines[0] = "// " + state.lines[0];
        state.col += 3;
        state.statusMsg = "Toggled `//` line comment in place!";
      }
    },
    {
      id: "sc_move_line_up",
      category: "Line Editing",
      title: "Move Current Line Upward",
      acceptedChords: ["Alt+ArrowUp"],
      displayChord: "Alt + \u2191",
      macChord: "Opt + \u2191",
      visualHintKey: "Alt+Up",
      prompt: "`let sum = 0;` was accidentally placed AFTER the loop start! Swap line 2 upward above line 1 without cut-and-paste.",
      initialLines: ["for (let i = 0; i < n; i++) {", "let sum = 0;"],
      initialLine: 1,
      initialCol: 4,
      applyEffect: function (state) {
        var tmp = state.lines[0];
        state.lines[0] = state.lines[1];
        state.lines[1] = tmp;
        state.line = 0;
        state.statusMsg = "Moved `let sum = 0;` cleanly above the loop!";
      }
    },
    {
      id: "sc_delete_line",
      category: "Line Editing",
      title: "Delete Entire Current Line",
      acceptedChords: ["Ctrl+Shift+KeyK", "Meta+Shift+KeyK"],
      displayChord: "Ctrl + Shift + K",
      macChord: "Cmd + Shift + K",
      visualHintKey: "Ctrl+Shift+K",
      prompt: "Delete the obsolete temporary line completely in one editor chord without selecting text first.",
      initialLines: ["const deadTemp = 99999; // remove me", "const cleanResult = 42;"],
      initialLine: 0,
      initialCol: 8,
      applyEffect: function (state) {
        state.lines.splice(0, 1);
        state.line = 0;
        state.col = 0;
        state.statusMsg = "Deleted entire line cleanly in 1 chord!";
      }
    },
    {
      id: "sc_select_word_right",
      category: "Selection",
      title: "Select Next Whole Word Without Mouse",
      acceptedChords: ["Ctrl+Shift+ArrowRight", "Alt+Shift+ArrowRight"],
      displayChord: "Ctrl + Shift + \u2192",
      macChord: "Opt + Shift + \u2192",
      visualHintKey: "Ctrl+Shift+Right",
      prompt: "Highlight the identifier `oldBuffer` right ahead of the cursor so you can type a replacement name immediately.",
      initialLines: ["const ptr = oldBuffer;", "return ptr;"],
      initialLine: 0,
      initialCol: 12,
      applyEffect: function (state) {
        state.selStart = 12;
        state.selEnd = 21;
        state.col = 21;
        state.statusMsg = "Selected token `oldBuffer` with zero mouse reach!";
      }
    },
    {
      id: "sc_select_to_end",
      category: "Selection",
      title: "Select From Cursor to End of Line",
      acceptedChords: ["Shift+End", "Ctrl+Shift+E", "Meta+Shift+ArrowRight"],
      displayChord: "Shift + End",
      macChord: "Cmd + Shift + \u2192",
      visualHintKey: "Shift+End",
      prompt: "Select everything from the `=` sign to the end of the line in a single chord.",
      initialLines: ["const threshold = 0.70 + noiseMargin;", "return threshold;"],
      initialLine: 0,
      initialCol: 18,
      applyEffect: function (state) {
        state.selStart = 18;
        state.selEnd = state.lines[0].length;
        state.col = state.lines[0].length;
        state.statusMsg = "Selected remainder of line (`0.70 + noiseMargin;`)!";
      }
    },
    {
      id: "sc_term_sigint",
      category: "Terminal Shortcuts",
      title: "Interrupt Runaway Process (SIGINT)",
      acceptedChords: ["Ctrl+KeyC"],
      displayChord: "Ctrl + C",
      macChord: "Ctrl + C",
      visualHintKey: "Ctrl+c",
      prompt: "[TERMINAL] An infinite `while (true)` loop is pegging CPU at 100%! Send `SIGINT` to stop the process cleanly.",
      initialLines: ["$ node spin_forever.js", "Running step 9,482,110... [stuck]"],
      initialLine: 1,
      initialCol: 33,
      applyEffect: function (state) {
        state.lines.push("^C  [Process interrupted via SIGINT — prompt restored]");
        state.line = 2;
        state.col = 0;
        state.statusMsg = "Sent ^C (SIGINT) — runaway loop terminated!";
      }
    },
    {
      id: "sc_term_clear_screen",
      category: "Terminal Shortcuts",
      title: "Clear Terminal Viewport",
      acceptedChords: ["Ctrl+KeyL"],
      displayChord: "Ctrl + L",
      macChord: "Ctrl + L",
      visualHintKey: "Ctrl+l",
      prompt: "[TERMINAL] Your shell is cluttered with 200 lines of build logs. Clear the terminal viewport without typing `clear` + Enter!",
      initialLines: ["[build] Warner 142...", "[build] Output noisy...", "$ git status"],
      initialLine: 2,
      initialCol: 12,
      applyEffect: function (state) {
        state.lines = ["$ git status"];
        state.line = 0;
        state.col = 12;
        state.statusMsg = "Cleared terminal viewport cleanly while keeping your typed prompt!";
      }
    },
    {
      id: "sc_term_kill_line",
      category: "Terminal Shortcuts",
      title: "Clear Shell Command Before Cursor",
      acceptedChords: ["Ctrl+KeyU"],
      displayChord: "Ctrl + U",
      macChord: "Ctrl + U",
      visualHintKey: "Ctrl+u",
      prompt: "[TERMINAL] You typed a long wrong shell command and want to wipe everything before the cursor back to `$ ` instantly.",
      initialLines: ["$ ./deploy --wrong-env --force-prod"],
      initialLine: 0,
      initialCol: 35,
      applyEffect: function (state) {
        state.lines[0] = "$ ";
        state.col = 2;
        state.statusMsg = "Killed command line back to prompt (`Ctrl+U`)!";
      }
    },
    {
      id: "sc_term_reverse_search",
      category: "Terminal Shortcuts",
      title: "Reverse Incremental History Search",
      acceptedChords: ["Ctrl+KeyR", "Alt+KeyR"],
      displayChord: "Ctrl + R (or Alt + R)",
      macChord: "Ctrl + R",
      visualHintKey: "Ctrl+r",
      prompt: "[TERMINAL] Search backward through your past shell commands interactively instead of pressing Up Arrow 40 times!",
      initialLines: ["$ "],
      initialLine: 0,
      initialCol: 2,
      applyEffect: function (state) {
        state.lines[0] = "(reverse-i-search)`python3': python3 -m http.server 8000";
        state.col = 28;
        state.statusMsg = "Opened reverse incremental history search (`Ctrl+R`)!";
      }
    }
  ];

  var BENCHMARK_PASSAGES = [
    "function stepCpu(pc, ram, regs) { const ir = ram[pc]; const op = (ir >> 4) & 0x0f; if (op === 2) { regs[0] = (regs[0] + regs[1]) & 0xff; } return pc + 1; }",
    "const fullAdder = (a, b, cin) => ({ sum: (a ^ b) ^ cin, cout: (a & b) | (cin & (a ^ b)) }); const bit0 = fullAdder(1, 1, 0);",
    "function countWeakKeys(log) { const map = {}; for (let i = 0; i < log.length; i++) { const k = log[i]; map[k] = (map[k] || 0) + 1; } return map; }"
  ];

  function normalizeChordEvent(e) {
    // Ignore bare modifier presses
    if (e.key === "Control" || e.key === "Shift" || e.key === "Alt" || e.key === "Meta" || e.key === "CapsLock") {
      return null;
    }
    var parts = [];
    if (e.ctrlKey) { parts.push("Ctrl"); }
    if (e.metaKey) { parts.push("Meta"); }
    if (e.altKey)  { parts.push("Alt"); }
    if (e.shiftKey) { parts.push("Shift"); }

    var keyToken = e.code;
    if (e.key === "Home") { keyToken = "Home"; }
    else if (e.key === "End") { keyToken = "End"; }
    else if (e.key === "Backspace") { keyToken = "Backspace"; }
    else if (e.key === "Delete") { keyToken = "Delete"; }
    else if (e.key === "ArrowLeft") { keyToken = "ArrowLeft"; }
    else if (e.key === "ArrowRight") { keyToken = "ArrowRight"; }
    else if (e.key === "ArrowUp") { keyToken = "ArrowUp"; }
    else if (e.key === "ArrowDown") { keyToken = "ArrowDown"; }
    else if (e.code === "Slash") { keyToken = "Slash"; }
    else if (/^Key[A-Z]$/.test(e.code)) {
      // Allow matching both "Ctrl+KeyC" and "Ctrl+C"
      keyToken = e.code;
    }

    parts.push(keyToken);
    return parts.join("+");
  }

  function matchesAcceptedChord(chordStr, acceptedList) {
    if (!chordStr || !Array.isArray(acceptedList)) {
      return false;
    }
    for (var i = 0; i < acceptedList.length; i++) {
      var target = acceptedList[i];
      if (chordStr === target) {
        return true;
      }
      // Also match short letter form e.g. Ctrl+E vs Ctrl+KeyE
      var shortForm = chordStr.replace("+Key", "+");
      if (shortForm === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * Binds scoped shortcut capture ONLY inside `sandboxEl` when focused.
   */
  function bindShortcutSandbox(sandboxEl, config) {
    if (!sandboxEl) {
      return function noop() {};
    }
    var T = window.CSTrainer.Telemetry;
    var opts = config || {};
    var promptShownAt = performance.now();

    function getChallenge() {
      return typeof opts.getCurrentChallenge === "function" ? opts.getCurrentChallenge() : null;
    }

    function pushGuidance() {
      if (document.activeElement !== sandboxEl) {
        return;
      }
      var ch = getChallenge();
      if (ch) {
        var g = T.getKeyGuidance(ch.visualHintKey, "Press " + ch.displayChord + " inside this focused sandbox");
        g.badgeText = "Shortcut: " + ch.displayChord;
        if (typeof opts.onGuidance === "function") {
          opts.onGuidance(g);
        }
      }
    }

    function onFocus() {
      promptShownAt = performance.now();
      if (typeof opts.onScopeChange === "function") {
        opts.onScopeChange(true, "Shortcut Sandbox");
      }
      pushGuidance();
    }

    function onBlur() {
      if (typeof opts.onScopeChange === "function") {
        opts.onScopeChange(false, "Outside Input");
      }
    }

    function onKeyDown(e) {
      if (e.currentTarget !== sandboxEl || document.activeElement !== sandboxEl) {
        return;
      }
      var ch = getChallenge();
      if (!ch) {
        return;
      }
      var chord = normalizeChordEvent(e);
      if (!chord) {
        return;
      }

      // Safely intercept shortcut inside the sandbox so browser doesn't scroll, reload, or jump focus
      e.preventDefault();
      e.stopPropagation();

      var elapsedMs = Math.round(performance.now() - promptShownAt);
      var ok = matchesAcceptedChord(chord, ch.acceptedChords);
      T.recordShortcutAttempt(ch.id, ok, elapsedMs);

      if (ok) {
        promptShownAt = performance.now();
        if (typeof opts.onMatch === "function") {
          opts.onMatch(chord.replace("+Key", "+"), elapsedMs, ch);
        }
      } else {
        if (typeof opts.onMiss === "function") {
          opts.onMiss(chord.replace("+Key", "+"), ch);
        }
      }
    }

    sandboxEl.addEventListener("focus", onFocus);
    sandboxEl.addEventListener("blur", onBlur);
    sandboxEl.addEventListener("keydown", onKeyDown);

    return function unbind() {
      sandboxEl.removeEventListener("focus", onFocus);
      sandboxEl.removeEventListener("blur", onBlur);
      sandboxEl.removeEventListener("keydown", onKeyDown);
    };
  }

  function getBenchmarkShortcuts(seed) {
    var list = SHORTCUT_CHALLENGES.slice();
    var out = [];
    var offset = Math.abs(seed || 0);
    for (var i = 0; i < 6 && i < list.length; i++) {
      out.push(list[(offset + i * 2) % list.length]);
    }
    return out;
  }

  window.CSTrainer.ShortcutTrainer = {
    TYPING_DRILLS: TYPING_DRILLS,
    SHORTCUT_CHALLENGES: SHORTCUT_CHALLENGES,
    BENCHMARK_PASSAGES: BENCHMARK_PASSAGES,
    generateAdaptiveWeakKeyDrill: generateAdaptiveWeakKeyDrill,
    bindShortcutSandbox: bindShortcutSandbox,
    normalizeChordEvent: normalizeChordEvent,
    matchesAcceptedChord: matchesAcceptedChord,
    getBenchmarkShortcuts: getBenchmarkShortcuts
  };
})();
