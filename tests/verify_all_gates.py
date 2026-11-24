#!/usr/bin/env python3
"""
Deterministic 7-Gate Verification Suite for Zero-to-Code Systems Lab.
Verifies:
  1. Required modular files & zero JS syntax errors (`node --check`)
  2. 100% offline / zero external network dependencies / file:// compatibility
  3. Strict scoped keystroke telemetry (zero window/document keyloggers)
  4. Complete 5-Stage, 10-Module, 100-Concept curriculum & topic coverage
  5. Adaptive 10-question quiz, Deep Teaching Cards & Changed-Scenario loop
  6. Safe Shortcut Sandbox & Personalized Weak-Key Synthesizer
  7. End-to-end Benchmark grading, localStorage persistence, JSON export & reset
"""

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
import shutil
NODE_BIN = shutil.which("node") or "node"

REQUIRED_FILES = [
    "index.html",
    "css/styles.css",
    "js/telemetry.js",
    "js/curriculum.js",
    "js/quiz-engine.js",
    "js/shortcut-trainer.js",
    "js/app.js",
]


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_gate_1_files_and_syntax():
    hashes = {}
    for rel in REQUIRED_FILES:
        p = ROOT / rel
        assert p.exists() and p.stat().st_size > 500, f"Missing or empty required file: {rel}"
        text = p.read_text(encoding="utf-8")
        assert "TODO" not in text and "FIXME" not in text, f"Found placeholder marker in {rel}"
        hashes[rel] = {"bytes": p.stat().st_size, "sha256": sha256_file(p)}
        if rel.endswith(".js"):
            proc = subprocess.run([NODE_BIN, "--check", str(p)], capture_output=True, text=True, timeout=15)
            assert proc.returncode == 0, f"Syntax error in {rel}: {proc.stderr}"
    return hashes


def check_gate_2_offline_and_privacy_static():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    # Must NOT use type="module" so opening index.html over file:// never hits CORS block
    assert 'type="module"' not in html, "ES module scripts fail over file:// origin!"
    assert "connect-src 'none'" in html, "Missing strict offline CSP connect-src 'none'"

    forbidden_net_patterns = [
        r"https?://",
        r"//cdn\.",
        r"fonts\.googleapis",
        r"\bfetch\s*\(",
        r"\bXMLHttpRequest\b",
        r"\bWebSocket\b",
        r"sendBeacon",
        r"@import\s+url",
    ]
    for rel in REQUIRED_FILES:
        text = (ROOT / rel).read_text(encoding="utf-8")
        for pat in forbidden_net_patterns:
            # Allow xmlns="http://www.w3.org/2000/svg" standard inline SVG namespace only
            cleaned = text.replace('xmlns="http://www.w3.org/2000/svg"', "")
            m = re.search(pat, cleaned)
            assert m is None, f"Forbidden external/network pattern '{pat}' found in {rel}: {m.group(0)}"

    # Verify ZERO global window/document keydown or keyup listeners anywhere
    for rel in REQUIRED_FILES:
        if not rel.endswith(".js"):
            continue
        text = (ROOT / rel).read_text(encoding="utf-8")
        global_keylog = re.search(r"(window|document)\.addEventListener\s*\(\s*['\"]key(down|up|press)", text)
        assert global_keylog is None, f"Privacy violation: global key listener in {rel}"

    return {"zero_external_urls": True, "file_protocol_safe": True, "zero_global_keylisteners": True}


