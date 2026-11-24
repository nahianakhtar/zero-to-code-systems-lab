# Zero-to-Code Systems Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![CI & Windows x64 Build](https://github.com/nahianakhtar/zero-to-code-systems-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/nahianakhtar/zero-to-code-systems-lab/actions/workflows/ci.yml)
[![Offline Architecture](https://img.shields.io/badge/Network%20Calls-0%20(Air--Gapped%20CSP)-0284c7.svg)](index.html)
[![Live Browser Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8.svg)](https://nahianakhtar.github.io/zero-to-code-systems-lab/)

**Zero-to-Code Systems Lab** is a **100% offline, zero-dependency interactive computer science, proprioceptive touch-typing, developer-shortcut, and coding trainer** built from first principles. It ships both as a zero-server browser app (`index.html`) and as a **native Windows x64 desktop application** (**Installer `.exe`** + **USB-ready Portable `.zip`**).

- **Live Browser Lab**: [https://nahianakhtar.github.io/zero-to-code-systems-lab/](https://nahianakhtar.github.io/zero-to-code-systems-lab/)
- **Windows x64 Standalone Downloads (`v1.0.0`)**: [Releases Page (`ZeroToCode-Systems-Lab-Setup-x64.exe` & `ZeroToCode-Systems-Lab-Portable-win-x64.zip`)](https://github.com/nahianakhtar/zero-to-code-systems-lab/releases/latest)

---

## Key Engineering Highlights

1. **Strict Air-Gapped Offline & Scoped Keystroke Privacy**
   - **Zero External Dependencies**: Uses native OS typography, inline SVG hand/circuit schematics, and classic `file://`-compatible scripts enforced by `<meta http-equiv="Content-Security-Policy" content="connect-src 'none'; ...">` plus a native `403 Offline Blocked` `WebResourceRequested` filter in the Windows x64 desktop host.
   - **Input-Scoped Keystroke Dynamics Only**: `keydown` and `keyup` listeners bind strictly to active practice and answer boxes (zero global `window`/`document` keyloggers). Computes rollover-aware flight hesitation latency (`ms`), Net/Gross WPM, backspace recovery counts, and an ergonomic **Finger-Slip Confusion Matrix** (`Shift` timing slips, horizontal neighbor slips, vertical row-reach slips, mirror-hand swaps).
   - **Transparent Local Vault**: Persists all mastery, telemetry, and mistake history strictly in `localStorage` (`portable-data/` in Portable Mode) with one-click **JSON Export**, **JSON Restore**, and **Reset**.

2. **5 Progressive First-Principles Stages (`10` Modules, `100` Core Concepts, `300+` Scenario Variants)**
   - **Stage 1 - Pre-Computer History & Physical Laws**: Unary vs. positional radix systems, zero as placeholder, Abacus registers, Pascaline/Leibniz carry gears, Jacquard punch-card instructions, Babbage's Store/Mill, Ada Lovelace's Note G, Ohm's Law (`V = I * R`), pull-up/pull-down sensing, relays, vacuum tubes, and MOSFET silicon switches.
   - **Stage 2 - How Binary & Logic Were Born**: Voltage noise margins (`NM_H = V_OH - V_IH`), static discipline regeneration, `NOT`/`AND`/`OR`/`NAND`/`XOR` switch networks, Half-Adders, Full-Adders, Ripple-Carry Adders, `SR` Latches, Gated `D`-Latches, and Rising-Edge `D` Flip-Flops.
   - **Stage 3 - How a Computer Runs Instructions**: Quartz clock vs. critical-path gate delay, CPU registers (`PC`, `IR`, `R0-R3`, `FLAGS`), `ALU` multiplexers, Control Unit decoding, Fetch-Decode-Execute cycles, DRAM vs. persistent NAND Flash SSDs, binary opcodes, Assembly, AOT Compilers vs. Interpreters/JITs, and OS Kernel Ring 0/Ring 3 isolation, Virtual Memory (`MMU`), and `syscall` traps.
   - **Stage 4 - No-Look Touch Typing, Heavy Symbols & Safe Shortcuts**: Interactive ANSI visual keyboard (clickable + physical sync) with `F`/`J` tactile homing ridges, real-time two-hand SVG finger guide, weak/slow key heat overlays, heavy developer symbol drills (`{} [] () <> ; : ' " \` = === !== => && || / \ | %`), dynamic **Weak-Key Synthesizer**, and a **Safe In-App Shortcut Sandbox** (`Ctrl+Left/Right`, `Ctrl+Backspace`, `Ctrl+/`, `Alt+Up/Down`, `Ctrl+Shift+K`, `Ctrl+C` `SIGINT`, `Ctrl+L`, `Ctrl+U`, `Ctrl+R`).
   - **Stage 5 - Coding Foundations From Scratch**: Variables as labeled memory slots (`const`/`let`), types, modulo `%` & strict `===`, short-circuit guards, conditionals, loops, `0`-indexed arrays, hash-map objects, LIFO Call Stack frames, heap reference aliasing, and systematic boundary debugging.

3. **Adaptive Mastery Loop & Timed Benchmark Exam**
   - Every module pairs an interactive hardware/CPU/call-stack simulator with a **10-question keyboard-driven MCQ + Type-to-Lock-In assessment**.
   - Any missed question generates a **Deep Teaching Card** diagnosing why the specific distractor failed, re-teaching the concept from zero with a worked example, and verifying understanding via an interactive **Mini Typed Check**.
   - **Changed-Scenario Follow-Up Rounds** automatically prioritize missed concepts using fresh numbers, truth-table rows, and weak-key typing targets until `>= 90%` mastery is achieved.
   - Includes a **7-minute Cumulative Benchmark Exam** tracking longitudinal composite scores with an inline SVG sparkline.

---

## Running Locally or Building the Windows Standalone App

### Option A: Instant Browser Launch (macOS / Linux / Windows)
Open `index.html` directly in any modern browser (zero server required), or serve locally:
```bash
python3 -m http.server 8080
```

### Option B: Standalone Windows x64 Portable App & Installer
Download `ZeroToCode-Systems-Lab-Setup-x64.exe` (installer) or `ZeroToCode-Systems-Lab-Portable-win-x64.zip` (unzip-and-run portable app) from [Releases](https://github.com/nahianakhtar/zero-to-code-systems-lab/releases/latest), or build from source on Windows:
```powershell
powershell -ExecutionPolicy Bypass -File .\desktopuild-windows.ps1
```
- **Portable Mode**: Presence of `portable.mode` beside `ZeroToCodeLab.exe` keeps all WebView2 state and `localStorage` inside `./portable-data/` with zero registry or `%LOCALAPPDATA%` writes.
- **Installer Mode**: User-mode Inno Setup x64 installer (`PrivilegesRequired=lowest`) installs cleanly under `%LOCALAPPDATA%\Programs\ZeroToCodeLab` with Start Menu & optional Desktop shortcuts.

---

## Automated Verification Suite

```bash
python3 tests/verify_all_gates.py
node tests/verify_dom_app.js
```

---

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Nahian Akhtar.
