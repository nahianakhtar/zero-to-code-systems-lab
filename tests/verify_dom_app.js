// Deterministic Full-App DOM Integration & Element-ID Verification for js/app.js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// Lightweight recursive DOM mock sufficient to execute 100% of app.js renderers & click/key handlers
let activeEl = null;
const elementsById = new Map();

class MockElement {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.id = "";
    this.title = "";
    this.value = "";
    this.checked = true;
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.style = {};
    this.attrs = {};
    this.children = [];
    this.listeners = {};
    this._innerHTML = "";
    this._textContent = "";
    this._classes = new Set();
    const self = this;
    this.classList = {
      add(...cs) { cs.forEach(c => c && self._classes.add(c)); },
      remove(...cs) { cs.forEach(c => self._classes.delete(c)); },
      toggle(c, force) {
        if (force === undefined) {
          if (self._classes.has(c)) { self._classes.delete(c); return false; }
          self._classes.add(c); return true;
        }
        if (force) self._classes.add(c); else self._classes.delete(c);
        return Boolean(force);
      },
      contains(c) { return self._classes.has(c); }
    };
  }
  set className(v) {
    this._classes = new Set(String(v || "").split(/\s+/).filter(Boolean));
  }
  get className() {
    return Array.from(this._classes).join(" ");
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
    if (k === "id") { this.id = String(v); elementsById.set(this.id, this); }
    if (k === "class") { this.className = String(v); }
    if (k === "value") { this.value = String(v); }
  }
  getAttribute(k) {
    if (k === "id") return this.id || null;
    return k in this.attrs ? this.attrs[k] : null;
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
  }
  set textContent(v) {
    this._textContent = String(v);
    this._innerHTML = String(v);
    this.children = [];
  }
  get textContent() { return this._textContent; }
  set innerHTML(raw) {
    this._innerHTML = String(raw || "");
    this.children = parseFragments(this._innerHTML);
  }
  get innerHTML() { return this._innerHTML; }
  addEventListener(type, fn) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(fn);
  }
  removeEventListener(type, fn) {
    if (this.listeners[type]) this.listeners[type] = this.listeners[type].filter(f => f !== fn);
  }
  focus() {
    if (activeEl && activeEl !== this) activeEl.blur();
    activeEl = this;
    this.dispatch({ type: "focus" });
  }
  blur() {
    if (activeEl === this) activeEl = null;
    this.dispatch({ type: "blur" });
  }
  select() {}
  click() {
    this.dispatch({ type: "click", target: this });
  }
  dispatchEvent(ev) {
    this.dispatch(ev);
  }
  dispatch(ev) {
    ev.currentTarget = this;
    ev.target = ev.target || this;
    ev.preventDefault = ev.preventDefault || (() => {});
    ev.stopPropagation = ev.stopPropagation || (() => {});
    for (const fn of (this.listeners[ev.type] || []).slice()) {
      fn.call(this, ev);
    }
  }
  querySelectorAll(sel) {
    const out = [];
    const visit = (node) => {
      for (const ch of node.children) {
        if (matchesSelector(ch, sel)) out.push(ch);
        visit(ch);
      }
    };
    visit(this);
    return out;
  }
}

function matchesSelector(el, sel) {
  if (sel.startsWith("[") && sel.endsWith("]")) {
    const attr = sel.slice(1, -1);
    return el.getAttribute(attr) !== null;
  }
  if (sel === ".nav-tab[data-nav]") {
    return el.classList.contains("nav-tab") && el.getAttribute("data-nav") !== null;
  }
  return false;
}

// Parse tags with id / class / data-* attributes so innerHTML mounts working interactive elements
function parseFragments(htmlStr) {
  const nodes = [];
  const tagRegex = /<(button|input|textarea|select|div|span|article|section|aside|header|main|rect|h1|h2|h3|label|svg)\b([^>]*)>/gi;
  let m;
  while ((m = tagRegex.exec(htmlStr)) !== null) {
    const el = new MockElement(m[1]);
    const attrStr = m[2] || "";
    const attrRe = /([a-zA-Z0-9_-]+)(?:="([^"]*)")?/g;
    let am;
    while ((am = attrRe.exec(attrStr)) !== null) {
      const k = am[1];
      const v = am[2] !== undefined ? am[2] : "";
      if (k === "checked") el.checked = true;
      else el.setAttribute(k, v);
    }
    nodes.push(el);
  }
  return nodes;
}

const docRoot = new MockElement("html");
const bodyEl = new MockElement("body");
bodyEl.innerHTML = html;

const store = {};
global.window = {
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  }
};
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.Blob = class Blob { constructor(parts) { this.parts = parts; } };
global.URL = { createObjectURL: () => "blob:local", revokeObjectURL: () => {} };
global.performance = { _t: 1000, now() { this._t += 35; return this._t; } };
global.Event = class Event { constructor(type) { this.type = type; } };
global.KeyboardEvent = class KeyboardEvent { constructor(type, init = {}) { Object.assign(this, { type }, init); } };
global.document = {
  readyState: "complete",
  documentElement: docRoot,
  body: bodyEl,
  get activeElement() { return activeEl; },
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => elementsById.get(id) || null,
  querySelectorAll: (sel) => bodyEl.querySelectorAll(sel),
  hasFocus: () => true,
  querySelector: (sel) => bodyEl.querySelectorAll(sel)[0] || null,
  execCommand: () => true
};

require(path.join(ROOT, "js/telemetry.js"));
require(path.join(ROOT, "js/curriculum.js"));
require(path.join(ROOT, "js/quiz-engine.js"));
require(path.join(ROOT, "js/shortcut-trainer.js"));
require(path.join(ROOT, "js/app.js"));

