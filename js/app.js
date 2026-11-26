/* ==========================================================================
 js/app.js - Main UI Controller, Visual Keyboard Renderer, Interactive
 Hardware/Code Simulators, Adaptive Quiz UI & Timed Benchmark Exam Mode
 ========================================================================== */

(function () {
 "use strict";

 var T = window.CSTrainer.Telemetry;
 var C = window.CSTrainer.Curriculum;
 var Q = window.CSTrainer.QuizEngine;
 var S = window.CSTrainer.ShortcutTrainer;

 var state = {
 activeNav: "curriculum", // curriculum | typing | shortcuts | benchmark | telemetry
 activeModuleId: "s1m1",
 moduleSubTab: "lesson", // lesson | quiz | analysis
 activeRoundsByModule: {},
 lastReportsByModule: {},
 activeDrillId: "drill_fj_home",
 activeShortcutIdx: 0,
 shortcutCategoryFilter: "All",
 benchmark: null,
 unbinders: [],
 timerHandle: null
 };

 function escapeHtml(str) {
 return String(str === undefined || str === null ? "" : str)
 .replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;")
 .replace(/"/g, "&quot;")
 .replace(/'/g, "&#39;");
 }

 function formatInlineCode(text) {
 var escaped = escapeHtml(text);
 return escaped
 .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
 .replace(/`([^`]+)`/g, "<code>$1</code>")
 .replace(/\n/g, "<br>");
 }

 function renderTargetTapeHtml(typed, target) {
 var html = "";
 var tStr = String(target || "");
 var uStr = String(typed || "");
 var firstErr = false;
 for (var i = 0; i < tStr.length; i++) {
 var ch = tStr[i];
 var disp = ch === "\n" ? "\u21b5\n" : escapeHtml(ch);
 if (i < uStr.length) {
 if (!firstErr && uStr[i] === ch) {
 html += '<span class="tape-char done-ok">' + disp + "</span>";
 } else {
 firstErr = true;
 html += '<span class="tape-char done-err">' + disp + "</span>";
 }
 } else if (i === uStr.length && !firstErr) {
 html += '<span class="tape-char current">' + (ch === " " ? "&nbsp;" : disp) + "</span>";
 } else {
 html += '<span class="tape-char pending">' + disp + "</span>";
 }
 }
 return html;
 }

 function cleanupViewBindings() {
 while (state.unbinders.length > 0) {
 var fn = state.unbinders.pop();
 try { fn(); } catch (err) {}
 }
 if (state.timerHandle && (!state.benchmark || state.activeNav !== "benchmark")) {
 clearInterval(state.timerHandle);
 state.timerHandle = null;
 }
 }

 function registerUnbinder(fn) {
 if (typeof fn === "function") {
 state.unbinders.push(fn);
 }
 }

 // ==========================================================================
 // VISUAL KEYBOARD, TWO-HAND SVG & TOP HUD
 // ==========================================================================

 var keyElementsByCode = {};
 var fingerSvgByCode = {};
 var virtualShiftLatched = false;

 function focusNoScroll(el) {
 if (!el || typeof el.focus !== "function") { return; }
 try {
 el.focus({ preventScroll: true });
 } catch (err) {
 el.focus();
 }
 }

 function findPrimaryPracticeInput() {
 return document.getElementById("type-lock-input") ||
 document.getElementById("drill-input") ||
 document.getElementById("bench-typing-input") ||
 document.getElementById("bench-q-input") ||
 document.getElementById("lesson-warmup-input") ||
 document.querySelector(".scoped-input:not([readonly])");
 }

 function setShiftLatchVisual(latched) {
 virtualShiftLatched = Boolean(latched);
 if (keyElementsByCode.ShiftLeft) {
 keyElementsByCode.ShiftLeft.classList.toggle("shift-latched", virtualShiftLatched);
 }
 if (keyElementsByCode.ShiftRight) {
 keyElementsByCode.ShiftRight.classList.toggle("shift-latched", virtualShiftLatched);
 }
 }

 function handleVirtualKeyClick(k) {
 if (k.code === "ShiftLeft" || k.code === "ShiftRight") {
 setShiftLatchVisual(!virtualShiftLatched);
 flashKeycap(k.code, true);
 return;
 }

 var inp = (document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("scoped-input") && !document.activeElement.readOnly)
 ? document.activeElement
 : findPrimaryPracticeInput();

 // Always show finger guidance when clicking any keycap
 var chosenChar = (virtualShiftLatched && k.shift) ? k.shift : k.main;
 if (!inp) {
 flashKeycap(k.code, true);
 applyNextKeyGuidance(T.getKeyGuidance(chosenChar.length === 1 ? chosenChar : k.code));
 return;
 }

 if (document.activeElement !== inp) {
 focusNoScroll(inp);
 }

 if (k.code === "Backspace") {
 inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", code: "Backspace", bubbles: false }));
 var cur = inp.value || "";
 if (cur.length > 0) {
 inp.value = cur.slice(0, -1);
 }
 inp.dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", code: "Backspace", bubbles: false }));
 inp.dispatchEvent(new Event("input", { bubbles: false }));
 return;
 }

 if (k.code === "Enter") {
 inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: false }));
 inp.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: false }));
 return;
 }

 var outChar = null;
 if (k.code === "Space") {
 outChar = " ";
 } else if (chosenChar && chosenChar.length === 1 && k.code.indexOf("Arrow") !== 0) {
 outChar = chosenChar;
 }

 if (outChar !== null) {
 var usedShift = virtualShiftLatched;
 setShiftLatchVisual(false);
 inp.dispatchEvent(new KeyboardEvent("keydown", { key: outChar, code: k.code, shiftKey: usedShift, bubbles: false }));
 inp.value = (inp.value || "") + outChar;
 if (typeof inp.selectionStart === "number") {
 inp.selectionStart = inp.selectionEnd = inp.value.length;
 }
 inp.dispatchEvent(new KeyboardEvent("keyup", { key: outChar, code: k.code, shiftKey: usedShift, bubbles: false }));
 inp.dispatchEvent(new Event("input", { bubbles: false }));
 } else {
 flashKeycap(k.code, true);
 }
 }

 function buildVisualKeyboardDom() {
 var container = document.getElementById("visual-keyboard");
 if (!container) {
 return;
 }
 container.innerHTML = "";
 keyElementsByCode = {};

 for (var r = 0; r < T.KEYBOARD_ROWS.length; r++) {
 var rowSpec = T.KEYBOARD_ROWS[r];
 var rowEl = document.createElement("div");
 rowEl.className = "kb-row";
 for (var c = 0; c < rowSpec.length; c++) {
 (function (k) {
 var keyEl = document.createElement("div");
 var cls = ["kb-key", k.zone];
 if (k.width) { cls.push(k.width); }
 if (k.bump) { cls.push("has-bump"); }
 keyEl.className = cls.join(" ");
 keyEl.setAttribute("data-code", k.code);
 keyEl.title = "Click to type or inspect: " + (T.FINGER_LABELS[k.finger] || k.finger) + (k.shift ? " (" + k.main + " / Shift: " + k.shift + ")" : "");
 keyEl.innerHTML =
 (k.shift ? '<span class="key-top">' + escapeHtml(k.shift) + "</span>" : "") +
 '<span class="key-main">' + escapeHtml(k.main.length === 1 ? k.main.toUpperCase() : k.main) + "</span>";
 keyEl.addEventListener("mousedown", function (ev) {
 if (document.hasFocus()) {
 ev.preventDefault();
 }
 });
 keyEl.addEventListener("click", function () {
 handleVirtualKeyClick(k);
 });
 rowEl.appendChild(keyEl);
 keyElementsByCode[k.code] = keyEl;
 })(rowSpec[c]);
 }
 container.appendChild(rowEl);
 }

 var fingerRects = document.querySelectorAll("[data-finger-svg]");
 fingerSvgByCode = {};
 for (var i = 0; i < fingerRects.length; i++) {
 var el = fingerRects[i];
 fingerSvgByCode[el.getAttribute("data-finger-svg")] = el;
 }

 refreshKeyboardHeatmap();
 }

 function applyNextKeyGuidance(guidance) {
 var g = guidance || { codes: [], fingers: [], badgeText: "Ready", fingerText: "Anchor on F & J bumps" };
 for (var code in keyElementsByCode) {
 if (Object.prototype.hasOwnProperty.call(keyElementsByCode, code)) {
 keyElementsByCode[code].classList.remove("target-next");
 }
 }
 for (var f in fingerSvgByCode) {
 if (Object.prototype.hasOwnProperty.call(fingerSvgByCode, f)) {
 fingerSvgByCode[f].classList.remove("active-finger");
 }
 }
 for (var i = 0; i < g.codes.length; i++) {
 var kEl = keyElementsByCode[g.codes[i]];
 if (kEl) { kEl.classList.add("target-next"); }
 }
 for (var j = 0; j < g.fingers.length; j++) {
 var fEl = fingerSvgByCode[g.fingers[j]];
 if (fEl) { fEl.classList.add("active-finger"); }
 }
 var keyBadge = document.getElementById("kb-next-key-badge");
 var fingerBadge = document.getElementById("kb-finger-badge");
 if (keyBadge) { keyBadge.textContent = g.badgeText; }
 if (fingerBadge) { fingerBadge.textContent = g.fingerText; }
 }

 function flashKeycap(code, ok) {
 var el = keyElementsByCode[code];
 if (!el) { return; }
 var cls = ok ? "pressed-ok" : "pressed-err";
 el.classList.add(cls);
 setTimeout(function () {
 el.classList.remove(cls);
 }, 120);
 }

 function refreshKeyboardHeatmap() {
 var show = T.getVault().preferences.showHeatmap !== false;
 var report = T.getWeakAndSlowKeys();
 for (var code in keyElementsByCode) {
 if (!Object.prototype.hasOwnProperty.call(keyElementsByCode, code)) { continue; }
 var el = keyElementsByCode[code];
 el.classList.remove("heat-weak", "heat-slow");
 if (show && report.byCode[code]) {
 var info = report.byCode[code];
 el.classList.add(info.level === "weak" ? "heat-weak" : "heat-slow");
 }
 }
 var summaryEl = document.getElementById("kb-weak-summary");
 if (summaryEl) {
 var wCount = report.weakChars.length;
 var sCount = report.slowChars.length;
 if (wCount === 0 && sCount === 0) {
 summaryEl.textContent = "0 weak/slow keys flagged";
 } else {
 var topWeak = report.weakChars.slice(0, 3).map(function (x) { return "'" + x.char + "'"; }).join(", ");
 summaryEl.textContent = wCount + " weak, " + sCount + " slow" + (topWeak ? " (" + topWeak + ")" : "");
 }
 }
 }

 function updateScopeIndicator(armed, label) {
 var dot = document.getElementById("telemetry-scope-dot");
 var txt = document.getElementById("telemetry-scope-label");
 if (!dot || !txt) { return; }
 if (armed) {
 dot.className = "scope-dot armed";
 txt.textContent = "Offline \u2022 Armed (" + label + ")";
 } else {
 dot.className = "scope-dot idle";
 txt.textContent = "Offline \u2022 Idle";
 applyNextKeyGuidance({
 codes: ["KeyF", "KeyJ"],
 fingers: ["L-Index", "R-Index"],
 badgeText: "Home Row Ready",
 fingerText: "Rest Left Index on F & Right Index on J bumps"
 });
 }
 }

 function refreshTopHudAndSidebar() {
 var stats = T.getGlobalHudStats(C.getTotalModuleCount());
 var wpmEl = document.getElementById("hud-wpm");
 var accEl = document.getElementById("hud-accuracy");
 var latEl = document.getElementById("hud-latency");
 var masEl = document.getElementById("hud-mastery");
 if (wpmEl) { wpmEl.textContent = String(stats.wpm); }
 if (accEl) { accEl.textContent = stats.accuracyPct + "%"; }
 if (latEl) { latEl.textContent = stats.medianLatencyMs > 0 ? (stats.medianLatencyMs + "ms") : "\u2014"; }
 if (masEl) { masEl.textContent = stats.masteredCount + "/" + stats.totalModules; }

 var overallBadge = document.getElementById("sidebar-overall-pct");
 if (overallBadge) {
 overallBadge.textContent = Math.round((stats.masteredCount / stats.totalModules) * 100) + "%";
 }

 renderSidebarTree();
 refreshKeyboardHeatmap();
 }

 function renderSidebarTree() {
 var treeEl = document.getElementById("curriculum-tree");
 if (!treeEl) { return; }
 var vault = T.getVault();
 var html = "";

 for (var s = 0; s < C.STAGES.length; s++) {
 var st = C.STAGES[s];
 var stageMastered = 0;
 for (var m = 0; m < st.modules.length; m++) {
 var rec = vault.moduleMastery[st.modules[m].id];
 if (rec && rec.mastered) { stageMastered += 1; }
 }
 html += '<div class="stage-block">';
 html += '<div class="stage-header">';
 html += '<span class="stage-name">Stage ' + st.number + '</span>';
 html += '<span class="badge ' + (stageMastered === st.modules.length ? "badge-success" : "badge-neutral") + '">' +
 stageMastered + "/" + st.modules.length + "</span>";
 html += "</div>";
 html += '<div class="stage-modules">';

 for (var k = 0; k < st.modules.length; k++) {
 var mod = st.modules[k];
 var mRec = vault.moduleMastery[mod.id];
 var isActive = state.activeNav === "curriculum" && state.activeModuleId === mod.id;
 var badgeHtml = '<span class="badge badge-neutral">New</span>';
 if (mRec) {
 if (mRec.mastered) {
 badgeHtml = '<span class="badge badge-success">\u2713 ' + mRec.bestPct + "%</span>";
 } else {
 badgeHtml = '<span class="badge badge-warn">' + mRec.bestPct + "%</span>";
 }
 }
 html += '<button type="button" class="module-nav-btn' + (isActive ? " active" : "") + '" data-select-module="' + mod.id + '">';
 html += '<div><div class="module-nav-title">' + escapeHtml(mod.code + " " + mod.title) + "</div>";
 html += '<span class="module-nav-sub">' + (mRec ? ("Rounds: " + mRec.roundsCompleted) : "10 concepts + lock-in") + "</span></div>";
 html += badgeHtml;
 html += "</button>";
 }
 html += "</div></div>";
 }

 treeEl.innerHTML = html;
 var btns = treeEl.querySelectorAll("[data-select-module]");
 for (var b = 0; b < btns.length; b++) {
 btns[b].addEventListener("click", function () {
 var mid = this.getAttribute("data-select-module");
 state.activeModuleId = mid;
 state.activeNav = "curriculum";
 state.moduleSubTab = "lesson";
 document.getElementById("sidebar").classList.remove("open");
 syncPrimaryNavButtons();
 renderActiveMainView();
 });
 }
 }

 function syncPrimaryNavButtons() {
 var tabs = document.querySelectorAll(".nav-tab[data-nav]");
 for (var i = 0; i < tabs.length; i++) {
 var nav = tabs[i].getAttribute("data-nav");
 tabs[i].classList.toggle("active", nav === state.activeNav);
 }
 }

 // ==========================================================================
 // INTERACTIVE FIRST-PRINCIPLES HARDWARE & CODE SIMULATORS
 // ==========================================================================

 function mountLessonSimulator(container, mod) {
 if (!container) { return; }
 var type = mod.simulatorType;

 if (type === "punchcard-radix") {
 var holes = [1, 0, 0, 1, 1, 0, 1, 0];
 var renderPunch = function () {
 var weights = [128, 64, 32, 16, 8, 4, 2, 1];
 var dec = 0;
 var btnsHtml = "";
 for (var i = 0; i < 8; i++) {
 if (holes[i]) { dec += weights[i]; }
 btnsHtml += '<button type="button" class="sim-toggle-btn ' + (holes[i] ? "high" : "") + '" data-bit="' + i + '">' +
 "Rod " + (7 - i) + " (" + weights[i] + "): " + (holes[i] ? "HOLE [1]" : "SOLID [0]") + "</button>";
 }
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; JACQUARD PUNCH ROW &amp; POSITIONAL RADIX</div>' +
 '<p style="margin:0.35rem 0 0.7rem;font-size:0.86rem;color:var(--text-secondary)">Click any card column to punch or seal a hole and watch Base-2, Base-8, Base-10, and Base-16 update from identical physical state:</p>' +
 '<div class="sim-controls">' + btnsHtml + "</div>" +
 '<div class="sim-readout">' +
 '<div class="sim-metric"><span>Binary (Base-2)</span><strong>' + holes.join("") + "</strong></div>" +
 '<div class="sim-metric"><span>Decimal (Base-10)</span><strong>' + dec + "</strong></div>" +
 '<div class="sim-metric"><span>Octal (Base-8)</span><strong>0o' + dec.toString(8) + "</strong></div>" +
 '<div class="sim-metric"><span>Hexadecimal (Base-16)</span><strong>0x' + dec.toString(16).toUpperCase() + "</strong></div>" +
 "</div></div>";
 var bEls = container.querySelectorAll("[data-bit]");
 for (var j = 0; j < bEls.length; j++) {
 bEls[j].addEventListener("click", function () {
 var idx = Number(this.getAttribute("data-bit"));
 holes[idx] = holes[idx] ? 0 : 1;
 renderPunch();
 });
 }
 };
 renderPunch();
 return;
 }

 if (type === "circuit-switch") {
 var cState = { volts: 5, ohms: 10, gateHigh: true };
 var renderCircuit = function () {
 var currentA = cState.gateHigh ? (cState.volts / cState.ohms).toFixed(2) : "0.00";
 var vOut = cState.gateHigh ? ("+" + cState.volts + ".0V (HIGH / 1)") : "0.0V (LOW / 0)";
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; OHM\'S LAW &amp; SILICON MOSFET SWITCH</div>' +
 '<div class="sim-controls" style="margin-top:0.55rem">' +
 '<button type="button" class="sim-toggle-btn ' + (cState.gateHigh ? "high" : "") + '" id="sim-mosfet-gate">MOSFET Gate: ' + (cState.gateHigh ? "HIGH (+V -> Channel CLOSED)" : "LOW (0V -> Channel OPEN)") + "</button>" +
 '<label class="mono" style="font-size:0.82rem">Supply V: <select id="sim-volts" class="util-btn"><option value="3" ' + (cState.volts === 3 ? "selected" : "") + '>3V</option><option value="5" ' + (cState.volts === 5 ? "selected" : "") + '>5V</option><option value="12" ' + (cState.volts === 12 ? "selected" : "") + '>12V</option></select></label>' +
 '<label class="mono" style="font-size:0.82rem">Load R: <select id="sim-ohms" class="util-btn"><option value="2" ' + (cState.ohms === 2 ? "selected" : "") + '>2 \u03a9</option><option value="5" ' + (cState.ohms === 5 ? "selected" : "") + '>5 \u03a9</option><option value="10" ' + (cState.ohms === 10 ? "selected" : "") + '>10 \u03a9</option><option value="100" ' + (cState.ohms === 100 ? "selected" : "") + '>100 \u03a9</option></select></label>' +
 "</div>" +
 '<div class="sim-readout">' +
 '<div class="sim-metric"><span>Circuit Path</span><strong>' + (cState.gateHigh ? "CLOSED LOOP" : "OPEN GAP (R=\u221e)") + "</strong></div>" +
 '<div class="sim-metric"><span>Current (I = V / R)</span><strong>' + currentA + " A</strong></div>" +
 '<div class="sim-metric"><span>Power Heat (P = V*I)</span><strong>' + (cState.gateHigh ? (cState.volts * Number(currentA)).toFixed(2) : "0.00") + " W</strong></div>" +
 '<div class="sim-metric"><span>Node Logic State</span><strong>' + vOut + "</strong></div>" +
 "</div></div>";
 document.getElementById("sim-mosfet-gate").addEventListener("click", function () {
 cState.gateHigh = !cState.gateHigh;
 renderCircuit();
 });
 document.getElementById("sim-volts").addEventListener("change", function () {
 cState.volts = Number(this.value);
 renderCircuit();
 });
 document.getElementById("sim-ohms").addEventListener("change", function () {
 cState.ohms = Number(this.value);
 renderCircuit();
 });
 };
 renderCircuit();
 return;
 }

 if (type === "logic-gates") {
 var gState = { a: 1, b: 0 };
 var renderGates = function () {
 var a = gState.a, b = gState.b;
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; LIVE BOOLEAN SWITCH GATES</div>' +
 '<div class="sim-controls" style="margin-top:0.5rem">' +
 '<button type="button" class="sim-toggle-btn ' + (a ? "high" : "") + '" id="sim-ga">Switch A = ' + a + "</button>" +
 '<button type="button" class="sim-toggle-btn ' + (b ? "high" : "") + '" id="sim-gb">Switch B = ' + b + "</button>" +
 "</div>" +
 '<div class="sim-readout">' +
 '<div class="sim-metric"><span>NOT A (!A)</span><strong>' + (1 - a) + "</strong></div>" +
 '<div class="sim-metric"><span>A AND B (Series)</span><strong>' + (a & b) + "</strong></div>" +
 '<div class="sim-metric"><span>A OR B (Parallel)</span><strong>' + (a | b) + "</strong></div>" +
 '<div class="sim-metric"><span>A NAND B (!(A&amp;B))</span><strong>' + (1 - (a & b)) + "</strong></div>" +
 '<div class="sim-metric"><span>A XOR B (A != B)</span><strong>' + (a ^ b) + "</strong></div>" +
 "</div></div>";
 document.getElementById("sim-ga").addEventListener("click", function () { gState.a = 1 - gState.a; renderGates(); });
 document.getElementById("sim-gb").addEventListener("click", function () { gState.b = 1 - gState.b; renderGates(); });
 };
 renderGates();
 return;
 }

 if (type === "adder-latch") {
 var alState = { a: 1, b: 1, cin: 0, d: 1, we: 0, q: 0 };
 var renderAdderLatch = function () {
 var total = alState.a + alState.b + alState.cin;
 var sum = total % 2;
 var cout = total >= 2 ? 1 : 0;
 if (alState.we === 1) { alState.q = alState.d; }
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; FULL-ADDER + 1-BIT GATED D-LATCH MEMORY</div>' +
 '<div class="sim-controls" style="margin-top:0.5rem">' +
 '<button type="button" class="sim-toggle-btn ' + (alState.a ? "high" : "") + '" id="fa-a">A=' + alState.a + "</button>" +
 '<button type="button" class="sim-toggle-btn ' + (alState.b ? "high" : "") + '" id="fa-b">B=' + alState.b + "</button>" +
 '<button type="button" class="sim-toggle-btn ' + (alState.cin ? "high" : "") + '" id="fa-cin">Cin=' + alState.cin + "</button>" +
 '<span style="margin:0 0.4rem;color:var(--text-muted)">|</span>' +
 '<button type="button" class="sim-toggle-btn ' + (alState.d ? "high" : "") + '" id="dl-d">Data D=' + alState.d + "</button>" +
 '<button type="button" class="sim-toggle-btn ' + (alState.we ? "high" : "") + '" id="dl-we">WriteEnable=' + alState.we + "</button>" +
 "</div>" +
 '<div class="sim-readout">' +
 '<div class="sim-metric"><span>Full-Adder Binary</span><strong>' + cout + "" + sum + " (dec " + total + ")</strong></div>" +
 '<div class="sim-metric"><span>Carry_Out / SUM</span><strong>Cout=' + cout + ", SUM=" + sum + "</strong></div>" +
 '<div class="sim-metric"><span>D-Latch Stored Bit Q</span><strong>Q = ' + alState.q + (alState.we ? " (Writing)" : " (Latched!)") + "</strong></div>" +
 "</div></div>";
 document.getElementById("fa-a").addEventListener("click", function () { alState.a = 1 - alState.a; renderAdderLatch(); });
 document.getElementById("fa-b").addEventListener("click", function () { alState.b = 1 - alState.b; renderAdderLatch(); });
 document.getElementById("fa-cin").addEventListener("click", function () { alState.cin = 1 - alState.cin; renderAdderLatch(); });
 document.getElementById("dl-d").addEventListener("click", function () { alState.d = 1 - alState.d; renderAdderLatch(); });
 document.getElementById("dl-we").addEventListener("click", function () { alState.we = 1 - alState.we; renderAdderLatch(); });
 };
 renderAdderLatch();
 return;
 }

 if (type === "cpu-fde" || type === "opcode-pipeline") {
 var cpu = {
 pc: 0,
 r1: 0,
 r2: 0,
 zero: 0,
 phase: "Ready (Click Step Clock)",
 program: [
 { asm: "MOV R1, 12", bin: "0001 01 12", run: function (s) { s.r1 = 12; s.pc = 1; } },
 { asm: "MOV R2, 30", bin: "0001 10 30", run: function (s) { s.r2 = 30; s.pc = 2; } },
 { asm: "ADD R1, R2", bin: "0010 01 10", run: function (s) { s.r1 = s.r1 + s.r2; s.zero = s.r1 === 0 ? 1 : 0; s.pc = 3; } },
 { asm: "SUB R1, R1", bin: "0011 01 01", run: function (s) { s.r1 = 0; s.zero = 1; s.pc = 0; } }
 ]
 };
 var renderCpu = function () {
 var cur = cpu.program[cpu.pc];
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; STEP-BY-STEP CPU FETCH-DECODE-EXECUTE</div>' +
 '<div class="sim-controls" style="margin-top:0.5rem">' +
 '<button type="button" class="btn btn-primary" id="btn-cpu-step">Step Clock Rising Edge (\u2191)</button>' +
 '<button type="button" class="btn btn-secondary" id="btn-cpu-reset">Reset CPU</button>' +
 '<span class="mono" style="font-size:0.82rem;color:var(--text-secondary)">Last Action: ' + escapeHtml(cpu.phase) + "</span>" +
 "</div>" +
 '<div class="sim-readout">' +
 '<div class="sim-metric"><span>PC (Next Addr)</span><strong>0x0' + cpu.pc + "</strong></div>" +
 '<div class="sim-metric"><span>Next Instruction</span><strong>' + escapeHtml(cur.asm) + "</strong></div>" +
 '<div class="sim-metric"><span>Opcode Bits</span><strong>' + cur.bin + "</strong></div>" +
 '<div class="sim-metric"><span>Registers &amp; Flags</span><strong>R1=' + cpu.r1 + ", R2=" + cpu.r2 + ", Z=" + cpu.zero + "</strong></div>" +
 "</div></div>";
 document.getElementById("btn-cpu-step").addEventListener("click", function () {
 var inst = cpu.program[cpu.pc];
 cpu.phase = "Fetched [0x0" + cpu.pc + "] -> Decoded '" + inst.asm + "' -> Executed!";
 inst.run(cpu);
 renderCpu();
 });
 document.getElementById("btn-cpu-reset").addEventListener("click", function () {
 cpu.pc = 0; cpu.r1 = 0; cpu.r2 = 0; cpu.zero = 0; cpu.phase = "CPU Reset";
 renderCpu();
 });
 };
 renderCpu();
 return;
 }

 if (type === "finger-columns" || type === "symbol-chord-map") {
 var sampleChars = ["{", "}", "[", "]", "(", ")", ";", ":", "'", "\"", "=", ">", "&", "|", "\\", "%"];
 var btns = sampleChars.map(function (ch) {
 return '<button type="button" class="sim-toggle-btn" data-inspect-char="' + escapeHtml(ch) + '">' + escapeHtml(ch) + "</button>";
 }).join("");
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; NO-LOOK SYMBOL &amp; FINGER INSPECTOR</div>' +
 '<p style="margin:0.35rem 0 0.65rem;font-size:0.85rem;color:var(--text-secondary)">Click any developer symbol below to light up its exact physical key(s), opposite-hand Shift, and finger on the visual keyboard dock below:</p>' +
 '<div class="sim-controls">' + btns + "</div>" +
 '<div id="sym-inspect-readout" class="mono" style="font-size:0.88rem;color:var(--accent-emerald)">Select a symbol above to inspect its home-row triangulation.</div>' +
 "</div>";
 var cBtns = container.querySelectorAll("[data-inspect-char]");
 for (var i = 0; i < cBtns.length; i++) {
 cBtns[i].addEventListener("click", function () {
 var ch = this.getAttribute("data-inspect-char");
 var g = T.getKeyGuidance(ch);
 applyNextKeyGuidance(g);
 document.getElementById("sym-inspect-readout").textContent = g.badgeText + " \u2014 " + g.fingerText;
 });
 }
 return;
 }

 if (type === "memory-boxes" || type === "callstack-tracer") {
 var frames = [
 { step: "1. Call fact(3)", stack: ["main()", "fact(n=3) [waiting on fact(2)]"], ret: "pending" },
 { step: "2. Push fact(2)", stack: ["main()", "fact(n=3)", "fact(n=2) [waiting on fact(1)]"], ret: "pending" },
 { step: "3. Base Case fact(1)", stack: ["main()", "fact(n=3)", "fact(n=2)", "fact(n=1) -> returns 1!"], ret: "1" },
 { step: "4. Unwind & Pop fact(2)", stack: ["main()", "fact(n=3)", "fact(n=2) -> 2 * 1 = 2!"], ret: "2" },
 { step: "5. Unwind & Pop fact(3)", stack: ["main() receives 3 * 2 = 6!"], ret: "6" }
 ];
 var fIdx = 0;
 var renderStack = function () {
 var cur = frames[fIdx];
 container.innerHTML =
 '<div class="sim-box">' +
 '<div class="eyebrow">INTERACTIVE LAB &bull; LIFO CALL STACK &amp; MEMORY FRAME STEPPER</div>' +
 '<div class="sim-controls" style="margin-top:0.5rem">' +
 '<button type="button" class="btn btn-primary" id="btn-stack-next">Next Call-Stack Step</button>' +
 '<span class="mono" style="font-size:0.84rem">' + escapeHtml(cur.step) + "</span>" +
 "</div>" +
 '<div class="code-diagram" style="margin:0.4rem 0">' + escapeHtml(cur.stack.slice().reverse().join("\n")) + "</div>" +
 "</div>";
 document.getElementById("btn-stack-next").addEventListener("click", function () {
 fIdx = (fIdx + 1) % frames.length;
 renderStack();
 });
 };
 renderStack();
 }
 }

 // ==========================================================================
 // VIEW 1: CURRICULUM (LESSON / 10-Q ASSESSMENT / DEEP MISTAKE ANALYSIS)
 // ==========================================================================

 function renderCurriculumView(stageEl) {
 var mod = C.getModuleById(state.activeModuleId) || C.ALL_MODULES[0];
 var vault = T.getVault();
 var mRec = vault.moduleMastery[mod.id];
 var hasReport = Boolean(state.lastReportsByModule[mod.id]);

 var isCompactQuiz = state.moduleSubTab === "quiz";
 var headerHtml =
 '<div class="hero-card" style="padding:' + (isCompactQuiz ? "0.38rem 0.75rem" : "0.62rem 0.9rem") + '">' +
 '<div class="hero-header" style="align-items:center">' +
 "<div>" +
 (isCompactQuiz ? "" : '<div class="eyebrow">STAGE ' + mod.stageNumber + " &bull; MODULE " + escapeHtml(mod.code) + "</div>") +
 '<h2 class="hero-title" style="font-size:' + (isCompactQuiz ? "0.94rem" : "1.05rem") + ';margin:0">' +
 (isCompactQuiz ? ("Module " + escapeHtml(mod.code) + ": ") : "") + escapeHtml(mod.title) + "</h2>" +
 "</div>" +
 '<div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap">' +
 '<button type="button" class="mode-pill-btn' + (state.moduleSubTab === "lesson" ? " active" : "") + '" style="padding:0.32rem 0.68rem;font-size:0.79rem" data-mod-tab="lesson">1. Lesson &amp; Lab</button>' +
 '<button type="button" class="mode-pill-btn' + (state.moduleSubTab === "quiz" ? " active" : "") + '" style="padding:0.32rem 0.68rem;font-size:0.79rem" data-mod-tab="quiz">2. 10-Q Quiz + Lock-In</button>' +
 '<button type="button" class="mode-pill-btn' + (state.moduleSubTab === "analysis" ? " active" : "") + '" style="padding:0.32rem 0.68rem;font-size:0.79rem" data-mod-tab="analysis"' + (!hasReport ? " disabled" : "") + ">3. Mistake Review</button>" +
 (mRec && mRec.mastered
 ? '<span class="badge badge-success">\u2713 ' + mRec.bestPct + "%</span>"
 : '<span class="badge badge-accent">Goal: 90%+' + (mRec ? (" (" + mRec.bestPct + "%)") : "") + "</span>") +
 "</div></div></div>" +
 '<div id="module-subview"></div>';

 stageEl.innerHTML = '<div class="stage-container">' + headerHtml + "</div>";

 var tabBtns = stageEl.querySelectorAll("[data-mod-tab]");
 for (var i = 0; i < tabBtns.length; i++) {
 tabBtns[i].addEventListener("click", function () {
 var targetTab = this.getAttribute("data-mod-tab");
 if (targetTab === "quiz" && (!state.activeRoundsByModule[mod.id] || state.activeRoundsByModule[mod.id].completed)) {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {});
 }
 state.moduleSubTab = targetTab;
 renderActiveMainView();
 });
 }

 var heroStartBtn = document.getElementById("btn-hero-start-quiz");
 if (heroStartBtn) {
 heroStartBtn.addEventListener("click", function () {
 if (!state.activeRoundsByModule[mod.id] || state.activeRoundsByModule[mod.id].completed) {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {});
 }
 state.moduleSubTab = "quiz";
 renderActiveMainView();
 });
 }

 var subEl = document.getElementById("module-subview");
 if (state.moduleSubTab === "lesson") {
 renderLessonSubView(subEl, mod);
 } else if (state.moduleSubTab === "quiz") {
 if (!state.activeRoundsByModule[mod.id] || state.activeRoundsByModule[mod.id].completed) {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {});
 }
 renderQuizRoundSubView(subEl, state.activeRoundsByModule[mod.id]);
 } else if (state.moduleSubTab === "analysis" && state.lastReportsByModule[mod.id]) {
 renderMistakeAnalysisSubView(subEl, mod, state.lastReportsByModule[mod.id]);
 }
 }

 function renderLessonSubView(container, mod) {
 var warmupSample = mod.concepts[0].reteachCheck.target;
 var warmupText = "fj fj " + warmupSample;
 var html = '<div class="lesson-grid">';
 html +=
 '<div class="lockin-box" style="margin-top:0;border-color:var(--accent-primary)">' +
 '<div class="lockin-header">' +
 '<span class="lockin-title">Live No-Look Keyboard Warmup (Ready Right Now &mdash; Type Below or Click Visual Keys!)</span>' +
 '<span id="warmup-badge" class="badge badge-accent">F &amp; J Active</span>' +
 "</div>" +
 '<div id="warmup-tape" class="target-tape">' + renderTargetTapeHtml("", warmupText) + "</div>" +
 '<input id="lesson-warmup-input" type="text" class="scoped-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
 'placeholder="Start typing right now (keep eyes on screen, index fingers on F &amp; J bumps)...">' +
 "</div>";
 html += '<div id="lesson-simulator-slot"></div>';

 for (var i = 0; i < mod.lessonSections.length; i++) {
 var sec = mod.lessonSections[i];
 html += '<article class="lesson-section">';
 html += "<h3>" + escapeHtml(sec.heading) + "</h3>";
 for (var p = 0; p < sec.body.length; p++) {
 html += "<p>" + formatInlineCode(sec.body[p]) + "</p>";
 }
 if (sec.diagram) {
 html += '<pre class="code-diagram">' + escapeHtml(sec.diagram) + "</pre>";
 }
 if (sec.takeaway) {
 html += '<div class="first-principles-callout"><strong>First-Principles Takeaway:</strong> ' + formatInlineCode(sec.takeaway) + "</div>";
 }
 html += "</article>";
 }

 html +=
 '<div class="panel-card" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">' +
 "<div><strong>Ready to prove mastery without looking at the keyboard?</strong>" +
 '<div style="color:var(--text-secondary);font-size:0.88rem">Take the 10-Question Assessment: answer via keys <code>1-4</code> and complete each no-look <em>Type to Lock In</em> drill.</div></div>' +
 '<button type="button" class="btn btn-primary" id="btn-start-assessment">Start 10-Question Assessment &rarr;</button>' +
 "</div></div>";

 container.innerHTML = html;
 mountLessonSimulator(document.getElementById("lesson-simulator-slot"), mod);

 var warmupIn = document.getElementById("lesson-warmup-input");
 var warmupTape = document.getElementById("warmup-tape");
 var warmupBadge = document.getElementById("warmup-badge");
 if (warmupIn) {
 var unbindWarm = T.bindPracticeInput(warmupIn, {
 label: "Module " + mod.code + " Warmup",
 getExpectedText: function () { return warmupText; },
 onProgress: function (val, target, info) {
 warmupTape.innerHTML = renderTargetTapeHtml(val, target);
 if (info.exactMatch) {
 warmupBadge.className = "badge badge-success";
 warmupBadge.textContent = "\u2713 Warmup Complete! Press Enter to Start Quiz";
 } else {
 warmupBadge.className = "badge badge-accent";
 warmupBadge.textContent = val.length + "/" + target.length + " chars";
 }
 },
 onEnterSubmit: function () {
 if (warmupIn.value === warmupText) {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {});
 state.moduleSubTab = "quiz";
 renderActiveMainView();
 }
 }
 });
 registerUnbinder(unbindWarm);
 focusNoScroll(warmupIn);
 }

 document.getElementById("btn-start-assessment").addEventListener("click", function () {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {});
 state.moduleSubTab = "quiz";
 renderActiveMainView();
 });
 }

 function renderQuizRoundSubView(container, round) {
 var q = round.questions[round.currentIndex];
 var pct = Math.round((round.currentIndex / round.questions.length) * 100);

 var optionsHtml = "";
 for (var i = 0; i < q.options.length; i++) {
 var isSel = q.selectedOptionIdx === i;
 optionsHtml +=
 '<button type="button" class="mcq-option' + (isSel ? " selected" : "") + '" data-opt-idx="' + i + '">' +
 '<span class="mcq-key">' + (i + 1) + "</span>" +
 "<span>" + formatInlineCode(q.options[i].text) + "</span>" +
 "</button>";
 }

 var retryBadge = q.isTargetedRetry
 ? '<span class="badge badge-warn">Changed-Scenario Retry &bull; Weak Concept Focus</span>'
 : '<span class="badge badge-neutral">' + escapeHtml(q.conceptTitle) + "</span>";

 container.innerHTML =
 '<div class="panel-card question-arena" id="question-arena" tabindex="0">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;flex-wrap:wrap">' +
 '<div><strong>Round ' + round.roundNumber + (round.isFollowUp ? " (Adaptive Changed-Scenario Follow-Up)" : "") +
 " &bull; Question " + q.number + " of " + round.questions.length + "</strong></div>" +
 retryBadge +
 "</div>" +
 '<div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + pct + '%"></div></div>' +
 '<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.4rem">Keyboard Flow: Press <kbd>1</kbd>-<kbd>4</kbd> (or <kbd>Alt+1..4</kbd> anytime) to pick your MCQ answer, then type the Lock-In box eyes-up and press <kbd>Enter</kbd>!</div>' +
 '<div class="question-prompt">' + formatInlineCode(q.prompt) + "</div>" +
 '<div class="mcq-grid" id="mcq-grid">' + optionsHtml + "</div>" +

 '<div class="lockin-box">' +
 '<div class="lockin-header">' +
 '<span class="lockin-title">Type to Lock In (Eyes on Screen, Fingers on F &amp; J)</span>' +
 '<span id="lockin-status-badge" class="badge ' + (q.lockInCompleted ? "badge-success" : "badge-accent") + '">' +
 (q.lockInCompleted ? "\u2713 Locked In" : "Type exact target below") + "</span>" +
 "</div>" +
 '<div style="font-size:0.84rem;color:var(--text-secondary);margin-bottom:0.45rem">' + escapeHtml(q.lockInInstruction) + "</div>" +
 '<div id="lockin-tape" class="target-tape">' + renderTargetTapeHtml(q.typedValue, q.lockInTarget) + "</div>" +
 '<input id="type-lock-input" type="text" class="scoped-input' + (q.lockInCompleted ? " locked-complete" : "") + '" ' +
 'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
 'placeholder="Focus here (or press 1-4 above) and type without looking at the keyboard...">' +
 "</div>" +

 '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;gap:0.75rem;flex-wrap:wrap">' +
 '<span id="quiz-validation-msg" style="font-size:0.84rem;color:var(--text-secondary)">Select an option (1-4) and complete the Type-to-Lock-In phrase to advance.</span>' +
 '<button type="button" class="btn btn-primary" id="btn-submit-question">' +
 (round.currentIndex + 1 === round.questions.length ? "Submit &amp; Analyze 10-Question Round &rarr;" : "Lock In &amp; Next Question (Enter) &rarr;") +
 "</button></div></div>";

 var arenaEl = document.getElementById("question-arena");
 var inputEl = document.getElementById("type-lock-input");
 var tapeEl = document.getElementById("lockin-tape");
 var statusBadge = document.getElementById("lockin-status-badge");
 var msgEl = document.getElementById("quiz-validation-msg");
 inputEl.value = q.typedValue || "";

 function selectMcqOption(idx, moveFocusToInput) {
 if (idx < 0 || idx >= q.options.length) { return; }
 q.selectedOptionIdx = idx;
 var btns = container.querySelectorAll("[data-opt-idx]");
 for (var b = 0; b < btns.length; b++) {
 btns[b].classList.toggle("selected", b === idx);
 }
 if (moveFocusToInput) {
 focusNoScroll(inputEl);
 }
 }

 function attemptAdvanceQuestion() {
 if (q.selectedOptionIdx === null) {
 msgEl.style.color = "var(--accent-amber)";
 msgEl.textContent = "Pick an MCQ choice first (press Alt+1..4 or click option 1-4)!";
 return;
 }
 if (!q.lockInCompleted) {
 msgEl.style.color = "var(--accent-amber)";
 msgEl.textContent = "Finish typing the exact 'Type to Lock In' target cleanly before advancing!";
 focusNoScroll(inputEl);
 return;
 }
 q.submitted = true;
 if (round.currentIndex + 1 < round.questions.length) {
 round.currentIndex += 1;
 renderActiveMainView();
 } else {
 var report = Q.finalizeModuleRound(round);
 state.lastReportsByModule[round.moduleId] = report;
 state.moduleSubTab = "analysis";
 renderActiveMainView();
 }
 }

 var optBtns = container.querySelectorAll("[data-opt-idx]");
 for (var m = 0; m < optBtns.length; m++) {
 optBtns[m].addEventListener("click", function () {
 selectMcqOption(Number(this.getAttribute("data-opt-idx")), true);
 });
 }

 // Scoped MCQ option hotkeys inside question-arena (and Alt+1..4 while inside input)
 function onArenaKeyDown(e) {
 if (document.activeElement === arenaEl && !e.ctrlKey && !e.metaKey && !e.altKey) {
 var keyUpper = (e.key || "").toUpperCase();
 var map = { "1": 0, "2": 1, "3": 2, "4": 3, "A": 0, "B": 1, "C": 2, "D": 3 };
 if (map[keyUpper] !== undefined) {
 e.preventDefault();
 selectMcqOption(map[keyUpper], true);
 }
 } else if (document.activeElement === inputEl && e.altKey && /^[1-4]$/.test(e.key)) {
 e.preventDefault();
 selectMcqOption(Number(e.key) - 1, true);
 }
 }
 arenaEl.addEventListener("keydown", onArenaKeyDown);
 registerUnbinder(function () { arenaEl.removeEventListener("keydown", onArenaKeyDown); });

 // Strictly scoped telemetry binding on #type-lock-input
 var unbindInput = T.bindPracticeInput(inputEl, {
 label: "Quiz Q" + q.number + " Lock-In",
 tracker: round.tracker,
 getExpectedText: function () { return q.lockInTarget; },
 onProgress: function (val, target, info) {
 q.typedValue = val;
 q.lockInCompleted = info.exactMatch;
 tapeEl.innerHTML = renderTargetTapeHtml(val, target);
 if (info.exactMatch) {
 statusBadge.className = "badge badge-success";
 statusBadge.textContent = "\u2713 Locked In! Press Enter";
 } else {
 statusBadge.className = "badge badge-accent";
 statusBadge.textContent = val.length + "/" + target.length + " chars";
 }
 },
 onEnterSubmit: attemptAdvanceQuestion
 });
 registerUnbinder(unbindInput);

 document.getElementById("btn-submit-question").addEventListener("click", attemptAdvanceQuestion);

 // Focus arena initially without scrolling so prompt + options + lock-in stay 100% in view!
 if (q.selectedOptionIdx === null) {
 focusNoScroll(arenaEl);
 } else {
 focusNoScroll(inputEl);
 }
 }

 function renderMistakeAnalysisSubView(container, mod, report) {
 var ts = report.typingSummary;
 var slipsHtml = "";
 if (report.groupedSlips.length === 0) {
 slipsHtml = '<div style="color:var(--accent-emerald);font-size:0.9rem">\u2713 Zero finger slips recorded in this round!</div>';
 } else {
 slipsHtml = '<table class="data-table"><thead><tr><th>Expected &rarr; Typed</th><th>Count</th><th>Physical Slip Diagnosis</th></tr></thead><tbody>' +
 report.groupedSlips.slice(0, 8).map(function (sl) {
 return "<tr><td><code>" + escapeHtml(sl.pair) + "</code></td><td>" + sl.count + "</td><td>" + escapeHtml(sl.reason) + "</td></tr>";
 }).join("") + "</tbody></table>";
 }

 var hesitantHtml = ts.hesitantKeys.length === 0
 ? '<span class="badge badge-success">Smooth cadence (&lt;250ms/key)</span>'
 : ts.hesitantKeys.map(function (hk) {
 return '<span class="badge badge-warn" style="margin-right:0.35rem">\'' + escapeHtml(hk.char) + "\': " + hk.avgMs + "ms</span>";
 }).join("");

 var cardsHtml = "";
 if (report.teachingCards.length === 0) {
 cardsHtml =
 '<div class="panel-card" style="border-color:var(--accent-emerald)">' +
 '<h3 style="margin:0 0 0.35rem;color:var(--accent-emerald)">\u2713 Flawless 10/10 Conceptual Mastery!</h3>' +
 "<p style=\"margin:0;color:var(--text-secondary)\">You answered all 10 concepts accurately and locked in every typed drill. Proceed to the next module or run a fresh changed-scenario challenge anytime.</p>" +
 "</div>";
 } else {
 cardsHtml = '<h3 style="margin:0.4rem 0 0.2rem">Deep Mistake Analysis &amp; First-Principles Re-Teaching (' + report.teachingCards.length + ' Missed)</h3>' +
 '<p style="margin:0 0 0.6rem;color:var(--text-secondary);font-size:0.9rem">Review why each wrong choice failed and complete its <strong>Mini Typed Verification Check</strong> below before launching your Changed-Scenario Follow-Up Round:</p>';

 for (var c = 0; c < report.teachingCards.length; c++) {
 var card = report.teachingCards[c];
 cardsHtml +=
 '<div class="reteach-card' + (card.verified ? " verified" : "") + '" id="card-' + card.cardId + '">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap">' +
 '<strong>Q' + card.questionNumber + " &bull; " + escapeHtml(card.conceptTitle) + "</strong>" +
 '<span id="badge-' + card.cardId + '" class="badge ' + (card.verified ? "badge-success" : "badge-danger") + '">' +
 (card.verified ? "\u2713 Re-Teach Verified" : "Needs Mini Check") + "</span></div>" +
 '<div style="font-size:0.92rem">' + formatInlineCode(card.prompt) + "</div>" +
 '<div class="reteach-why-wrong"><strong>Why Your Choice Failed (<code>' + escapeHtml(card.chosenText) + "</code>):</strong><br>" +
 formatInlineCode(card.whyWrong) + "<br><strong style=\"color:var(--accent-emerald)\">Correct Answer:</strong> " + formatInlineCode(card.correctText) + "</div>" +
 '<div class="reteach-zero-lesson"><strong>Teach From Zero:</strong> ' + formatInlineCode(card.zeroTeach) +
 '<div style="margin-top:0.4rem;color:var(--text-secondary)"><strong>Concrete Example:</strong> ' + formatInlineCode(card.concreteExample) + "</div></div>" +
 '<div class="lockin-box" style="margin-top:0.2rem">' +
 '<div style="font-size:0.8rem;font-weight:700;color:var(--accent-primary);margin-bottom:0.35rem">Mini Typed Verification Check: ' + escapeHtml(card.reteachCheck.instruction) + "</div>" +
 '<div id="tape-' + card.cardId + '" class="target-tape">' + renderTargetTapeHtml(card.verified ? card.reteachCheck.target : "", card.reteachCheck.target) + "</div>" +
 '<input type="text" class="scoped-input' + (card.verified ? " locked-complete" : "") + '" data-reteach-idx="' + c + '" ' +
 'value="' + (card.verified ? escapeHtml(card.reteachCheck.target) : "") + '" autocomplete="off" spellcheck="false" placeholder="Type to verify understanding without looking down...">' +
 "</div></div>";
 }
 }

 // Next module button when >= 90%
 var modIdx = C.ALL_MODULES.indexOf(mod);
 var nextMod = modIdx >= 0 && modIdx + 1 < C.ALL_MODULES.length ? C.ALL_MODULES[modIdx + 1] : null;

 var ctaHtml = "";
 if (!report.masteredRound) {
 ctaHtml =
 '<div class="panel-card" style="border-color:var(--accent-amber);display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">' +
 "<div><strong>Adaptive Mastery Loop (" + report.scorePct + "% / 90% Target)</strong>" +
 '<div style="color:var(--text-secondary);font-size:0.88rem">Your next 10-question round will prioritize <strong>' + report.missedConceptIds.length +
 " missed concept(s)</strong> using fresh changed scenarios, new values, and weak-key typing practice until you hit 90%+.</div></div>" +
 '<button type="button" class="btn btn-primary" id="btn-followup-round">Launch Changed-Scenario Follow-Up Round &rarr;</button>' +
 "</div>";
 } else {
 ctaHtml =
 '<div class="panel-card" style="border-color:var(--accent-emerald);display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">' +
 "<div><strong style=\"color:var(--accent-emerald)\">\u2713 Module Mastery Achieved (" + report.scorePct + "% &ge; 90%)!</strong>" +
 '<div style="color:var(--text-secondary);font-size:0.88rem">You can advance to the next module or generate another changed-scenario practice round anytime.</div></div>' +
 '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
 '<button type="button" class="btn btn-secondary" id="btn-followup-round">New Changed-Scenario Round</button>' +
 (nextMod ? '<button type="button" class="btn btn-success" id="btn-next-module">Next: ' + escapeHtml(nextMod.code + " " + nextMod.title) + " &rarr;</button>" : "") +
 "</div></div>";
 }

 container.innerHTML =
 '<div class="lesson-grid">' +
 '<div class="panel-card">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap">' +
 '<h3 style="margin:0">Round ' + report.roundNumber + " Diagnostic Scorecard</h3>" +
 '<span class="badge ' + (report.masteredRound ? "badge-success" : "badge-warn") + '">' +
 report.correctCount + "/" + report.totalCount + " (" + report.scorePct + "%)</span></div>" +
 '<div class="summary-kpi-grid">' +
 '<div class="kpi-card"><div class="kpi-label">Concept Mastery</div><div class="kpi-val">' + report.scorePct + '%</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Round Net WPM</div><div class="kpi-val">' + ts.netWpm + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Typing Accuracy</div><div class="kpi-val">' + ts.accuracyPct + '%</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Median Hesitation</div><div class="kpi-val">' + (ts.medianLatencyMs || 0) + 'ms</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Backspaces</div><div class="kpi-val">' + ts.backspaces + '</div></div>' +
 "</div>" +
 '<div style="margin-top:0.6rem"><strong style="font-size:0.82rem;color:var(--text-muted)">HESITANT / SLOW KEYS IN ROUND:</strong> ' + hesitantHtml + "</div>" +
 '<div style="margin-top:0.75rem"><strong style="font-size:0.82rem;color:var(--text-muted)">FINGER-SLIP DIAGNOSTICS:</strong>' + slipsHtml + "</div>" +
 "</div>" +
 cardsHtml +
 ctaHtml +
 "</div>";

 // Bind scoped telemetry to every Deep Teaching Card mini-check input!
 var reteachInputs = container.querySelectorAll("[data-reteach-idx]");
 for (var r = 0; r < reteachInputs.length; r++) {
 (function (inp) {
 var idx = Number(inp.getAttribute("data-reteach-idx"));
 var card = report.teachingCards[idx];
 var tape = document.getElementById("tape-" + card.cardId);
 var cardBox = document.getElementById("card-" + card.cardId);
 var badge = document.getElementById("badge-" + card.cardId);
 var unbind = T.bindPracticeInput(inp, {
 label: "Re-Teach Check Q" + card.questionNumber,
 getExpectedText: function () { return card.reteachCheck.target; },
 onProgress: function (val, target, info) {
 tape.innerHTML = renderTargetTapeHtml(val, target);
 if (info.exactMatch) {
 card.verified = true;
 cardBox.classList.add("verified");
 badge.className = "badge badge-success";
 badge.textContent = "\u2713 Re-Teach Verified!";
 }
 }
 });
 registerUnbinder(unbind);
 })(reteachInputs[r]);
 }

 var followBtn = document.getElementById("btn-followup-round");
 if (followBtn) {
 followBtn.addEventListener("click", function () {
 state.activeRoundsByModule[mod.id] = Q.createModuleRound(mod.id, {
 isFollowUp: true,
 prioritizeConceptIds: report.missedConceptIds,
 missedCharsFromLastRound: report.roundMissedChars
 });
 state.moduleSubTab = "quiz";
 renderActiveMainView();
 });
 }

 var nextBtn = document.getElementById("btn-next-module");
 if (nextBtn && nextMod) {
 nextBtn.addEventListener("click", function () {
 state.activeModuleId = nextMod.id;
 state.moduleSubTab = "lesson";
 renderActiveMainView();
 });
 }
 }

 // ==========================================================================
 // VIEW 2: NO-LOOK TOUCH TYPING & HEAVY DEVELOPER SYMBOL DOJO
 // ==========================================================================

 function renderTypingDojoView(stageEl) {
 var adaptiveDrill = S.generateAdaptiveWeakKeyDrill();
 var allDrills = S.TYPING_DRILLS.concat([adaptiveDrill]);
 var currentDrill = allDrills[0];
 for (var i = 0; i < allDrills.length; i++) {
 if (allDrills[i].id === state.activeDrillId) {
 currentDrill = allDrills[i];
 break;
 }
 }

 var selectorBtns = allDrills.map(function (d) {
 return '<button type="button" class="mode-pill-btn' + (d.id === currentDrill.id ? " active" : "") + '" data-drill-id="' + d.id + '">' +
 escapeHtml(d.category) + "</button>";
 }).join("");

 stageEl.innerHTML =
 '<div class="stage-container">' +
 '<div class="hero-card">' +
 '<div class="eyebrow">STAGE 4 DOJO &bull; PROPRIOCEPTIVE NO-LOOK FLUENCY</div>' +
 '<h2 class="hero-title">Touch Typing &amp; Heavy Developer Symbol Drills</h2>' +
 '<p class="hero-subtitle">Keep index fingers anchored on <code>F</code> and <code>J</code> tactile bumps. Follow the glowing next-key and two-hand finger diagram below - never look down at physical keys.</p>' +
 '<div class="mode-pills">' + selectorBtns + "</div>" +
 "</div>" +

 '<div class="panel-card">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;flex-wrap:wrap">' +
 '<div><h3 style="margin:0">' + escapeHtml(currentDrill.title) + '</h3>' +
 '<div style="font-size:0.84rem;color:var(--text-secondary);margin-top:0.2rem"><strong>Focus Keys:</strong> <code>' + escapeHtml(currentDrill.focusKeys) + "</code> &bull; " + escapeHtml(currentDrill.tip) + "</div></div>" +
 '<button type="button" class="btn btn-secondary" id="btn-reset-drill">Restart Drill</button>' +
 "</div>" +

 '<div class="summary-kpi-grid">' +
 '<div class="kpi-card"><div class="kpi-label">Live Net WPM</div><div class="kpi-val" id="drill-wpm">0</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Accuracy</div><div class="kpi-val" id="drill-acc">100%</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Median Latency</div><div class="kpi-val" id="drill-lat">&mdash;</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Backspaces</div><div class="kpi-val" id="drill-bksp">0</div></div>' +
 "</div>" +

 '<div id="drill-tape" class="target-tape" style="font-size:1.12rem">' + renderTargetTapeHtml("", currentDrill.text) + "</div>" +
 '<textarea id="drill-input" class="scoped-input" rows="3" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Click here and type the entire target tape without glancing down at your hands..."></textarea>' +
 '<div id="drill-complete-banner" style="margin-top:0.8rem"></div>' +
 "</div></div>";

 var dBtns = stageEl.querySelectorAll("[data-drill-id]");
 for (var b = 0; b < dBtns.length; b++) {
 dBtns[b].addEventListener("click", function () {
 state.activeDrillId = this.getAttribute("data-drill-id");
 renderActiveMainView();
 });
 }

 var inputEl = document.getElementById("drill-input");
 var tapeEl = document.getElementById("drill-tape");
 var tracker = T.createSessionTracker(currentDrill.title);
 var savedOnce = false;

 var unbind = T.bindPracticeInput(inputEl, {
 label: "Symbol Dojo (" + currentDrill.id + ")",
 tracker: tracker,
 onProgress: function (val, target, info) {
 tapeEl.innerHTML = renderTargetTapeHtml(val, target);
 var s = info.summary;
 document.getElementById("drill-wpm").textContent = String(s.netWpm);
 document.getElementById("drill-acc").textContent = s.accuracyPct + "%";
 document.getElementById("drill-lat").textContent = s.medianLatencyMs ? (s.medianLatencyMs + "ms") : "\u2014";
 document.getElementById("drill-bksp").textContent = String(s.backspaces);
 },
 getExpectedText: function () { return currentDrill.text; },
 onComplete: function (summary) {
 if (savedOnce) { return; }
 savedOnce = true;
 T.recordDrillResult({
 drillId: currentDrill.id,
 title: currentDrill.title,
 netWpm: summary.netWpm,
 accuracyPct: summary.accuracyPct,
 medianLatencyMs: summary.medianLatencyMs,
 backspaces: summary.backspaces
 });
 var curIdx = allDrills.indexOf(currentDrill);
 var nextDrill = allDrills[(curIdx + 1) % allDrills.length];
 document.getElementById("drill-complete-banner").innerHTML =
 '<div class="first-principles-callout" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.6rem">' +
 "<span><strong>\u2713 Drill Complete!</strong> " + summary.netWpm + " Net WPM &bull; " + summary.accuracyPct + "% Accuracy &bull; " + summary.medianLatencyMs + "ms Median Latency.</span>" +
 '<button type="button" class="btn btn-primary" id="btn-next-drill">Next Track: ' + escapeHtml(nextDrill.category) + " &rarr;</button></div>";
 document.getElementById("btn-next-drill").addEventListener("click", function () {
 state.activeDrillId = nextDrill.id;
 renderActiveMainView();
 });
 }
 });
 registerUnbinder(unbind);

 document.getElementById("btn-reset-drill").addEventListener("click", function () {
 renderActiveMainView();
 });

 inputEl.focus();
 }

 // ==========================================================================
 // VIEW 3: SAFE IN-APP SHORTCUT LAB
 // ==========================================================================

 function renderBufferLineWithCursor(lineText, isCursorLine, col, selStart, selEnd) {
 if (!isCursorLine) {
 return escapeHtml(lineText);
 }
 if (typeof selStart === "number" && typeof selEnd === "number" && selEnd > selStart) {
 return escapeHtml(lineText.slice(0, selStart)) +
 '<span class="selection-span">' + escapeHtml(lineText.slice(selStart, selEnd)) + "</span>" +
 '<span class="cursor-caret">&nbsp;</span>' +
 escapeHtml(lineText.slice(selEnd));
 }
 var c = Math.min(Math.max(0, col), lineText.length);
 var chAt = c < lineText.length ? escapeHtml(lineText[c]) : "&nbsp;";
 return escapeHtml(lineText.slice(0, c)) +
 '<span class="cursor-caret">' + chAt + "</span>" +
 escapeHtml(lineText.slice(c + 1));
 }

 function renderShortcutLabView(stageEl) {
 var cats = ["All", "Word Navigation", "Line Editing", "Selection", "Terminal Shortcuts"];
 var filtered = S.SHORTCUT_CHALLENGES.filter(function (ch) {
 return state.shortcutCategoryFilter === "All" || ch.category === state.shortcutCategoryFilter;
 });
 if (state.activeShortcutIdx >= filtered.length) {
 state.activeShortcutIdx = 0;
 }
 var ch = filtered[state.activeShortcutIdx];
 var bufState = {
 lines: ch.initialLines.slice(),
 line: ch.initialLine,
 col: ch.initialCol,
 selStart: null,
 selEnd: null,
 statusMsg: "Focus the sandbox box below and execute the shortcut chord!"
 };

 var catBtns = cats.map(function (cat) {
 return '<button type="button" class="mode-pill-btn' + (cat === state.shortcutCategoryFilter ? " active" : "") + '" data-sc-cat="' + cat + '">' + cat + "</button>";
 }).join("");

 stageEl.innerHTML =
 '<div class="stage-container">' +
 '<div class="hero-card">' +
 '<div class="eyebrow">SAFE SCOPED SANDBOX &bull; ZERO TAB CLOSES</div>' +
 '<h2 class="hero-title">Editor &amp; Terminal Shortcut Trainer</h2>' +
 '<p class="hero-subtitle">All chords are safely intercepted inside the focused sandbox below so you build instinctive navigation, line-editing, selection, and shell reflexes.</p>' +
 '<div class="mode-pills">' + catBtns + "</div>" +
 "</div>" +

 '<div class="panel-card">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">' +
 '<div><span class="badge badge-accent">' + escapeHtml(ch.category) + " &bull; " + (state.activeShortcutIdx + 1) + "/" + filtered.length + "</span>" +
 '<h3 style="margin:0.35rem 0 0.2rem">' + escapeHtml(ch.title) + "</h3></div>" +
 '<div><span class="badge badge-neutral">Win/Linux: ' + escapeHtml(ch.displayChord) + '</span> ' +
 '<span class="badge badge-neutral">macOS: ' + escapeHtml(ch.macChord) + "</span></div>" +
 "</div>" +
 '<p style="margin:0.4rem 0 0.85rem;color:var(--text-primary)">' + formatInlineCode(ch.prompt) + "</p>" +

 '<div id="shortcut-sandbox" class="shortcut-sandbox" tabindex="0" role="application" aria-label="Focused Shortcut Capture Sandbox">' +
 '<div style="font-size:0.74rem;color:var(--accent-primary);font-weight:700;margin-bottom:0.4rem">FOCUSED SHORTCUT BUFFER (Press ' + escapeHtml(ch.displayChord) + ' here):</div>' +
 '<div id="sandbox-lines"></div>' +
 '<div id="sandbox-feedback" style="margin-top:0.65rem;font-size:0.86rem;color:var(--text-secondary)"></div>' +
 "</div>" +

 '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.9rem;flex-wrap:wrap;gap:0.5rem">' +
 '<button type="button" class="btn btn-secondary" id="btn-sc-prev">&larr; Previous</button>' +
 '<button type="button" class="btn btn-primary" id="btn-sc-next">Skip / Next Shortcut &rarr;</button>' +
 "</div></div></div>";

 function paintBuffer(feedbackHtml) {
 var linesContainer = document.getElementById("sandbox-lines");
 var fb = document.getElementById("sandbox-feedback");
 if (!linesContainer || !fb) { return; }
 linesContainer.innerHTML = bufState.lines.map(function (ln, idx) {
 return '<div class="sandbox-buffer-line">' +
 renderBufferLineWithCursor(ln, idx === bufState.line, bufState.col, bufState.selStart, bufState.selEnd) +
 "</div>";
 }).join("");
 fb.innerHTML = feedbackHtml || escapeHtml(bufState.statusMsg);
 }

 paintBuffer();

 var catEls = stageEl.querySelectorAll("[data-sc-cat]");
 for (var i = 0; i < catEls.length; i++) {
 catEls[i].addEventListener("click", function () {
 state.shortcutCategoryFilter = this.getAttribute("data-sc-cat");
 state.activeShortcutIdx = 0;
 renderActiveMainView();
 });
 }

 var sandboxEl = document.getElementById("shortcut-sandbox");
 var unbind = S.bindShortcutSandbox(sandboxEl, {
 getCurrentChallenge: function () { return ch; },
 onScopeChange: updateScopeIndicator,
 onGuidance: applyNextKeyGuidance,
 onMatch: function (chordPressed, elapsedMs) {
 ch.applyEffect(bufState);
 paintBuffer(
 '<span style="color:var(--accent-emerald);font-weight:700">\u2713 Captured <code>' + escapeHtml(chordPressed) +
 "</code> in " + elapsedMs + "ms!</span> " + escapeHtml(bufState.statusMsg) +
 ' &mdash; Press <kbd>Enter</kbd> or click Next for the next challenge.'
 );
 var advanceHandler = function (ev) {
 if (ev.key === "Enter") {
 ev.preventDefault();
 sandboxEl.removeEventListener("keydown", advanceHandler);
 state.activeShortcutIdx = (state.activeShortcutIdx + 1) % filtered.length;
 renderActiveMainView();
 }
 };
 sandboxEl.addEventListener("keydown", advanceHandler);
 },
 onMiss: function (chordPressed) {
 paintBuffer(
 '<span style="color:var(--accent-danger);font-weight:700">Heard <code>' + escapeHtml(chordPressed) +
 "</code></span> &mdash; expected <code>" + escapeHtml(ch.displayChord) + "</code>. Keep hands on home row and try again!"
 );
 }
 });
 registerUnbinder(unbind);

 document.getElementById("btn-sc-prev").addEventListener("click", function () {
 state.activeShortcutIdx = (state.activeShortcutIdx - 1 + filtered.length) % filtered.length;
 renderActiveMainView();
 });
 document.getElementById("btn-sc-next").addEventListener("click", function () {
 state.activeShortcutIdx = (state.activeShortcutIdx + 1) % filtered.length;
 renderActiveMainView();
 });

 sandboxEl.focus();
 }

 // ==========================================================================
 // VIEW 4: TIMED BENCHMARK EXAM MODE (TYPING + SHORTCUTS + CUMULATIVE MCQS)
 // ==========================================================================

 function startNewBenchmarkExam() {
 var seed = Date.now() % 1000;
 var passage = S.BENCHMARK_PASSAGES[seed % S.BENCHMARK_PASSAGES.length];
 state.benchmark = {
 phase: "typing", // typing -> shortcuts -> mcq -> done
 totalSecondsLeft: 420, // 7-minute comprehensive timed benchmark
 passage: passage,
 typingTracker: T.createSessionTracker("Benchmark Typing"),
 typingSummary: null,
 shortcuts: S.getBenchmarkShortcuts(seed),
 shortcutIdx: 0,
 shortcutHits: 0,
 shortcutTotalMs: 0,
 questions: Q.buildBenchmarkQuestionSet(seed),
 qIdx: 0,
 mcqTracker: T.createSessionTracker("Benchmark Lock-In"),
 finalRecord: null
 };

 if (state.timerHandle) {
 clearInterval(state.timerHandle);
 }
 state.timerHandle = setInterval(function () {
 if (!state.benchmark || state.benchmark.phase === "done") {
 clearInterval(state.timerHandle);
 state.timerHandle = null;
 return;
 }
 state.benchmark.totalSecondsLeft -= 1;
 var timerBadge = document.getElementById("bench-timer-badge");
 if (timerBadge) {
 var m = Math.floor(Math.max(0, state.benchmark.totalSecondsLeft) / 60);
 var sec = Math.max(0, state.benchmark.totalSecondsLeft) % 60;
 timerBadge.textContent = "\u23f1 " + m + ":" + (sec < 10 ? "0" + sec : sec);
 }
 if (state.benchmark.totalSecondsLeft <= 0) {
 finishBenchmarkExam();
 if (state.activeNav === "benchmark") {
 renderActiveMainView();
 }
 }
 }, 1000);
 }

 function finishBenchmarkExam() {
 var b = state.benchmark;
 if (!b || b.phase === "done") { return; }
 if (state.timerHandle) {
 clearInterval(state.timerHandle);
 state.timerHandle = null;
 }

 var tSum = b.typingSummary || T.summarizeTracker(b.typingTracker);
 var scPct = Math.round((b.shortcutHits / b.shortcuts.length) * 100);
 var scAvgMs = b.shortcutHits > 0 ? Math.round(b.shortcutTotalMs / b.shortcutHits) : 0;

 var mcqCorrect = 0;
 for (var i = 0; i < b.questions.length; i++) {
 var q = b.questions[i];
 if (q.selectedOptionIdx !== null && q.options[q.selectedOptionIdx] && q.options[q.selectedOptionIdx].isCorrect) {
 mcqCorrect += 1;
 }
 }
 var mcqPct = Math.round((mcqCorrect / b.questions.length) * 100);

 // Weighted holistic Systems Score: 45% Foundations MCQ, 35% No-Look Speed & Accuracy, 20% Shortcut Recall
 var typingComponent = Math.min(100, Math.round((Math.min(tSum.netWpm, 65) / 65) * 60 + (tSum.accuracyPct / 100) * 40));
 var composite = Math.round(mcqPct * 0.45 + typingComponent * 0.35 + scPct * 0.20);
 var grade = composite >= 90 ? "Principal Systems Builder" :
 composite >= 78 ? "Proficient Systems Developer" :
 composite >= 62 ? "Developing Practitioner" : "Apprentice - Keep Drilling";

 b.finalRecord = T.recordBenchmarkResult({
 compositeScore: composite,
 grade: grade,
 netWpm: tSum.netWpm,
 typingAccuracyPct: tSum.accuracyPct,
 medianLatencyMs: tSum.medianLatencyMs,
 shortcutPct: scPct,
 shortcutAvgMs: scAvgMs,
 mcqPct: mcqPct,
 mcqCorrect: mcqCorrect,
 mcqTotal: b.questions.length,
 timeRemainingSec: Math.max(0, b.totalSecondsLeft)
 });
 b.phase = "done";
 }

 function renderBenchmarkHistoryHtml() {
 var history = T.getVault().benchmarkHistory || [];
 if (history.length === 0) {
 return '<p style="color:var(--text-muted);margin:0.4rem 0">No saved benchmark runs yet. Complete a timed Benchmark Exam above to track longitudinal speed and systems mastery.</p>';
 }
 // Simple local inline SVG sparkline when >= 2 runs exist
 var sparkHtml = "";
 if (history.length >= 2) {
 var chron = history.slice(0, 12).reverse();
 var pts = chron.map(function (r, idx) {
 var x = Math.round(16 + (idx / (chron.length - 1)) * 328);
 var y = Math.round(54 - (Math.min(100, Math.max(0, r.compositeScore)) / 100) * 44);
 return x + "," + y;
 }).join(" ");
 sparkHtml =
 '<svg viewBox="0 0 360 64" style="width:100%;max-width:420px;height:64px;background:var(--bg-code);border-radius:8px;border:1px solid var(--border-subtle);margin-bottom:0.65rem">' +
 '<polyline fill="none" stroke="var(--accent-primary)" stroke-width="2.5" points="' + pts + '" />' +
 "</svg>";
 }

 var rows = history.slice(0, 15).map(function (r) {
 return "<tr>" +
 "<td>" + escapeHtml(r.timestamp.slice(0, 16).replace("T", " ")) + "</td>" +
 "<td><strong>" + r.compositeScore + "/100</strong> (" + escapeHtml(r.grade) + ")</td>" +
 "<td>" + r.netWpm + " WPM (" + r.typingAccuracyPct + "%)</td>" +
 "<td>" + r.shortcutPct + "%</td>" +
 "<td>" + r.mcqCorrect + "/" + r.mcqTotal + " (" + r.mcqPct + "%)</td>" +
 "</tr>";
 }).join("");

 return sparkHtml +
 '<table class="data-table"><thead><tr><th>Date</th><th>Overall Score</th><th>No-Look Typing</th><th>Shortcuts</th><th>Stages 1-5 MCQ</th></tr></thead><tbody>' +
 rows + "</tbody></table>";
 }

 function renderBenchmarkView(stageEl) {
 var b = state.benchmark;
 if (!b) {
 stageEl.innerHTML =
 '<div class="stage-container">' +
 '<div class="hero-card">' +
 '<div class="eyebrow">CUMULATIVE TIMED CERTIFICATION</div>' +
 '<h2 class="hero-title">Systems, Shortcut &amp; No-Look Coding Benchmark Exam</h2>' +
 '<p class="hero-subtitle">7-minute cumulative gauntlet combining: (1) Blindfolded Code &amp; Symbol Speed Passage, (2) 6 Rapid Safe Shortcut Tasks, and (3) 10 Cross-Stage Foundation MCQs + Lock-Ins across Stages 1-5.</p>' +
 '<div style="margin-top:0.9rem"><button type="button" class="btn btn-primary" id="btn-launch-bench">Start Timed Benchmark Exam &rarr;</button></div>' +
 "</div>" +
 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Saved Local Benchmark History</h3>' + renderBenchmarkHistoryHtml() + "</div>" +
 "</div>";
 document.getElementById("btn-launch-bench").addEventListener("click", function () {
 startNewBenchmarkExam();
 renderActiveMainView();
 });
 return;
 }

 var m = Math.floor(Math.max(0, b.totalSecondsLeft) / 60);
 var sec = Math.max(0, b.totalSecondsLeft) % 60;
 var clockStr = "\u23f1 " + m + ":" + (sec < 10 ? "0" + sec : sec);

 if (b.phase === "typing") {
 stageEl.innerHTML =
 '<div class="stage-container"><div class="panel-card">' +
 '<div style="display:flex;justify-content:space-between;align-items:center">' +
 '<div><span class="badge badge-accent">Part 1 of 3 &bull; Blindfolded Code &amp; Symbol Speed</span><h3 style="margin:0.3rem 0">Type the Systems Snippet Eyes-Up</h3></div>' +
 '<span id="bench-timer-badge" class="badge badge-warn" style="font-size:0.9rem">' + clockStr + "</span></div>" +
 '<div id="bench-tape" class="target-tape">' + renderTargetTapeHtml("", b.passage) + "</div>" +
 '<textarea id="bench-typing-input" class="scoped-input" rows="3" autocomplete="off" spellcheck="false" placeholder="Type exact passage without looking down..."></textarea>' +
 '<div style="margin-top:0.75rem;display:flex;justify-content:flex-end"><button type="button" class="btn btn-secondary" id="btn-skip-bench-p1">Finish Part 1 Early &rarr;</button></div>' +
 "</div></div>";
 var inp = document.getElementById("bench-typing-input");
 var tape = document.getElementById("bench-tape");
 var unbind = T.bindPracticeInput(inp, {
 label: "Benchmark Part 1 Typing",
 tracker: b.typingTracker,
 getExpectedText: function () { return b.passage; },
 onProgress: function (val, target) {
 tape.innerHTML = renderTargetTapeHtml(val, target);
 },
 onComplete: function (summary) {
 b.typingSummary = summary;
 b.phase = "shortcuts";
 renderActiveMainView();
 }
 });
 registerUnbinder(unbind);
 document.getElementById("btn-skip-bench-p1").addEventListener("click", function () {
 b.typingSummary = T.summarizeTracker(b.typingTracker);
 b.phase = "shortcuts";
 renderActiveMainView();
 });
 inp.focus();
 return;
 }

 if (b.phase === "shortcuts") {
 var sc = b.shortcuts[b.shortcutIdx];
 stageEl.innerHTML =
 '<div class="stage-container"><div class="panel-card">' +
 '<div style="display:flex;justify-content:space-between;align-items:center">' +
 '<div><span class="badge badge-accent">Part 2 of 3 &bull; Rapid Shortcut Recall (' + (b.shortcutIdx + 1) + "/" + b.shortcuts.length + ')</span>' +
 '<h3 style="margin:0.3rem 0">' + escapeHtml(sc.title) + "</h3></div>" +
 '<span id="bench-timer-badge" class="badge badge-warn" style="font-size:0.9rem">' + clockStr + "</span></div>" +
 "<p>" + formatInlineCode(sc.prompt) + "</p>" +
 '<div id="bench-sc-box" class="shortcut-sandbox" tabindex="0">' +
 '<div class="mono" style="font-size:0.8rem;color:var(--accent-primary);margin-bottom:0.4rem">Focus here &amp; press the required shortcut chord (recall from memory!):</div>' +
 sc.initialLines.map(function (ln) { return '<div class="sandbox-buffer-line">' + escapeHtml(ln) + "</div>"; }).join("") +
 '<div id="bench-sc-msg" style="margin-top:0.5rem;font-size:0.84rem;color:var(--text-secondary)">Waiting for chord...</div>' +
 "</div>" +
 '<div style="margin-top:0.75rem;display:flex;justify-content:flex-end"><button type="button" class="btn btn-secondary" id="btn-skip-sc">Skip Shortcut &rarr;</button></div>' +
 "</div></div>";

 var scBox = document.getElementById("bench-sc-box");
 var advanceSc = function () {
 if (b.shortcutIdx + 1 < b.shortcuts.length) {
 b.shortcutIdx += 1;
 } else {
 b.phase = "mcq";
 }
 renderActiveMainView();
 };
 var unbindSc = S.bindShortcutSandbox(scBox, {
 getCurrentChallenge: function () { return sc; },
 onScopeChange: updateScopeIndicator,
 onGuidance: function () {
 // In Benchmark exam mode don't give away the answer key on the badge!
 applyNextKeyGuidance({ codes: [], fingers: [], badgeText: "Benchmark Recall Mode", fingerText: "Execute shortcut from memory!" });
 },
 onMatch: function (_chord, ms) {
 b.shortcutHits += 1;
 b.shortcutTotalMs += ms;
 advanceSc();
 },
 onMiss: function (pressed) {
 document.getElementById("bench-sc-msg").innerHTML =
 '<span style="color:var(--accent-danger)">Heard <code>' + escapeHtml(pressed) + "</code> (incorrect) - try again or click Skip.</span>";
 }
 });
 registerUnbinder(unbindSc);
 document.getElementById("btn-skip-sc").addEventListener("click", advanceSc);
 scBox.focus();
 return;
 }

 if (b.phase === "mcq") {
 var q = b.questions[b.qIdx];
 var optHtml = q.options.map(function (opt, idx) {
 return '<button type="button" class="mcq-option' + (q.selectedOptionIdx === idx ? " selected" : "") + '" data-bopt="' + idx + '">' +
 '<span class="mcq-key">' + (idx + 1) + "</span><span>" + formatInlineCode(opt.text) + "</span></button>";
 }).join("");

 stageEl.innerHTML =
 '<div class="stage-container"><div class="panel-card question-arena" id="bench-q-arena" tabindex="0">' +
 '<div style="display:flex;justify-content:space-between;align-items:center">' +
 '<div><span class="badge badge-accent">Part 3 of 3 &bull; Cumulative Foundations (' + q.number + "/" + b.questions.length + " &bull; Stage " + q.stageNumber + ')</span></div>' +
 '<span id="bench-timer-badge" class="badge badge-warn" style="font-size:0.9rem">' + clockStr + "</span></div>" +
 '<div class="question-prompt">' + formatInlineCode(q.prompt) + "</div>" +
 '<div class="mcq-grid">' + optHtml + "</div>" +
 '<div class="lockin-box">' +
 '<div class="lockin-header"><span class="lockin-title">Benchmark Lock-In</span></div>' +
 '<div id="bench-q-tape" class="target-tape">' + renderTargetTapeHtml(q.typedValue, q.lockInTarget) + "</div>" +
 '<input id="bench-q-input" type="text" class="scoped-input" autocomplete="off" spellcheck="false" placeholder="Press 1-4 above, then type Lock-In and press Enter...">' +
 "</div>" +
 '<div style="margin-top:0.85rem;display:flex;justify-content:space-between;align-items:center">' +
 '<span id="bench-q-err" style="font-size:0.84rem;color:var(--text-secondary)">Select 1-4 + type Lock-In</span>' +
 '<button type="button" class="btn btn-primary" id="btn-bench-q-next">' +
 (b.qIdx + 1 === b.questions.length ? "Finish &amp; Grade Benchmark &rarr;" : "Next Question &rarr;") + "</button></div>" +
 "</div></div>";

 var qArena = document.getElementById("bench-q-arena");
 var qInput = document.getElementById("bench-q-input");
 var qTape = document.getElementById("bench-q-tape");
 qInput.value = q.typedValue || "";

 var pickBenchOpt = function (idx) {
 q.selectedOptionIdx = idx;
 var bs = stageEl.querySelectorAll("[data-bopt]");
 for (var i = 0; i < bs.length; i++) { bs[i].classList.toggle("selected", i === idx); }
 qInput.focus();
 };

 var nextBenchQ = function () {
 if (q.selectedOptionIdx === null || !q.lockInCompleted) {
 document.getElementById("bench-q-err").style.color = "var(--accent-amber)";
 document.getElementById("bench-q-err").textContent = "Choose an option (1-4) and complete the Lock-In box first!";
 return;
 }
 if (b.qIdx + 1 < b.questions.length) {
 b.qIdx += 1;
 } else {
 finishBenchmarkExam();
 }
 renderActiveMainView();
 };

 var bOpts = stageEl.querySelectorAll("[data-bopt]");
 for (var k = 0; k < bOpts.length; k++) {
 bOpts[k].addEventListener("click", function () { pickBenchOpt(Number(this.getAttribute("data-bopt"))); });
 }

 var onArenaKey = function (e) {
 if (document.activeElement === qArena && /^[1-4a-dA-D]$/.test(e.key)) {
 e.preventDefault();
 var map = { "1": 0, "2": 1, "3": 2, "4": 3, "A": 0, "B": 1, "C": 2, "D": 3 };
 pickBenchOpt(map[e.key.toUpperCase()]);
 } else if (document.activeElement === qInput && e.altKey && /^[1-4]$/.test(e.key)) {
 e.preventDefault();
 pickBenchOpt(Number(e.key) - 1);
 }
 };
 qArena.addEventListener("keydown", onArenaKey);
 registerUnbinder(function () { qArena.removeEventListener("keydown", onArenaKey); });

 var unbindBenchIn = T.bindPracticeInput(qInput, {
 label: "Benchmark Q" + q.number,
 tracker: b.mcqTracker,
 getExpectedText: function () { return q.lockInTarget; },
 onProgress: function (val, target, info) {
 q.typedValue = val;
 q.lockInCompleted = info.exactMatch;
 qTape.innerHTML = renderTargetTapeHtml(val, target);
 },
 onEnterSubmit: nextBenchQ
 });
 registerUnbinder(unbindBenchIn);
 document.getElementById("btn-bench-q-next").addEventListener("click", nextBenchQ);
 qArena.focus();
 return;
 }

 // Done view
 var rec = b.finalRecord;
 stageEl.innerHTML =
 '<div class="stage-container">' +
 '<div class="hero-card" style="border-color:var(--accent-emerald)">' +
 '<div class="eyebrow">BENCHMARK RESULT SAVED TO LOCALSTORAGE</div>' +
 '<h2 class="hero-title">' + rec.compositeScore + "/100 &mdash; " + escapeHtml(rec.grade) + "</h2>" +
 '<div class="summary-kpi-grid">' +
 '<div class="kpi-card"><div class="kpi-label">Composite Score</div><div class="kpi-val">' + rec.compositeScore + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">No-Look Typing</div><div class="kpi-val">' + rec.netWpm + ' WPM (' + rec.typingAccuracyPct + '%)</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Shortcut Recall</div><div class="kpi-val">' + rec.shortcutPct + '%</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Stages 1-5 MCQ</div><div class="kpi-val">' + rec.mcqCorrect + '/' + rec.mcqTotal + ' (' + rec.mcqPct + '%)</div></div>' +
 "</div>" +
 '<button type="button" class="btn btn-primary" id="btn-retake-bench">Run Another Fresh Benchmark &rarr;</button>' +
 "</div>" +
 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Saved Local Benchmark History</h3>' + renderBenchmarkHistoryHtml() + "</div>" +
 "</div>";

 document.getElementById("btn-retake-bench").addEventListener("click", function () {
 startNewBenchmarkExam();
 renderActiveMainView();
 });
 }

 // ==========================================================================
 // VIEW 5: TELEMETRY, WEAK-KEY MATRIX & LOCALSTORAGE VAULT
 // ==========================================================================

 function renderTelemetryVaultView(stageEl) {
 var vault = T.getVault();
 var hud = T.getGlobalHudStats(C.getTotalModuleCount());
 var weak = T.getWeakAndSlowKeys();

 var slipEntries = Object.keys(vault.lifetimeTyping.slipMatrix).map(function (k) {
 return vault.lifetimeTyping.slipMatrix[k];
 }).sort(function (a, b) { return b.count - a.count; }).slice(0, 12);

 var slipRows = slipEntries.length === 0
 ? '<tr><td colspan="3" style="color:var(--text-muted)">No finger slips logged yet.</td></tr>'
 : slipEntries.map(function (s) {
 return "<tr><td><code>" + escapeHtml(s.expected) + " &rarr; " + escapeHtml(s.typed) + "</code></td><td>" + s.count + "</td><td>" + escapeHtml(s.reason) + "</td></tr>";
 }).join("");

 var weakBadges = weak.weakChars.concat(weak.slowChars).slice(0, 14).map(function (item) {
 return '<span class="badge badge-warn" style="margin:0.2rem"><code>' + escapeHtml(item.char) + "</code> " +
 item.accuracy + "% acc &bull; " + item.avgMs + "ms</span>";
 }).join("") || '<span style="color:var(--text-muted)">No weak or hesitant keys flagged yet.</span>';

 var recentMistakes = vault.mistakeHistory.slice(0, 8).map(function (m) {
 return "<tr><td><code>" + escapeHtml(m.moduleId.toUpperCase()) + "</code></td><td>" + escapeHtml(m.conceptTitle) + "</td><td>" + escapeHtml(m.chosenText) + "</td><td>" + escapeHtml(m.correctText) + "</td></tr>";
 }).join("") || '<tr><td colspan="4" style="color:var(--text-muted)">Zero conceptual mistakes recorded yet.</td></tr>';

 stageEl.innerHTML =
 '<div class="stage-container">' +
 '<div class="hero-card">' +
 '<div class="hero-header">' +
 '<div><div class="eyebrow">STRICT LOCAL PRIVACY &bull; 0 NETWORK REQUESTS</div>' +
 '<h2 class="hero-title">Scoped Keystroke Telemetry &amp; Mastery Vault</h2>' +
 '<p class="hero-subtitle">Every metric below is captured exclusively inside focused app practice inputs and stored in <code>localStorage["cs_trainer_vault_v1"]</code>.</p></div>' +
 '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
 '<button type="button" class="btn btn-primary" id="vault-btn-export">Export Telemetry JSON</button>' +
 '<button type="button" class="btn btn-secondary" id="vault-btn-import">Import JSON</button>' +
 '<button type="button" class="btn btn-danger" id="vault-btn-reset">Reset All Local Data</button>' +
 "</div></div>" +

 '<div class="summary-kpi-grid">' +
 '<div class="kpi-card"><div class="kpi-label">Lifetime Net WPM</div><div class="kpi-val">' + hud.wpm + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Keystroke Accuracy</div><div class="kpi-val">' + hud.accuracyPct + '%</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Median Hesitation</div><div class="kpi-val">' + (hud.medianLatencyMs ? hud.medianLatencyMs + "ms" : "\u2014") + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Total Keystrokes</div><div class="kpi-val">' + hud.totalKeystrokes + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Total Backspaces</div><div class="kpi-val">' + hud.backspaces + '</div></div>' +
 '<div class="kpi-card"><div class="kpi-label">Modules Mastered</div><div class="kpi-val">' + hud.masteredCount + '/' + hud.totalModules + '</div></div>' +
 "</div></div>" +

 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Flagged Weak &amp; Hesitant Keys (Threshold: ' + weak.slowThresholdMs + 'ms)</h3><div>' + weakBadges + "</div></div>" +
 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Top Finger-Slip Confusion Matrix</h3><table class="data-table"><thead><tr><th>Slip Pair</th><th>Count</th><th>Ergonomic Cause</th></tr></thead><tbody>' + slipRows + "</tbody></table></div>" +
 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Recent Conceptual Mistake Log</h3><table class="data-table"><thead><tr><th>Module</th><th>Concept</th><th>Chosen</th><th>Correct</th></tr></thead><tbody>' + recentMistakes + "</tbody></table></div>" +
 '<div class="panel-card"><h3 style="margin:0 0 0.5rem">Benchmark Exam History</h3>' + renderBenchmarkHistoryHtml() + "</div>" +
 "</div>";

 document.getElementById("vault-btn-export").addEventListener("click", openExportModal);
 document.getElementById("vault-btn-import").addEventListener("click", openImportModal);
 document.getElementById("vault-btn-reset").addEventListener("click", openResetModal);
 }

 // ==========================================================================
 // MODAL DIALOGS FOR EXPORT / IMPORT / RESET LOCAL JSON
 // ==========================================================================

 function closeModal() {
 document.getElementById("modal-backdrop").classList.add("hidden");
 }

 function openExportModal() {
 var jsonStr = T.exportVaultJSON();
 // Trigger browser file download cleanly via local Blob URL
 try {
 var blob = new Blob([jsonStr], { type: "application/json" });
 var url = URL.createObjectURL(blob);
 var a = document.createElement("a");
 a.href = url;
 a.download = "zero-to-code-telemetry-" + new Date().toISOString().slice(0, 10) + ".json";
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
 } catch (err) {}

 document.getElementById("modal-title").textContent = "Exported Local Telemetry & Mastery JSON";
 document.getElementById("modal-body").innerHTML =
 '<p style="margin:0 0 0.5rem;font-size:0.86rem;color:var(--text-secondary)">Your JSON download has started automatically. You can also inspect or copy the raw JSON snapshot below:</p>' +
 '<textarea id="export-json-textarea" class="scoped-input" rows="11" readonly>' + escapeHtml(jsonStr) + "</textarea>";
 document.getElementById("modal-actions").innerHTML =
 '<button type="button" class="btn btn-secondary" id="modal-copy-btn">Copy JSON</button>' +
 '<button type="button" class="btn btn-primary" id="modal-done-btn">Done</button>';
 document.getElementById("modal-backdrop").classList.remove("hidden");

 document.getElementById("modal-copy-btn").addEventListener("click", function () {
 var ta = document.getElementById("export-json-textarea");
 ta.select();
 if (navigator.clipboard && navigator.clipboard.writeText) {
 navigator.clipboard.writeText(jsonStr);
 } else {
 document.execCommand("copy");
 }
 this.textContent = "\u2713 Copied!";
 });
 document.getElementById("modal-done-btn").addEventListener("click", closeModal);
 }

 function openImportModal() {
 document.getElementById("modal-title").textContent = "Import Telemetry & Progress JSON";
 document.getElementById("modal-body").innerHTML =
 '<p style="margin:0 0 0.5rem;font-size:0.86rem;color:var(--text-secondary)">Paste a previously exported JSON backup below to restore local progress:</p>' +
 '<textarea id="import-json-textarea" class="scoped-input" rows="9" placeholder="{ ... }"></textarea>' +
 '<div id="import-err" style="color:var(--accent-danger);font-size:0.83rem;margin-top:0.4rem"></div>';
 document.getElementById("modal-actions").innerHTML =
 '<button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>' +
 '<button type="button" class="btn btn-primary" id="modal-import-confirm">Restore Backup</button>';
 document.getElementById("modal-backdrop").classList.remove("hidden");

 document.getElementById("modal-cancel-btn").addEventListener("click", closeModal);
 document.getElementById("modal-import-confirm").addEventListener("click", function () {
 try {
 T.importVaultJSON(document.getElementById("import-json-textarea").value);
 closeModal();
 renderActiveMainView();
 } catch (err) {
 document.getElementById("import-err").textContent = "Invalid JSON backup: " + err.message;
 }
 });
 }

 function openResetModal() {
 document.getElementById("modal-title").textContent = "Reset All Local Telemetry & Progress?";
 document.getElementById("modal-body").innerHTML =
 "<p style=\"margin:0\">This permanently clears all keystroke metrics, slip history, module mastery badges, and benchmark runs from browser <code>localStorage</code>. Export a JSON backup first if you want to save your history.</p>";
 document.getElementById("modal-actions").innerHTML =
 '<button type="button" class="btn btn-secondary" id="modal-cancel-reset">Cancel</button>' +
 '<button type="button" class="btn btn-danger" id="modal-confirm-reset">Yes, Reset Local JSON</button>';
 document.getElementById("modal-backdrop").classList.remove("hidden");

 document.getElementById("modal-cancel-reset").addEventListener("click", closeModal);
 document.getElementById("modal-confirm-reset").addEventListener("click", function () {
 T.resetVault();
 state.activeRoundsByModule = {};
 state.lastReportsByModule = {};
 state.benchmark = null;
 closeModal();
 refreshTopHudAndSidebar();
 renderActiveMainView();
 });
 }

 // ==========================================================================
 // MAIN ROUTER & INITIALIZATION
 // ==========================================================================

 function renderActiveMainView() {
 cleanupViewBindings();
 updateScopeIndicator(false, "Outside Input");
 var stageEl = document.getElementById("main-stage");
 if (!stageEl) { return; }
 stageEl.scrollTop = 0;

 if (state.activeNav === "curriculum") {
 renderCurriculumView(stageEl);
 } else if (state.activeNav === "typing") {
 renderTypingDojoView(stageEl);
 } else if (state.activeNav === "shortcuts") {
 renderShortcutLabView(stageEl);
 } else if (state.activeNav === "benchmark") {
 renderBenchmarkView(stageEl);
 } else if (state.activeNav === "telemetry") {
 renderTelemetryVaultView(stageEl);
 }
 refreshTopHudAndSidebar();
 }

 function applyThemePreference(theme) {
 var clean = theme === "light" ? "light" : "dark";
 document.documentElement.setAttribute("data-theme", clean);
 var icon = document.getElementById("theme-icon");
 if (icon) { icon.innerHTML = clean === "dark" ? "&#9789;" : "&#9728;"; }
 }

 function initApp() {
 var prefs = T.getVault().preferences || {};
 applyThemePreference(prefs.theme || "light");

 buildVisualKeyboardDom();

 // Subscribe to scoped telemetry events
 T.subscribe(function (type, payload) {
 if (type === "scope-status") {
 updateScopeIndicator(payload.armed, payload.label);
 } else if (type === "next-key-guidance") {
 applyNextKeyGuidance(payload);
 } else if (type === "key-flash") {
 flashKeycap(payload.code, payload.ok);
 } else if (type === "vault-updated") {
 refreshTopHudAndSidebar();
 }
 });

 // Primary navigation tabs
 var navTabs = document.querySelectorAll(".nav-tab[data-nav]");
 for (var i = 0; i < navTabs.length; i++) {
 navTabs[i].addEventListener("click", function () {
 state.activeNav = this.getAttribute("data-nav");
 syncPrimaryNavButtons();
 renderActiveMainView();
 });
 }

 // Header utility buttons
 document.getElementById("btn-theme-toggle").addEventListener("click", function () {
 var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
 applyThemePreference(cur);
 T.setPreference("theme", cur);
 });

 var kbDock = document.getElementById("visual-keyboard-dock");
 var kbToggleState = document.getElementById("kb-toggle-state");
 var minBtn = document.getElementById("btn-minimize-kb");
 function toggleKeyboardCollapsed() {
 var collapsed = kbDock.classList.toggle("collapsed");
 kbToggleState.textContent = collapsed ? "Off" : "On";
 minBtn.textContent = collapsed ? "Show Keys" : "Hide Keys";
 T.setPreference("keyboardVisible", !collapsed);
 }
 if (prefs.keyboardVisible === false) {
 toggleKeyboardCollapsed();
 }
 document.getElementById("btn-toggle-kb").addEventListener("click", toggleKeyboardCollapsed);
 minBtn.addEventListener("click", toggleKeyboardCollapsed);

 var heatChk = document.getElementById("chk-kb-heatmap");
 heatChk.checked = prefs.showHeatmap !== false;
 heatChk.addEventListener("change", function () {
 T.setPreference("showHeatmap", this.checked);
 refreshKeyboardHeatmap();
 });

 document.getElementById("btn-export-json").addEventListener("click", openExportModal);
 document.getElementById("btn-reset-json").addEventListener("click", openResetModal);
 document.getElementById("btn-modal-close").addEventListener("click", closeModal);
 document.getElementById("modal-backdrop").addEventListener("click", function (e) {
 if (e.target === this) { closeModal(); }
 });

 document.getElementById("btn-sidebar-toggle").addEventListener("click", function () {
 document.getElementById("sidebar").classList.toggle("open");
 });

 // Scoped #app focus recovery: if user clicks plain text/card background inside #app
 // and then presses keys, route smoothly to the active quiz option, shortcut box, or practice input!
 var appShellEl = document.getElementById("app");
 if (appShellEl) {
 appShellEl.addEventListener("keydown", function (e) {
 var active = document.activeElement;
 var tag = active && active.tagName ? active.tagName.toUpperCase() : "";
 if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
 return;
 }
 // Check Shortcut Sandbox first
 var scBox = document.getElementById("shortcut-sandbox") || document.getElementById("bench-sc-box");
 if (scBox && active !== scBox) {
 focusNoScroll(scBox);
 scBox.dispatchEvent(new KeyboardEvent("keydown", {
 key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, bubbles: false
 }));
 e.preventDefault();
 return;
 }
 // Check Quiz MCQ 1-4 selection if not already handled by arenaEl
 var arena = document.getElementById("question-arena") || document.getElementById("bench-q-arena");
 if (arena && active !== arena && !e.ctrlKey && !e.metaKey && !e.altKey && /^[1-4]$/.test(e.key)) {
 var optIdx = Number(e.key) - 1;
 var optBtn = arena.querySelector('[data-opt-idx="' + optIdx + '"]') || arena.querySelector('[data-bopt="' + optIdx + '"]');
 if (optBtn) {
 e.preventDefault();
 optBtn.click();
 return;
 }
 }
 // Route printable typing / Backspace into the primary practice input if user clicked background text
 if (!e.ctrlKey && !e.metaKey && !e.altKey) {
 var inp = findPrimaryPracticeInput();
 if (inp && (e.key === "Backspace" || (e.key && e.key.length === 1))) {
 e.preventDefault();
 focusNoScroll(inp);
 if (e.key === "Backspace") {
 inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", code: "Backspace", bubbles: false }));
 inp.value = (inp.value || "").slice(0, -1);
 inp.dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", code: "Backspace", bubbles: false }));
 inp.dispatchEvent(new Event("input", { bubbles: false }));
 } else {
 inp.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, code: e.code, shiftKey: e.shiftKey, bubbles: false }));
 inp.value = (inp.value || "") + e.key;
 if (typeof inp.selectionStart === "number") {
 inp.selectionStart = inp.selectionEnd = inp.value.length;
 }
 inp.dispatchEvent(new KeyboardEvent("keyup", { key: e.key, code: e.code, shiftKey: e.shiftKey, bubbles: false }));
 inp.dispatchEvent(new Event("input", { bubbles: false }));
 }
 }
 }
 });
 }

 renderActiveMainView();
 }

 window.CSTrainer.App = {
 getState: function () { return state; },
 renderActiveMainView: renderActiveMainView
 };

 if (document.readyState === "loading") {
 document.addEventListener("DOMContentLoaded", initApp);
 } else {
 initApp();
 }
})();
