/* ==========================================================================
 js/quiz-engine.js - Adaptive 10-Question Assessment, Type-to-Lock-In,
 Deep Mistake Analysis, Re-Teaching Cards & Changed-Scenario Generator
 ========================================================================== */

(function () {
 "use strict";

 window.CSTrainer = window.CSTrainer || {};

 var MASTERY_THRESHOLD_PCT = 90;
 var QUESTIONS_PER_ROUND = 10;

 function collectPriorityWeakKeys(extraRoundMissedChars) {
 var T = window.CSTrainer.Telemetry;
 var report = T.getWeakAndSlowKeys();
 var out = [];
 var seen = {};

 if (Array.isArray(extraRoundMissedChars)) {
 for (var i = 0; i < extraRoundMissedChars.length; i++) {
 var ch = extraRoundMissedChars[i];
 if (ch && ch !== "\n" && !seen[ch]) {
 seen[ch] = true;
 out.push(ch);
 }
 }
 }
 for (var w = 0; w < report.weakChars.length; w++) {
 var wc = report.weakChars[w].char;
 if (wc && wc !== "\n" && !seen[wc]) {
 seen[wc] = true;
 out.push(wc);
 }
 }
 for (var s = 0; s < report.slowChars.length; s++) {
 var sc = report.slowChars[s].char;
 if (sc && sc !== "\n" && !seen[sc]) {
 seen[sc] = true;
 out.push(sc);
 }
 }
 return out.slice(0, 6);
 }

 // Builds a short extra typing suffix exercising missed keys on follow-up rounds
 function buildWeakKeyPracticeSuffix(weakKeys, seed) {
 if (!weakKeys || weakKeys.length === 0) {
 return "";
 }
 var usable = weakKeys.filter(function (c) {
 return c && c.length === 1 && c !== "\n" && c !== "\t";
 }).slice(0, 3);
 if (usable.length === 0) {
 return "";
 }
 // Pair brackets/parens naturally if present so muscle memory stays idiomatic
 var pattern = [];
 for (var i = 0; i < usable.length; i++) {
 var k = usable[i];
 if (k === "{" || k === "}") { pattern.push("{}"); }
 else if (k === "[" || k === "]") { pattern.push("[]"); }
 else if (k === "(" || k === ")") { pattern.push("()"); }
 else if (k === "<" || k === ">") { pattern.push("<>"); }
 else if (k === " ") { continue; }
 else { pattern.push(k + k); }
 }
 if (pattern.length === 0) {
 return "";
 }
 var rotated = pattern[(seed || 0) % pattern.length];
 return " // " + rotated;
 }

 /**
 * Generates a 10-question assessment round for `moduleId`.
 * - Round 1: covers all 10 module concepts cleanly.
 * - Follow-Up Round (`options.prioritizeConceptIds` or `needsReview` concepts):
 * Prioritizes the exact missed concepts with CHANGED scenarios (`variantIdx + 1`, `+ 2`),
 * fresh numbers/truth-table inputs, and extra typing practice on missed keys!
 */
 function createModuleRound(moduleId, options) {
 var C = window.CSTrainer.Curriculum;
 var T = window.CSTrainer.Telemetry;
 var opts = options || {};
 var mod = C.getModuleById(moduleId);
 if (!mod) {
 throw new Error("Unknown moduleId: " + moduleId);
 }

 var vault = T.getVault();
 var mMastery = vault.moduleMastery[moduleId];
 var roundNumber = (mMastery ? mMastery.roundsCompleted : 0) + 1;
 var isFollowUp = Boolean(opts.isFollowUp || roundNumber > 1);
 var weakKeys = collectPriorityWeakKeys(opts.missedCharsFromLastRound);

 // Determine prioritized missed concepts
 var missedSet = {};
 var priorityList = [];
 if (Array.isArray(opts.prioritizeConceptIds) && opts.prioritizeConceptIds.length > 0) {
 for (var i = 0; i < opts.prioritizeConceptIds.length; i++) {
 var pid = opts.prioritizeConceptIds[i];
 if (!missedSet[pid]) {
 missedSet[pid] = true;
 priorityList.push(pid);
 }
 }
 } else if (isFollowUp) {
 for (var cIdx = 0; cIdx < mod.concepts.length; cIdx++) {
 var cid = mod.concepts[cIdx].id;
 var st = vault.conceptState[cid];
 if (st && st.needsReview) {
 missedSet[cid] = true;
 priorityList.push(cid);
 }
 }
 }

 var selectedPlan = [];
 var localBump = {};

 function nextVariantFor(conceptId) {
 var st = vault.conceptState[conceptId];
 var base = st ? st.lastVariantIdx : 0;
 var bump = localBump[conceptId] || 0;
 localBump[conceptId] = bump + 1;
 // Offset by roundNumber so follow-up rounds ALWAYS shift scenario & option order
 return base + bump + (isFollowUp ? roundNumber : 0);
 }

 if (priorityList.length > 0) {
 // Allocate changed-scenario slots to every missed concept first (up to 2 variants each
 // when <= 4 concepts were missed, so the learner deeply masters exact weak spots!)
 var repeatsPerMissed = priorityList.length <= 4 ? 2 : 1;
 for (var r = 0; r < repeatsPerMissed; r++) {
 for (var p = 0; p < priorityList.length; p++) {
 if (selectedPlan.length >= QUESTIONS_PER_ROUND) {
 break;
 }
 var mCid = priorityList[p];
 var entry = C.getConceptEntry(mCid);
 if (entry && entry.module.id === moduleId) {
 selectedPlan.push({
 concept: entry.concept,
 isTargetedRetry: true,
 variantIdx: nextVariantFor(mCid)
 });
 }
 }
 }

 // Fill remaining slots up to 10 with remaining concepts sorted by lowest accuracy
 var remainingConcepts = mod.concepts.slice().sort(function (a, b) {
 var sa = vault.conceptState[a.id];
 var sb = vault.conceptState[b.id];
 var accA = sa && sa.attempts > 0 ? sa.correct / sa.attempts : 0.5;
 var accB = sb && sb.attempts > 0 ? sb.correct / sb.attempts : 0.5;
 return accA - accB;
 });

 var fillCursor = 0;
 while (selectedPlan.length < QUESTIONS_PER_ROUND) {
 var cand = remainingConcepts[fillCursor % remainingConcepts.length];
 fillCursor += 1;
 // Avoid third copy of an already-doubled concept if others haven't appeared
 if ((localBump[cand.id] || 0) >= 2 && fillCursor <= remainingConcepts.length) {
 continue;
 }
 selectedPlan.push({
 concept: cand,
 isTargetedRetry: Boolean(missedSet[cand.id]),
 variantIdx: nextVariantFor(cand.id)
 });
 }
 } else {
 // Clean full-coverage 10-question assessment across all 10 concepts of the module
 for (var k = 0; k < mod.concepts.length && selectedPlan.length < QUESTIONS_PER_ROUND; k++) {
 var con = mod.concepts[k];
 selectedPlan.push({
 concept: con,
 isTargetedRetry: false,
 variantIdx: nextVariantFor(con.id)
 });
 }
 }

 var questions = [];
 for (var qIdx = 0; qIdx < selectedPlan.length; qIdx++) {
 var slot = selectedPlan[qIdx];
 var generated = slot.concept.generate(slot.variantIdx, weakKeys, mod.stageNumber);

 // On follow-up rounds where the learner had missed keys and this is a targeted retry
 // in Stage 4 or Stage 5 (or if opts.missedCharsFromLastRound is non-empty), weave in
 // extra weak-key lock-in practice when the target doesn't already contain those keys!
 var finalLockTarget = generated.lockInTarget;
 var finalLockInstr = generated.lockInInstruction;
 if (isFollowUp && weakKeys.length > 0 && slot.isTargetedRetry) {
 var hasWeakAlready = weakKeys.some(function (wk) {
 return finalLockTarget.indexOf(wk) !== -1;
 });
 if (!hasWeakAlready && mod.stageNumber >= 4) {
 var suffix = buildWeakKeyPracticeSuffix(weakKeys, qIdx + roundNumber);
 if (suffix) {
 finalLockTarget += suffix;
 finalLockInstr += " (Includes extra missed-key drill!)";
 }
 }
 }

 questions.push({
 index: qIdx,
 number: qIdx + 1,
 moduleId: moduleId,
 stageNumber: mod.stageNumber,
 conceptId: generated.conceptId,
 conceptTitle: generated.conceptTitle,
 variantIdx: generated.variantIdx,
 isTargetedRetry: slot.isTargetedRetry,
 prompt: generated.prompt,
 options: generated.options,
 lockInInstruction: finalLockInstr,
 lockInTarget: finalLockTarget,
 zeroTeach: generated.zeroTeach,
 concreteExample: generated.concreteExample,
 reteachCheck: generated.reteachCheck,
 selectedOptionIdx: null,
 typedValue: "",
 lockInCompleted: false,
 submitted: false
 });
 }

 return {
 moduleId: moduleId,
 moduleTitle: mod.title,
 moduleCode: mod.code,
 stageNumber: mod.stageNumber,
 roundNumber: roundNumber,
 isFollowUp: isFollowUp,
 prioritizedConceptIds: priorityList,
 targetedWeakKeys: weakKeys,
 questions: questions,
 currentIndex: 0,
 tracker: T.createSessionTracker("Module " + mod.code + " Round " + roundNumber),
 completed: false,
 report: null
 };
 }

 /**
 * Evaluates a finished 10-question round, updates localStorage mastery & mistake history,
 * and constructs Deep Teaching Cards + Next-Round Adaptive Prescription.
 */
 function finalizeModuleRound(roundState) {
 var T = window.CSTrainer.Telemetry;
 if (roundState.completed && roundState.report) {
 return roundState.report;
 }

 var correctCount = 0;
 var missedConceptIds = [];
 var missedSet = {};
 var teachingCards = [];
 var questionBreakdown = [];

 for (var i = 0; i < roundState.questions.length; i++) {
 var q = roundState.questions[i];
 var chosenIdx = q.selectedOptionIdx;
 var chosenOpt = (chosenIdx !== null && q.options[chosenIdx]) ? q.options[chosenIdx] : null;
 var correctOpt = null;
 for (var o = 0; o < q.options.length; o++) {
 if (q.options[o].isCorrect) {
 correctOpt = q.options[o];
 break;
 }
 }

 var isCorrect = Boolean(chosenOpt && chosenOpt.isCorrect);
 if (isCorrect) {
 correctCount += 1;
 } else {
 if (!missedSet[q.conceptId]) {
 missedSet[q.conceptId] = true;
 missedConceptIds.push(q.conceptId);
 }
 teachingCards.push({
 cardId: "reteach_" + i + "_" + q.conceptId,
 questionNumber: q.number,
 conceptId: q.conceptId,
 conceptTitle: q.conceptTitle,
 prompt: q.prompt,
 chosenText: chosenOpt ? chosenOpt.text : "(No option selected)",
 whyWrong: chosenOpt ? chosenOpt.whyWrong : "No option was selected before submission.",
 correctText: correctOpt ? correctOpt.text : "",
 zeroTeach: q.zeroTeach,
 concreteExample: q.concreteExample,
 reteachCheck: q.reteachCheck,
 verified: false
 });
 }

 T.recordConceptOutcome({
 moduleId: roundState.moduleId,
 conceptId: q.conceptId,
 conceptTitle: q.conceptTitle,
 isCorrect: isCorrect,
 prompt: q.prompt,
 chosenText: chosenOpt ? chosenOpt.text : "",
 correctText: correctOpt ? correctOpt.text : "",
 whyWrong: chosenOpt ? chosenOpt.whyWrong : ""
 });

 questionBreakdown.push({
 number: q.number,
 conceptId: q.conceptId,
 conceptTitle: q.conceptTitle,
 isCorrect: isCorrect,
 chosenText: chosenOpt ? chosenOpt.text : "",
 correctText: correctOpt ? correctOpt.text : ""
 });
 }

 var totalCount = roundState.questions.length;
 var scorePct = Math.round((correctCount / totalCount) * 100);
 var typingSummary = T.summarizeTracker(roundState.tracker);

 // Aggregate slip characters from this round for adaptive next-round lock-ins
 var slipCountsByExpected = {};
 var roundMissedChars = [];
 for (var s = 0; s < typingSummary.slips.length; s++) {
 var sl = typingSummary.slips[s];
 if (sl.expected) {
 slipCountsByExpected[sl.expected] = (slipCountsByExpected[sl.expected] || 0) + 1;
 }
 }
 var sortedSlipChars = Object.keys(slipCountsByExpected).sort(function (a, b) {
 return slipCountsByExpected[b] - slipCountsByExpected[a];
 });
 for (var k = 0; k < sortedSlipChars.length; k++) {
 roundMissedChars.push(sortedSlipChars[k]);
 }
 for (var h = 0; h < typingSummary.hesitantKeys.length; h++) {
 var hk = typingSummary.hesitantKeys[h].char;
 if (roundMissedChars.indexOf(hk) === -1) {
 roundMissedChars.push(hk);
 }
 }

 // Group slip reasons cleanly for display
 var groupedSlips = {};
 for (var g = 0; g < typingSummary.slips.length; g++) {
 var item = typingSummary.slips[g];
 var key = (item.expected || "?") + " \u2192 " + (item.typed || "?");
 if (!groupedSlips[key]) {
 groupedSlips[key] = {
 pair: key,
 expected: item.expected,
 typed: item.typed,
 reason: item.reason,
 count: 0
 };
 }
 groupedSlips[key].count += 1;
 }
 var slipList = Object.keys(groupedSlips).map(function (key) {
 return groupedSlips[key];
 }).sort(function (a, b) { return b.count - a.count; });

 var report = {
 moduleId: roundState.moduleId,
 moduleCode: roundState.moduleCode,
 moduleTitle: roundState.moduleTitle,
 roundNumber: roundState.roundNumber,
 correctCount: correctCount,
 totalCount: totalCount,
 scorePct: scorePct,
 masteredRound: scorePct >= MASTERY_THRESHOLD_PCT,
 masteryThresholdPct: MASTERY_THRESHOLD_PCT,
 missedConceptIds: missedConceptIds,
 roundMissedChars: roundMissedChars.slice(0, 6),
 teachingCards: teachingCards,
 typingSummary: typingSummary,
 groupedSlips: slipList,
 questionBreakdown: questionBreakdown
 };

 var moduleMasteryRecord = T.recordModuleRound(roundState.moduleId, report);
 report.bestModulePct = moduleMasteryRecord.bestPct;
 report.moduleMasteredOverall = moduleMasteryRecord.mastered;

 roundState.completed = true;
 roundState.report = report;
 return report;
 }

 /**
 * Builds a cumulative cross-stage question set (2 questions per stage = 10 questions)
 * with fresh scenario seeds for Benchmark Exam Mode.
 */
 function buildBenchmarkQuestionSet(seedOffset) {
 var C = window.CSTrainer.Curriculum;
 var T = window.CSTrainer.Telemetry;
 var weakKeys = collectPriorityWeakKeys([]);
 var seedBase = Math.abs(seedOffset || Date.now() % 997);
 var out = [];

 for (var m = 0; m < C.ALL_MODULES.length; m++) {
 var mod = C.ALL_MODULES[m];
 // Pick 1 foundational + 1 quantitative/trace concept from each of the 10 modules = 10 cumulative items
 var pickIdx = (seedBase + m * 3) % mod.concepts.length;
 var concept = mod.concepts[pickIdx];
 var q = concept.generate(seedBase + m, weakKeys, mod.stageNumber);
 out.push({
 index: out.length,
 number: out.length + 1,
 moduleId: mod.id,
 moduleCode: mod.code,
 stageNumber: mod.stageNumber,
 conceptId: q.conceptId,
 conceptTitle: q.conceptTitle,
 prompt: q.prompt,
 options: q.options,
 lockInInstruction: q.lockInInstruction,
 lockInTarget: q.lockInTarget,
 selectedOptionIdx: null,
 typedValue: "",
 lockInCompleted: false
 });
 }
 return out;
 }

 window.CSTrainer.QuizEngine = {
 MASTERY_THRESHOLD_PCT: MASTERY_THRESHOLD_PCT,
 QUESTIONS_PER_ROUND: QUESTIONS_PER_ROUND,
 createModuleRound: createModuleRound,
 finalizeModuleRound: finalizeModuleRound,
 buildBenchmarkQuestionSet: buildBenchmarkQuestionSet,
 collectPriorityWeakKeys: collectPriorityWeakKeys
 };
})();