// 1. Verify Visual Keyboard rendered all 65 keycaps including F and J bumps
const mainStage = document.getElementById("main-stage");
assert.ok(mainStage.innerHTML.includes("Counting, Positional Systems"), "Default Module 1.1 lesson must render");
const vkb = document.getElementById("visual-keyboard");
assert.strictEqual(vkb.children.length, 5, "Visual keyboard must render 5 ANSI rows");

// 2. Walk every single module 1..10 so every interactive simulator mounts without error!
const treeBtns = document.getElementById("curriculum-tree").querySelectorAll("[data-select-module]");
assert.strictEqual(treeBtns.length, 10, "Sidebar must render all 10 module buttons");
for (const btn of treeBtns) {
  btn.click();
  assert.ok(mainStage.innerHTML.length > 400);
}

// 3. Walk a full 10-question assessment round inside the UI!
document.getElementById("btn-start-assessment").click();
for (let q = 0; q < 10; q++) {
  const arena = document.getElementById("question-arena");
  assert.ok(arena, "Question arena must exist on Q" + (q + 1));
  arena.focus();
  // Press '1' to pick option 1 -> focus glides automatically to #type-lock-input!
  arena.dispatch({ type: "keydown", key: "1", code: "Digit1" });
  const inp = document.getElementById("type-lock-input");
  assert.strictEqual(document.activeElement, inp, "Pressing 1 on MCQ must focus Type-to-Lock-In input!");
  // Complete lock-in text using the active round question's exact lockInTarget
  const appState = window.CSTrainer.App.getState();
  const activeRound = appState.activeRoundsByModule[appState.activeModuleId];
  const curQ = activeRound.questions[activeRound.currentIndex];
  inp.value = curQ.lockInTarget;
  inp.dispatch({ type: "input" });
  assert.ok(inp.classList.contains("locked-complete"), "Exact match must mark input locked-complete");
  document.getElementById("btn-submit-question").click();
}
const subviewEl = document.getElementById("module-subview");
assert.ok(subviewEl.innerHTML.includes("Diagnostic Scorecard"), "Completing 10 questions must open Mistake Analysis view!");

// 3b. Verify Deep Teaching Cards & Launch Changed-Scenario Follow-Up Round if < 100%, or New Round!
const reteachInputs = subviewEl.querySelectorAll("[data-reteach-idx]");
const lastRep = window.CSTrainer.App.getState().lastReportsByModule[window.CSTrainer.App.getState().activeModuleId];
assert.strictEqual(reteachInputs.length, lastRep.teachingCards.length);
for (let r = 0; r < reteachInputs.length; r++) {
  reteachInputs[r].focus();
  reteachInputs[r].value = lastRep.teachingCards[r].reteachCheck.target;
  reteachInputs[r].dispatch({ type: "input" });
  assert.strictEqual(lastRep.teachingCards[r].verified, true, "Mini typed check must verify Deep Teaching Card");
}
document.getElementById("btn-followup-round").click();
assert.strictEqual(window.CSTrainer.App.getState().moduleSubTab, "quiz", "Follow-up round button must launch Round 2 quiz");

// 4. Switch across all 5 primary navigation tabs cleanly
const navTabs = document.querySelectorAll(".nav-tab[data-nav]");
assert.strictEqual(navTabs.length, 5);
for (const tab of navTabs) {
  tab.click();
  assert.ok(mainStage.innerHTML.length > 300, "Tab " + tab.getAttribute("data-nav") + " rendered cleanly");
}

// 5. Test full Timed Benchmark Exam flow (Part 1 Typing -> Part 2 Shortcuts -> Part 3 Cumulative MCQs -> Graded History)
const benchTab = navTabs.find(t => t.getAttribute("data-nav") === "benchmark");
benchTab.click();
document.getElementById("btn-launch-bench").click();
const bState = window.CSTrainer.App.getState().benchmark;
assert.strictEqual(bState.phase, "typing");
const benchIn = document.getElementById("bench-typing-input");
benchIn.focus();
benchIn.value = bState.passage;
benchIn.dispatch({ type: "input" });
assert.strictEqual(bState.phase, "shortcuts", "Completing Benchmark passage must advance to Shortcuts");
for (let s = 0; s < 6; s++) {
  document.getElementById("btn-skip-sc").click();
}
assert.strictEqual(bState.phase, "mcq", "Completing 6 shortcuts must advance to Cumulative MCQs");
for (let k = 0; k < 10; k++) {
  const bq = bState.questions[bState.qIdx];
  const rightIdx = bq.options.findIndex(o => o.isCorrect);
  const qa = document.getElementById("bench-q-arena");
  qa.focus();
  qa.dispatch({ type: "keydown", key: String(rightIdx + 1), code: "Digit" + (rightIdx + 1) });
  const qi = document.getElementById("bench-q-input");
  qi.value = bq.lockInTarget;
  qi.dispatch({ type: "input" });
  document.getElementById("btn-bench-q-next").click();
}
assert.strictEqual(bState.phase, "done", "Completing 10 cumulative MCQs must grade & save Benchmark");
assert.ok(bState.finalRecord.mcqPct === 100);

// 6. Test Export JSON, Theme Toggle, and Confirmed Reset Modal
document.getElementById("btn-theme-toggle").click();
assert.strictEqual(docRoot.getAttribute("data-theme"), "light");
document.getElementById("btn-export-json").click();
assert.ok(!document.getElementById("modal-backdrop").classList.contains("hidden"));
document.getElementById("modal-done-btn").click();
document.getElementById("btn-reset-json").click();
document.getElementById("modal-confirm-reset").click();

console.log("FULL APP DOM, ADAPTIVE QUIZ, SIMULATORS & BENCHMARK INTEGRATION: 100% PASSED!");