def check_gates_3_to_7_behavioral_node():
    node_test_script = r"""
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = process.cwd();

// Minimal deterministic browser environment to test all 4 core engines + DOM controller
let activeEl = null;
const store = {};
global.window = {
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  }
};
global.performance = {
  _t: 1000,
  now() { return this._t; }
};
global.Event = class Event {
  constructor(type) { this.type = type; }
};

function makeMockInput(id) {
  const listeners = {};
  return {
    id,
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    addEventListener(type, fn) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (listeners[type]) listeners[type] = listeners[type].filter(x => x !== fn);
    },
    focus() {
      activeEl = this;
      this.dispatch({ type: "focus", currentTarget: this });
    },
    blur() {
      if (activeEl === this) activeEl = null;
      this.dispatch({ type: "blur", currentTarget: this });
    },
    dispatch(ev) {
      const arr = listeners[ev.type] || [];
      ev.currentTarget = this;
      ev.preventDefault = ev.preventDefault || (() => { ev._prevented = true; });
      ev.stopPropagation = ev.stopPropagation || (() => {});
      for (const fn of arr) fn(ev);
    }
  };
}

global.document = {
  get activeElement() { return activeEl; }
};

require(path.join(root, "js/telemetry.js"));
require(path.join(root, "js/curriculum.js"));
require(path.join(root, "js/quiz-engine.js"));
require(path.join(root, "js/shortcut-trainer.js"));

const { Telemetry: T, Curriculum: C, QuizEngine: Q, ShortcutTrainer: S } = window.CSTrainer;

// Gate 3: Scoped Keystroke Telemetry test
const input = makeMockInput("type-lock-input");
const tracker = T.createSessionTracker("unit-test");
const targetStr = "{a}";
const unbind = T.bindPracticeInput(input, {
  label: "Unit Lock-In",
  tracker,
  getExpectedText: () => targetStr
});

// 3a. Unfocused keydown MUST NOT be captured!
input.dispatch({ type: "keydown", key: "{", code: "BracketLeft", shiftKey: true });
assert.strictEqual(T.getVault().lifetimeTyping.totalKeystrokes, 0, "Unfocused keystroke must be ignored!");

// 3b. Focus input and simulate typing '[' (slip for '{'), Backspace, '{', 'a', '}' with realistic ms intervals
input.focus();
// Slip: expected '{', typed '[' (forgot Shift!)
global.performance._t += 200;
input.dispatch({ type: "keydown", key: "[", code: "BracketLeft", shiftKey: false });
global.performance._t += 65;
input.dispatch({ type: "keyup", key: "[", code: "BracketLeft" });
input.value = "["; input.selectionStart = 1;
input.dispatch({ type: "input" });

// Backspace correction
global.performance._t += 190;
input.dispatch({ type: "keydown", key: "Backspace", code: "Backspace" });
global.performance._t += 50;
input.dispatch({ type: "keyup", key: "Backspace", code: "Backspace" });
input.value = ""; input.selectionStart = 0;
input.dispatch({ type: "input" });

// Correct '{', hesitant 'a' (360ms), fast '}' (140ms)
const seq = [
  { key: "{", code: "BracketLeft", gap: 180 },
  { key: "a", code: "KeyA", gap: 360 },
  { key: "}", code: "BracketRight", gap: 140 }
];
for (const step of seq) {
  global.performance._t += step.gap;
  input.dispatch({ type: "keydown", key: step.key, code: step.code });
  global.performance._t += 55;
  input.dispatch({ type: "keyup", key: step.key, code: step.code });
  input.value += step.key;
  input.selectionStart = input.value.length;
  input.dispatch({ type: "input" });
}

const summary = T.summarizeTracker(tracker);
assert.strictEqual(summary.totalKeystrokes, 4);
assert.strictEqual(summary.correctKeystrokes, 3);
assert.strictEqual(summary.errorKeystrokes, 1);
assert.strictEqual(summary.backspaces, 1);
assert.ok(summary.netWpm > 0, "WPM must be computed > 0");
assert.strictEqual(summary.accuracyPct, 75);
assert.strictEqual(summary.slips.length, 1);
assert.ok(summary.slips[0].reason.includes("Shift"), "Should diagnose missing Shift modifier");
assert.ok(summary.hesitantKeys.some(k => k.char === "a"), "Should flag hesitant 360ms key 'a'");

// Verify Next-Key Guidance for shifted symbol '{' requires ShiftLeft + BracketLeft
const braceGuide = T.getKeyGuidance("{");
assert.deepStrictEqual(braceGuide.codes, ["ShiftLeft", "BracketLeft"]);
assert.deepStrictEqual(braceGuide.fingers, ["L-Pinky", "R-Pinky"]);
unbind();

// Gate 4: Curriculum 5 Stages, 10 Modules, 100 Concepts & Topic Keywords
assert.strictEqual(C.STAGES.length, 5);
assert.strictEqual(C.getTotalModuleCount(), 10);
assert.strictEqual(C.getTotalConceptCount(), 100);
const fullCurrText = fs.readFileSync(path.join(root, "js/curriculum.js"), "utf8").toLowerCase();
const mandatoryTopics = [
  "tally", "positional", "abacus", "jacquard", "babbage", "lovelace",
  "voltage", "current", "resistance", "relay", "vacuum tube", "transistor",
  "noise margin", "nand", "xor", "half-adder", "full-adder", "latch", "flip-flop",
  "program counter", "alu", "control unit", "fetch", "decode", "execute",
  "opcode", "assembly", "compiler", "interpreter", "kernel",
  "tactile", "semicolon", "ctrl+backspace", "sigint",
  "variable", "conditional", "call stack", "array", "debugging"
];
for (const kw of mandatoryTopics) {
  assert.ok(fullCurrText.includes(kw), "Missing required curriculum topic: " + kw);
}

// Gate 5: Adaptive 10-Question Round -> Deep Mistake Analysis -> Changed-Scenario Follow-Up -> 90%+ Mastery
const r1 = Q.createModuleRound("s2m2", {});
assert.strictEqual(r1.questions.length, 10);
// Intentionally miss Q0, Q1, Q2 and get Q3..Q9 right (7/10 = 70% < 90%)
r1.questions.forEach((q, idx) => {
  const rightIdx = q.options.findIndex(o => o.isCorrect);
  const wrongIdx = q.options.findIndex(o => !o.isCorrect);
  q.selectedOptionIdx = idx < 3 ? wrongIdx : rightIdx;
  q.typedValue = q.lockInTarget;
  q.lockInCompleted = true;
});
const rep1 = Q.finalizeModuleRound(r1);
assert.strictEqual(rep1.scorePct, 70);
assert.strictEqual(rep1.masteredRound, false);
assert.strictEqual(rep1.teachingCards.length, 3, "Must create 3 Deep Teaching Cards for 3 wrong answers");
for (const card of rep1.teachingCards) {
  assert.ok(card.whyWrong.length > 15 && card.zeroTeach.length > 20 && card.reteachCheck.target.length > 3);
}

// Follow-up Round 2 must prioritize those exact 3 missed concepts with CHANGED scenarios!
const r2 = Q.createModuleRound("s2m2", {
  isFollowUp: true,
  prioritizeConceptIds: rep1.missedConceptIds,
  missedCharsFromLastRound: ["{", ";"]
});
assert.strictEqual(r2.questions.length, 10);
const retryMatches = r2.questions.filter(q => rep1.missedConceptIds.includes(q.conceptId));
assert.ok(retryMatches.length >= 6, "3 missed concepts should each get 2 prioritized slots (6/10) in Round 2!");
const r1Q0 = r1.questions[0];
const r2SameConcept = r2.questions.find(q => q.conceptId === r1Q0.conceptId);
assert.notStrictEqual(r2SameConcept.variantIdx, r1Q0.variantIdx, "Follow-up variantIdx must advance!");

// Score 10/10 on Round 2 -> verify 100% mastery unlocked in localStorage!
r2.questions.forEach(q => {
  q.selectedOptionIdx = q.options.findIndex(o => o.isCorrect);
  q.typedValue = q.lockInTarget;
  q.lockInCompleted = true;
});
const rep2 = Q.finalizeModuleRound(r2);
assert.strictEqual(rep2.scorePct, 100);
assert.strictEqual(rep2.masteredRound, true);
assert.strictEqual(T.getVault().moduleMastery["s2m2"].mastered, true);

// Gate 6: Safe Shortcut Sandbox & Personalized Weak-Key Drill
const scBox = makeMockInput("shortcut-sandbox");
let matchedShortcut = false;
const scChallenge = S.SHORTCUT_CHALLENGES.find(c => c.id === "sc_del_word_back");
const unbindSc = S.bindShortcutSandbox(scBox, {
  getCurrentChallenge: () => scChallenge,
  onMatch: () => { matchedShortcut = true; }
});
scBox.focus();
const scEvent = { type: "keydown", key: "Backspace", code: "Backspace", ctrlKey: true };
scBox.dispatch(scEvent);
assert.strictEqual(matchedShortcut, true, "Ctrl+Backspace must match delete-previous-word challenge");
assert.strictEqual(scEvent._prevented, true, "Shortcut event must call preventDefault() safely");
unbindSc();

const adaptiveDrill = S.generateAdaptiveWeakKeyDrill();
assert.ok(adaptiveDrill.text.length >= 80, "Adaptive weak-key drill should synthesize rich practice text");

// Gate 7: Benchmark Exam & JSON Export / Import / Reset
const benchQs = Q.buildBenchmarkQuestionSet(42);
assert.strictEqual(benchQs.length, 10);
T.recordBenchmarkResult({ compositeScore: 91, grade: "Principal Systems Builder", netWpm: 58, typingAccuracyPct: 98.5, shortcutPct: 100, mcqPct: 90, mcqCorrect: 9, mcqTotal: 10 });
const exported = T.exportVaultJSON();
const parsedExport = JSON.parse(exported);
assert.strictEqual(parsedExport.vault.benchmarkHistory.length, 1);
T.resetVault();
assert.strictEqual(T.getVault().benchmarkHistory.length, 0, "Reset must wipe vault cleanly");
T.importVaultJSON(exported);
assert.strictEqual(T.getVault().benchmarkHistory.length, 1, "Import must restore exported JSON cleanly");

console.log(JSON.stringify({
  behavioral_gates_passed: true,
  stages: C.STAGES.length,
  modules: C.getTotalModuleCount(),
  concepts: C.getTotalConceptCount(),
  drills: S.TYPING_DRILLS.length + 1,
  shortcuts: S.SHORTCUT_CHALLENGES.length
}));
"""
    proc = subprocess.run([NODE_BIN, "-e", node_test_script], cwd=str(ROOT), capture_output=True, text=True, timeout=20)
    assert proc.returncode == 0, f"Behavioral gate failed:\nSTDOUT:{proc.stdout}\nSTDERR:{proc.stderr}"
    return json.loads(proc.stdout.strip())


def main():
    hashes = check_gate_1_files_and_syntax()
    privacy = check_gate_2_offline_and_privacy_static()
    behavioral = check_gates_3_to_7_behavioral_node()

    receipt = {
        "project": "Zero-to-Code Systems Lab (100% Local CS, Touch-Typing & Coding Trainer)",
        "status": "ALL_7_GATES_PASSED",
        "files": hashes,
        "privacy_and_offline_audit": privacy,
        "behavioral_verification": behavioral,
    }
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
