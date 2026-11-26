/* ==========================================================================
 js/curriculum.js - First-Principles 5-Stage Systems & Coding Curriculum
 Covers 5 Stages, 10 Deep Modules, Interactive Simulators, and 100 Core
 Concepts with Parametric & Multi-Scenario Variant Generators.
 ========================================================================== */

(function () {
 "use strict";

 window.CSTrainer = window.CSTrainer || {};

 // Deterministic seeded helper so every follow-up round gets fresh, reproducible
 // scenarios, numbers, truth-table rows, and shuffled option orders.
 function rotateOptions(options, seed) {
 var n = options.length;
 var shift = Math.abs(seed * 3 + 1) % n;
 var out = [];
 for (var i = 0; i < n; i++) {
 out.push(options[(i + shift) % n]);
 }
 return out;
 }

 function toBin(num, width) {
 var s = (num >>> 0).toString(2);
 while (s.length < width) {
 s = "0" + s;
 }
 return s;
 }

 function toHex(num, width) {
 var s = (num >>> 0).toString(16).toUpperCase();
 while (s.length < width) {
 s = "0" + s;
 }
 return "0x" + s;
 }

 // Adapts the Type-to-Lock-In target when the learner has missed/hesitant keys
 function adaptLockIn(baseTarget, baseInstruction, weakKeys, stageNum) {
 if (!weakKeys || weakKeys.length === 0) {
 return { target: baseTarget, instruction: baseInstruction, adaptedKeys: [] };
 }
 // Check if baseTarget already exercises any weak key
 var used = [];
 for (var i = 0; i < weakKeys.length; i++) {
 if (baseTarget.indexOf(weakKeys[i]) !== -1) {
 used.push(weakKeys[i]);
 }
 }
 if (used.length > 0 || stageNum < 4) {
 // For Stages 1-3 keep clean domain expressions unless no weak key is hit on retry;
 // on follow-up rounds append a compact weak-key tag comment when helpful.
 return { target: baseTarget, instruction: baseInstruction, adaptedKeys: used };
 }
 var focus = weakKeys.slice(0, 3).join("");
 return {
 target: baseTarget,
 instruction: baseInstruction + " (Focus weak keys: " + focus + ")",
 adaptedKeys: weakKeys.slice(0, 3)
 };
 }

 // Helper to wrap a multi-scenario bank (3+ distinct authored scenarios per concept)
 function scenarioBankConcept(meta, scenarios) {
 return {
 id: meta.id,
 title: meta.title,
 zeroTeach: meta.zeroTeach,
 concreteExample: meta.concreteExample,
 reteachCheck: meta.reteachCheck,
 generate: function (variantIdx, weakKeys, stageNum) {
 var idx = Math.abs(variantIdx || 0) % scenarios.length;
 var sc = scenarios[idx];
 var lock = adaptLockIn(sc.lockInTarget, sc.lockInInstruction, weakKeys, stageNum);
 return {
 conceptId: meta.id,
 conceptTitle: meta.title,
 variantIdx: variantIdx || 0,
 prompt: sc.prompt,
 options: rotateOptions(sc.options, (variantIdx || 0) + meta.id.length),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: meta.zeroTeach,
 concreteExample: meta.concreteExample,
 reteachCheck: meta.reteachCheck
 };
 }
 };
 }

 // ==========================================================================
 // STAGE 1: PRE-COMPUTER HISTORY & PHYSICAL LAWS
 // ==========================================================================

 var stage1Modules = [
 {
 id: "s1m1",
 stageId: "stage1",
 stageNumber: 1,
 code: "1.1",
 title: "Counting, Positional Systems & Stored Mechanical Instructions",
 subtitle: "From bone tally marks and the Abacus to Jacquard punch cards, Babbage's Analytical Engine, and Ada Lovelace.",
 estimatedMinutes: 18,
 simulatorType: "punchcard-radix",
 lessonSections: [
 {
 heading: "1. Why Tally Marks Hit a Physical Wall (Unary vs. Positional Place Value)",
 body: [
 "Before machines existed, humans recorded sheep, grain, and days by carving one notch per item into bone or wood (such as the Ishango bone). In math, this is called a unary (Base-1) system: five sheep is |||||, and five thousand sheep requires 5,000 physical marks. Unary has zero compression and makes multiplication excruciating.",
 "Roman numerals (I, V, X, L, C, D, M) grouped tallies into symbols, yet lacked consistent place value: 'VIII' (8) takes four characters while 'X' (10) takes one, so columns do not align when adding. Positional number systems solved this permanently with two breakthroughs: a fixed radix (base b, such as 10 for ten fingers) and the symbol 0 to hold an empty column."
 ],
 diagram:
"Positional Base-10 Expansion of 407:\n" +
" Column Weight: 10^2 (100s) | 10^1 (10s) | 10^0 (1s)\n" +
" Digit Symbol : 4 | 0 | 7\n" +
" Physical Value: 4 x 100 + 0 x 10 + 7 x 1 = 407\n" +
" (Without '0' holding the empty tens slot, 407 collapses into 47!)",
 takeaway: "Any positional system with base b represents a number as sum(d_k * b^k). That exact rule works identically in Base-10, Base-8, Base-16, and Base-2."
 },
 {
 heading: "2. The Abacus & Gear Calculators: Physical State + Mechanical Carry",
 body: [
 "An Abacus is not a calculator that thinks - it is a physical memory register made of sliding beads on rods. Each rod represents one positional power of 10 (ones, tens, hundreds). In a bi-quinary suanpan or soroban, upper 'heaven' beads have weight 5 and lower 'earth' beads have weight 1, storing digits 0-9 via physical bead positions.",
 "In 1642, Blaise Pascal built the Pascaline using spoked brass wheels where turning the ones wheel past 9 engaged a weighted lever (sautoir) to advance the tens wheel by 1 - mechanizing the arithmetic carry! Gottfried Wilhelm Leibniz extended this with the stepped drum (Step Reckoner) to perform repeated addition (multiplication)."
 ],
 diagram:
"Mechanical Carry Chain:\n" +
" [Ones Wheel: 9 -> 0] ===(carry pin trips lever)===> [Tens Wheel: +1]",
 takeaway: "Computation requires two physical ingredients: stable physical states to remember digits, and a deterministic transition rule (like a carry lever) that updates state."
 },
 {
 heading: "3. Jacquard's Loom (1804): Separating Hardware from Stored Instructions",
 body: [
 "Early calculators were fixed-function: Pascal's gear train could only add. In 1804, French weaver Joseph Marie Jacquard automated complex silk brocade patterns using chains of stiff paper cards punched with grids of holes.",
 "Spring-loaded rods pressed against each card on every shuttle pass: where a HOLE existed, the rod passed through, lifted the harness hook, and raised that warp thread (1); where SOLID CARD blocked the rod, the thread stayed down (0). Swapping the chain of punch cards made the exact same wooden loom weave a portrait or flowers without rebuilding a single gear!"
 ],
 diagram:
"Jacquard Card Row: [ O . O O . . O . ] O = Hole (Lift Thread = 1)\n" +
"Feeler Needles : ^ ^ ^ ^ . = Solid (Stay Down = 0)\n" +
"Hardware = Loom frame & hooks | Software = Replaceable punch-card loop",
 takeaway: "Jacquard punch cards introduced stored binary instructions: physical matter (holes vs. solid card) encoding a replaceable program."
 },
 {
 heading: "4. Charles Babbage & Ada Lovelace: The Architecture of General Computing",
 body: [
 "Charles Babbage first designed the Difference Engine to tabulate polynomials automatically, then conceived the far more ambitious Analytical Engine (1837) - the direct blueprint of every modern computer. It separated the 'Store' (1,000 columns of 50-digit gear memory) from the 'Mill' (the central arithmetic processor, today's ALU/CPU), driven by Jacquard-style Operation Cards and Variable Cards.",
 "In 1843, mathematician Ada Lovelace translated Luigi Menabrea's paper on the Analytical Engine and wrote extensive Notes (longer than the paper itself). In Note G, she authored a complete step-by-step trace table with nested loops and branching to compute Bernoulli numbers - and articulated the profound leap that if an engine manipulates symbols by rules, those numbers can represent musical notes, text, or logical relationships, not merely quantities."
 ],
 diagram:
"Babbage's Analytical Engine <===> Modern Computer Architecture\n" +
" The Store (Gear Columns) <===> RAM / Memory Addresses\n" +
" The Mill (Arithmetic Unit) <===> CPU Arithmetic Logic Unit (ALU)\n" +
" Operation & Variable Cards <===> Machine Code Opcodes & Operands\n" +
" Conditional Card Backing <===> if / while Branching Loops",
 takeaway: "A true computer is not just a fast adder: it combines addressable memory (Store), an execution unit (Mill), stored instructions, and conditional branching."
 }
 ],
 concepts: [
 scenarioBankConcept({
 id: "s1m1_c1",
 title: "Unary Tally Marks vs. Positional Compression",
 zeroTeach: "Unary (tally marks) uses 1 symbol per unit, so representing N requires N physical marks (O(N) space). A positional system of base b represents N in roughly log_b(N) + 1 digits because each column multiplies value by b.",
 concreteExample: "Representing 1,000 in unary takes 1,000 scratches; in Base-10 positional notation it takes just 4 digits ('1000' = 1*10^3 + 0*10^2 + 0*10^1 + 0*10^0).",
 reteachCheck: { instruction: "Type the space-growth comparison expression:", target: "unary=N digits, positional=log(N)" }
 }, [
 {
 prompt: "Why do raw tally marks (unary notation) fail as a foundation for large-scale calculation?",
 options: [
 { text: "Representing a quantity N requires N physical marks, so storage length grows linearly with value and lacks column place weights.", isCorrect: true, whyWrong: "" },
 { text: "Tally marks cannot represent odd numbers without fractions.", isCorrect: false, whyWrong: "Unary represents odd and even whole numbers identically - one mark per item (e.g., ||| = 3). Its flaw is linear size growth and lack of weighted columns." },
 { text: "Unary notation requires the symbol zero before you can count past ten.", isCorrect: false, whyWrong: "Unary never uses zero at all - it simply adds another stroke for each unit, which is precisely why it becomes unwieldy." },
 { text: "Tally marks only work in Base-16 arithmetic.", isCorrect: false, whyWrong: "Tally marks are Base-1 (unary), completely unrelated to hexadecimal (Base-16)." }
 ],
 lockInInstruction: "Type the core unary scaling rule without looking down:",
 lockInTarget: "unary uses N marks for value N"
 },
 {
 prompt: "A warehouse tracks 4,000 barrels. Moving from unary tally scratches to Base-10 positional digits shrinks the symbol count from 4,000 marks down to how many digits?",
 options: [
 { text: "4 digits ('4000'), because each leftward shift multiplies column weight by 10.", isCorrect: true, whyWrong: "" },
 { text: "400 digits, because Base-10 divides the tally count by ten once.", isCorrect: false, whyWrong: "Dividing by 10 once only handles a single column shift; 4000 uses thousands (10^3), hundreds (10^2), tens (10^1), and ones (10^0) - just 4 digits." },
 { text: "10 digits, because Base-10 always writes ten symbols per number.", isCorrect: false, whyWrong: "Base-10 has an alphabet of 10 possible symbols (0-9), not a fixed length of 10 digits per number." },
 { text: "1 digit, because 4 represents 4,000 without any zeros.", isCorrect: false, whyWrong: "Without three trailing zeros holding the hundreds, tens, and ones columns, '4' alone equals four, not four thousand." }
 ],
 lockInInstruction: "Type the positional expansion of 4000:",
 lockInTarget: "4000 = 4 * 10^3"
 },
 {
 prompt: "Why is column-by-column addition hard in Roman numerals ('XLVIII + XIX') compared with Hindu-Arabic positional numerals ('48 + 19')?",
 options: [
 { text: "Roman symbols have fixed or subtractive values rather than uniform powers-of-base columns, so digits do not align by place weight.", isCorrect: true, whyWrong: "" },
 { text: "Roman numerals were designed exclusively for binary electronics.", isCorrect: false, whyWrong: "Roman numerals predate electronics by millennia and are non-positional human tally groupings." },
 { text: "Roman numerals cannot represent any number larger than 50.", isCorrect: false, whyWrong: "Roman numerals have C (100), D (500), and M (1000); their limitation is non-positional structure, not a cap at 50." },
 { text: "Hindu-Arabic numerals forbid carrying from one column to the next.", isCorrect: false, whyWrong: "Positional numerals make column carries systematic and uniform whenever a column sum reaches the base!" }
 ],
 lockInInstruction: "Type the positional principle:",
 lockInTarget: "place value aligns powers of base"
 }
 ]),
 {
 id: "s1m1_c2",
 title: "Positional Radix & Place-Value Expansion",
 zeroTeach: "In Base-b, a 3-digit string d2 d1 d0 has exact quantity d2*(b^2) + d1*(b^1) + d0*(b^0). Remember that any base raised to the 0th power (b^0) equals 1!",
 concreteExample: "In Base-5, the string '234' means 2*(5^2) + 3*(5^1) + 4*(5^0) = 2*25 + 3*5 + 4*1 = 50 + 15 + 4 = 69 in Base-10.",
 reteachCheck: { instruction: "Type the Base-5 expansion of 234:", target: "2*25 + 3*5 + 4*1 = 69" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cases = [
 { base: 5, digits: [2, 3, 1], str: "231" },
 { base: 8, digits: [1, 4, 5], str: "145" },
 { base: 6, digits: [3, 0, 4], str: "304" },
 { base: 4, digits: [2, 1, 3], str: "213" }
 ];
 var c = cases[Math.abs(variantIdx || 0) % cases.length];
 var b = c.base;
 var val = c.digits[0] * b * b + c.digits[1] * b + c.digits[2];
 var wrongNoZeroPow = c.digits[0] * b * b + c.digits[1] * b + c.digits[2] * b;
 var wrongBase10 = c.digits[0] * 100 + c.digits[1] * 10 + c.digits[2];
 var wrongSum = c.digits[0] + c.digits[1] + c.digits[2];
 var expr = c.digits[0] + "*" + (b * b) + " + " + c.digits[1] + "*" + b + " + " + c.digits[2] + "*1 = " + val;
 var lock = adaptLockIn(expr, "Type the place-value sum to lock in the base-" + b + " calculation:", weakKeys, stageNum);
 return {
 conceptId: "s1m1_c2",
 conceptTitle: "Positional Radix & Place-Value Expansion",
 variantIdx: variantIdx || 0,
 prompt: "In a Base-" + b + " positional system, what Base-10 quantity is represented by the numeral '" + c.str + "'?",
 options: rotateOptions([
 { text: val + " (computed as " + c.digits[0] + "\u00d7" + b + "\u00b2 + " + c.digits[1] + "\u00d7" + b + "\u00b9 + " + c.digits[2] + "\u00d7" + b + "\u2070)", isCorrect: true, whyWrong: "" },
 { text: wrongBase10 + " (reading the columns as hundreds, tens, and ones)", isCorrect: false, whyWrong: "You used Base-10 weights (100, 10, 1) instead of Base-" + b + " weights (" + (b * b) + ", " + b + ", 1)." },
 { text: wrongNoZeroPow + " (multiplying the rightmost digit by " + b + " instead of 1)", isCorrect: false, whyWrong: "The rightmost column is always b^0 = 1, never b^1 = " + b + "." },
 { text: wrongSum + " (adding the digit symbols without column weights)", isCorrect: false, whyWrong: "Simply summing the digits ignores positional place weights (" + (b * b) + ", " + b + ", 1)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s1m1_c3",
 title: "Zero as a Positional Placeholder",
 zeroTeach: "Zero wears two hats in computing: it is a number (zero items) AND a structural placeholder showing that a specific power-of-base column is empty so higher columns keep their true place weights.",
 concreteExample: "In 509, the '0' in the tens column keeps '5' in the 10^2 (hundreds) slot: 5*100 + 0*10 + 9*1 = 509. Without '0', '59' drops the 5 into the tens slot (59).",
 reteachCheck: { instruction: "Type the placeholder expansion of 509:", target: "5*100 + 0*10 + 9*1 = 509" }
 }, [
 {
 prompt: "Why was inventing a dedicated symbol for zero ('0') mandatory before positional number systems could work unambiguously?",
 options: [
 { text: "It marks an empty column so digits to its left stay in their higher power-of-base positions instead of collapsing rightward.", isCorrect: true, whyWrong: "" },
 { text: "Without zero, you cannot add two odd numbers together.", isCorrect: false, whyWrong: "People added odd numbers on counting boards long before written zero; written positional notation needed '0' to distinguish 305 from 35." },
 { text: "Zero doubles the voltage of electrical circuits.", isCorrect: false, whyWrong: "In digital electronics, logic 0 usually corresponds to the LOW voltage threshold near ground (0V), not double voltage." },
 { text: "Zero prevents numbers from ever needing a carry operation.", isCorrect: false, whyWrong: "Carries happen whenever a column reaches the base (e.g., 9 + 1 = 10), where '0' records the wrapped-around empty ones slot." }
 ],
 lockInInstruction: "Type how zero separates 305 from 35:",
 lockInTarget: "305 = 3*100 + 0*10 + 5*1"
 },
 {
 prompt: "On an ancient clay tablet without a zero symbol, a scribe writes '6 4' with a faint gap to mean 604, but a reader misreads it as 64. Which role of '0' fixes this physical ambiguity?",
 options: [
 { text: "Explicit positional placeholder locking '6' into the b^2 column while contributing 0 * b^1 to the sum.", isCorrect: true, whyWrong: "" },
 { text: "Acting as a multiplication terminator that zeroes out the entire number.", isCorrect: false, whyWrong: "Multiplying a whole number by 0 gives 0, whereas placing '0' in the tens slot only multiplies the tens weight by 0 (0*10), preserving 6*100 + 4*1." },
 { text: "Converting the base from Base-10 into Base-60.", isCorrect: false, whyWrong: "A placeholder zero preserves column alignment inside whatever base is already in use." },
 { text: "Turning negative quantities into positive quantities.", isCorrect: false, whyWrong: "Sign representation is distinct from empty-column placeholding." }
 ],
 lockInInstruction: "Type the expansion of 604:",
 lockInTarget: "604 = 6*100 + 0*10 + 4*1"
 },
 {
 prompt: "When a single decimal column holds 9 and you add 1, why does the result become '10'?",
 options: [
 { text: "Base-10 has no single symbol for ten, so the ones column resets to '0' and carries '1' into the 10^1 column.", isCorrect: true, whyWrong: "" },
 { text: "Ten is the largest number expressible in Base-10.", isCorrect: false, whyWrong: "Base-10 can express arbitrarily large integers by adding leftward columns; 9 is simply the largest single-column digit (b - 1)." },
 { text: "The digit '1' in '10' still sits in the ones column.", isCorrect: false, whyWrong: "In '10', '0' occupies the ones (10^0) column so '1' sits in the tens (10^1) column." },
 { text: "Adding 1 changes the radix of the number system from 10 to 2.", isCorrect: false, whyWrong: "Carrying into the next column happens within the same radix whenever a digit exceeds b - 1." }
 ],
 lockInInstruction: "Type the maximum single-digit rule for any base b:",
 lockInTarget: "max digit in base b is b - 1"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c4",
 title: "The Abacus as a Physical Memory Register",
 zeroTeach: "An Abacus stores numeric state physically via bead positions along rods. Each rod is a positional digit column; in bi-quinary designs (soroban/suanpan), an upper bead represents 5 and lower beads represent 1 each.",
 concreteExample: "On one soroban rod, pushing 1 upper bead (weight 5) and 3 lower beads (weight 1 each) against the reckoning bar stores 5 + 3 = 8 in physical matter.",
 reteachCheck: { instruction: "Type the bi-quinary rod equation for 8:", target: "1*5 + 3*1 = 8" }
 }, [
 {
 prompt: "From a computer architecture standpoint, what does an Abacus fundamentally demonstrate?",
 options: [
 { text: "Discrete physical positions of matter (beads on positional rods) can reliably store and update numerical state.", isCorrect: true, whyWrong: "" },
 { text: "An Abacus automatically fetches and executes stored conditional loops without a human operator.", isCorrect: false, whyWrong: "On an Abacus, the human brain acts as the Control Unit and ALU; the frame itself is passive physical state storage." },
 { text: "Beads generate electrical voltage proportional to their wooden mass.", isCorrect: false, whyWrong: "An Abacus is purely mechanical/manual - zero electricity is involved." },
 { text: "Every rod on a standard decimal Abacus requires 100 individual beads.", isCorrect: false, whyWrong: "Bi-quinary rods represent all digits 0-9 using just 5 beads (one 5-bead + four 1-beads) or 7 beads on a Chinese suanpan." }
 ],
 lockInInstruction: "Type what an Abacus is in systems terms:",
 lockInTarget: "physical positional state register"
 },
 {
 prompt: "On a Japanese soroban (1 upper bead worth 5, 4 lower beads each worth 1), how is the digit 7 physically stored on a single rod?",
 options: [
 { text: "1 upper bead + 2 lower beads moved against the central reckoning bar (5 + 2 = 7).", isCorrect: true, whyWrong: "" },
 { text: "7 lower beads pushed upward on one rod.", isCorrect: false, whyWrong: "Each soroban rod only has 4 lower beads; values 5-9 combine the upper 5-bead with 0-4 lower beads." },
 { text: "2 upper beads minus 3 lower beads.", isCorrect: false, whyWrong: "A soroban has 1 upper bead per rod and adds engaged bead weights rather than subtracting." },
 { text: "Leaving all beads away from the bar so air represents 7.", isCorrect: false, whyWrong: "Zero beads touching the reckoning bar represents 0, not 7." }
 ],
 lockInInstruction: "Type the bead combination for 7:",
 lockInTarget: "5 + 2 = 7"
 },
 {
 prompt: "In an Abacus calculation, which modern computer component is still performed by the human user rather than the wooden frame?",
 options: [
 { text: "The Control Unit and instruction sequencing - deciding which operation to perform next.", isCorrect: true, whyWrong: "" },
 { text: "Holding the current intermediate digits between steps.", isCorrect: false, whyWrong: "Holding intermediate digits is the exact job the Abacus beads DO perform so the human doesn't have to hold them all in working memory!" },
 { text: "Assigning positional weights (ones, tens, hundreds) to adjacent columns.", isCorrect: false, whyWrong: "Adjacent rods physically partition ones, tens, hundreds, and thousands columns." },
 { text: "Representing zero in an empty column.", isCorrect: false, whyWrong: "Clearing beads away from the reckoning bar physically encodes 0 in that rod's column." }
 ],
 lockInInstruction: "Type the separation of roles:",
 lockInTarget: "beads store state; human sequences steps"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c5",
 title: "Pascaline & Leibniz Mechanical Carry Trains",
 zeroTeach: "Pascal's 1642 Pascaline proved a physical mechanism - gears and gravity-assisted carry levers - could propagate arithmetic carries automatically without human mental intervention. Leibniz's stepped drum extended gear trains to multiplication via repeated addition.",
 concreteExample: "When the ones wheel rotates from 9 to 0, a single carry pin lifts a weighted pawl that drops and advances the tens wheel by 1 tooth.",
 reteachCheck: { instruction: "Type the mechanical carry trigger:", target: "9 -> 0 trips carry +1" }
 }, [
 {
 prompt: "What core engineering problem did Blaise Pascal's 1642 Pascaline solve that an Abacus did not?",
 options: [
 { text: "Automatic mechanical carry propagation across digit wheels when a column wraps from 9 to 0.", isCorrect: true, whyWrong: "" },
 { text: "Executing replaceable programs from paper punch cards.", isCorrect: false, whyWrong: "Punch-card programmability arrived later with Jacquard (1804) and Babbage (1837); the Pascaline was a fixed-function adder." },
 { text: "Switching currents at microsecond speeds using vacuum tubes.", isCorrect: false, whyWrong: "Vacuum tubes were invented in the early 20th century, roughly 260 years after Pascal's brass gear adder." },
 { text: "Storing text and musical scores in binary RAM.", isCorrect: false, whyWrong: "The Pascaline only accumulated decimal figures for tax and currency calculations." }
 ],
 lockInInstruction: "Type what Pascal's sautoir mechanized:",
 lockInTarget: "automatic gear carry propagation"
 },
 {
 prompt: "Why could a simple direct-meshed gear train stumble when adding 1 to 99,999, and how did Pascal's 'sautoir' lever help?",
 options: [
 { text: "Turning five wheels simultaneously creates huge friction; the weighted sautoir stores potential energy and cascades carries one wheel after another.", isCorrect: true, whyWrong: "" },
 { text: "Brass gears melt at room temperature whenever carries exceed three digits.", isCorrect: false, whyWrong: "The limit was mechanical torque and tooth friction from driving many wheels at once, not melting brass!" },
 { text: "Direct gears can only rotate in Base-2, never Base-10.", isCorrect: false, whyWrong: "A 10-tooth wheel natively counts in Base-10." },
 { text: "Adding 1 to 99,999 requires floating-point logarithms.", isCorrect: false, whyWrong: "99,999 + 1 = 100,000 is pure integer carry propagation across six columns." }
 ],
 lockInInstruction: "Type the 6-digit carry ripple:",
 lockInTarget: "99999 + 1 = 100000"
 },
 {
 prompt: "How did Leibniz's Step Reckoner (1670s) perform multiplication mechanically?",
 options: [
 { text: "Using a fluted cylinder with nine teeth of staggered lengths to add a multi-digit multiplicand repeatedly per crank turn.", isCorrect: true, whyWrong: "" },
 { text: "By compiling C source code into silicon logic gates.", isCorrect: false, whyWrong: "Leibniz worked in the 17th century with brass stepped drums, centuries before silicon or compilers." },
 { text: "By melting lead weights proportional to the product.", isCorrect: false, whyWrong: "It used discrete gear teeth on stepped drums, not analog weights." },
 { text: "It could not multiply and only subtracted Roman numerals.", isCorrect: false, whyWrong: "The Step Reckoner was famous specifically for mechanizing all four arithmetic operations via decimal stepped drums." }
 ],
 lockInInstruction: "Type how mechanical hardware multiplies:",
 lockInTarget: "multiplication via repeated shifted addition"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c6",
 title: "Jacquard Loom Punch Cards as Stored Binary Instructions",
 zeroTeach: "Joseph Marie Jacquard's 1804 loom used punched cards where each position had two discrete physical states: HOLE (rod passes through -> warp thread lifted = 1) or NO HOLE (rod blocked -> thread stays down = 0). Changing the cards changed the behavior without rebuilding the machine.",
 concreteExample: "Card row [1, 0, 1, 1] lifts hooks 1, 3, and 4 while keeping hook 2 down - an early read-only binary instruction stream!",
 reteachCheck: { instruction: "Type the physical binary mapping:", target: "hole = 1, solid card = 0" }
 }, [
 {
 prompt: "Why is Joseph Marie Jacquard's 1804 punch-card loom considered a watershed milestone in computer science?",
 options: [
 { text: "It separated fixed physical hardware (the loom) from replaceable stored binary instructions (chains of punched cards).", isCorrect: true, whyWrong: "" },
 { text: "It was the first machine to use silicon transistors to weave cloth.", isCorrect: false, whyWrong: "Jacquard's loom was 100% mechanical - spring rods, hooks, and pasteboard cards - 143 years before the transistor." },
 { text: "Each hole on a Jacquard card could store 10 different analog depths.", isCorrect: false, whyWrong: "A punch position was strictly binary: either a feeler rod passed through a hole (1) or hit solid card (0)." },
 { text: "It calculated artillery tables for Napoleon's navy.", isCorrect: false, whyWrong: "Jacquard's loom wove intricate silk patterns in Lyon; Babbage later adapted its punch-card concept for mathematical tables." }
 ],
 lockInInstruction: "Type the hardware/software separation:",
 lockInTarget: "same loom hardware, new card program"
 },
 {
 prompt: "In a Jacquard loom mechanism, if 8 spring-loaded feeler rods press against a card row `[Hole, Solid, Solid, Hole, Hole, Solid, Hole, Solid]`, what 8-bit binary pattern is physically read?",
 options: [
 { text: "10011010", isCorrect: true, whyWrong: "" },
 { text: "01100101", isCorrect: false, whyWrong: "That inverts every position (treating Hole as 0 instead of 1). With Hole = 1 and Solid = 0, `[Hole, Solid, Solid, Hole, Hole, Solid, Hole, Solid]` is `10011010`." },
 { text: "11110000", isCorrect: false, whyWrong: "That groups all four holes at the front instead of preserving each rod's exact positional column." },
 { text: "10101010", isCorrect: false, whyWrong: "Positions 2 and 3 are both Solid (`00`) and positions 4 and 5 are both Hole (`11`), giving `10011010`." }
 ],
 lockInInstruction: "Type the 8-bit Jacquard row trace:",
 lockInTarget: "10011010"
 },
 {
 prompt: "If a weaver links the last Jacquard punch card in a flower motif back to the first card in a closed loop, what programming structure have they physically built?",
 options: [
 { text: "An iteration loop that repeats the same instruction sequence automatically.", isCorrect: true, whyWrong: "" },
 { text: "A voltage regulator for alternating current.", isCorrect: false, whyWrong: "Card chains sequence mechanical pattern instructions; they do not regulate electricity." },
 { text: "A compiler that translates French into English.", isCorrect: false, whyWrong: "Linking cards end-to-end repeats the existing binary pattern instructions - a hardware loop." },
 { text: "A volatile capacitor array that erases on power loss.", isCorrect: false, whyWrong: "Punched pasteboard cards are non-volatile read-only storage: holes stay punched indefinitely without power!" }
 ],
 lockInInstruction: "Type what a closed card chain implements:",
 lockInTarget: "repeating instruction loop"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c7",
 title: "Babbage's Analytical Engine: Store vs. Mill",
 zeroTeach: "Charles Babbage's Difference Engine only evaluated polynomials via finite differences. His 1837 Analytical Engine was general-purpose: it divided hardware into the 'Store' (addressable memory columns) and the 'Mill' (central arithmetic/logic processor) controlled by punch cards.",
 concreteExample: "To compute (a + b) * c, Variable Cards fetch 'a' and 'b' from the Store into the Mill, an Operation Card commands ADD, stores the sum, then commands MULTIPLY with 'c'.",
 reteachCheck: { instruction: "Type Babbage's two core units:", target: "Store = memory, Mill = ALU" }
 }, [
 {
 prompt: "In Charles Babbage's Analytical Engine design, what correspond directly to modern RAM and the CPU's Arithmetic Logic Unit (ALU)?",
 options: [
 { text: "The 'Store' corresponds to addressable memory (RAM), and the 'Mill' corresponds to the ALU processor.", isCorrect: true, whyWrong: "" },
 { text: "The 'Mill' is persistent hard-disk storage, and the 'Store' is the screen monitor.", isCorrect: false, whyWrong: "Babbage named the processing unit the 'Mill' (after textile mills where raw material is processed) and the memory columns the 'Store'." },
 { text: "Both 'Store' and 'Mill' were names for steam boilers powering the Difference Engine.", isCorrect: false, whyWrong: "They were the logical memory and arithmetic organs of the Analytical Engine, not steam boilers." },
 { text: "The Analytical Engine had no memory and required humans to write every intermediate digit on paper.", isCorrect: false, whyWrong: "Babbage explicitly designed the Store to hold up to 1,000 50-digit numbers on gear columns!" }
 ],
 lockInInstruction: "Type the architectural mapping:",
 lockInTarget: "Store -> RAM, Mill -> ALU"
 },
 {
 prompt: "What separated Babbage's Analytical Engine fundamentally from his earlier Difference Engine?",
 options: [
 { text: "The Analytical Engine was general-purpose - programmable via punch cards with branching loops - whereas the Difference Engine only computed one fixed method (finite differences).", isCorrect: true, whyWrong: "" },
 { text: "The Difference Engine used silicon microchips while the Analytical Engine used wooden beads.", isCorrect: false, whyWrong: "Both were 19th-century mechanical gear designs; neither used silicon." },
 { text: "The Analytical Engine removed all memory so it would weigh less.", isCorrect: false, whyWrong: "The Analytical Engine expanded memory dramatically with its separate multi-column Store." },
 { text: "The Difference Engine ran Python scripts while the Analytical Engine ran Assembly.", isCorrect: false, whyWrong: "Python was created in 1991; the Difference Engine was a fixed-algorithm mechanical tabulator." }
 ],
 lockInInstruction: "Type the leap from fixed to general machine:",
 lockInTarget: "stored cards + branching = general-purpose"
 },
 {
 prompt: "How did Babbage plan for the Analytical Engine to make data-dependent decisions (equivalent to an `if` statement)?",
 options: [
 { text: "A 'run-up lever' signaled when a result crossed zero/changed sign, allowing the mechanism to advance or back up the punch cards conditionally.", isCorrect: true, whyWrong: "" },
 { text: "It paused and rang a bell so a clerk could rewire the gears by hand on every step.", isCorrect: false, whyWrong: "While it did include bells for operator alerts, conditional branching was mechanized via the sign/overflow run-up lever advancing or reversing cards!" },
 { text: "It could not branch at all; every card ran strictly once in straight-line order.", isCorrect: false, whyWrong: "Conditional card backing/advancing was the exact feature that made it Turing-complete in principle." },
 { text: "It measured room temperature to pick random cards.", isCorrect: false, whyWrong: "Branching was strictly deterministic, triggered by arithmetic sign change in the Mill." }
 ],
 lockInInstruction: "Type what triggers conditional card branching:",
 lockInTarget: "sign change triggers conditional branch"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c8",
 title: "Ada Lovelace's Note G Algorithm & Loop Trace",
 zeroTeach: "In 1843, Ada Lovelace published Note G containing an explicit instruction table to compute Bernoulli numbers on the Analytical Engine - complete with variable registers, operation sequence, intermediate state tracking, and nested repetition cycles (loops).",
 concreteExample: "Lovelace wrote cycle notation like '2(13...23)' showing instructions 13 through 23 repeat dynamically until a counter condition completes.",
 reteachCheck: { instruction: "Type what Note G introduced:", target: "trace table with nested loops" }
 }, [
 {
 prompt: "What makes Ada Lovelace's 1843 'Note G' for the Analytical Engine the first published computer algorithm in history?",
 options: [
 { text: "It laid out an explicit step-by-step instruction table with register assignments, state updates, and nested loops to compute Bernoulli numbers.", isCorrect: true, whyWrong: "" },
 { text: "It patented the first solid-state silicon transistor.", isCorrect: false, whyWrong: "The transistor was invented at Bell Labs in 1947, over a century after Lovelace's 1843 notes." },
 { text: "It was a wiring manual for ENIAC's 18,000 vacuum tubes.", isCorrect: false, whyWrong: "ENIAC was completed in 1945; Lovelace wrote for Babbage's mechanical Analytical Engine in 1843." },
 { text: "It only listed static multiplication tables with no variables or loops.", isCorrect: false, whyWrong: "Note G specifically chose Bernoulli numbers because their recursive structure showcased variable reuse and nested loops!" }
 ],
 lockInInstruction: "Type Lovelace's milestone:",
 lockInTarget: "Note G: variables, state trace, nested loops"
 },
 {
 prompt: "In Lovelace's Note G table, why does the same Store column (such as `V4`) get overwritten with new values across successive steps?",
 options: [
 { text: "Because mutable memory slots let a finite number of registers compute arbitrarily long loops by updating working variables.", isCorrect: true, whyWrong: "" },
 { text: "Because mechanical gears erase themselves randomly every ten seconds.", isCorrect: false, whyWrong: "Gear columns hold their position until explicitly reset or overwritten by an instruction." },
 { text: "Because she ran out of ink while printing the table.", isCorrect: false, whyWrong: "Variable reuse was a deliberate, foundational insight allowing bounded hardware memory to run iterative loops!" },
 { text: "Because `V4` measured the engine's steam pressure in volts.", isCorrect: false, whyWrong: "`V4` stood for Variable Column 4 in Babbage's Store, not voltage." }
 ],
 lockInInstruction: "Type why loops reuse variables:",
 lockInTarget: "finite registers + loop updates = unbounded steps"
 }
 ]),
 scenarioBankConcept({
 id: "s1m1_c9",
 title: "Lovelace's Symbolic Computing Insight",
 zeroTeach: "Babbage focused primarily on numerical tables. Lovelace saw that a machine manipulating discrete symbols according to formal rules is a universal symbol processor: numbers can encode letters, logic propositions, images, or musical pitch and duration.",
 concreteExample: "Today, the byte 01000001 (65) means the integer 65 in an ALU, the letter 'A' in UTF-8 text, or a pixel brightness/MIDI note F4 depending on program rules!",
 reteachCheck: { instruction: "Type Lovelace's symbolic principle:", target: "symbols can encode numbers, text, or music" }
 }, [
 {
 prompt: "Which visionary insight did Ada Lovelace articulate that anticipated modern multimedia, text processing, and AI software?",
 options: [
 { text: "Numbers in a computing engine are abstract symbols whose rules can represent anything - such as musical composition or logical relations - not merely arithmetic quantities.", isCorrect: true, whyWrong: "" },
 { text: "Computers can magically invent truths with zero input rules or data.", isCorrect: false, whyWrong: "Lovelace famously argued the exact opposite: the Analytical Engine has no pretensions to originate anything on its own without rules and inputs." },
 { text: "Only Base-10 gears can ever process sound waves.", isCorrect: false, whyWrong: "Any discrete base (especially Base-2) can encode sampled audio, text, and graphics." },
 { text: "Hardware must be physically rebuilt from scratch to switch from math to text.", isCorrect: false, whyWrong: "Her insight was that the SAME symbolic engine processes math, text, or music simply by changing the program rules and encoding!" }
 ],
 lockInInstruction: "Type how one byte has multiple meanings:",
 lockInTarget: "65 = integer 65 or ASCII 'A'"
 },
 {
 prompt: "When your computer stores the letter `'A'`, a pixel brightness, and the integer `65` using the exact same bit pattern `01000001`, what determines how it behaves?",
 options: [
 { text: "The program instructions and data type context interpreting those bits.", isCorrect: true, whyWrong: "" },
 { text: "Different colored electrons inside the RAM chip for text versus math.", isCorrect: false, whyWrong: "All electrons are physically identical! Bits in RAM are just voltage charges; program instructions give them meaning." },
 { text: "Text bits use Base-26 voltages while numbers use Base-2 voltages.", isCorrect: false, whyWrong: "Everything in digital hardware uses Base-2 HIGH/LOW voltages." },
 { text: "The keyboard physically stamps tiny ink letters onto the silicon die.", isCorrect: false, whyWrong: "A keyboard merely sends numeric scan codes that software maps to character codes like UTF-8/ASCII." }
 ],
 lockInInstruction: "Type the core encoding truth:",
 lockInTarget: "bits are raw state; instructions define meaning"
 }
 ]),
 {
 id: "s1m1_c10",
 title: "Converting Base-10 Quantities into Base-2 / Base-8",
 zeroTeach: "To convert a Base-10 integer into Base-b from first principles, find the largest power of b that fits, subtract it, and repeat down to b^0 = 1 (or repeatedly divide by b and read remainders bottom-to-top).",
 concreteExample: "Convert 13 to Base-2 (weights 8, 4, 2, 1): 8 fits (rem 5) -> 1; 4 fits (rem 1) -> 1; 2 doesn't fit -> 0; 1 fits (rem 0) -> 1. Result: 1101.",
 reteachCheck: { instruction: "Type 13 in 4-bit binary:", target: "13 = 8 + 4 + 0 + 1 = 1101" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var nums = [11, 13, 14, 19, 21, 25, 26];
 var n = nums[Math.abs(variantIdx || 0) % nums.length];
 var width = n >= 16 ? 5 : 4;
 var correctBin = toBin(n, width);
 var revBin = correctBin.split("").reverse().join("");
 if (revBin === correctBin) {
 revBin = toBin(n - 1, width);
 }
 var offOne = toBin(n + 1, width);
 var invBin = correctBin.split("").map(function (b) { return b === "1" ? "0" : "1"; }).join("");
 var lock = adaptLockIn(n + " -> " + correctBin, "Type the decimal-to-binary mapping without looking at the keyboard:", weakKeys, stageNum);
 return {
 conceptId: "s1m1_c10",
 conceptTitle: "Converting Base-10 Quantities into Base-2",
 variantIdx: variantIdx || 0,
 prompt: "Using positional powers of 2 (" + (width === 5 ? "16, 8, 4, 2, 1" : "8, 4, 2, 1") + "), how is the Base-10 integer `" + n + "` written in " + width + "-bit binary?",
 options: rotateOptions([
 { text: "`" + correctBin + "`", isCorrect: true, whyWrong: "" },
 { text: "`" + offOne + "`", isCorrect: false, whyWrong: "`" + offOne + "` adds up to " + (n + 1) + " (off by 1 in the rightmost 2^0 ones column)." },
 { text: "`" + revBin + "`", isCorrect: false, whyWrong: "You reversed bit order (`" + revBin + "` = " + parseInt(revBin, 2) + "). Most-significant power of 2 always goes on the LEFT." },
 { text: "`" + invBin + "`", isCorrect: false, whyWrong: "You inverted 1s and 0s (`" + invBin + "` = " + parseInt(invBin, 2) + "). Mark '1' for each power of 2 included in the sum of " + n + "." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 }
 ]
 },
 {
 id: "s1m2",
 stageId: "stage1",
 stageNumber: 1,
 code: "1.2",
 title: "Physical Laws of Electricity, Relays, Tubes & Silicon Transistors",
 subtitle: "Voltage, current, resistance, Ohm's Law, open/closed circuits, and the hardware evolution from mechanical relays to MOSFET switches.",
 estimatedMinutes: 20,
 simulatorType: "circuit-switch",
 lessonSections: [
 {
 heading: "1. Voltage, Current, Resistance & Ohm's Law (V = I * R)",
 body: [
 "Mechanical gears move too slowly because brass has mass and inertia. Electrons have nearly zero mass (~9.11 x 10^-31 kg) and electromagnetic signals propagate down copper traces at a large fraction of the speed of light! To build logic out of electricity, you need three physical quantities:",
 "1) Voltage (V, measured in Volts): Electrical potential difference - like water pressure between an elevated tank and ground (0V). Without a potential difference, no net current flows.\n2) Current (I, measured in Amperes / Amps): The rate of charge flowing past a point per second.\n3) Resistance (R, measured in Ohms): How strongly a material's atomic lattice opposes electron flow. Ohm's Law unites all three: V = I * R (equivalently I = V / R)."
 ],
 diagram:
"Water Pipe Analogy <===> Electrical Circuit Law (Ohm's Law)\n" +
" Pump Pressure <===> Voltage (V) in Volts\n" +
" Flow Rate (L/s) <===> Current (I) in Amps I = V / R\n" +
" Pipe Narrowing <===> Resistance (R) in Ohms V = I * R",
 takeaway: "Doubling voltage doubles current; doubling resistance cuts current in half (I = V / R)."
 },
 {
 heading: "2. Open vs. Closed Circuits & Voltage Sensing Nodes",
 body: [
 "Current only flows around a complete, unbroken conductive loop from a higher potential (+V supply) back to reference ground (0V). An OPEN switch introduces an air gap with near-infinite resistance (R -> infinity), forcing current I = 0. A CLOSED switch bridges the metal contacts (R -> 0), completing the loop.",
 "Caution: connecting +5V directly to 0V with zero resistance creates a SHORT CIRCUIT - huge current spikes (I = V / R_wire) and dangerous heat! Digital circuits place a load/pull-up or pull-down resistor in series with a switch so an output wire cleanly swings between 0V (LOW) and +V (HIGH) at tiny safe currents."
 ],
 diagram:
"Pull-Down Switch Sensor:\n" +
" +5V Supply ---[ Switch ]---+--- Output Wire (V_out)\n" +
" |\n" +
" [10k Ohm Resistor]\n" +
" |\n" +
" GND (0V)\n" +
" * Switch OPEN -> No current flows -> Resistor pulls V_out to 0V (0)\n" +
" * Switch CLOSED -> Switch connects +5V -> V_out rises to +5V (1)",
 takeaway: "A computer bit is NOT raw current - it is a clean node VOLTAGE (0V vs +V) steered by opening and closing switches!"
 },
 {
 heading: "3. Relays & Vacuum Tubes: Electrically Controlled Switches",
 body: [
 "A wall light switch needs a human finger - useless for automatic chaining where the output of Calculation Step 1 must flip the switches of Step 2! Computing required a switch controlled by another electrical wire:",
 "• Electromechanical Relay (1830s telegraph; 1930s-40s Zuse Z3 & Harvard Mark I): Current through a wire coil creates a magnetic field that physically pulls a spring-loaded iron lever closed (~50-200 switches/sec). Noisy, power-hungry, and vulnerable to physical wear (Grace Hopper's team famously taped an actual moth trapped in a Mark II relay into the logbook as a 'bug'!).\n• Vacuum Tube / Triode Valve (1906 Lee De Forest; 1945 ENIAC): Inside a glass vacuum bulb, a red-hot filament boils off electrons toward a positive plate, while a tiny voltage on a middle wire 'grid' blocks or allows the electron stream - zero moving parts, switching ~100,000 times/sec! Yet ENIAC's 18,000 tubes consumed ~150 kW of power and burned filaments constantly."
 ],
 diagram:
"Generation 1-2 Electrically Controlled Switches:\n" +
" [Relay] Control Wire -> Magnet Coil -> Pulls Iron Armature (~10 ms)\n" +
" [Vacuum Tube] Control Grid -> Electric Field -> Gates Electron Beam (~1-10 us)",
 takeaway: "The breakthrough enabling digital computers is a 3-terminal switch where Voltage A controls the path between Terminal B and Terminal C."
 },
 {
 heading: "4. Silicon Semiconductors & the MOSFET Transistor (1947-Present)",
 body: [
 "Pure silicon is a semiconductor: its crystalline lattice holds 4 valence electrons tightly, conducting poorly. By 'doping' tiny regions with trace phosphorus (5 valence electrons -> extra free electrons, N-type) or boron (3 valence electrons -> positive 'holes', P-type), engineers control conductivity at atomic scale.",
 "In an N-channel MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor), Source and Drain are N-type islands separated by P-type body, with an ultra-thin insulating oxide beneath the Gate terminal:\n• Gate = 0V (LOW): No conductive bridge exists between Source and Drain -> Switch is OPEN (OFF).\n• Gate = +V (HIGH): The Gate's electric field attracts electrons to form an inversion channel -> Switch is CLOSED (ON) in picoseconds! Billions fit on a fingernail-sized chip with zero moving parts and no glowing filaments."
 ],
 diagram:
"N-Channel MOSFET Switch:\n" +
" Gate (Control Input: 0V = OFF, +1V = ON)\n" +
" ======== <-- Thin Insulating Oxide\n" +
" Source [ N+ ] ( P-type Silicon Body ) [ N+ ] Drain\n" +
" ^^^^^^^^^^^^^^^^^^^^^^^\n" +
" Channel forms instantly when Gate is HIGH!",
 takeaway: "Every modern CPU, GPU, and SSD is billions of microscopic silicon field-effect switches opening and closing by voltage alone."
 }
 ],
 concepts: [
 scenarioBankConcept({
 id: "s1m2_c1",
 title: "Conductors, Insulators & Semiconductors",
 zeroTeach: "Conductors (copper, gold, aluminum) have loosely bound valence electrons that drift freely under voltage. Insulators (glass, silicon dioxide) bind electrons tightly so current cannot pass. Semiconductors (doped silicon) can switch cleanly between insulating and conducting via an electric field!",
 concreteExample: "Inside a microchip, copper wires act as conductors, silicon dioxide acts as the gate insulator, and doped silicon forms the switchable transistor channel.",
 reteachCheck: { instruction: "Type why silicon beats pure copper for switches:", target: "silicon switches between off and on via gate voltage" }
 }, [
 {
 prompt: "Why can't you build a transistor switch purely out of solid copper?",
 options: [
 { text: "Copper is always a conductor full of free electrons - you cannot turn its conductivity OFF using a small gate electric field.", isCorrect: true, whyWrong: "" },
 { text: "Copper blocks all electricity unless heated to 1,000 degrees.", isCorrect: false, whyWrong: "Copper conducts electricity effortlessly at room temperature - that's why wires are made of copper!" },
 { text: "Electrons cannot enter metallic elements.", isCorrect: false, whyWrong: "Metals have a 'sea' of mobile conduction electrons." },
 { text: "Copper only conducts Base-10 signals.", isCorrect: false, whyWrong: "Conductors carry continuous analog electromagnetic currents/voltages regardless of number base." }
 ],
 lockInInstruction: "Type the three material roles on a chip:",
 lockInTarget: "copper=wire, oxide=insulator, silicon=switch"
 },
 {
 prompt: "What role does the ultra-thin insulator layer (such as silicon dioxide) under a MOSFET's Gate perform?",
 options: [
 { text: "It lets the Gate's electric field attract a conductive channel beneath it without leaking Gate current directly into the channel.", isCorrect: true, whyWrong: "" },
 { text: "It heats up until electrons boil into open air.", isCorrect: false, whyWrong: "Thermionic emission belongs to vacuum tubes, not solid-state MOSFETs." },
 { text: "It permanently blocks the Source and Drain from ever conducting.", isCorrect: false, whyWrong: "The insulator sits between Gate and Body - Source and Drain conduct horizontally through the induced channel whenever Gate is HIGH." },
 { text: "It stores punch-card holes physically.", isCorrect: false, whyWrong: "Gate oxide is an atomic-scale dielectric insulator inside a silicon chip." }
 ],
 lockInInstruction: "Type how a MOSFET gate controls current:",
 lockInTarget: "electric field across gate insulator"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c2",
 title: "Voltage as Electrical Potential Difference",
 zeroTeach: "Voltage (Volts) is always a DIFFERENCE in electrical potential energy per unit charge between two points (usually measured relative to 0V Ground). If both ends of a wire sit at +5V, potential difference is 5V - 5V = 0V, so zero current flows!",
 concreteExample: "A bird perched with both feet on the same high-voltage line experiences nearly 0V potential difference between its feet, so current does not surge through it.",
 reteachCheck: { instruction: "Type the zero-difference rule:", target: "deltaV = 5V - 5V = 0V -> I = 0" }
 }, [
 {
 prompt: "Node A of a resistor is at `+3.3V` and Node B of the same resistor is ALSO at `+3.3V`. How much current flows through the resistor?",
 options: [
 { text: "0 Amps, because current requires a voltage DIFFERENCE (`3.3V - 3.3V = 0V`) across the component.", isCorrect: true, whyWrong: "" },
 { text: "6.6 Amps, because the two voltages add together.", isCorrect: false, whyWrong: "Potential difference subtracts node potentials (`V_A - V_B = 0V`), and Volts never equal Amps directly without dividing by Resistance." },
 { text: "3.3 Amps regardless of resistance.", isCorrect: false, whyWrong: "With `V_diff = 0V`, `I = 0 / R = 0 Amps`." },
 { text: "Infinite short-circuit current.", isCorrect: false, whyWrong: "Short circuits occur when a nonzero voltage difference (e.g., +3.3V to 0V) bridges near-zero resistance." }
 ],
 lockInInstruction: "Type why equal potentials produce zero flow:",
 lockInTarget: "voltage is potential difference: V_a - V_b"
 },
 {
 prompt: "In the hydraulic analogy of electricity, what physical role corresponds directly to Voltage (`V`)?",
 options: [
 { text: "Pressure difference pushing charges through the circuit.", isCorrect: true, whyWrong: "" },
 { text: "The liters-per-second volume of water passing a point.", isCorrect: false, whyWrong: "Flow rate per second corresponds to electric Current (`I` in Amperes), not Voltage." },
 { text: "Gravel clogging the pipe.", isCorrect: false, whyWrong: "Pipe narrowing or friction corresponds to Resistance (`R` in Ohms)." },
 { text: "A mechanical valve snapping shut.", isCorrect: false, whyWrong: "A valve corresponds to a switch/transistor, whereas Voltage is pressure." }
 ],
 lockInInstruction: "Type the three hydraulic mappings:",
 lockInTarget: "V=pressure, I=flow, R=opposition"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c3",
 title: "Current (Amps) vs. Resistance (Ohms)",
 zeroTeach: "Current (I, Amperes) measures how much charge passes per second (1 Amp = 1 Coulomb/sec). Resistance (R, Ohms) measures opposition to that flow, converting electrical energy into heat when current passes through.",
 concreteExample: "At constant 5V, raising resistance from 100 Ohms to 1,000 Ohms cuts current tenfold from 0.05 A (50 mA) down to 0.005 A (5 mA), saving power and heat!",
 reteachCheck: { instruction: "Type the inverse relationship:", target: "higher R -> lower I at fixed V" }
 }, [
 {
 prompt: "If you keep power-supply Voltage constant at `+5V` and replace a `100 Ohm` resistor with a `1,000 Ohm` resistor, what happens to the Current (`I`)?",
 options: [
 { text: "Current drops to one-tenth its previous value because `I = V / R`.", isCorrect: true, whyWrong: "" },
 { text: "Current increases tenfold because larger Ohms push harder.", isCorrect: false, whyWrong: "Resistance OPPOSES flow! Dividing fixed V by 10x larger R produces 1/10th the current." },
 { text: "Current stays identical because only voltage affects current.", isCorrect: false, whyWrong: "By Ohm's Law (`I = V / R`), both Voltage and Resistance govern current." },
 { text: "Voltage automatically jumps to 50V to compensate.", isCorrect: false, whyWrong: "A regulated +5V voltage source maintains +5V while current adjusts inversely with resistance." }
 ],
 lockInInstruction: "Type Ohm's current formula:",
 lockInTarget: "I = V / R"
 },
 {
 prompt: "Why do CPU designers work relentlessly to minimize wasted switching current across billions of transistors?",
 options: [
 { text: "Current flowing through resistance dissipates electrical power as heat (`P = V * I`), creating thermal limits on clock speed.", isCorrect: true, whyWrong: "" },
 { text: "Electrons permanently run out inside a wall outlet after an hour.", isCorrect: false, whyWrong: "Circuits circulate existing electrons in closed loops; the physical limit in chips is heat dissipation (`P = I^2 * R`)." },
 { text: "Lower current makes Base-2 turn into Base-8.", isCorrect: false, whyWrong: "Number representation remains binary regardless of milliamps." },
 { text: "Zero resistance in copper wires freezes chips below absolute zero.", isCorrect: false, whyWrong: "Lower resistance reduces heat waste; it never refrigerates below ambient temperature." }
 ],
 lockInInstruction: "Type the electrical power heat law:",
 lockInTarget: "P = V * I"
 }
 ]),
 {
 id: "s1m2_c4",
 title: "Ohm's Law Quantitative Circuit Calculation",
 zeroTeach: "Ohm's Law states V = I * R. Rearranging gives I = V / R (Current in Amps = Volts / Ohms) and R = V / I (Resistance in Ohms = Volts / Amps).",
 concreteExample: "A 12V supply connected across a 4 Ohm load drives I = 12 / 4 = 3 Amps of current.",
 reteachCheck: { instruction: "Type the 12V / 4 Ohm calculation:", target: "I = 12 / 4 = 3A" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var pairs = [
 { v: 12, r: 4 },
 { v: 9, r: 3 },
 { v: 5, r: 10 },
 { v: 15, r: 5 },
 { v: 24, r: 6 },
 { v: 6, r: 2 }
 ];
 var p = pairs[Math.abs(variantIdx || 0) % pairs.length];
 var amp = p.v / p.r;
 var multWrong = p.v * p.r;
 var invWrong = Math.round((p.r / p.v) * 100) / 100;
 var addWrong = p.v + p.r;
 var targetStr = "I = " + p.v + " / " + p.r + " = " + amp + "A";
 var lock = adaptLockIn(targetStr, "Type the exact Ohm's Law equation to lock in:", weakKeys, stageNum);
 return {
 conceptId: "s1m2_c4",
 conceptTitle: "Ohm's Law Quantitative Circuit Calculation",
 variantIdx: variantIdx || 0,
 prompt: "A `" + p.v + "V` DC supply is connected in a closed loop across a `" + p.r + " Ohm` resistor. Using Ohm's Law, what current `I` flows through the loop?",
 options: rotateOptions([
 { text: "`" + amp + " A` (since `I = V / R = " + p.v + " / " + p.r + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + multWrong + " A` (multiplying `" + p.v + " * " + p.r + "`)", isCorrect: false, whyWrong: "You computed `V * R` instead of `V / R`. Remember `V = I * R`, so solving for `I` divides voltage by resistance." },
 { text: "`" + invWrong + " A` (dividing `R / V`)", isCorrect: false, whyWrong: "You inverted the fraction (`R / V` instead of `V / R`). Higher voltage drives MORE current, so `V` belongs in the numerator." },
 { text: "`" + addWrong + " A` (adding `" + p.v + " + " + p.r + "`)", isCorrect: false, whyWrong: "Volts and Ohms have different physical units and cannot be added; divide `V / R`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s1m2_c5",
 title: "Open Circuits, Closed Circuits & Short-Circuit Hazards",
 zeroTeach: "An OPEN circuit has a gap (infinite resistance) -> 0 current. A CLOSED circuit with a proper load resistor allows controlled current. A SHORT circuit connects +V directly to Ground (0V) with near-zero resistance, causing extreme current I = V / R_tiny and overheating.",
 concreteExample: "If wire resistance is 0.01 Ohms across a 5V supply with no load resistor, short-circuit current surges toward 5 / 0.01 = 500 Amps!",
 reteachCheck: { instruction: "Type the three circuit states:", target: "open: I=0; closed: controlled I; short: R->0 surge" }
 }, [
 {
 prompt: "Why does connecting a `+5V` supply rail directly to `0V Ground` with a bare copper wire (and no load resistor) immediately overheat or trip protection?",
 options: [
 { text: "Resistance approaches zero (`R -> 0`), so by `I = V / R` current surges violently and dumps intense heat (`P = I^2 * R`).", isCorrect: true, whyWrong: "" },
 { text: "An open air gap traps electrons until they explode.", isCorrect: false, whyWrong: "A bare wire from +5V to 0V has NO air gap - it is a closed zero-resistance short circuit!" },
 { text: "Ground reverses gravity inside the power supply.", isCorrect: false, whyWrong: "Electrical ground (0V) is simply the reference electrical potential, completely unrelated to gravity." },
 { text: "Zero resistance causes current to drop to 0 Amps.", isCorrect: false, whyWrong: "Infinite resistance (open switch) causes `I = 0 Amps`; near-zero resistance causes huge current!" }
 ],
 lockInInstruction: "Type why a short circuit spikes current:",
 lockInTarget: "as R -> 0, I = V / R spikes"
 },
 {
 prompt: "When a physical switch in a single loop is OPEN (contacts separated by air), what is true about current and voltage across the open gap?",
 options: [
 { text: "Current is `0 Amps` everywhere in the loop, while the full supply voltage appears across the open switch contacts.", isCorrect: true, whyWrong: "" },
 { text: "Current flows halfway to the switch and piles up at 10 Amps.", isCorrect: false, whyWrong: "In steady state, current cannot flow sustainably down a dead-end wire - the entire series loop drops to `0 Amps`." },
 { text: "Resistance of air is 0 Ohms.", isCorrect: false, whyWrong: "Dry air at low voltage has megaohms/gigaohms of resistance, acting as an insulator." },
 { text: "Supply voltage vanishes permanently from the battery.", isCorrect: false, whyWrong: "An open switch preserves battery energy because `I = 0` draws zero power (`P = V * 0 = 0W`)." }
 ],
 lockInInstruction: "Type the open-loop rule:",
 lockInTarget: "open loop -> R = infinity, I = 0A"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c6",
 title: "Pull-Up & Pull-Down Voltage Sensing Nodes",
 zeroTeach: "A bare wire disconnected from both +V and 0V 'floats' at an unpredictable voltage due to stray electromagnetic noise! A pull-down resistor weakly ties an input to 0V when a switch is open, while closing the switch overrides it cleanly to +V.",
 concreteExample: "With +3.3V -> Switch -> V_out -> 10kOhm -> GND: Switch OPEN gives V_out = 0V (Logic 0); Switch CLOSED gives V_out = 3.3V (Logic 1) with just 0.33 mA current.",
 reteachCheck: { instruction: "Type why floating inputs need pull resistors:", target: "pull resistor prevents floating noise" }
 }, [
 {
 prompt: "In a digital switch circuit (`+5V -> Switch -> V_out -> 10kΩ pull-down resistor -> GND`), what happens to `V_out` when the switch is OPEN versus CLOSED?",
 options: [
 { text: "OPEN: `V_out = 0V` (pulled cleanly to ground with `I = 0`); CLOSED: `V_out = +5V` (Logic 1, drawing a safe `0.5 mA`).", isCorrect: true, whyWrong: "" },
 { text: "OPEN: `V_out = +5V`; CLOSED: `V_out = 0V` short-circuiting the battery.", isCorrect: false, whyWrong: "Because the 10kΩ resistor sits between `V_out` and `GND`, closing the switch puts `V_out` at `+5V` while the 10kΩ resistor limits current to `5 / 10000 = 0.5 mA`!" },
 { text: "Both OPEN and CLOSED give `+2.5V`.", isCorrect: false, whyWrong: "A closed metal switch has ~0Ω compared to 10kΩ, pulling `V_out` all the way to `+5V`, not halfway." },
 { text: "Removing the resistor makes `V_out` stay reliably at `0V` when open.", isCorrect: false, whyWrong: "Without a pull-down path to ground, an open wire is 'floating' and picks up random electrostatic noise!" }
 ],
 lockInInstruction: "Type the two output states of a pull-down switch:",
 lockInTarget: "open -> 0V (0), closed -> +5V (1)"
 },
 {
 prompt: "What happens in an inverted PULL-UP configuration (`+5V -> 10kΩ resistor -> V_out -> Switch -> GND`) when the switch closes?",
 options: [
 { text: "The closed switch connects `V_out` straight to `0V Ground` (inverting CLOSED into Logic `0`), while the 10kΩ resistor safely drops the 5V.", isCorrect: true, whyWrong: "" },
 { text: "`V_out` rises to +10V.", isCorrect: false, whyWrong: "Closing a switch connected to Ground pulls that node directly to `0V`." },
 { text: "The 10kΩ resistor catches fire from 5,000 Amps.", isCorrect: false, whyWrong: "`I = 5V / 10,000Ω = 0.0005 A` (`2.5 mW` of heat - completely cool and safe!)." },
 { text: "`V_out` stays at +5V even though it is wired directly to Ground.", isCorrect: false, whyWrong: "A ~0Ω closed switch to Ground easily wins over a 10kΩ pull-up resistor, bringing `V_out` to `0V` (this is how a NOT inverter works!)." }
 ],
 lockInInstruction: "Type how a pull-up switch inverts logic:",
 lockInTarget: "pull-up + closed switch to GND -> V_out = 0V"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c7",
 title: "Electromechanical Relays (Zuse Z3 & Harvard Mark I)",
 zeroTeach: "An electromechanical relay lets one circuit switch another circuit with zero human hands: current in an electromagnet coil pulls a spring-loaded metal contact open or closed. This allowed cascading logic gates, though mechanical inertia limited speed to ~50-200 Hz.",
 concreteExample: "Konrad Zuse's Z3 (1941) used ~2,600 telephone relays to execute binary floating-point arithmetic.",
 reteachCheck: { instruction: "Type how a relay switches:", target: "coil current -> magnetic field -> flips contact" }
 }, [
 {
 prompt: "Why was the electromechanical relay a critical leap beyond manual wall switches for building early computers like the Zuse Z3?",
 options: [
 { text: "The electrical output of one relay can energize the coil of the next relay, enabling multi-stage logic cascades without human fingers.", isCorrect: true, whyWrong: "" },
 { text: "Relays have zero moving parts and switch in picoseconds.", isCorrect: false, whyWrong: "Relays have a physical moving iron armature and spring, limiting them to milliseconds (~50-200 ops/sec) - silicon transistors brought picosecond solid-state switching." },
 { text: "Relays generate infinite free electricity from permanent magnets.", isCorrect: false, whyWrong: "Relay coils consume significant electrical power to hold the magnetic contact closed." },
 { text: "Relays store terabytes of video on a single iron spring.", isCorrect: false, whyWrong: "One latching relay holds just 1 bit of state and is the size of a thumb!" }
 ],
 lockInInstruction: "Type why electrically controlled switches matter:",
 lockInTarget: "output voltage of gate A drives input of gate B"
 },
 {
 prompt: "What physical bottleneck prevented relay computers from ever reaching megahertz or gigahertz speeds?",
 options: [
 { text: "Mechanical inertia, contact bounce, and spring wear of moving a physical metal lever across an air gap.", isCorrect: true, whyWrong: "" },
 { text: "Electricity travels slower than sound in copper wire.", isCorrect: false, whyWrong: "Electromagnetic waves travel near ~200,000 km/s in copper; the bottleneck was moving the heavy iron lever!" },
 { text: "Boolean algebra had not been discovered yet.", isCorrect: false, whyWrong: "Boole published Boolean algebra in 1854 and Shannon mapped it to relay circuits in 1937!" },
 { text: "Relays can only represent the number 7.", isCorrect: false, whyWrong: "Relays are crisp two-state (open/closed) binary switches." }
 ],
 lockInInstruction: "Type the physical bottleneck of relays:",
 lockInTarget: "mechanical mass + inertia limit relay speed"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c8",
 title: "Vacuum Tubes / Thermionic Valves (Colossus & ENIAC)",
 zeroTeach: "Vacuum tubes replaced moving metal levers with an electron beam in an evacuated glass bulb: a heated cathode emits electrons toward a positive plate (anode), and a control grid wire between them blocks or passes the flow at microsecond speeds (~1,000x faster than relays).",
 concreteExample: "ENIAC (1945) jumped to 5,000 additions per second using ~18,000 vacuum tubes, at the cost of ~150 kW of heat and frequent burned-out filaments.",
 reteachCheck: { instruction: "Type the vacuum tube tradeoff:", target: "no moving parts -> fast, but hot & fragile" }
 }, [
 {
 prompt: "How did vacuum tubes (used in Colossus and ENIAC) achieve roughly 1,000x faster switching speeds than electromechanical relays?",
 options: [
 { text: "They eliminated moving mechanical levers, using a grid voltage to gate low-mass electrons flying through a vacuum.", isCorrect: true, whyWrong: "" },
 { text: "They operated at icy cryogenic temperatures with zero power consumption.", isCorrect: false, whyWrong: "Vacuum tubes required glowing red-hot filaments (thermionic emission), consuming ~150 kilowatts in ENIAC!" },
 { text: "They shrank 10 billion switches onto a 5mm silicon wafer.", isCorrect: false, whyWrong: "Each vacuum tube was the size of a small light bulb; integrated silicon chips came decades later." },
 { text: "They replaced electricity with pressurized water.", isCorrect: false, whyWrong: "Vacuum tubes are purely electronic thermionic devices." }
 ],
 lockInInstruction: "Type how a triode tube switches:",
 lockInTarget: "grid voltage gates electron stream in vacuum"
 },
 {
 prompt: "Despite its microsecond speed, what severe physical flaw limited the scale and reliability of vacuum-tube computers?",
 options: [
 { text: "Every tube required a continuously heated filament that wasted huge power as heat and burned out like an incandescent bulb.", isCorrect: true, whyWrong: "" },
 { text: "Vacuum tubes could only open once and had to be smashed with a hammer to reset.", isCorrect: false, whyWrong: "Tubes switched millions of times per second cleanly until filament degradation eventually caused failure." },
 { text: "Moths lived inside the evacuated vacuum glass.", isCorrect: false, whyWrong: "The interior of a vacuum tube is sealed airless vacuum; moths got stuck in open electromechanical relays!" },
 { text: "Tubes could not implement NOT or AND logic gates.", isCorrect: false, whyWrong: "ENIAC, Colossus, and EDVAC built thousands of electronic logic gates and flip-flops from vacuum tubes." }
 ],
 lockInInstruction: "Type the two vacuum-tube liabilities:",
 lockInTarget: "high filament heat + glass bulb burnout"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c9",
 title: "Silicon Semiconductors & N/P Doping",
 zeroTeach: "Pure silicon has 4 valence electrons locked in crystal bonds. Adding trace Group-V atoms like phosphorus (5 valence electrons) creates N-type silicon with mobile negative electrons; adding Group-III atoms like boron (3 valence electrons) creates P-type silicon with mobile positive 'holes'.",
 concreteExample: "Alternating N-type, P-type, and N-type regions on one crystal creates a junction barrier that stays OFF until a Gate electric field inverts the channel!",
 reteachCheck: { instruction: "Type the silicon doping summary:", target: "doping tunes silicon into N-type and P-type" }
 }, [
 {
 prompt: "What does 'doping' silicon mean in semiconductor physics?",
 options: [
 { text: "Introducing tiny, precise amounts of impurity atoms (like phosphorus or boron) into pure silicon crystal to create controllable charge carriers.", isCorrect: true, whyWrong: "" },
 { text: "Coating copper wires in rubber insulation so they don't touch.", isCorrect: false, whyWrong: "Wire insulation is macroscopic packaging; doping alters the atomic crystal lattice of silicon itself." },
 { text: "Melting sand into glass light bulbs to hold a vacuum.", isCorrect: false, whyWrong: "Glass is amorphous insulator SiO2; transistors use ultra-pure single-crystal silicon wafers." },
 { text: "Painting binary 1s and 0s onto a motherboard with silver ink.", isCorrect: false, whyWrong: "1s and 0s are dynamic voltages during operation, while doping builds the permanent transistor junctions." }
 ],
 lockInInstruction: "Type the two doped carrier types:",
 lockInTarget: "N-type = extra electrons, P-type = holes"
 },
 {
 prompt: "Why was moving from glass vacuum tubes to solid-state doped silicon such a dramatic reliability breakthrough?",
 options: [
 { text: "Charge carriers move inside a solid crystal at room temperature with no glowing filament to burn out and no glass vacuum seal to leak.", isCorrect: true, whyWrong: "" },
 { text: "Silicon transistors require zero voltage to operate.", isCorrect: false, whyWrong: "Transistors still require supply voltage (e.g., ~0.7V-1.1V in modern CPUs), just vastly less power than hot tube filaments!" },
 { text: "Silicon switches use mechanical springs etched inside the sand.", isCorrect: false, whyWrong: "Transistors are 100% solid-state - zero mechanical springs or moving parts." },
 { text: "Each silicon atom stores an entire movie.", isCorrect: false, whyWrong: "A single transistor acts as 1 switch; billions together store and process complex media." }
 ],
 lockInInstruction: "Type why solid-state wins:",
 lockInTarget: "solid crystal, no hot filament, nanometer scale"
 }
 ]),
 scenarioBankConcept({
 id: "s1m2_c10",
 title: "The MOSFET Silicon Transistor as an Ideal Switch",
 zeroTeach: "A MOSFET has three main active terminals: Gate (control input), Source, and Drain. In an N-MOSFET, applying HIGH voltage to the Gate forms a thin conductive bridge letting current pass between Source and Drain (Switch CLOSED); dropping Gate to 0V dissolves the bridge (Switch OPEN).",
 concreteExample: "Modern CPUs pair P-MOSFETs (closed when Gate=0) and N-MOSFETs (closed when Gate=1) in CMOS logic so nearly zero static current flows when idle!",
 reteachCheck: { instruction: "Type the N-MOSFET switch rule:", target: "Gate=0 -> OPEN (off), Gate=1 -> CLOSED (on)" }
 }, [
 {
 prompt: "In a standard N-channel MOSFET acting as a digital switch, what happens when the Gate voltage changes from `0V (LOW)` to `+1V (HIGH)`?",
 options: [
 { text: "An electric field attracts electrons to form a conductive channel between Source and Drain, closing the switch with zero moving parts.", isCorrect: true, whyWrong: "" },
 { text: "A microscopic iron hinge swings down to touch the Drain.", isCorrect: false, whyWrong: "Iron hinges exist in mechanical relays; a MOSFET switches purely via an electrostatic inversion channel in silicon." },
 { text: "The transistor permanently melts so it can store a 1 forever.", isCorrect: false, whyWrong: "One-time anti-fuses melt permanently, whereas logic MOSFETs switch reversibly billions of times per second!" },
 { text: "Current flows straight through the insulating Gate oxide into the Drain.", isCorrect: false, whyWrong: "The Gate oxide insulates the Gate; main current flows horizontally between Source and Drain!" }
 ],
 lockInInstruction: "Type the three MOSFET terminals:",
 lockInTarget: "Gate controls channel between Source and Drain"
 },
 {
 prompt: "Why do modern processors use CMOS (pairing complementary P-type pull-up and N-type pull-down MOSFETs) in every logic gate?",
 options: [
 { text: "In steady state (`0` or `1`), one transistor is ON and the opposite is OFF, so no continuous direct path exists from `+V` to `GND` - slashing idle heat!", isCorrect: true, whyWrong: "" },
 { text: "Because N-type transistors only work on Mondays and P-type on Tuesdays.", isCorrect: false, whyWrong: "Both operate simultaneously in push-pull harmony on every single clock picosecond!" },
 { text: "To convert digital bits back into Base-10 analog waves.", isCorrect: false, whyWrong: "CMOS push-pull snapping keeps outputs sharply pinned to `0V` or `+V` (Base-2!)." },
 { text: "Because a single transistor cannot conduct electrons.", isCorrect: false, whyWrong: "A single transistor conducts fine, but pairing it with a passive resistor wastes constant static current whenever the switch is closed." }
 ],
 lockInInstruction: "Type the CMOS efficiency secret:",
 lockInTarget: "CMOS: pull-up ON means pull-down OFF"
 }
 ])
 ]
 }
 ];

 // ==========================================================================
 // STAGE 2: HOW BINARY AND LOGIC WERE BORN
 // ==========================================================================

 var stage2Modules = [
 {
 id: "s2m1",
 stageId: "stage2",
 stageNumber: 2,
 code: "2.1",
 title: "Noise Margins, Base-2 Physics & Boolean Logic Gates",
 subtitle: "Why Base-10 voltages fail under real-world noise, how wide HIGH/LOW thresholds regenerate clean bits, and building NOT, AND, OR, NAND, and XOR from switches.",
 estimatedMinutes: 22,
 simulatorType: "logic-gates",
 lessonSections: [
 {
 heading: "1. Why Computers Use Base-2 Physically Instead of Base-10: Noise Margins!",
 body: [
 "Beginners often wonder: 'Humans love Base-10, and early ENIAC even tried decimal ring counters - why did every modern computer converge on Base-2 (0 and 1)?' The answer is pure electrical physics: NOISE MARGINS.",
 "Real chip wires suffer thermal fluctuations, crosstalk from neighboring traces, power-droop, and manufacturing variation. Suppose your chip supply is 1.0V and you try encoding Base-10 digits (0 through 9) as ten voltage levels: 0.0V, 0.11V, 0.22V, 0.33V ... 1.0V. A tiny 0.06V electromagnetic spike corrupts digit '3' (0.33V) into '4' (0.39V) permanently! Worse, cascading through 50 stages accumulates analog drift until output is garbage.",
 "In Base-2, we split 0.0V-1.0V into TWO wide ranges separated by a 'Forbidden Transition Zone': e.g., 0.0V-0.3V = Guaranteed LOW (0), and 0.7V-1.0V = Guaranteed HIGH (1). Even if a 0.95V '1' loses 0.20V to wire noise (0.75V), the next CMOS inverter still sees >= 0.7V and snaps its output cleanly back to a fresh 1.0V! Digital gates actively heal noise at every hop."
 ],
 diagram:
"Base-10 Voltage Bands (Fragile!) vs. Base-2 Static Discipline (Self-Healing!)\n" +
" 1.0V +-------+ 1.0V +-----------------------+\n" +
" |9|8|7|6| (~0.1V tiny bands: | LOGIC 1 (HIGH) | 0.7V..1.0V\n" +
" |5|4|3|2| 0.06V noise flips!)0.7V+-----------------------+\n" +
" | 1| 0| | /// FORBIDDEN ZONE ///| (Amplifier snaps!)\n" +
" 0.0V +-------+ 0.3V +-----------------------+\n" +
" | LOGIC 0 (LOW) | 0.0V..0.3V\n" +
" 0.0V +-----------------------+",
 takeaway: "Binary wins not because 2 is cute in math, but because ON vs. OFF gives maximum voltage noise margins and signal regeneration across billions of switches."
 },
 {
 heading: "2. George Boole & C. E. Shannon: Switches Become Logic Gates",
 body: [
 "In 1854, George Boole showed human logical reasoning ('TRUE' and 'FALSE') obeys an exact algebra. Eighty-three years later, 21-year-old MIT master's student C. E. Shannon (1937) proved that electrical switches wired in series and parallel implement Boolean algebra 1-for-1!",
 "• NOT (Inverter): Output is the opposite of Input (`!0 = 1`, `!1 = 0`). Built with a pull-up to +V and a switch to GND.\n• AND Gate: Two switches in SERIES. Current reaches Output ONLY if Switch A is closed (1) AND Switch B is closed (1).\n• OR Gate: Two switches in PARALLEL. Current reaches Output if Switch A is closed (1) OR Switch B is closed (1) (or both)."
 ],
 diagram:
"Series Switches = AND Gate: Parallel Switches = OR Gate:\n" +
" +V ---[ A ]---[ B ]---> Out +V ---+---[ A ]---+---> Out\n" +
" Out=1 ONLY when A=1 AND B=1 +---[ B ]---+\n" +
" Out=1 when A=1 OR B=1 (or both)",
 takeaway: "Every `&&`, `||`, and `!` you write in code compiles down to physical series/parallel transistor networks."
 },
 {
 heading: "3. Universal `NAND` and Difference-Detecting `XOR` Truth Tables",
 body: [
 "Two more gates unlock all of computing:\n• NAND ('NOT-AND'): Outputs `0` ONLY when both inputs are `1`, and `1` otherwise (`!(A && B)`). NAND is 'functionally complete' (universal): wire both inputs of a NAND together (`NAND(A, A)`) and you get `NOT(A)`; follow NAND with NOT and you get `AND`; invert inputs into NAND (`NAND(!A, !B)`) and by De Morgan's Law you get `OR`! Real SSD Flash chips and ASIC libraries are built heavily out of NAND gates.\n• XOR ('Exclusive OR'): Outputs `1` ONLY when its two inputs DIFFER (`A != B`), and `0` when they match (`0^0=0`, `0^1=1`, `1^0=1`, `1^1=0`). Watch `1 + 1` in binary: `1 + 1 = 10` (ones digit is `0`!). XOR computes 1-bit addition without carry, parity checks, and cryptographic bit mixing."
 ],
 diagram:
"Complete 2-Input Gate Truth Table:\n" +
" A B | AND | OR | NAND | XOR\n" +
" ------+-----+-----+------+-----\n" +
" 0 0 | 0 | 0 | 1 | 0\n" +
" 0 1 | 0 | 1 | 1 | 1\n" +
" 1 0 | 0 | 1 | 1 | 1\n" +
" 1 1 | 1 | 1 | 0 | 0",
 takeaway: "Memorize the anchor rows: AND is 1 only at (1,1); OR is 0 only at (0,0); NAND flips AND; XOR is 1 when A != B."
 }
 ],
 concepts: [
 scenarioBankConcept({
 id: "s2m1_c1",
 title: "Why Base-2 Beats Base-10 Physically",
 zeroTeach: "Encoding 10 distinct digits on one wire forces 10 tightly packed voltage thresholds where small thermal noise, IR voltage drop, or electromagnetic crosstalk flips digits. Base-2 uses just two wide saturated states (fully OFF near 0V, fully ON near +V), tolerating large noise spikes cleanly.",
 concreteExample: "On a 0V-1.0V chip, 10 levels sit ~0.11V apart (0.06V noise causes bit corruption), whereas 2 levels leave a ~0.4V-0.7V safety buffer!",
 reteachCheck: { instruction: "Type why Base-2 wins on real silicon:", target: "Base-2 maximizes voltage noise margins" }
 }, [
 {
 prompt: "What is the primary PHYSICAL reason modern digital computers use Base-2 (binary) rather than Base-10 (decimal) voltages inside chips?",
 options: [
 { text: "Two wide HIGH/LOW voltage zones provide huge noise margins and regenerate degraded signals cleanly, whereas 10 narrow voltage bands corrupt easily under electrical noise.", isCorrect: true, whyWrong: "" },
 { text: "Mathematics forbids doing multiplication or division in Base-10.", isCorrect: false, whyWrong: "Math works in every base! Humans multiply in Base-10 daily; Base-2 wins because of physical switch saturation and noise immunity." },
 { text: "Silicon atoms only contain 2 electrons total.", isCorrect: false, whyWrong: "A silicon atom has 14 electrons (4 valence); Base-2 comes from transistor ON/OFF switching, not electron count." },
 { text: "Base-2 uses ten times more wires so chips look larger.", isCorrect: false, whyWrong: "A 32-bit binary bus represents over 4.29 billion values on just 32 wires - extremely compact and reliable!" }
 ],
 lockInInstruction: "Type the physical reason binary won:",
 lockInTarget: "wide HIGH/LOW thresholds resist electrical noise"
 },
 {
 prompt: "Suppose a hypothetical Base-10 wire maps digits `0..9` evenly from `0.0V` to `0.9V` (`0.1V` per step). If neighboring wire crosstalk induces a `+0.08V` spike on a `0.3V` ('3') signal, what happens?",
 options: [
 { text: "The voltage jumps to `0.38V`, crossing the midpoint into `'4'` (`0.4V` band) and silently corrupting the calculation!", isCorrect: true, whyWrong: "" },
 { text: "The wire automatically subtracts `0.08V` because copper knows Base-10.", isCorrect: false, whyWrong: "Passive copper cannot tell signal from noise! Only wide digital threshold margins prevent small spikes from crossing boundaries." },
 { text: "Nothing happens unless noise exceeds `100V`.", isCorrect: false, whyWrong: "When thresholds sit `0.1V` apart, half-step noise (`>0.05V`) already misclassifies the digit." },
 { text: "The signal turns into negative binary.", isCorrect: false, whyWrong: "`0.30V + 0.08V = 0.38V`, which lands right inside the adjacent `4` voltage bucket." }
 ],
 lockInInstruction: "Type why analog drift breaks multi-level logic:",
 lockInTarget: "narrow voltage bands corrupt under small noise"
 }
 ]),
 {
 id: "s2m1_c2",
 title: "Static Noise Margin Calculation",
 zeroTeach: "A sender guarantees HIGH outputs are at least V_OH (e.g., 0.9V) and a receiver accepts anything >= V_IH (e.g., 0.7V) as HIGH. The High Noise Margin is NM_H = V_OH - V_IH. Similarly for LOW: NM_L = V_IL - V_OL.",
 concreteExample: "If Sender outputs V_OH = 0.95V and Receiver recognizes >= 0.70V as Logic 1, the wire can suffer up to 0.95 - 0.70 = 0.25V of noise droop without error!",
 reteachCheck: { instruction: "Type the High Noise Margin formula:", target: "NM_H = V_OH - V_IH" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var specs = [
 { voh: 0.95, vih: 0.70, nm: "0.25" },
 { voh: 3.10, vih: 2.00, nm: "1.10" },
 { voh: 4.50, vih: 3.15, nm: "1.35" },
 { voh: 1.10, vih: 0.75, nm: "0.35" }
 ];
 var s = specs[Math.abs(variantIdx || 0) % specs.length];
 var sumWrong = (s.voh + s.vih).toFixed(2);
 var target = "NM_H = " + s.voh.toFixed(2) + " - " + s.vih.toFixed(2) + " = " + s.nm + "V";
 var lock = adaptLockIn(target, "Type the noise-margin calculation to lock in:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c2",
 conceptTitle: "Static Noise Margin Calculation",
 variantIdx: variantIdx || 0,
 prompt: "Gate A guarantees a Logic `1` output of at least `V_OH = " + s.voh.toFixed(2) + "V`, and Gate B reliably reads any input `>= V_IH = " + s.vih.toFixed(2) + "V` as Logic `1`. How much negative voltage noise can hit the wire before Gate B misreads the `1`?",
 options: rotateOptions([
 { text: "`" + s.nm + "V` (computed as `V_OH - V_IH = " + s.voh.toFixed(2) + " - " + s.vih.toFixed(2) + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + sumWrong + "V` (adding `V_OH + V_IH`)", isCorrect: false, whyWrong: "Noise margin is the safety GAP between guaranteed output and required input (`V_OH - V_IH`), not their sum." },
 { text: "`0.00V` (any millivolt drop destroys a binary 1)", isCorrect: false, whyWrong: "The whole point of setting `V_OH > V_IH` is creating a `" + s.nm + "V` cushion where noise causes ZERO bit errors!" },
 { text: "`" + s.vih.toFixed(2) + "V` (equal to `V_IH` itself)", isCorrect: false, whyWrong: "Dropping by `" + s.vih.toFixed(2) + "V` from `" + s.voh.toFixed(2) + "V` would leave `" + s.nm + "V`, which is well BELOW the `" + s.vih.toFixed(2) + "V` HIGH threshold!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c3",
 title: "8-Bit Unsigned Byte Place Values",
 zeroTeach: "An 8-bit byte has column weights 128, 64, 32, 16, 8, 4, 2, 1 from left (Most Significant Bit, MSB) to right (Least Significant Bit, LSB). Minimum unsigned value is 00000000 = 0; maximum is 11111111 = 255 (2^8 - 1 = 256 total patterns).",
 concreteExample: "01001010 = 64 + 8 + 2 = 74.",
 reteachCheck: { instruction: "Type the 8 byte weights left to right:", target: "128 64 32 16 8 4 2 1" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var vals = [42, 74, 137, 195, 90, 165];
 var v = vals[Math.abs(variantIdx || 0) % vals.length];
 var b8 = toBin(v, 8);
 var lock = adaptLockIn(b8 + " = " + v, "Type the 8-bit binary byte and its decimal value:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c3",
 conceptTitle: "8-Bit Unsigned Byte Place Values",
 variantIdx: variantIdx || 0,
 prompt: "Using 8-bit byte weights (`128, 64, 32, 16, 8, 4, 2, 1`), what decimal value does the unsigned byte `" + b8 + "` represent?",
 options: rotateOptions([
 { text: "`" + v + "`", isCorrect: true, whyWrong: "" },
 { text: "`" + (v + 16) + "`", isCorrect: false, whyWrong: "Check the `2^4 = 16` column carefully - summing the active 1-bits of `" + b8 + "` yields `" + v + "`, not `" + (v + 16) + "`." },
 { text: "`" + (255 - v) + "`", isCorrect: false, whyWrong: "`" + (255 - v) + "` sums the `0` positions (bitwise complement) instead of the `1` positions!" },
 { text: "`" + Math.max(1, v - 1) + "`", isCorrect: false, whyWrong: "Check the rightmost `2^0 = 1` bit: `" + b8 + "` ends in `" + b8[7] + "`, so its parity must match `" + v + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s2m1_c4",
 title: "C. E. Shannon's Bridge & the NOT Inverter",
 zeroTeach: "C. E. Shannon's 1937 thesis proved Boolean operations map directly to switching circuits. The simplest gate is NOT (Inverter): Input 0 -> Output 1, Input 1 -> Output 0, regenerating clean voltage levels at the same time.",
 concreteExample: "In CMOS, Input=1 closes the bottom N-MOSFET to 0V (Output=0); Input=0 closes the top P-MOSFET to +V (Output=1).",
 reteachCheck: { instruction: "Type the NOT truth table:", target: "!0 = 1, !1 = 0" }
 }, [
 {
 prompt: "What happens when you cascade TWO `NOT` (inverter) gates back-to-back (`Input -> NOT -> NOT -> Output`)?",
 options: [
 { text: "Logical value returns to the original bit (`!!A === A`), while electrically buffering and sharpening a degraded signal back to crisp HIGH/LOW rails!", isCorrect: true, whyWrong: "" },
 { text: "Both bits cancel out to permanently output `0`.", isCorrect: false, whyWrong: "If `A = 1`, the first NOT outputs `0`, and the second NOT inverts `0` right back to `1` (`!!1 = 1`)." },
 { text: "It multiplies the binary number by 2.", isCorrect: false, whyWrong: "Left-shifting multiplies by 2; double negation restores the exact same 1-bit truth value." },
 { text: "It creates an infinite short circuit.", isCorrect: false, whyWrong: "Cascading Gate 1's output into Gate 2's insulated MOSFET gate is completely safe and forms a digital buffer!" }
 ],
 lockInInstruction: "Type the double-negation identity:",
 lockInTarget: "!!A === A"
 },
 {
 prompt: "What monumental connection did C. E. Shannon establish in his 1937 master's thesis?",
 options: [
 { text: "George Boole's 1854 symbolic logic maps identically onto series, parallel, and inverting electrical switch networks.", isCorrect: true, whyWrong: "" },
 { text: "HTML and CSS layout rules for desktop browsers.", isCorrect: false, whyWrong: "The World Wide Web arrived over 50 years later (1989-1990)." },
 { text: "That computers must use vacuum tubes instead of transistors.", isCorrect: false, whyWrong: "Shannon's Boolean circuit algebra is technology-independent - it works identically on relays, tubes, transistors, or optical switches!" },
 { text: "That binary numbers cannot represent negative integers.", isCorrect: false, whyWrong: "Binary represents negative numbers cleanly via two's complement." }
 ],
 lockInInstruction: "Type Shannon's 1937 equation:",
 lockInTarget: "Boolean algebra === switch circuits"
 }
 ]),
 {
 id: "s2m1_c5",
 title: "Series Switches & the AND Gate",
 zeroTeach: "Two switches wired in SERIES form an AND gate: current can only cross from source to output when Switch A is closed (1) AND Switch B is closed (1). If EITHER switch is open (0), the path is broken and Output = 0.",
 concreteExample: "Truth table: 0&0=0, 0&1=0, 1&0=0, 1&1=1.",
 reteachCheck: { instruction: "Type the only input pair where AND outputs 1:", target: "1 AND 1 = 1" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var rows = [
 { a: 1, b: 0, out: 0 },
 { a: 0, b: 1, out: 0 },
 { a: 1, b: 1, out: 1 },
 { a: 0, b: 0, out: 0 }
 ];
 var r = rows[Math.abs(variantIdx || 0) % rows.length];
 var lock = adaptLockIn(r.a + " && " + r.b + " === " + r.out, "Type the series-switch AND expression:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c5",
 conceptTitle: "Series Switches & the AND Gate",
 variantIdx: variantIdx || 0,
 prompt: "Two transistor switches `A` and `B` are wired in **SERIES** between `+V` and an output lamp (with pull-down to `0V`). When `A = " + r.a + "` and `B = " + r.b + "`, what is the output?",
 options: rotateOptions([
 { text: "`" + r.out + "`, because series switches implement `A AND B` (`1` iff BOTH switches are closed).", isCorrect: true, whyWrong: "" },
 { text: "`" + (1 - r.out) + "`, treating a single closed switch or open pair as conducting.", isCorrect: false, whyWrong: "In a SERIES chain, ANY single `0` (open switch) breaks the entire path, so only `A=1, B=1` yields `1`!" },
 { text: "Series switches implement `XOR`, so `A=1, B=1` turns the lamp OFF.", isCorrect: false, whyWrong: "When both series switches `A=1` and `B=1` close, there is a straight closed wire from `+V` to Output (`1`), which is `AND`, not `XOR`." },
 { text: "Output floats randomly regardless of `A` and `B`.", isCorrect: false, whyWrong: "With the pull-down resistor present, Output is deterministically `1` when both conduct and `0` otherwise." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c6",
 title: "Parallel Switches & the OR Gate",
 zeroTeach: "Two switches wired in PARALLEL form an inclusive OR gate: current reaches Output if Switch A is closed (1), OR Switch B is closed (1), OR BOTH are closed (1). Output is 0 ONLY when both A=0 and B=0.",
 concreteExample: "A car dome light wired with two door switches in parallel turns ON if the left door opens, right door opens, or both open: 0|0=0, 0|1=1, 1|0=1, 1|1=1.",
 reteachCheck: { instruction: "Type the inclusive OR edge case (both 1):", target: "1 || 1 === 1" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var rows = [
 { a: 1, b: 1, out: 1 },
 { a: 0, b: 1, out: 1 },
 { a: 0, b: 0, out: 0 },
 { a: 1, b: 0, out: 1 }
 ];
 var r = rows[Math.abs(variantIdx || 0) % rows.length];
 var lock = adaptLockIn(r.a + " || " + r.b + " === " + r.out, "Type the parallel-switch OR expression:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c6",
 conceptTitle: "Parallel Switches & the OR Gate",
 variantIdx: variantIdx || 0,
 prompt: "Switches `A` and `B` are wired in **PARALLEL** between `+V` and Output (with pull-down to `0V`). If `A = " + r.a + "` and `B = " + r.b + "`, what is the logical output?",
 options: rotateOptions([
 { text: "`" + r.out + "` - parallel paths implement inclusive `OR` (`0` only when BOTH branches are open).", isCorrect: true, whyWrong: "" },
 { text: "`" + (1 - r.out) + "` - confusing parallel `OR` with `XOR` or `NOR`.", isCorrect: false, whyWrong: "Check both branches: if at least one parallel switch is `1`, current reaches Output (`1`); if both are `0`, neither conducts (`0`)." },
 { text: "Closing both `A=1` and `B=1` cancels the two currents to `0`.", isCorrect: false, whyWrong: "Two parallel closed paths from `+V` simply tie Output even more strongly to `+V` (`1 || 1 === 1`)!" },
 { text: "Parallel switches require `A` and `B` to alternate every clock tick.", isCorrect: false, whyWrong: "Combinational `OR` evaluates instantaneously from steady inputs `A` and `B`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c7",
 title: "NAND Gate & Universal Functional Completeness",
 zeroTeach: "NAND(A, B) = !(A && B): it outputs 0 ONLY when A=1 AND B=1, and outputs 1 for (0,0), (0,1), and (1,0). Any Boolean circuit - NOT, AND, OR, XOR, Adders, RAM, an entire CPU - can be built out of 2-input NAND gates alone!",
 concreteExample: "Tie both inputs together: NAND(A, A) = !(A && A) = !A (an inverter!). Then AND(A, B) = NAND(NAND(A, B), NAND(A, B)).",
 reteachCheck: { instruction: "Type how NAND builds NOT:", target: "NAND(A, A) === !A" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var mode = Math.abs(variantIdx || 0) % 3;
 if (mode === 0) {
 var lock0 = adaptLockIn("!(1 && 1) === 0", "Type the unique 0-output case of NAND:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c7",
 conceptTitle: "NAND Gate & Universal Functional Completeness",
 variantIdx: variantIdx || 0,
 prompt: "Why is the 2-input `NAND` gate celebrated in computer engineering as a **universal gate**?",
 options: rotateOptions([
 { text: "Every other Boolean gate (`NOT`, `AND`, `OR`, `XOR`) and even a complete CPU can be constructed exclusively from `NAND` gates.", isCorrect: true, whyWrong: "" },
 { text: "It outputs `1` for all four input pairs `(0,0), (0,1), (1,0), (1,1)`.", isCorrect: false, whyWrong: "A gate that always outputs `1` ignores its inputs and cannot compute anything! `NAND(1, 1)` outputs `0`." },
 { text: "`NAND` is the only gate that works without transistors.", isCorrect: false, whyWrong: "In CMOS, a 2-input `NAND` actually uses 4 transistors (fewer than CMOS `AND`, which is `NAND` + 2-transistor `NOT` = 6 transistors!)." },
 { text: "`NAND` converts binary numbers directly into English words.", isCorrect: false, whyWrong: "`NAND` is a 1-bit Boolean primitive `!(A && B)`." }
 ], variantIdx || 0),
 lockInInstruction: lock0.instruction,
 lockInTarget: lock0.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 var pairs = [{ a: 1, b: 1, out: 0 }, { a: 1, b: 0, out: 1 }, { a: 0, b: 0, out: 1 }];
 var p = pairs[mode % pairs.length];
 var lock = adaptLockIn("!(" + p.a + " && " + p.b + ") === " + p.out, "Type the NAND evaluation expression:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c7",
 conceptTitle: "NAND Gate & Universal Functional Completeness",
 variantIdx: variantIdx || 0,
 prompt: "Evaluate `NAND(" + p.a + ", " + p.b + ")`, and identify what happens if you feed that output into `NAND(out, out)`:",
 options: rotateOptions([
 { text: "`NAND(" + p.a + ", " + p.b + ") = " + p.out + "`, and `NAND(out, out)` inverts it to `" + (1 - p.out) + "` (implementing `AND`).", isCorrect: true, whyWrong: "" },
 { text: "`NAND(" + p.a + ", " + p.b + ") = " + (1 - p.out) + "`, identical to `AND`.", isCorrect: false, whyWrong: "`NAND` is `!(A && B)` - the exact inverse of `AND`. Since `" + p.a + " && " + p.b + " = " + (1 - p.out) + "`, `NAND` outputs `" + p.out + "`." },
 { text: "`NAND(out, out)` always outputs `1` regardless of `out`.", isCorrect: false, whyWrong: "When `out = 1`, `NAND(1, 1) = 0`; when `out = 0`, `NAND(0, 0) = 1` - so `NAND(x, x)` is a `NOT` inverter!" },
 { text: "`NAND(0, 0)` equals `0` because both inputs are zero.", isCorrect: false, whyWrong: "`0 && 0` is `0`, and `NOT(0)` is `1` - so `NAND(0, 0) = 1`!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c8",
 title: "XOR (Exclusive OR) Difference & Parity Gate",
 zeroTeach: "XOR(A, B) outputs 1 when A and B are DIFFERENT (0^1=1, 1^0=1) and 0 when A and B are EQUAL (0^0=0, 1^1=0). That makes XOR simultaneously a bit-difference comparator, a controllable bit-flipper (A ^ 1 = !A, A ^ 0 = A), and mod-2 addition!",
 concreteExample: "1 XOR 1 = 0 (matching the ones column of 1 + 1 = 10 in binary!).",
 reteachCheck: { instruction: "Type the 4 XOR outcomes:", target: "0^0=0, 0^1=1, 1^0=1, 1^1=0" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cases = [
 { a: "1010", b: "1100", res: "0110" },
 { a: "1101", b: "0101", res: "1000" },
 { a: "0111", b: "1111", res: "1000" },
 { a: "1001", b: "0110", res: "1111" }
 ];
 var c = cases[Math.abs(variantIdx || 0) % cases.length];
 var orWrong = "";
 var andWrong = "";
 for (var i = 0; i < 4; i++) {
 orWrong += (c.a[i] === "1" || c.b[i] === "1") ? "1" : "0";
 andWrong += (c.a[i] === "1" && c.b[i] === "1") ? "1" : "0";
 }
 if (orWrong === c.res) { orWrong = "0000"; }
 if (andWrong === c.res) { andWrong = "1111"; }
 var lock = adaptLockIn(c.a + " ^ " + c.b + " = " + c.res, "Type the 4-bit bitwise XOR trace:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c8",
 conceptTitle: "XOR (Exclusive OR) Difference & Parity Gate",
 variantIdx: variantIdx || 0,
 prompt: "Apply bitwise `XOR` (`^`) column-by-column to the 4-bit nibbles `" + c.a + "` and `" + c.b + "`. What 4-bit output is produced?",
 options: rotateOptions([
 { text: "`" + c.res + "` (`1` in every bit position where the two inputs differ, `0` where they match)", isCorrect: true, whyWrong: "" },
 { text: "`" + orWrong + "` (outputting `1` even when both bits are `1`)", isCorrect: false, whyWrong: "You applied inclusive `OR` (`1 | 1 = 1`). In `XOR`, `1 ^ 1 = 0` because equal bits cancel!" },
 { text: "`" + andWrong + "` (outputting `1` only when both bits are `1`)", isCorrect: false, whyWrong: "You applied `AND` (`&`) instead of `XOR` (`^`)." },
 { text: "`" + c.res.split("").reverse().join("") + "` (reading columns reversed or misaligning bit positions)", isCorrect: false, whyWrong: "Compare each aligned column left-to-right: `" + c.a + " ^ " + c.b + " = " + c.res + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c9",
 title: "Compound Boolean Expressions & De Morgan's Laws",
 zeroTeach: "De Morgan's Laws show how negation distributes across AND/OR by flipping the operator: !(A && B) === (!A || !B), and !(A || B) === (!A && !B). Never distribute '!' without flipping && <-> ||!",
 concreteExample: "'NOT (loggedIn AND isAdmin)' is true whenever (!loggedIn OR !isAdmin).",
 reteachCheck: { instruction: "Type De Morgan's first law:", target: "!(A && B) === (!A || !B)" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var v = Math.abs(variantIdx || 0) % 2;
 if (v === 0) {
 var lock0 = adaptLockIn("!(A && B) === (!A || !B)", "Type De Morgan's AND-negation equivalence:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c9",
 conceptTitle: "Compound Boolean Expressions & De Morgan's Laws",
 variantIdx: variantIdx || 0,
 prompt: "By De Morgan's Law, which gate expression is 100% logically equivalent to `!(A && B)` for all four input combinations?",
 options: rotateOptions([
 { text: "`!A || !B`", isCorrect: true, whyWrong: "" },
 { text: "`!A && !B`", isCorrect: false, whyWrong: "Classic trap! Test `A=1, B=0`: `!(1 && 0) = !0 = 1`, whereas `!1 && !0 = 0 && 1 = 0`. Negating `&&` MUST flip the operator to `||`!" },
 { text: "`A || B`", isCorrect: false, whyWrong: "Test `A=0, B=0`: `!(0 && 0) = 1`, whereas `0 || 0 = 0`." },
 { text: "`A ^ B`", isCorrect: false, whyWrong: "Test `A=0, B=0`: `!(0 && 0) = 1`, whereas `0 ^ 0 = 0`." }
 ], variantIdx || 0),
 lockInInstruction: lock0.instruction,
 lockInTarget: lock0.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 var lock1 = adaptLockIn("!(A || B) === (!A && !B)", "Type De Morgan's OR-negation equivalence:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c9",
 conceptTitle: "Compound Boolean Expressions & De Morgan's Laws",
 variantIdx: variantIdx || 0,
 prompt: "A safety shutdown triggers whenever `!(sensorOk || manualOverride)` is `1`. Which refactored condition is identically true in every case?",
 options: rotateOptions([
 { text: "`!sensorOk && !manualOverride` (BOTH must be false for `OR` to be false)", isCorrect: true, whyWrong: "" },
 { text: "`!sensorOk || !manualOverride`", isCorrect: false, whyWrong: "If `sensorOk = 1` and `manualOverride = 0`, `!(1 || 0)` is `0` (safe), whereas `!1 || !0` gives `1` (false shutdown!). Flip `||` to `&&` when pushing `!` inside." },
 { text: "`sensorOk && manualOverride`", isCorrect: false, whyWrong: "That triggers only when BOTH are true - the opposite direction." },
 { text: "`!sensorOk ^ !manualOverride`", isCorrect: false, whyWrong: "When both are `0`, `!(0 || 0) = 1`, whereas `!0 ^ !0 = 1 ^ 1 = 0`." }
 ], variantIdx || 0),
 lockInInstruction: lock1.instruction,
 lockInTarget: lock1.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m1_c10",
 title: "Bitwise Masking (`&` Clear/Extract, `|` Set, `^` Toggle)",
 zeroTeach: "Hardware drivers manipulate individual control bits inside a register using masks: `x & 0` forces 0 (clears/isolates), `x | 1` forces 1 (sets), and `x ^ 1` flips `x` (toggles)!",
 concreteExample: "To isolate the lowest 4 bits of byte x, compute `x & 0b00001111` (`x & 0x0F`).",
 reteachCheck: { instruction: "Type the 3 bitwise mask identities:", target: "x&0=0, x|1=1, x^1=!x" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var inputs = ["11010110", "10111010", "11100101"];
 var inp = inputs[Math.abs(variantIdx || 0) % inputs.length];
 var low4 = "0000" + inp.slice(4);
 var highSet = "1111" + inp.slice(4);
 var lock = adaptLockIn(inp + " & 00001111 = " + low4, "Type the bitwise AND mask extraction:", weakKeys, stageNum);
 return {
 conceptId: "s2m1_c10",
 conceptTitle: "Bitwise Masking (& Extract, | Set, ^ Toggle)",
 variantIdx: variantIdx || 0,
 prompt: "You want to extract ONLY the lower 4 bits of register `" + inp + "` while zeroing out the upper 4 bits. What does `" + inp + " & 00001111` produce?",
 options: rotateOptions([
 { text: "`" + low4 + "` (because `bit & 0 = 0` clears upper bits and `bit & 1 = bit` preserves lower bits)", isCorrect: true, whyWrong: "" },
 { text: "`" + highSet + "`", isCorrect: false, whyWrong: "`" + highSet + "` comes from ORing with `11110000`. ANDing with `0` always produces `0`." },
 { text: "`00001111`", isCorrect: false, whyWrong: "`bit & 1` preserves the original `bit` (`0 & 1 = 0`, `1 & 1 = 1`), rather than forcing all four lower bits to `1`." },
 { text: "`11111111`", isCorrect: false, whyWrong: "`AND` never turns `0`s into `1`s." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 }
 ]
 },
 {
 id: "s2m2",
 stageId: "stage2",
 stageNumber: 2,
 code: "2.2",
 title: "How Electricity Adds Numbers & Stores 1 Bit of Memory",
 subtitle: "Half-Adders, Full-Adders, Ripple-Carry Adders, and feedback loops (SR Latch, Gated D-Latch, Edge-Triggered Flip-Flop).",
 estimatedMinutes: 24,
 simulatorType: "adder-latch",
 lessonSections: [
 {
 heading: "1. How Pure Switches Perform Arithmetic: The Half-Adder",
 body: [
 "Look at all four cases of adding two 1-bit binary numbers A + B:\n• 0 + 0 = 00 (Carry = 0, Sum = 0)\n• 0 + 1 = 01 (Carry = 0, Sum = 1)\n• 1 + 0 = 01 (Carry = 0, Sum = 1)\n• 1 + 1 = 10 (Carry = 1, Sum = 0 - two in binary is written '10'!)",
 "Compare the `Sum` column (`0, 1, 1, 0`) and `Carry` column (`0, 0, 0, 1`) against our Stage 2.1 truth tables! `Sum` is literally `A XOR B`, and `Carry` is literally `A AND B`! Wiring one XOR gate and one AND gate in parallel across inputs `A` and `B` creates a **Half-Adder**: lifeless silicon switches adding numbers at gigahertz speed!"
 ],
 diagram:
"Half-Adder Circuit (Adds two 1-bit inputs A + B):\n" +
" A ----+----->[ XOR ]-----> SUM = A ^ B\n" +
" | +->[ ]\n" +
" B ----+---+->[ AND ]-----> CARRY = A & B",
 takeaway: "Half-Adder equations: SUM = A XOR B, CARRY = A AND B."
 },
 {
 heading: "2. Chaining Columns: Full-Adder & Multi-Bit Ripple-Carry Addition",
 body: [
 "Why is it called only a 'Half'-Adder? Because when you add multi-bit numbers like `011 + 001`, Column 0 (`1+1`) generates a `Carry_Out = 1` that MUST feed into Column 1 as a THIRD input (`Carry_In` / `Cin`)! A Half-Adder only has 2 input wires (`A, B`).",
 "A **Full-Adder** takes THREE 1-bit inputs (`A`, `B`, `Cin`) whose sum ranges from `0` (`00`) to `3` (`11`):\n• `SUM = (A XOR B) XOR Cin` (`1` whenever an odd number - 1 or 3 - of the inputs are `1`)\n• `Cout = (A AND B) OR (Cin AND (A XOR B))` (`1` whenever AT LEAST TWO of `{A, B, Cin}` are `1`!).\nDaisy-chaining 64 Full-Adders (`Cout` of bit `k` wired to `Cin` of bit `k+1`) builds a 64-bit hardware adder!"
 ],
 diagram:
"Full-Adder Truth Table (A + B + Cin -> Cout, SUM):\n" +
" A B Cin | Decimal Sum | Cout SUM\n" +
" 0 0 0 | 0 | 0 0\n" +
" 0 1 1 | 2 | 1 0 <-- two 1s -> binary '10'\n" +
" 1 1 0 | 2 | 1 0 <-- two 1s -> binary '10'\n" +
" 1 1 1 | 3 | 1 1 <-- three 1s -> binary '11'",
 takeaway: "Full-Adder outputs binary 00 (0), 01 (1), 10 (2), or 11 (3) by counting how many of {A, B, Cin} equal 1."
 },
 {
 heading: "3. How Electricity Remembers: Latches & Edge-Triggered Flip-Flops",
 body: [
 "Adders are **combinational circuits**: the instant inputs disappear (`A=0, B=0`), the output forgets everything and drops to `0`. How can electricity REMEMBER `1` bit after your finger leaves the key? By wiring two inverting gates (`NOR` or `NAND`) in a **cross-coupled feedback loop** where Gate 1's output feeds Gate 2's input and Gate 2's output feeds Gate 1's input!",
 "• **SR Latch**: Pulse `Set = 1` and output `Q` flips to `1` and locks itself there even after `Set` returns to `0`! Pulse `Reset = 1` and `Q` clears to `0` (`S=1, R=1` is forbidden).\n• **Gated D-Latch**: Adds a single `Data (D)` wire + `Write Enable (WE)`. When `WE = 1`, `Q` mirrors `D` transparently; when `WE = 0`, the gate locks shut and `Q` remembers the last stored bit!\n• **Edge-Triggered D Flip-Flop**: Pairs master-slave latches so `Q` updates ONLY at the razor-thin instant the System Clock rises from `0 -> 1` (`↑` rising edge), letting billions of registers step in lockstep without values racing through multiple stages in one cycle!"
 ],
 diagram:
"Gated D-Latch vs. Rising-Edge D Flip-Flop:\n" +
" D-Latch : WE=1 -> Q follows D live | WE=0 -> Q holds stored bit\n" +
" Flip-Flop : Samples D ONLY at Clock 0->1 rising edge (|/); holds rest of cycle!\n" +
" 8 Flip-Flops side-by-side sharing 1 Clock wire = 8-Bit CPU Register!",
 takeaway: "Combinational gates compute; cross-coupled feedback latches remember; clock-edge flip-flops synchronize the CPU."
 }
 ],
 concepts: [
 scenarioBankConcept({
 id: "s2m2_c1",
 title: "1-Bit Binary Addition Carry Rule (1 + 1 = 10)",
 zeroTeach: "In Base-2, the largest single digit is 1. Adding 1 + 1 equals two, which in binary is 1*(2^1) + 0*(2^0) = '10' (Sum bit = 0, Carry bit = 1). And 1 + 1 + 1 = three = '11' (Sum bit = 1, Carry bit = 1).",
 concreteExample: "Just like 9 + 1 = 10 in Base-10 resets ones to 0 and carries 1, 1 + 1 = 10 in Base-2 resets ones to 0 and carries 1 to the twos column.",
 reteachCheck: { instruction: "Type both binary carry identities:", target: "1+1=10, 1+1+1=11" }
 }, [
 {
 prompt: "In binary arithmetic, what is `1 + 1`, and how does that break down into `(Carry, Sum)` bits?",
 options: [
 { text: "Binary `10` - `Carry = 1` (into the twos column) and `Sum = 0` (in the ones column).", isCorrect: true, whyWrong: "" },
 { text: "Binary `11` - `Carry = 1` and `Sum = 1`.", isCorrect: false, whyWrong: "Binary `11` equals `2 + 1 = 3` (`1 + 1 + 1`), whereas `1 + 1 = 2`, which is `10` in binary!" },
 { text: "Binary `2` - `Carry = 0` and `Sum = 2`.", isCorrect: false, whyWrong: "The symbol `'2'` does not exist in Base-2 (only `0` and `1`)." },
 { text: "Binary `01` - `Carry = 0` and `Sum = 1`.", isCorrect: false, whyWrong: "That is inclusive Boolean `OR` (`1 || 1 = 1`), not arithmetic addition (`1 + 1 = 2 = 0b10`)!" }
 ],
 lockInInstruction: "Type the binary addition equation:",
 lockInTarget: "0b1 + 0b1 = 0b10 (carry=1, sum=0)"
 },
 {
 prompt: "When adding three 1-bit values `1 + 1 + 1` inside a column with an incoming carry, what binary two-bit result `(Carry, Sum)` is produced?",
 options: [
 { text: "Binary `11` (`Carry = 1` worth 2, plus `Sum = 1` worth 1 = 3).", isCorrect: true, whyWrong: "" },
 { text: "Binary `10` (`Carry = 1, Sum = 0`).", isCorrect: false, whyWrong: "`10` in binary is 2 (`1 + 1 + 0`), missing the third `1`." },
 { text: "Binary `100` (requiring 3 output wires).", isCorrect: false, whyWrong: "`100` in binary is 4; the maximum sum of three 1-bit inputs is `1+1+1 = 3 = 11`, which fits cleanly on 2 output wires!" },
 { text: "Binary `00` due to carry cancellation.", isCorrect: false, whyWrong: "`3` in binary is `11` (`Carry=1, Sum=1`)." }
 ],
 lockInInstruction: "Type the three-ones addition equation:",
 lockInTarget: "1 + 1 + 1 = 0b11 (carry=1, sum=1)"
 }
 ]),
 {
 id: "s2m2_c2",
 title: "Half-Adder Gate Construction (`XOR` + `AND`)",
 zeroTeach: "A Half-Adder takes two 1-bit inputs A and B and computes SUM = A XOR B and CARRY = A AND B using exactly two logic gates.",
 concreteExample: "For A=1, B=1: SUM = 1 XOR 1 = 0, CARRY = 1 AND 1 = 1 -> binary '10' (2).",
 reteachCheck: { instruction: "Type the two Half-Adder equations:", target: "SUM = A ^ B; CARRY = A & B" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var inputs = [
 { a: 1, b: 1 },
 { a: 1, b: 0 },
 { a: 0, b: 1 }
 ];
 var inp = inputs[Math.abs(variantIdx || 0) % inputs.length];
 var sum = inp.a ^ inp.b;
 var carry = inp.a & inp.b;
 var lock = adaptLockIn("SUM=" + sum + ", CARRY=" + carry, "Type the Half-Adder outputs for A=" + inp.a + ", B=" + inp.b + ":", weakKeys, stageNum);
 return {
 conceptId: "s2m2_c2",
 conceptTitle: "Half-Adder Gate Construction (XOR + AND)",
 variantIdx: variantIdx || 0,
 prompt: "Which two logic gates form a **Half-Adder**, and what `(SUM, CARRY)` outputs do they produce when `A = " + inp.a + "` and `B = " + inp.b + "`?",
 options: rotateOptions([
 { text: "`SUM = A XOR B = " + sum + "` and `CARRY = A AND B = " + carry + "`", isCorrect: true, whyWrong: "" },
 { text: "`SUM = A OR B = " + (inp.a | inp.b) + "` and `CARRY = A XOR B = " + sum + "`", isCorrect: false, whyWrong: "Using `OR` for `SUM` breaks on `1 + 1` (`1 OR 1 = 1` instead of `0`), and `XOR` for `CARRY` wrongly carries on `1 + 0`!" },
 { text: "`SUM = A AND B = " + carry + "` and `CARRY = A XOR B = " + sum + "`", isCorrect: false, whyWrong: "You swapped the `SUM` and `CARRY` wires! `SUM` needs `XOR`, while `CARRY` needs `AND`." },
 { text: "`SUM = !(A && B)` and `CARRY = !A`", isCorrect: false, whyWrong: "Those gates do not compute binary addition `A + B`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s2m2_c3",
 title: "Why Multi-Bit Addition Requires Full-Adders",
 zeroTeach: "Column 0 (the rightmost 1s bit) has no previous column, so a 2-input Half-Adder works there. Every higher column k >= 1 MUST sum THREE bits: A_k + B_k + CarryIn_k (from column k-1), requiring a 3-input Full-Adder!",
 concreteExample: "Adding 01 + 01: Column 0 produces CarryOut=1. Column 1 has A1=0, B1=0, plus CarryIn=1 -> output must be 1 ('10' = 2). A Half-Adder ignoring CarryIn would output 00!",
 reteachCheck: { instruction: "Type the 3 inputs of a Full-Adder:", target: "Full-Adder inputs: A, B, Cin" }
 }, [
 {
 prompt: "Why can't you chain 2-input Half-Adders alone to add two 8-bit binary numbers?",
 options: [
 { text: "Bit positions 1 through 7 must add THREE bits (`A_i`, `B_i`, plus `Carry_In` from bit `i-1`), and a Half-Adder has no `Carry_In` input terminal.", isCorrect: true, whyWrong: "" },
 { text: "Half-Adders only work on odd numbers.", isCorrect: false, whyWrong: "A Half-Adder handles all four 1-bit pairs (`0+0, 0+1, 1+0, 1+1`); it simply lacks a third `Carry_In` input." },
 { text: "XOR gates stop working above 4 bits.", isCorrect: false, whyWrong: "Full-Adders are themselves built right out of two Half-Adders (`XOR` + `AND`) plus one `OR` gate!" },
 { text: "8-bit addition never produces carries between columns.", isCorrect: false, whyWrong: "Carries propagate across columns constantly (e.g., `00001111 + 00000001 = 00010000`)." }
 ],
 lockInInstruction: "Type how two Half-Adders build one Full-Adder:",
 lockInTarget: "FullAdder(A, B, Cin) -> (SUM, Cout)"
 },
 {
 prompt: "How can you construct one **Full-Adder** out of simpler modular building blocks?",
 options: [
 { text: "Chain two Half-Adders (`HA1` adds `A + B`; `HA2` adds `HA1.Sum + Cin`) and combine their two carry outputs with one `OR` gate.", isCorrect: true, whyWrong: "" },
 { text: "Wire eight NOT gates in a circle.", isCorrect: false, whyWrong: "A ring of inverters is an oscillator/latch, not an arithmetic adder." },
 { text: "Connect `A`, `B`, and `Cin` straight together onto one copper wire.", isCorrect: false, whyWrong: "Shorting `1` and `0` outputs together causes electrical contention instead of adding." },
 { text: "Replace `XOR` with a pull-down resistor.", isCorrect: false, whyWrong: "Parity `SUM` across three bits requires `A ^ B ^ Cin`." }
 ],
 lockInInstruction: "Type the Full-Adder carry-merge equation:",
 lockInTarget: "Cout = (A & B) | (Cin & (A ^ B))"
 }
 ]),
 {
 id: "s2m2_c4",
 title: "Full-Adder Truth-Table Trace (`A, B, Cin`)",
 zeroTeach: "Count how many 1s appear among (A, B, Cin): 0 ones -> Cout=0, SUM=0; 1 one -> Cout=0, SUM=1; 2 ones -> Cout=1, SUM=0 (binary 10); 3 ones -> Cout=1, SUM=1 (binary 11).",
 concreteExample: "If A=1, B=0, Cin=1, there are TWO 1s (total = 2 = 0b10), so Cout=1 and SUM=0!",
 reteachCheck: { instruction: "Type the output for A=1, B=0, Cin=1:", target: "1+0+1 = 0b10 -> Cout=1, SUM=0" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var triples = [
 { a: 1, b: 0, cin: 1 },
 { a: 1, b: 1, cin: 1 },
 { a: 0, b: 1, cin: 1 },
 { a: 1, b: 1, cin: 0 },
 { a: 0, b: 0, cin: 1 }
 ];
 var t = triples[Math.abs(variantIdx || 0) % triples.length];
 var total = t.a + t.b + t.cin;
 var sum = total % 2;
 var cout = total >= 2 ? 1 : 0;
 var lock = adaptLockIn("Cout=" + cout + ", SUM=" + sum, "Type the Full-Adder Cout and SUM outputs:", weakKeys, stageNum);
 return {
 conceptId: "s2m2_c4",
 conceptTitle: "Full-Adder Truth-Table Trace (A, B, Cin)",
 variantIdx: variantIdx || 0,
 prompt: "A Full-Adder receives `A = " + t.a + "`, `B = " + t.b + "`, and `Cin = " + t.cin + "`. What `(Cout, SUM)` bits appear on its output wires?",
 options: rotateOptions([
 { text: "`Cout = " + cout + ", SUM = " + sum + "` (since `" + t.a + " + " + t.b + " + " + t.cin + " = " + total + "` = binary `" + cout + "" + sum + "`)", isCorrect: true, whyWrong: "" },
 { text: "`Cout = " + sum + ", SUM = " + cout + "`" + (sum === cout ? " with inverted polarity `0, 0`" : " (swapping Cout and SUM)"), isCorrect: false, whyWrong: sum === cout ? "Check the count of 1-bits: `" + total + "` in 2-bit binary is `" + cout + "" + sum + "`." : "You swapped `Cout` (twos column) and `SUM` (ones column)!" },
 { text: "`Cout = " + (1 - cout) + ", SUM = " + sum + "`", isCorrect: false, whyWrong: "`Cout` is `1` whenever at least TWO of `{A, B, Cin}` equal `1`. Here the sum is `" + total + "`, so `Cout = " + cout + "`." },
 { text: "`Cout = " + cout + ", SUM = " + (1 - sum) + "`", isCorrect: false, whyWrong: "`SUM = A ^ B ^ Cin` is `1` when an ODD number of inputs are `1`. Here `" + total + "` inputs are `1`, so `SUM = " + sum + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s2m2_c5",
 title: "4-Bit Ripple-Carry Binary Addition & Overflow",
 zeroTeach: "A 4-bit Ripple-Carry Adder chains 4 Full-Adders from bit 0 (rightmost LSB) to bit 3 (leftmost MSB). If the final carry Cout_3 leaves bit 3 on an unsigned 4-bit sum (> 15), the Carry/Overflow flag alerts the CPU!",
 concreteExample: "0101 (5) + 0011 (3): bit0: 1+1=10 (s0=0,c1=1); bit1: 0+1+1=10 (s1=0,c2=1); bit2: 1+0+1=10 (s2=0,c3=1); bit3: 0+0+1=01 (s3=1,c4=0) -> 1000 (8)!",
 reteachCheck: { instruction: "Type the 4-bit binary addition of 5 + 3:", target: "0101 + 0011 = 1000" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var pairs = [
 { x: 5, y: 3 },
 { x: 6, y: 5 },
 { x: 9, y: 4 },
 { x: 7, y: 6 },
 { x: 10, y: 5 }
 ];
 var p = pairs[Math.abs(variantIdx || 0) % pairs.length];
 var bx = toBin(p.x, 4);
 var by = toBin(p.y, 4);
 var bsum = toBin(p.x + p.y, 4);
 var noCarry = "";
 for (var i = 0; i < 4; i++) {
 noCarry += (bx[i] !== by[i]) ? "1" : "0";
 }
 if (noCarry === bsum) {
 noCarry = toBin((p.x + p.y - 2) & 15, 4);
 }
 var lock = adaptLockIn(bx + " + " + by + " = " + bsum, "Type the 4-bit ripple-carry sum:", weakKeys, stageNum);
 return {
 conceptId: "s2m2_c5",
 conceptTitle: "4-Bit Ripple-Carry Binary Addition",
 variantIdx: variantIdx || 0,
 prompt: "Trace a 4-bit Ripple-Carry Adder computing `" + bx + " + " + by + "` (`" + p.x + " + " + p.y + "`) from rightmost bit to leftmost bit. What 4-bit sum is produced?",
 options: rotateOptions([
 { text: "`" + bsum + "` (decimal `" + (p.x + p.y) + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + noCarry + "` (XORing columns without propagating carries leftward)", isCorrect: false, whyWrong: "You computed bitwise `XOR` without passing `Cout` into the next column's `Cin`!" },
 { text: "`" + toBin((p.x + p.y + 1) & 15, 4) + "` (extra phantom carry in bit 0)", isCorrect: false, whyWrong: "The initial `Cin` into bit 0 of `ADD` is `0`, giving `" + bsum + "` (`" + (p.x + p.y) + "`)." },
 { text: "`" + bsum.split("").reverse().join("") + "`" + (bsum === bsum.split("").reverse().join("") ? " with overflow `1`" : " (carries rippled left-to-right instead of right-to-left)"), isCorrect: false, whyWrong: "Addition always starts at the rightmost LSB (`2^0`) and ripples carries LEFTWARD toward MSB (`2^3`)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s2m2_c6",
 title: "Combinational vs. Sequential Logic (Feedback Loops)",
 zeroTeach: "Combinational circuits (AND, XOR, Full-Adder) have NO feedback loops: their outputs depend solely on PRESENT inputs. Sequential circuits (Latches, Flip-Flops, Registers) route outputs back into inputs via feedback loops so outputs depend on BOTH present inputs AND stored past state!",
 concreteExample: "An Adder forgets as soon as inputs drop to 0; a Latch keeps outputting Q=1 hours after the Set pulse ended (as long as power stays on).",
 reteachCheck: { instruction: "Type what gives sequential circuits memory:", target: "feedback loop stores past state" }
 }, [
 {
 prompt: "What structural difference allows a sequential circuit (like a Latch) to remember 1 bit while a combinational circuit (like an Adder) forgets immediately?",
 options: [
 { text: "Cross-coupled feedback wires feed gate outputs back into gate inputs, creating two stable self-reinforcing voltage states (`0` and `1`).", isCorrect: true, whyWrong: "" },
 { text: "Sequential circuits use thicker copper wires so electrons move slowly and get trapped.", isCorrect: false, whyWrong: "Wire thickness only lowers resistance; bistable feedback between active gates is what holds state!" },
 { text: "Combinational circuits run on AC while sequential circuits run on DC.", isCorrect: false, whyWrong: "Both share the exact same DC chip supply rails (`VDD` and `GND`)." },
 { text: "Latches punch physical microscopic holes into silicon on every clock cycle.", isCorrect: false, whyWrong: "Silicon registers never physically puncture crystal; they hold bistable gate voltages." }
 ],
 lockInInstruction: "Type the combinational vs sequential distinction:",
 lockInTarget: "combinational = f(inputs); sequential = f(inputs, state)"
 },
 {
 prompt: "Which of the following hardware blocks is purely **combinational** (stateless) rather than **sequential** (state-holding)?",
 options: [
 { text: "An 8-bit Ripple-Carry Adder (`SUM = A + B`).", isCorrect: true, whyWrong: "" },
 { text: "The CPU Program Counter (`PC`) register.", isCorrect: false, whyWrong: "The `PC` register holds the current instruction address across clock ticks using flip-flops (sequential!)." },
 { text: "A 1-bit D Flip-Flop.", isCorrect: false, whyWrong: "A D Flip-Flop stores 1 bit across clock edges (sequential!)." },
 { text: "An SRAM cache cell.", isCorrect: false, whyWrong: "SRAM uses 6 transistors in a cross-coupled bistable latch to store 1 bit (sequential!)." }
 ],
 lockInInstruction: "Type the two circuit classes:",
 lockInTarget: "Adder = combinational; Flip-Flop = sequential"
 }
 ]),
 scenarioBankConcept({
 id: "s2m2_c7",
 title: "Cross-Coupled SR Latch Behavior",
 zeroTeach: "An active-high SR Latch (two cross-coupled NOR gates) has three valid commands: Set (S=1, R=0 -> Q becomes 1), Reset (S=0, R=1 -> Q becomes 0), and Hold Memory (S=0, R=0 -> Q keeps whatever bit was stored previously!). S=1, R=1 is forbidden because it tries to set and clear simultaneously.",
 concreteExample: "Pulse S=1, R=0 -> Q=1. Return to S=0, R=0 -> Q stays 1! Pulse S=0, R=1 -> Q=0. Return to S=0, R=0 -> Q stays 0!",
 reteachCheck: { instruction: "Type the SR Latch hold input:", target: "S=0, R=0 holds stored Q" }
 }, [
 {
 prompt: "In an active-high `SR` Latch, suppose `S = 1, R = 0` sets output `Q = 1`, and then `S` returns to `0` (`S = 0, R = 0`). What is `Q` now?",
 options: [
 { text: "`Q = 1` - `(S=0, R=0)` is the **Hold** state where the cross-coupled feedback loop preserves the stored `1`!", isCorrect: true, whyWrong: "" },
 { text: "`Q = 0` - because both inputs are now `0`.", isCorrect: false, whyWrong: "If `Q` dropped to `0` when `S` returned to `0`, it would just be an `OR` gate with zero memory! Cross-coupled feedback keeps `Q = 1` latched until `R = 1` arrives." },
 { text: "`Q` oscillates between `0` and `1` at gigahertz speed.", isCorrect: false, whyWrong: "Metastable/race hazards occur only when releasing the forbidden `(S=1, R=1)` state simultaneously, not during normal `(0, 0)` hold." },
 { text: "`Q` becomes `2`.", isCorrect: false, whyWrong: "Digital wires only represent binary `0` or `1`." }
 ],
 lockInInstruction: "Type the three valid SR modes:",
 lockInTarget: "1,0=Set; 0,1=Reset; 0,0=Hold"
 },
 {
 prompt: "Why is driving `S = 1` and `R = 1` at the same time forbidden in a standard `SR` NOR Latch, motivating engineers to invent the `D`-Latch?",
 options: [
 { text: "It asserts 'Set to 1' and 'Reset to 0' simultaneously, forcing both `Q` and `!Q` to `0` and causing an unpredictable race if both inputs drop to `0` together.", isCorrect: true, whyWrong: "" },
 { text: "NOR gates cannot accept logic `1` on any input.", isCorrect: false, whyWrong: "NOR gates accept `1` cleanly (`1 NOR 0 = 0`); the conflict is asserting BOTH Set and Reset together." },
 { text: "It doubles the battery voltage to 10V.", isCorrect: false, whyWrong: "Logic gates never boost voltage above the supply rail." },
 { text: "It permanently erases the BIOS ROM.", isCorrect: false, whyWrong: "An SR latch is volatile working state, not permanent ROM." }
 ],
 lockInInstruction: "Type how D-Latch prevents S=R=1:",
 lockInTarget: "D-Latch feeds S = D and R = !D when enabled"
 }
 ]),
 {
 id: "s2m2_c8",
 title: "Gated D-Latch (`Data` + `Write Enable`)",
 zeroTeach: "A Gated D-Latch replaces separate Set/Reset wires with one Data wire (`D`) and one `Write Enable (WE)` wire: internally `S = D & WE` and `R = (!D) & WE`. When `WE = 1`, `Q` updates to `D`. When `WE = 0`, both `S` and `R` become `0`, locking `Q` immune to any changes on `D`!",
 concreteExample: "Store '1': set D=1, pulse WE=1 -> Q=1; set WE=0 -> now D can flip 0,1,0,1 all day and Q stays locked at 1!",
 reteachCheck: { instruction: "Type the D-Latch behavior:", target: "WE=1 -> Q=D; WE=0 -> Q holds" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var scenarios = [
 { initQ: 1, dNow: 0, we: 0, finalQ: 1 },
 { initQ: 0, dNow: 1, we: 1, finalQ: 1 },
 { initQ: 0, dNow: 1, we: 0, finalQ: 0 },
 { initQ: 1, dNow: 0, we: 1, finalQ: 0 }
 ];
 var sc = scenarios[Math.abs(variantIdx || 0) % scenarios.length];
 var lock = adaptLockIn("WE=" + sc.we + ", D=" + sc.dNow + " -> Q=" + sc.finalQ, "Type the D-Latch state transition:", weakKeys, stageNum);
 return {
 conceptId: "s2m2_c8",
 conceptTitle: "Gated D-Latch (Data + Write Enable)",
 variantIdx: variantIdx || 0,
 prompt: "A 1-bit Gated D-Latch currently stores `Q = " + sc.initQ + "`. Next, the `Data` wire changes to `D = " + sc.dNow + "` while `WriteEnable = " + sc.we + "`. What is `Q`?",
 options: rotateOptions([
 { text: "`Q = " + sc.finalQ + "` - because when `WriteEnable = " + sc.we + "`, the latch " + (sc.we === 1 ? "transparently loads `D`" : "blocks `D` and holds its prior state `" + sc.initQ + "`") + ".", isCorrect: true, whyWrong: "" },
 { text: "`Q = " + (1 - sc.finalQ) + "` - " + (sc.we === 1 ? "ignoring `WriteEnable = 1`" : "overwriting `Q` even though `WriteEnable = 0`"), isCorrect: false, whyWrong: sc.we === 1 ? "When `WriteEnable = 1`, the latch door is OPEN so `Q` updates immediately to `D = " + sc.dNow + "`!" : "When `WriteEnable = 0`, the latch door is LOCKED - changes on `D` are ignored and `Q` stays `" + sc.initQ + "`!" },
 { text: "`Q` resets to `0` automatically whenever `WriteEnable = 0`.", isCorrect: false, whyWrong: "`WriteEnable = 0` means HOLD memory, NOT clear to zero!" },
 { text: "Invalid state (`Q = !Q`) because `D` and `WriteEnable` differ.", isCorrect: false, whyWrong: "A D-Latch makes the invalid `S=1, R=1` state impossible for ALL combinations of `(D, WE)`!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s2m2_c9",
 title: "Edge-Triggered D Flip-Flop Synchronization",
 zeroTeach: "If a CPU register used a level-sensitive D-Latch (`WE = Clock`) in a feedback path like `R1 = R1 + 1`, during the entire half-cycle while `Clock === 1`, the new sum would loop back through the adder multiple times! An Edge-Triggered D Flip-Flop samples `D` ONLY at the instant `Clock` transitions `0 -> 1` (rising edge), holding steady for the rest of the cycle.",
 concreteExample: "To execute `count = count + 1` cleanly once per tick, a rising-edge flip-flop captures `count + 1` once per rising clock edge.",
 reteachCheck: { instruction: "Type why CPUs need edge-triggered flip-flops:", target: "samples D once on 0->1 rising clock edge" }
 }, [
 {
 prompt: "Why are CPU registers built from **edge-triggered D Flip-Flops** rather than simple level-transparent D-Latches?",
 options: [
 { text: "A transparent latch stays open for the entire `Clock = 1` plateau - allowing outputs in feedback loops (like `R1 = R1 + 1`) to race around multiple times in one tick - whereas a Flip-Flop captures `D` strictly once per rising `0 -> 1` edge.", isCorrect: true, whyWrong: "" },
 { text: "D-Latches cannot store the bit `1`.", isCorrect: false, whyWrong: "D-Latches store `0` and `1` fine; their issue in synchronous datapaths is level transparency while `Enable = 1`." },
 { text: "Flip-Flops retain data for 10 years when power is unplugged.", isCorrect: false, whyWrong: "Both latches and flip-flops are volatile CMOS circuits that lose state immediately when power is removed." },
 { text: "Flip-Flops compute division without an ALU.", isCorrect: false, whyWrong: "A flip-flop is a 1-bit synchronous storage element, not a divider." }
 ],
 lockInInstruction: "Type how `R1 = R1 + 1` stays deterministic:",
 lockInTarget: "rising edge updates R1 exactly once per tick"
 },
 {
 prompt: "Between two rising clock edges (`Clock` steady at `1`, or falling `1 -> 0`, or steady at `0`), if input `D` of a rising-edge D Flip-Flop wiggles `0 -> 1 -> 0`, what happens to `Q`?",
 options: [
 { text: "`Q` remains completely unchanged until the NEXT `0 -> 1` rising clock edge arrives.", isCorrect: true, whyWrong: "" },
 { text: "`Q` wiggles whenever `Clock === 1`.", isCorrect: false, whyWrong: "That describes a level-sensitive D-Latch! A rising-edge D Flip-Flop ignores `D` except at the `0 -> 1` edge instant." },
 { text: "`Q` updates on both rising and falling edges.", isCorrect: false, whyWrong: "Standard CPU registers trigger on a single edge (typically rising `0 -> 1`) for clean timing closure." },
 { text: "`Q` clears to `0` on the falling edge.", isCorrect: false, whyWrong: "Falling edge holds the stored value unchanged." }
 ],
 lockInInstruction: "Type the flip-flop hold rule:",
 lockInTarget: "between rising edges, Q stays constant"
 }
 ]),
 {
 id: "s2m2_c10",
 title: "Multi-Bit Hardware Registers from Parallel Flip-Flops",
 zeroTeach: "One D Flip-Flop holds 1 bit. Placing N D Flip-Flops side-by-side sharing a common `Clock` and `LoadEnable` wire creates an N-bit CPU Register (e.g., 64 flip-flops = one 64-bit register `RAX`) that latches all 64 bits simultaneously on one clock edge!",
 concreteExample: "A 16-bit register uses 16 D Flip-Flops; a 64-bit register uses 64 D Flip-Flops.",
 reteachCheck: { instruction: "Type the flip-flop count for a 64-bit register:", target: "64-bit register = 64 D flip-flops" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var widths = [8, 16, 32, 64];
 var w = widths[Math.abs(variantIdx || 0) % widths.length];
 var lock = adaptLockIn(w + "-bit register = " + w + " flip-flops", "Type the hardware register width relation:", weakKeys, stageNum);
 return {
 conceptId: "s2m2_c10",
 conceptTitle: "Multi-Bit Hardware Registers from Parallel Flip-Flops",
 variantIdx: variantIdx || 0,
 prompt: "How many 1-bit edge-triggered D Flip-Flops are wired in parallel to build a single `" + w + "-bit` CPU general-purpose register?",
 options: rotateOptions([
 { text: "`" + w + "` D Flip-Flops sharing common `Clock` and `WriteEnable` control lines.", isCorrect: true, whyWrong: "" },
 { text: "`1` D Flip-Flop holding `" + w + "` voltage levels.", isCorrect: false, whyWrong: "Each binary flip-flop holds strictly `1` bit (`0` or `1`); `" + w + "` bits require `" + w + "` parallel flip-flops!" },
 { text: "`2^" + w + "` D Flip-Flops.", isCorrect: false, whyWrong: "`" + w + "` flip-flops CAN REPRESENT `2^" + w + "` distinct possible binary numbers, using only `" + w + "` flip-flops total!" },
 { text: "`" + (w / 2) + "` Half-Adders with no feedback loops.", isCorrect: false, whyWrong: "Half-Adders have zero memory; registers require `" + w + "` sequential flip-flops." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 }
 ]
 }
 ];

 // ==========================================================================
 // STAGE 3: HOW A COMPUTER RUNS INSTRUCTIONS
 // ==========================================================================

 var stage3Modules = [
 {
 id: "s3m1",
 stageId: "stage3",
 stageNumber: 3,
 code: "3.1",
 title: "Clock, CPU Registers, ALU, Control Unit & Fetch-Decode-Execute",
 subtitle: "How quartz clock pulses step the Program Counter, Control Unit, Registers, ALU, and addressable RAM vs. persistent SSDs.",
 estimatedMinutes: 22,
 simulatorType: "cpu-fde",
 lessonSections: [
 {
 heading: "1. The System Clock, CPU Registers, ALU & Control Unit",
 body: [
 "In Stage 2 we built an Adder (computation) and Flip-Flop Registers (memory). Put them together under a rhythmic heartbeat and you have a Central Processing Unit (CPU)!",
 "• System Clock: A crystal oscillator pulsing 0 -> 1 -> 0 billions of times per second (e.g., 4 GHz = 4 billion rising edges/sec, 0.25 ns apart). Why can't the clock run infinitely fast? Because electricity needs a small 'propagation delay' to ripple through all gates of the ALU before the flip-flops snap their doors shut!\n• Registers: A tiny bank of ultra-fast flip-flops directly inside the CPU core (~0.3 ns access): General-Purpose Registers (`R0-R3` / `RAX`), `PC` (Program Counter holding the RAM address of the NEXT instruction), `IR` (Instruction Register holding the current binary instruction), and `FLAGS` (`ZERO`, `CARRY`, `NEGATIVE`).\n• ALU (Arithmetic Logic Unit): Combinational workhorse containing Adders, Subtracters, AND/OR/XOR gates, and a Multiplexer (`MUX`) that selects which operation result passes through.\n• Control Unit (CU): Combinational decoder reading the opcode bits inside `IR` and switching on exact control wires (`ALU_OP`, `RegWrite`, `MemRead`, `MemWrite`)."
 ],
 diagram:
"Inside One CPU Core:\n" +
" +----------------------------------------------------------+\n" +
" | [PC: 0x00] ---> Fetches Instruction ---> [IR: 00010110] |\n" +
" | | |\n" +
" | [Registers R0..R3] ===> [ ALU (+,-,^,&) ] <== [Control] |\n" +
" +----------------------------|-------------------+---------+\n" +
" v Address & Data Bus\n" +
" [ Main Memory (RAM): 0x0000 .. 0xFFFF ]",
 takeaway: "Registers hold immediate working bits inside the CPU; ALU transforms them; Control Unit steers the wires; Clock paces every step."
 },
 {
 heading: "2. The Fetch-Decode-Execute Heartbeat Cycle",
 body: [
 "From boot-up until power-off, every CPU core repeats one relentless 3-step loop:",
 "1) FETCH: Send the address stored in `PC` out onto the RAM Address Bus, read the instruction bytes at `RAM[PC]` into `IR`, and advance `PC = PC + instruction_size` so it points to the next instruction.\n2) DECODE: The Control Unit inspects the binary bitfields in `IR` (e.g., top 4 bits = Opcode `0010` = `ADD`, next 2 bits = `R1`, last 2 bits = `R2`) and configures internal multiplexers.\n3) EXECUTE (& Writeback): The ALU computes `R1 + R2`, updates `FLAGS` (such as `ZERO = 1` if result is 0), and latches the result into `R1` on the rising clock edge! And how do `if` statements and `while` loops happen? A Jump instruction (`JMP 0x08` or `JZ 0x08`) simply overwrites `PC` with `0x08`!"
 ],
 diagram:
"Fetch-Decode-Execute Loop:\n" +
" [1. FETCH] IR <- RAM[PC]; PC <- PC + 1\n" +
" |\n" +
" [2. DECODE] Control Unit splits IR into (Opcode, Dest, Src)\n" +
" |\n" +
" [3. EXECUTE] ALU/Memory acts; result latches on Clock rising edge!",
 takeaway: "Every `if` and `for` loop in every programming language boils down to conditionally overwriting the CPU's Program Counter (`PC`)."
 },
 {
 heading: "3. RAM Addresses vs. Persistent Storage (DRAM vs. NAND Flash)",
 body: [
 "Why does a computer have BOTH 16-64 GB of RAM and a 1 TB SSD? Physical tradeoffs:\n• Main Memory (DRAM): Organized as a huge linear array of numbered byte mailboxes (`0x00000000` upward). Each bit is 1 tiny capacitor + 1 access transistor (`1T1C`) - super dense and byte-addressable in ~50-80 nanoseconds, EXCEPT capacitors leak charge in milliseconds (requiring periodic refresh) and lose EVERYTHING the instant power turns off (**volatile**).\n• Persistent Storage (NVMe NAND Flash SSD): Pushes electrons across an insulator into an electrically isolated 'floating gate' / charge-trap cell where they stay trapped for years with **zero power** (**non-volatile**)! However, block-erasing Flash takes microseconds/milliseconds (~1,000x slower than RAM) and wears out after thousands of write cycles. So programs live on SSD when off, get copied into RAM to run, and pull active words into CPU Caches & Registers!"
 ],
 diagram:
"Memory Hierarchy (Fastest/Smallest ---> Largest/Non-Volatile):\n" +
" CPU Registers (~0.3 ns, Flip-Flops, bytes) [Volatile]\n" +
" L1/L2/L3 Cache (~1-12 ns, 6T SRAM, MBs) [Volatile]\n" +
" Main RAM (~60 ns, 1T1C DRAM, GBs) [Volatile]\n" +
" NVMe SSD (~50,000 ns, Floating-Gate, TBs) [Non-Volatile!]",
 takeaway: "RAM gives fast random byte addressing while powered; SSDs trap charge across insulators to survive power-off."
 }
 ],
 concepts: [
 {
 id: "s3m1_c1",
 title: "System Clock Period & Propagation Delay",
 zeroTeach: "Clock frequency f (in Hz) and clock period T (time per tick in seconds) are reciprocals: T = 1 / f. At 1 GHz (10^9 Hz), 1 tick is 1 nanosecond (1 ns). The clock period T MUST be longer than the longest gate propagation delay in a stage so signals settle before flip-flops latch!",
 concreteExample: "At 2 GHz, T = 1 / (2 * 10^9) = 0.5 ns (500 picoseconds). At 4 GHz, T = 0.25 ns (250 ps).",
 reteachCheck: { instruction: "Type the clock period relation at 2 GHz:", target: "2 GHz -> T = 0.5 ns" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var freqs = [
 { ghz: 1, ns: "1.00", ps: 1000 },
 { ghz: 2, ns: "0.50", ps: 500 },
 { ghz: 4, ns: "0.25", ps: 250 },
 { ghz: 5, ns: "0.20", ps: 200 }
 ];
 var f = freqs[Math.abs(variantIdx || 0) % freqs.length];
 var lock = adaptLockIn(f.ghz + " GHz -> " + f.ps + " ps", "Type the clock frequency-to-period mapping:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c1",
 conceptTitle: "System Clock Period & Gate Propagation Delay",
 variantIdx: variantIdx || 0,
 prompt: "A CPU core runs at `" + f.ghz + " GHz` (`" + f.ghz + " billion` cycles/sec). How much time passes per clock cycle (`T = 1 / f`), and what happens if the ALU's gate delay exceeds `T`?",
 options: rotateOptions([
 { text: "`" + f.ns + " ns` (`" + f.ps + " ps`); if gate delay exceeds `T`, flip-flops latch unfinished garbage bits before carries finish rippling!", isCorrect: true, whyWrong: "" },
 { text: "`" + f.ghz + " seconds` per cycle; slower gates simply pause the quartz crystal automatically.", isCorrect: false, whyWrong: "A crystal clock does NOT wait automatically for slow gates - overclocking past gate settling delay causes bit errors and crashes! And `1 / " + f.ghz + "e9` is `" + f.ns + " ns`." },
 { text: "`0 ps`; electricity inside silicon has zero propagation delay.", isCorrect: false, whyWrong: "Charging gate capacitances takes tens/hundreds of picoseconds, which directly caps clock frequency." },
 { text: "`" + (f.ghz * 1000) + " ms` per cycle.", isCorrect: false, whyWrong: "`GHz` means `10^9` ticks per single second (`nanoseconds`, not milliseconds)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s3m1_c2",
 title: "Special-Purpose Registers (`PC`, `IR`, `FLAGS`) vs. General Registers",
 zeroTeach: "Inside the CPU core: `PC` (Program Counter / Instruction Pointer) holds the RAM address of the NEXT instruction to fetch; `IR` (Instruction Register) holds the binary opcode currently being decoded; `R0..Rn` hold active program data; `FLAGS` record ALU conditions like `ZERO` or `CARRY`.",
 concreteExample: "When instruction at 0x0040 runs, PC holds 0x0040 during Fetch, IR receives RAM[0x0040], and PC increments to the next instruction address.",
 reteachCheck: { instruction: "Type the roles of PC and IR:", target: "PC = next address, IR = current instruction" }
 }, [
 {
 prompt: "What is the exact job of the CPU's **Program Counter (`PC`)** (called `RIP` on x86-64)?",
 options: [
 { text: "It stores the memory address in RAM of the next instruction to be fetched.", isCorrect: true, whyWrong: "" },
 { text: "It counts how many apps are installed on your SSD.", isCorrect: false, whyWrong: "Despite the historical name 'Program Counter', `PC` does NOT count apps - it points to the current/next instruction's RAM address!" },
 { text: "It measures CPU temperature in degrees Celsius.", isCorrect: false, whyWrong: "Thermal diodes measure temperature; `PC` is an address register driving instruction fetch." },
 { text: "It performs floating-point division.", isCorrect: false, whyWrong: "Arithmetic happens in the ALU/FPU, not the Program Counter." }
 ],
 lockInInstruction: "Type what PC stores:",
 lockInTarget: "PC holds next instruction RAM address"
 },
 {
 prompt: "Why does a CPU keep working values in internal **Registers** (`R0-R15`) instead of reading and writing directly to Main RAM on every arithmetic operation?",
 options: [
 { text: "Registers sit right beside the ALU out of flip-flops (~0.3 ns access), whereas crossing the memory bus to DRAM is ~150-200x slower (~50-80 ns).", isCorrect: true, whyWrong: "" },
 { text: "Main RAM can only store strings, while Registers store numbers.", isCorrect: false, whyWrong: "Both RAM and Registers store raw binary bits of any type; the difference is physical proximity, technology, and 200x speed!" },
 { text: "Registers keep their data when the computer is unplugged.", isCorrect: false, whyWrong: "Both CPU registers and DRAM are volatile and clear on power loss." },
 { text: "A CPU has terabytes of registers and only 64 bytes of RAM.", isCorrect: false, whyWrong: "It's the exact reverse: a core has only dozens of architectural registers (hundreds of bytes) vs. gigabytes of RAM!" }
 ],
 lockInInstruction: "Type the speed/capacity tradeoff:",
 lockInTarget: "registers: tiny & sub-ns; RAM: GBs & ~60ns"
 }
 ]),
 {
 id: "s3m1_c3",
 title: "ALU Multiplexer & Status Flags (`ZERO`, `CARRY`)",
 zeroTeach: "Inside the ALU, Add, Subtract, AND, OR, and XOR circuits compute in parallel on inputs A and B, and an N-to-1 Multiplexer (controlled by `ALU_OP` bits from the Control Unit) routes the chosen result to the output while setting status flags like `ZERO = (result === 0)`!",
 concreteExample: "How does `if (x === y)` work in hardware? The ALU computes `x - y`; if the result is `0`, the hardware `ZERO` flag becomes `1`!",
 reteachCheck: { instruction: "Type how hardware tests equality:", target: "x - y === 0 sets ZERO=1" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var pairs = [
 { a: 42, b: 42, diff: 0, z: 1 },
 { a: 19, b: 12, diff: 7, z: 0 },
 { a: 64, b: 64, diff: 0, z: 1 },
 { a: 25, b: 30, diff: -5, z: 0 }
 ];
 var p = pairs[Math.abs(variantIdx || 0) % pairs.length];
 var lock = adaptLockIn("CMP " + p.a + ", " + p.b + " -> ZERO=" + p.z, "Type the ALU comparison flag outcome:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c3",
 conceptTitle: "ALU Multiplexer & Status Flags",
 variantIdx: variantIdx || 0,
 prompt: "A `CMP R1, R2` instruction compares `R1 = " + p.a + "` and `R2 = " + p.b + "` by subtracting `R1 - R2` inside the ALU. What is the resulting `ZERO` status flag?",
 options: rotateOptions([
 { text: "`ZERO = " + p.z + "`, because `" + p.a + " - " + p.b + " = " + p.diff + "` (" + (p.z === 1 ? "all result bits are 0, so ZERO flag asserts 1!" : "result is non-zero, so ZERO flag is 0!") + ")", isCorrect: true, whyWrong: "" },
 { text: "`ZERO = " + (1 - p.z) + "` (" + (p.z === 1 ? "thinking equal numbers set ZERO=0" : "thinking any positive subtraction sets ZERO=1") + ")", isCorrect: false, whyWrong: "Watch the flag name carefully: `ZERO = 1` means 'Yes, the ALU output IS zero!' (`result === 0`). When `result !== 0`, `ZERO = 0`." },
 { text: "The ALU cannot subtract and must ask the SSD.", isCorrect: false, whyWrong: "The ALU subtracts in 1 clock cycle via two's complement addition (`A + (~B + 1)`)." },
 { text: "`CMP` overwrites both `R1` and `R2` with `0`.", isCorrect: false, whyWrong: "`CMP` updates ONLY the `FLAGS` register without overwriting `R1` or `R2` so a conditional jump can inspect `ZERO` next!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s3m1_c4",
 title: "The Control Unit (`CU`) Hardware Decoder",
 zeroTeach: "The Control Unit does not do arithmetic itself; it decodes the binary opcode in the Instruction Register (`IR`) and asserts control wires (`RegWrite`, `ALUSrc`, `ALUOp`, `MemRead`, `MemWrite`, `Jump`) that route data across buses.",
 concreteExample: "Opcode `0001` (`LOAD`) turns ON `MemRead=1, RegWrite=1`; Opcode `0010` (`STORE`) turns ON `MemWrite=1, RegWrite=0`.",
 reteachCheck: { instruction: "Type the Control Unit's core job:", target: "decodes IR opcode -> sets control wires" }
 }, [
 {
 prompt: "What does the CPU's **Control Unit (`CU`)** physically do during instruction execution?",
 options: [
 { text: "It decodes the opcode bits in `IR` into HIGH/LOW control wire signals (`MemRead`, `MemWrite`, `ALUOp`, `RegWrite`) that steer multiplexers and latches.", isCorrect: true, whyWrong: "" },
 { text: "It stores gigabytes of user photos permanently.", isCorrect: false, whyWrong: "Bulk persistent files live on SSDs; the Control Unit is a combinational/state-machine instruction decoder." },
 { text: "It adds two 64-bit numbers using Ripple-Carry Full-Adders.", isCorrect: false, whyWrong: "Addition happens inside the ALU; the Control Unit tells the ALU *when* to add vs. XOR!" },
 { text: "It cools the CPU heatsink with liquid nitrogen.", isCorrect: false, whyWrong: "The Control Unit is pure digital logic gates inside the silicon die." }
 ],
 lockInInstruction: "Type how CU and ALU collaborate:",
 lockInTarget: "CU steers wires; ALU computes bits"
 },
 {
 prompt: "When executing `STORE [0x20], R1` (copy `R1` into RAM slot `0x20`), which pair of Control Unit signals must be asserted?",
 options: [
 { text: "`MemWrite = 1` and `RegWrite = 0` (write to RAM, do not overwrite CPU registers).", isCorrect: true, whyWrong: "" },
 { text: "`MemWrite = 0` and `RegWrite = 1`.", isCorrect: false, whyWrong: "`MemWrite=0, RegWrite=1` is a `LOAD` (reading RAM into a register), the opposite of `STORE`!" },
 { text: "`MemWrite = 0` and `MemRead = 0`.", isCorrect: false, whyWrong: "With `MemWrite = 0`, RAM refuses to store `R1`'s value." },
 { text: "`PowerOff = 1`.", isCorrect: false, whyWrong: "`STORE` is a routine memory write occurring millions of times per second." }
 ],
 lockInInstruction: "Type the STORE control wire state:",
 lockInTarget: "STORE -> MemWrite=1, RegWrite=0"
 }
 ]),
 {
 id: "s3m1_c5",
 title: "Tracing Step 1: Instruction `FETCH`",
 zeroTeach: "During `FETCH`, the CPU places `PC` on the memory address bus, copies `RAM[PC]` into the Instruction Register (`IR`), and advances `PC = PC + instructionBytes` (e.g., +4 on fixed 32-bit RISC architectures) to prepare for the next instruction.",
 concreteExample: "If PC = 0x1000 and instructions are 4 bytes wide, FETCH loads IR = RAM[0x1000] and updates PC = 0x1004.",
 reteachCheck: { instruction: "Type the two FETCH state updates:", target: "IR = RAM[PC]; PC = PC + 4" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var bases = [0x1000, 0x2004, 0x0400, 0x3010];
 var pc = bases[Math.abs(variantIdx || 0) % bases.length];
 var nextPc = pc + 4;
 var lock = adaptLockIn("IR = RAM[" + toHex(pc, 4) + "]; PC = " + toHex(nextPc, 4), "Type the exact FETCH register trace:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c5",
 conceptTitle: "Tracing Step 1: Instruction FETCH",
 variantIdx: variantIdx || 0,
 prompt: "On a 32-bit RISC CPU (4 bytes per instruction), `PC` currently holds `" + toHex(pc, 4) + "`. What happens during the **FETCH** phase of a normal arithmetic instruction?",
 options: rotateOptions([
 { text: "`IR` loads the 4-byte instruction from `RAM[" + toHex(pc, 4) + "]`, and `PC` advances to `" + toHex(nextPc, 4) + "`.", isCorrect: true, whyWrong: "" },
 { text: "`PC` stays frozen at `" + toHex(pc, 4) + "` forever, re-running the same instruction in an infinite loop.", isCorrect: false, whyWrong: "Without incrementing `PC` (`+4` bytes), the CPU would fetch the exact same address forever!" },
 { text: "`RAM[" + toHex(pc, 4) + "]` is erased to `0` after being read.", isCorrect: false, whyWrong: "Instruction reads are non-destructive so functions and loops can run repeatedly." },
 { text: "`PC` loads into the ALU to be multiplied by `R0`.", isCorrect: false, whyWrong: "During Fetch, `PC` indexes instruction memory and increments by the instruction width (`4`)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s3m1_c6",
 title: "Tracing Full Fetch-Decode-Execute Across Registers",
 zeroTeach: "Tracing machine execution means updating registers step-by-step: `LOAD Rx, [addr]` sets `Rx = RAM[addr]`; `ADD Rx, Ry` sets `Rx = Rx + Ry`; `SUB Rx, Ry` sets `Rx = Rx - Ry`.",
 concreteExample: "If R1=10, R2=6, then `ADD R1, R2` updates R1=16 while R2 remains 6.",
 reteachCheck: { instruction: "Type the register state after ADD R1, R2 (10, 6):", target: "R1=16, R2=6" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var traces = [
 { r1: 12, r2: 5, op: "ADD", res: 17 },
 { r1: 20, r2: 8, op: "SUB", res: 12 },
 { r1: 9, r2: 14, op: "ADD", res: 23 },
 { r1: 30, r2: 11, op: "SUB", res: 19 }
 ];
 var t = traces[Math.abs(variantIdx || 0) % traces.length];
 var wrongOp = t.op === "ADD" ? t.r1 - t.r2 : t.r1 + t.r2;
 var lock = adaptLockIn(t.op + " R1, R2 -> R1=" + t.res + ", R2=" + t.r2, "Type the post-Execute register state:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c6",
 conceptTitle: "Tracing Fetch-Decode-Execute on Registers",
 variantIdx: variantIdx || 0,
 prompt: "Suppose `R1 = " + t.r1 + "` and `R2 = " + t.r2 + "`. After the CPU fetches, decodes, and executes `" + t.op + " R1, R2` (destination first: `R1 <- R1 " + (t.op === "ADD" ? "+" : "-") + " R2`), what do `R1` and `R2` hold?",
 options: rotateOptions([
 { text: "`R1 = " + t.res + "`, `R2 = " + t.r2 + "`", isCorrect: true, whyWrong: "" },
 { text: "`R1 = " + t.r1 + "`, `R2 = " + t.res + "` (writing into source `R2` instead of destination `R1`)", isCorrect: false, whyWrong: "In `OP Dest, Src` syntax (`" + t.op + " R1, R2`), the destination register `R1` is updated while source `R2` stays `" + t.r2 + "`." },
 { text: "`R1 = " + wrongOp + "`, `R2 = " + t.r2 + "`", isCorrect: false, whyWrong: "You applied the opposite arithmetic operation instead of `" + t.op + "`!" },
 { text: "`R1 = 0`, `R2 = 0`", isCorrect: false, whyWrong: "Registers retain their latched values until explicitly overwritten." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s3m1_c7",
 title: "Conditional Jumps (`JZ` / `JNZ`) Overwriting `PC`",
 zeroTeach: "Normally `PC` steps sequentially (`+1` / `+4`). A Conditional Jump like `JZ target` inspects the `ZERO` flag in `FLAGS`: if `ZERO === 1`, the CPU overwrites `PC = target`; if `ZERO === 0`, `PC` continues straight ahead to the next sequential instruction!",
 concreteExample: "At PC=0x10 (next=0x14), `JZ 0x40` jumps to `PC=0x40` when `ZERO=1`, or falls through to `PC=0x14` when `ZERO=0`.",
 reteachCheck: { instruction: "Type how JZ branches:", target: "if ZERO==1 then PC=target" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cases = [
 { z: 1, fall: "0x08", target: "0x20", finalPc: "0x20" },
 { z: 0, fall: "0x08", target: "0x20", finalPc: "0x08" },
 { z: 1, fall: "0x14", target: "0x04", finalPc: "0x04" },
 { z: 0, fall: "0x14", target: "0x04", finalPc: "0x14" }
 ];
 var c = cases[Math.abs(variantIdx || 0) % cases.length];
 var other = c.finalPc === c.target ? c.fall : c.target;
 var lock = adaptLockIn("ZERO=" + c.z + " -> PC=" + c.finalPc, "Type the conditional jump PC outcome:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c7",
 conceptTitle: "Conditional Jumps (JZ) Overwriting PC",
 variantIdx: variantIdx || 0,
 prompt: "After a `CMP` instruction, the ALU status flag is `ZERO = " + c.z + "`. The CPU now executes `JZ " + c.target + "` (Jump if Zero; sequential fall-through address is `" + c.fall + "`). What address will `PC` hold next?",
 options: rotateOptions([
 { text: "`PC = " + c.finalPc + "` (" + (c.z === 1 ? "branch TAKEN because ZERO === 1" : "branch NOT taken because ZERO === 0, falling through sequentially") + ")", isCorrect: true, whyWrong: "" },
 { text: "`PC = " + other + "`", isCorrect: false, whyWrong: "`JZ` jumps to `" + c.target + "` ONLY when `ZERO === 1`. Since `ZERO = " + c.z + "`, `PC` becomes `" + c.finalPc + "`!" },
 { text: "`PC = 0x00` (all jumps reset the CPU)", isCorrect: false, whyWrong: "`JZ` sets `PC` either to `" + c.target + "` or fall-through `" + c.fall + "`, never resetting unless target is `0x00`." },
 { text: "`PC = " + c.target + " + " + c.fall + "`", isCorrect: false, whyWrong: "Direct jump target `" + c.target + "` replaces `PC` rather than adding to fall-through." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s3m1_c8",
 title: "RAM Address Bus Width ($N$ Wires $\\to 2^N$ Addresses)",
 zeroTeach: "Each wire on the Address Bus carries 1 binary bit (0 or 1). An N-bit Address Bus can form 2^N distinct binary addresses, indexing 2^N unique bytes in RAM! That is why 32-bit OSes capped direct byte addressing at 2^32 bytes = 4 GiB, while 64-bit CPUs vastly removed that ceiling.",
 concreteExample: "8 address wires -> 2^8 = 256 bytes; 10 wires -> 2^10 = 1,024 bytes (1 KiB); 16 wires -> 2^16 = 65,536 bytes (64 KiB).",
 reteachCheck: { instruction: "Type the address-space formula:", target: "N address bits -> 2^N byte slots" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var widths = [
 { n: 8, count: "256", wrongMult: "16" },
 { n: 10, count: "1,024", wrongMult: "20" },
 { n: 12, count: "4,096", wrongMult: "24" },
 { n: 16, count: "65,536", wrongMult: "32" }
 ];
 var w = widths[Math.abs(variantIdx || 0) % widths.length];
 var lock = adaptLockIn("2^" + w.n + " = " + w.count.replace(",", ""), "Type the exact power-of-two address count:", weakKeys, stageNum);
 return {
 conceptId: "s3m1_c8",
 conceptTitle: "RAM Address Bus Width (2^N Locations)",
 variantIdx: variantIdx || 0,
 prompt: "A microcontroller has a `" + w.n + "-bit` RAM Address Bus (each address selects 1 byte). How many distinct byte locations in RAM can it uniquely address?",
 options: rotateOptions([
 { text: "`" + w.count + "` bytes (`2^" + w.n + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + w.wrongMult + "` bytes (`2 * " + w.n + "`)", isCorrect: false, whyWrong: "Every extra address bit DOUBLES the address space (`2^N`, exponential), not `2 * N`!" },
 { text: "`" + (w.n * w.n) + "` bytes (`" + w.n + "^2`)", isCorrect: false, whyWrong: "Binary combinations grow as `2^N` (`2^" + w.n + " = " + w.count + "`), not `N^2` (`" + (w.n * w.n) + "`)." },
 { text: "`" + w.n + "` bytes total.", isCorrect: false, whyWrong: "`" + w.n + "` wires carry `" + w.n + "` bits simultaneously, encoding `2^" + w.n + " = " + w.count + "` distinct addresses." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s3m1_c9",
 title: "Volatile DRAM vs. Non-Volatile NAND Flash SSD",
 zeroTeach: "DRAM stores bits as tiny charges on leaky capacitors (~60 ns access, loses all data when power turns off = volatile). NAND Flash SSDs tunnel electrons onto insulated floating-gate / charge-trap cells that retain data for years without power (non-volatile), at ~1,000x slower write/erase latency.",
 concreteExample: "Unsaved text in an editor lives in volatile DRAM; clicking 'Save' writes blocks to non-volatile NAND Flash SSD.",
 reteachCheck: { instruction: "Type the volatility contrast:", target: "DRAM = volatile; SSD Flash = non-volatile" }
 }, [
 {
 prompt: "Why does unsaved work disappear if power suddenly cuts out, while saved files on your SSD survive?",
 options: [
 { text: "Working data lives in volatile DRAM capacitors that discharge without power, whereas SSDs trap electrons inside insulated floating-gate / charge-trap cells.", isCorrect: true, whyWrong: "" },
 { text: "SSDs contain spinning backup batteries inside every byte.", isCorrect: false, whyWrong: "NAND Flash needs zero battery power to hold stored charge - insulating oxide traps the electrons physically!" },
 { text: "DRAM intentionally runs an erase program when unplugged.", isCorrect: false, whyWrong: "Without power no program can run; microscopic DRAM capacitors naturally leak their tiny charge away in milliseconds." },
 { text: "Why not use SSD Flash as CPU registers? Because SSDs are faster than flip-flops.", isCorrect: false, whyWrong: "SSD writes/erases are tens of thousands of times SLOWER than CPU flip-flops and wear out under constant register writes!" }
 ],
 lockInInstruction: "Type why we need both RAM and SSD:",
 lockInTarget: "RAM = fast working state; SSD = persistent files"
 },
 {
 prompt: "Why can't we simply throw away DRAM and connect the CPU directly to a NAND Flash SSD for every variable update?",
 options: [
 { text: "NAND Flash block-erases take microseconds/milliseconds (~1,000x slower than DRAM) and wear out oxide insulation after limited P/E write cycles.", isCorrect: true, whyWrong: "" },
 { text: "NAND Flash erases itself every 64 milliseconds.", isCorrect: false, whyWrong: "Periodic 64ms refresh belongs to leaky DRAM capacitors, NOT non-volatile Flash!" },
 { text: "SSDs can only store odd numbers.", isCorrect: false, whyWrong: "Both DRAM and SSDs store arbitrary binary bytes." },
 { text: "CPUs cannot read binary from persistent media via DMA.", isCorrect: false, whyWrong: "OS kernels copy blocks from SSD into DRAM via NVMe DMA constantly." }
 ],
 lockInInstruction: "Type the two NAND Flash limits:",
 lockInTarget: "Flash: slower block erase + finite write endurance"
 }
 ]),
 scenarioBankConcept({
 id: "s3m1_c10",
 title: "Stored-Program (Von Neumann) Architecture",
 zeroTeach: "In a Stored-Program (Von Neumann / EDVAC) computer, machine instructions and program data live together as binary bytes inside the SAME addressable memory. That lets compilers - programs whose output DATA becomes the next program's INSTRUCTIONS - exist!",
 concreteExample: "gcc or rustc writes bytes as 'data' into a file, and the OS loads those exact bytes into RAM where `PC` fetches them as 'instructions'!",
 reteachCheck: { instruction: "Type what Stored-Program unifies:", target: "instructions and data share addressable RAM" }
 }, [
 {
 prompt: "What profound capability emerges from storing **program instructions** and **data** in the same addressable RAM (Stored-Program architecture)?",
 options: [
 { text: "One program (like an OS loader, compiler, or JIT) can generate or load binary bytes as data and then execute them as instructions!", isCorrect: true, whyWrong: "" },
 { text: "Humans must physically re-plug patch cables every time they switch from browser to calculator.", isCorrect: false, whyWrong: "Re-plugging patch cables was pre-stored-program ENIAC! Stored-program RAM eliminated manual rewiring." },
 { text: "Instructions use 12V while data uses 3V in RAM.", isCorrect: false, whyWrong: "Instruction bytes and data bytes use identical DRAM cells and voltage levels." },
 { text: "It prevents the CPU from ever needing a Program Counter.", isCorrect: false, whyWrong: "Because instructions and data look identical as bits, the CPU relies on `PC` to know which RAM addresses to fetch as instructions!" }
 ],
 lockInInstruction: "Type why compilers are possible:",
 lockInTarget: "compiler output data = CPU input instructions"
 }
 ])
 ]
 },
 {
 id: "s3m2",
 stageId: "stage3",
 stageNumber: 3,
 code: "3.2",
 title: "Machine Code Opcodes, Assembly, Compilers vs. Interpreters & OS Kernel",
 subtitle: "How binary opcodes map to Assembly, how Compilers and Interpreters translate human code, and how the OS Kernel protects hardware.",
 estimatedMinutes: 22,
 simulatorType: "opcode-pipeline",
 lessonSections: [
 {
 heading: "1. Machine Code Opcodes & Assembly Language Mnemonics",
 body: [
 "At the bottom of the software stack, the CPU understands ZERO English words - only fixed or variable-length binary **Machine Code** instructions! Each instruction packs bitfields:\n`[ Opcode (what to do) | Destination Register | Source Register / Immediate Constant ]`",
 "Typing `0001 01 10` by hand is error-prone, so engineers created **Assembly Language** (`ADD R1, R2`), which maps `1-to-1` onto machine instructions via a tiny translator called an **Assembler**. Assembly is still tied to a specific CPU family (Instruction Set Architecture, or ISA, like `x86-64`, `ARM64`, or `RISC-V`)."
 ],
 diagram:
"1-to-1 Mapping Between Assembly and Binary Machine Code:\n" +
" Assembly Mnemonic ---> 8-Bit Machine Byte (4b Op | 2b Dst | 2b Src)\n" +
" LOAD R1, [R2] ---> 0001 01 10 (Op=0001, R1=01, R2=10)\n" +
" ADD R1, R3 ---> 0010 01 11 (Op=0010, R1=01, R3=11)",
 takeaway: "Machine code is raw binary bitfields for the Control Unit; Assembly is human-readable shorthand for those exact bitfields."
 },
 {
 heading: "2. High-Level Languages: Compilers vs. Interpreters (& JITs)",
 body: [
 "Writing `total = price * qty + tax` shouldn't require rewriting Assembly for Intel x86 and Apple ARM! High-level languages bridge human thought to machine opcodes in two primary ways:",
 "• **Ahead-of-Time (AOT) Compiler** (C, C++, Rust, Go): Reads your entire source program BEFORE execution, checks syntax & types, optimizes across functions, and outputs a standalone native machine-code executable (`0101...`) that runs directly on the CPU at peak speed with no translator needed at runtime.\n• **Interpreter / Bytecode VM** (Python, Ruby, classic JS): Translates and executes source or compact bytecode step-by-step AT RUNTIME inside a host engine. Fast edit-run turnaround and cross-platform portability, though pure interpretation carries per-instruction dispatch overhead - which modern engines (like V8 JavaScript or PyPy) accelerate via **JIT (Just-In-Time) compilation** of hot loops into native machine code!"
 ],
 diagram:
"AOT Compiler: Source.rs ===[ rustc Optimizer ]===> Native Binary ===> CPU\n" +
"Interpreter : Script.py ===[ Python VM Loop ]===> Executes Step-by-Step\n" +
"JIT Hybrid : App.js ===[ Bytecode + Hot-Loop Native Compiler ]===> CPU",
 takeaway: "Compilers pay translation cost up front for raw native speed; Interpreters translate live on the fly; JITs blend both."
 },
 {
 heading: "3. Operating System Kernel Basics: Rings, Virtual Memory & Syscalls",
 body: [
 "What stops a buggy calculator tab from overwriting your banking tab's RAM or wiping SSD sector 0? Hardware + the **Operating System Kernel** (Linux, Windows NT, XNU):",
 "• **CPU Privilege Rings**: The Kernel runs in privileged **Ring 0 (Kernel Mode)** with full hardware access; ordinary apps run in restricted **Ring 3 (User Mode)**.\n• **Virtual Memory (MMU + Page Tables)**: Every process thinks it owns private RAM addresses starting near `0x0000...`, which the CPU's Memory Management Unit translates into isolated physical RAM frames! Touching unmapped memory triggers a Segmentation Fault instead of corrupting another app.\n• **System Calls (`syscall`) & Context Switching**: When an app needs to read a file, draw pixels, or open a socket, it executes a `syscall` instruction - a controlled trap into Ring 0 where the Kernel validates permissions, performs the I/O safely, and returns! Meanwhile, a hardware timer interrupts every few milliseconds so the Kernel Scheduler saves one process's registers (`PC`, `R0..Rn`) and restores the next process's registers (**Context Switch**)."
 ],
 diagram:
"User App (Ring 3) OS Kernel (Ring 0) Hardware\n" +
" write(fd, buf) ===[ syscall ]===> Checks permissions ===[ driver ]===> SSD\n" +
" <==[ return ]<=== Copies status",
 takeaway: "User apps compute in sandboxed virtual memory (Ring 3) and ask the Kernel (Ring 0) via `syscall` for all hardware I/O."
 }
 ],
 concepts: [
 {
 id: "s3m2_c1",
 title: "Decoding Binary Machine Code Bitfields",
 zeroTeach: "A machine instruction packs fields of bits side by side: e.g., in an 8-bit educational ISA `[4-bit Opcode][2-bit DestReg][2-bit SrcReg]`, splitting `0010 01 11` gives Opcode `0010` (`ADD`), Dest `01` (`R1`), Src `11` (`R3`) -> `ADD R1, R3`!",
 concreteExample: "With Opcodes 0001=LOAD, 0010=ADD, 0011=SUB and Regs 00=R0, 01=R1, 10=R2, 11=R3: `0011 10 01` = `SUB R2, R1`.",
 reteachCheck: { instruction: "Type the decoded mnemonic for 0011 10 01:", target: "0011 10 01 -> SUB R2, R1" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var ops = [
 { bits: "0010", name: "ADD" },
 { bits: "0011", name: "SUB" },
 { bits: "0100", name: "XOR" }
 ];
 var regs = ["R0", "R1", "R2", "R3"];
 var op = ops[Math.abs(variantIdx || 0) % ops.length];
 var d = (Math.abs(variantIdx || 0) + 1) % 4;
 var s = (Math.abs(variantIdx || 0) + 2) % 4;
 var word = op.bits + toBin(d, 2) + toBin(s, 2);
 var mnem = op.name + " " + regs[d] + ", " + regs[s];
 var swapped = op.name + " " + regs[s] + ", " + regs[d];
 var lock = adaptLockIn(word + " -> " + mnem, "Type the binary-to-Assembly decode:", weakKeys, stageNum);
 return {
 conceptId: "s3m2_c1",
 conceptTitle: "Decoding Binary Machine Code Bitfields",
 variantIdx: variantIdx || 0,
 prompt: "In an 8-bit ISA `[4b Opcode | 2b Dest | 2b Src]` where `0010=ADD, 0011=SUB, 0100=XOR` and `00=R0, 01=R1, 10=R2, 11=R3`, what instruction is `" + word + "`?",
 options: rotateOptions([
 { text: "`" + mnem + "` (`" + op.bits + "` = `" + op.name + "`, `" + toBin(d, 2) + "` = `" + regs[d] + "`, `" + toBin(s, 2) + "` = `" + regs[s] + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + swapped + "` (swapping Dest and Src bitfields)", isCorrect: false, whyWrong: "Bits `[3:2]` (`" + toBin(d, 2) + "`) encode Dest `" + regs[d] + "`, and bits `[1:0]` (`" + toBin(s, 2) + "`) encode Src `" + regs[s] + "`." },
 { text: "The integer `" + parseInt(word, 2) + "` printed to the monitor.", isCorrect: false, whyWrong: "Fetched into `IR`, `" + word + "` is decoded by the Control Unit as opcode + register bitfields!" },
 { text: "`LOAD R0, R0`", isCorrect: false, whyWrong: "`LOAD` is `0001`, whereas this instruction starts with `" + op.bits + "` (`" + op.name + "`)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s3m2_c2",
 title: "Assembly Language & the Assembler (`1:1` Mapping)",
 zeroTeach: "Assembly replaces raw binary bit patterns (`00100111`) with short mnemonics (`ADD R1, R3`) and symbolic jump labels (`loop_start:`). An Assembler translates those mnemonics nearly 1-to-1 into machine code for that specific CPU ISA.",
 concreteExample: "x86-64 Assembly runs on Intel/AMD chips, whereas ARM64 Assembly runs on Apple M-series / mobile chips because each ISA has different opcodes.",
 reteachCheck: { instruction: "Type what an Assembler translates:", target: "Assembly mnemonics -> binary machine code" }
 }, [
 {
 prompt: "What is the relationship between **Assembly language** and **Machine Code**?",
 options: [
 { text: "Assembly is a human-readable mnemonic representation of a specific CPU's machine instructions, translated nearly 1-to-1 by an Assembler.", isCorrect: true, whyWrong: "" },
 { text: "Assembly runs identically on every CPU architecture (x86, ARM, RISC-V) without translation.", isCorrect: false, whyWrong: "Each CPU architecture (ISA) has its own registers and opcodes, so Assembly is hardware-specific!" },
 { text: "CPUs read ASCII letters `'A'`, `'D'`, `'D'` directly inside the ALU.", isCorrect: false, whyWrong: "The Assembler MUST convert `'ADD'` into binary opcode bits before the CPU Control Unit can decode it." },
 { text: "Assembly is higher-level than Python and JavaScript.", isCorrect: false, whyWrong: "Assembly sits right at the hardware register level, far below Python and JS." }
 ],
 lockInInstruction: "Type the ISA portability fact:",
 lockInTarget: "Assembly is specific to one CPU ISA"
 }
 ]),
 {
 id: "s3m2_c3",
 title: "Immediate Constants vs. Memory Dereferencing (`42` vs. `[42]`)",
 zeroTeach: "`MOV R1, 42` loads the literal number 42 directly into R1 (Immediate mode). `LOAD R1, [42]` goes to RAM mailbox #42 and copies WHATEVER value is stored inside RAM[42] into R1 (Direct Memory / Pointer dereference)!",
 concreteExample: "If RAM[10] holds 99: `MOV R1, 10` sets R1 = 10; `LOAD R1, [10]` sets R1 = 99!",
 reteachCheck: { instruction: "Type the contrast when RAM[10] = 99:", target: "MOV R1, 10 -> 10; LOAD R1, [10] -> 99" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var slots = [
 { addr: 16, val: 85 },
 { addr: 32, val: 200 },
 { addr: 24, val: 77 }
 ];
 var s = slots[Math.abs(variantIdx || 0) % slots.length];
 var isLoad = Math.abs(variantIdx || 0) % 2 === 0;
 var instr = isLoad ? ("LOAD R1, [" + s.addr + "]") : ("MOV R1, " + s.addr);
 var ans = isLoad ? s.val : s.addr;
 var other = isLoad ? s.addr : s.val;
 var lock = adaptLockIn(instr + " -> R1=" + ans, "Type the addressing result:", weakKeys, stageNum);
 return {
 conceptId: "s3m2_c3",
 conceptTitle: "Immediate Constants vs. Memory Addressing",
 variantIdx: variantIdx || 0,
 prompt: "Suppose RAM address `[" + s.addr + "]` currently contains the byte `" + s.val + "`. After executing `" + instr + "`, what value is inside `R1`?",
 options: rotateOptions([
 { text: "`" + ans + "` (" + (isLoad ? "brackets `[" + s.addr + "]` dereference RAM mailbox `" + s.addr + "`" : "no brackets means literal immediate constant `" + s.addr + "`") + ")", isCorrect: true, whyWrong: "" },
 { text: "`" + other + "` (confusing the mailbox address `" + s.addr + "` with its contents `" + s.val + "`)", isCorrect: false, whyWrong: isLoad ? "Brackets `[" + s.addr + "]` fetch the CONTENTS inside RAM slot `" + s.addr + "` (`" + s.val + "`), not the address number!" : "Without brackets, `MOV R1, " + s.addr + "` loads the literal constant `" + s.addr + "` without touching RAM!" },
 { text: "`" + (s.addr + s.val) + "` (adding address and value)", isCorrect: false, whyWrong: "Addressing selects either the literal operand OR `RAM[addr]`, never their sum." },
 { text: "`0`", isCorrect: false, whyWrong: "`R1` receives `" + ans + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s3m2_c4",
 title: "Why High-Level Languages Exist (Abstraction & Portability)",
 zeroTeach: "Grace Hopper's work on early compilers (A-0, FLOW-MATIC) proved humans can write hardware-independent math and structured logic (`if`, `while`, functions), letting toolchains emit optimized machine code for x86-64, ARM64, or RISC-V from one codebase.",
 concreteExample: "One line `total = a * b + c` replaces 4-6 manual register load/mul/add/store Assembly instructions and compiles cleanly across CPU families.",
 reteachCheck: { instruction: "Type the two wins of high-level code:", target: "abstraction + cross-ISA portability" }
 }, [
 {
 prompt: "What two major problems did High-Level Programming Languages solve compared to writing raw Assembly?",
 options: [
 { text: "1) Expressing complex logic concisely (`variables`, `loops`, `functions`), and 2) Portability across different CPU instruction sets via recompilation/VMs.", isCorrect: true, whyWrong: "" },
 { text: "They eliminated the CPU's Fetch-Decode-Execute cycle completely.", isCorrect: false, whyWrong: "Every high-level program STILL executes via Fetch-Decode-Execute once compiled or interpreted!" },
 { text: "They made transistors run on Base-10 voltages.", isCorrect: false, whyWrong: "Hardware underneath remains 100% binary CMOS gates." },
 { text: "High-level code never needs RAM.", isCorrect: false, whyWrong: "High-level variables, arrays, and call stacks all map directly onto RAM and CPU registers." }
 ],
 lockInInstruction: "Type how high-level code runs on silicon:",
 lockInTarget: "high-level source -> machine opcodes -> CPU"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c5",
 title: "Ahead-of-Time (AOT) Compilers",
 zeroTeach: "An Ahead-of-Time Compiler (like clang, gcc, rustc, go build) parses the whole program into an Abstract Syntax Tree (AST), enforces static checks, applies whole-function optimizations, and emits a standalone native machine-code binary BEFORE the user ever runs it.",
 concreteExample: "`rustc main.rs` produces `./main` containing raw x86-64/ARM64 opcodes - users run `./main` directly with zero Rust compiler installed!",
 reteachCheck: { instruction: "Type the AOT compiler pipeline:", target: "source -> AST -> optimizer -> native binary" }
 }, [
 {
 prompt: "What happens when you compile a program with an **Ahead-of-Time (AOT) Compiler** (such as C or Rust)?",
 options: [
 { text: "The entire source program is translated and optimized up front into a native machine-code executable that the CPU runs directly without needing the compiler at runtime.", isCorrect: true, whyWrong: "" },
 { text: "The compiler waits until runtime to translate one character per keystroke.", isCorrect: false, whyWrong: "Step-by-step runtime execution describes an interpreter, not an AOT compiler." },
 { text: "A compiled binary cannot contain machine opcodes.", isCorrect: false, whyWrong: "A native binary IS packed machine opcodes plus static data segments!" },
 { text: "AOT compilation guarantees zero logic bugs in your algorithm.", isCorrect: false, whyWrong: "Compilers catch syntax and type errors, NOT logical bugs like writing `-` when you meant `+`!" }
 ],
 lockInInstruction: "Type what an AOT binary contains:",
 lockInTarget: "standalone native CPU machine code"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c6",
 title: "Interpreters & Bytecode JIT Engines",
 zeroTeach: "An Interpreter reads source code (or compact intermediate bytecode) and executes operations dynamically at runtime inside a host runtime loop. JIT (Just-In-Time) engines start interpreting quickly, profile 'hot' loops executed thousands of times, and compile those hot paths into native machine code on the fly!",
 concreteExample: "Browser JavaScript engines parse `.js` into bytecode immediately for fast startup, then JIT-compile hot functions into fast native assembly.",
 reteachCheck: { instruction: "Type how a JIT speeds up interpreted code:", target: "JIT compiles hot runtime loops to native code" }
 }, [
 {
 prompt: "How does an **Interpreter** differ from an Ahead-of-Time Compiler, and what does a **JIT** add?",
 options: [
 { text: "An Interpreter executes code dynamically step-by-step at runtime without a separate pre-built native binary; a JIT compiles frequently executed 'hot' code paths to native machine code during execution.", isCorrect: true, whyWrong: "" },
 { text: "An Interpreter runs directly on bare transistors without an OS or runtime program.", isCorrect: false, whyWrong: "An interpreter IS itself a native program (like `python3` or browser JS engine) running on the CPU fetching and dispatching your script's operations!" },
 { text: "Interpreted code never uses the ALU.", isCorrect: false, whyWrong: "When the interpreter evaluates `a + b`, the interpreter's own machine instructions drive the exact same hardware ALU!" },
 { text: "JIT stands for 'Jump If True' register.", isCorrect: false, whyWrong: "JIT stands for **Just-In-Time** compilation." }
 ],
 lockInInstruction: "Type the runtime contrast:",
 lockInTarget: "AOT = before run; Interpreter/JIT = during run"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c7",
 title: "Compile-Time / Parse Errors vs. Runtime Errors",
 zeroTeach: "Syntax/parse/static-type errors are caught BEFORE instructions execute because the code structure itself violates grammar or type rules. Runtime errors occur WHILE valid instructions are executing and encounter illegal dynamic state (like dividing by user input `0` or indexing `null`).",
 concreteExample: "`let x = (5 + ;` fails at parse/compile time; `let y = items[i].name` when `items[i]` is `undefined` crashes at runtime!",
 reteachCheck: { instruction: "Type the two error phases:", target: "parse/compile error vs runtime exception" }
 }, [
 {
 prompt: "You write syntactically valid code `return total / count;`. When a user passes `count = 0` ten minutes after launch, what class of event occurs?",
 options: [
 { text: "A **runtime** edge case/error - the grammar was 100% valid at parse/compile time, and the fault arose from dynamic input values during execution.", isCorrect: true, whyWrong: "" },
 { text: "A **lexer syntax** error because `/` is not an operator.", isCorrect: false, whyWrong: "`/` is completely valid division syntax; `count = 0` only surfaces dynamically at runtime." },
 { text: "A physical transistor burnout inside the ALU.", isCorrect: false, whyWrong: "Dividing by zero never harms hardware - integer division traps an OS exception (or returns `Infinity`/`NaN` in IEEE-754 floats)!" },
 { text: "An Assembler mnemonic typo.", isCorrect: false, whyWrong: "The instruction assembled cleanly; the dynamic divisor `0` occurred at runtime." }
 ],
 lockInInstruction: "Type the defensive guard for division:",
 lockInTarget: "if (count === 0) return 0;"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c8",
 title: "OS Kernel Ring 0 vs. User Mode Ring 3",
 zeroTeach: "Modern CPUs enforce hardware privilege levels in a status bit: **Kernel Mode (Ring 0)** can execute privileged instructions (page tables, I/O ports, interrupts); **User Mode (Ring 3)** runs normal apps and immediately triggers a hardware fault if an app tries executing privileged instructions directly!",
 concreteExample: "Your web browser runs in Ring 3; the OS Kernel (Linux/Windows) runs in Ring 0.",
 reteachCheck: { instruction: "Type the privilege boundary:", target: "Ring 0 = OS Kernel, Ring 3 = User Apps" }
 }, [
 {
 prompt: "What happens if an ordinary User-Mode (`Ring 3`) application tries to execute a privileged CPU instruction that directly reprograms SSD hardware registers?",
 options: [
 { text: "The CPU hardware immediately blocks the instruction and raises a privilege-violation trap into the OS Kernel (`Ring 0`), protecting the system.", isCorrect: true, whyWrong: "" },
 { text: "The CPU politely runs it as long as the app promises to be careful.", isCorrect: false, whyWrong: "Security is enforced in SILICON by the CPU privilege bit - Ring 3 apps physically cannot run Ring 0 instructions!" },
 { text: "User apps run in Ring 0 while the OS Kernel runs in Ring 3.", isCorrect: false, whyWrong: "Ring 0 is the innermost, highest-privilege mode reserved strictly for the OS Kernel; apps run in Ring 3." },
 { text: "The RAM melts to protect the SSD.", isCorrect: false, whyWrong: "Hardware traps cleanly terminate the offending process with zero physical damage." }
 ],
 lockInInstruction: "Type how hardware enforces OS isolation:",
 lockInTarget: "CPU privilege bit enforces Ring 0 vs Ring 3"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c9",
 title: "Virtual Memory & Process Address Isolation",
 zeroTeach: "Thanks to the CPU's Memory Management Unit (MMU) and OS Page Tables, every process gets its own private Virtual Address Space. Process A's virtual `0x4000` maps to Physical RAM Frame #120, while Process B's virtual `0x4000` maps to Physical RAM Frame #895 - they never collide!",
 concreteExample: "Even if a pointer bug crashes App A with a Segfault, App B's physical RAM frames are not even mapped in App A's page table!",
 reteachCheck: { instruction: "Type what translates virtual to physical RAM:", target: "MMU + OS Page Tables isolate process RAM" }
 }, [
 {
 prompt: "How can two separate programs run simultaneously and BOTH store different values at address `0x00401000` without overwriting each other?",
 options: [
 { text: "Each process uses **Virtual Addresses** that the CPU's MMU + OS Page Tables translate into completely separate **Physical RAM** frames!", isCorrect: true, whyWrong: "" },
 { text: "Each app physically owns a separate RAM stick on the motherboard.", isCorrect: false, whyWrong: "Hundreds of processes share the exact same physical RAM sticks safely via 4 KiB page-table mappings!" },
 { text: "One app runs in binary and the other runs in ternary.", isCorrect: false, whyWrong: "All processes use binary; MMU virtual-to-physical translation keeps their memory spaces isolated." },
 { text: "They actually DO overwrite each other, and apps just guess when to re-write.", isCorrect: false, whyWrong: "Shared corruption was a nightmare on 1980s unprotected systems; modern Virtual Memory prevents cross-process overwrites in hardware!" }
 ],
 lockInInstruction: "Type the virtual memory equation:",
 lockInTarget: "Virtual Addr --[MMU Page Table]--> Physical Addr"
 }
 ]),
 scenarioBankConcept({
 id: "s3m2_c10",
 title: "System Calls (`syscall`) & Preemptive Context Switching",
 zeroTeach: "Since User-Mode apps cannot touch disks/network/screens directly, they put arguments in registers and invoke `syscall`, which safely transitions the CPU to Ring 0 at a fixed Kernel entry point. And to run 200 processes on 8 cores, a timer interrupt triggers the Kernel Scheduler to save Process A's registers (`PC`, `SP`, `R0..Rn`) and load Process B's registers (**Context Switch**).",
 concreteExample: "`console.log('hi')` / `print('hi')` ultimately invokes an OS `write` syscall to display bytes on terminal/UI.",
 reteachCheck: { instruction: "Type the safe Ring 3 -> Ring 0 doorway:", target: "syscall traps safely into OS Kernel" }
 }, [
 {
 prompt: "How does a sandboxed Ring 3 program legitimately save a file to disk, and how do 100 programs share an 8-core CPU smoothly?",
 options: [
 { text: "Apps issue a controlled `syscall` trap so the Ring 0 Kernel validates and performs I/O; hardware timer interrupts let the Kernel save/restore register state (**Context Switch**) across processes.", isCorrect: true, whyWrong: "" },
 { text: "Apps disable the OS Kernel whenever they open a file.", isCorrect: false, whyWrong: "Disabling the kernel from Ring 3 is impossible; `syscall` asks the Kernel to perform the operation on the app's behalf." },
 { text: "Only 8 programs can ever be open at once on an 8-core computer.", isCorrect: false, whyWrong: "Time-slicing via preemptive Context Switching lets 8 cores run hundreds of processes concurrently!" },
 { text: "Context switching deletes all variables in RAM every millisecond.", isCorrect: false, whyWrong: "A Context Switch saves registers (`PC`, stack pointer, general regs) into the Process Control Block so execution resumes at the exact next instruction!" }
 ],
 lockInInstruction: "Type what a Context Switch saves and restores:",
 lockInTarget: "context switch saves & restores PC + registers"
 }
 ])
 ]
 }
 ];

 // ==========================================================================
 // STAGE 4: NO-LOOK TOUCH TYPING, SYMBOLS, AND SHORTCUTS
 // ==========================================================================

 var stage4Modules = [
 {
 id: "s4m1",
 stageId: "stage4",
 stageNumber: 4,
 code: "4.1",
 title: "No-Look Touch Typing: F & J Tactile Anchors, Alphabet & Numbers",
 subtitle: "Building 100% eyes-on-screen proprioception from F & J physical bumps across every letter, number, and opposite-hand Shift.",
 estimatedMinutes: 20,
 simulatorType: "finger-columns",
 lessonSections: [
 {
 heading: "1. Why Looking Down Destroys Coding Flow (Proprioception & F/J Bumps)",
 body: [
 "Every time a programmer glances down at the physical keyboard to hunt for `{`, `;`, or `7`, three costly things happen: 1) your eyes lose your cursor position on screen (~400-700 ms visual re-acquisition penalty), 2) you only notice typos AFTER finishing a word instead of the instant they occur, and 3) your working memory drops the logic problem you were holding!",
 "Look at your physical `F` and `J` keys right now - or better yet, FEEL them without looking: both keys have raised **tactile homing ridges**. Rest your **Left Index on `F`** and **Right Index on `J`**. Your remaining fingers fall naturally onto:\n• Left Hand Home Row: `A` (Pinky), `S` (Ring), `D` (Middle), `F` (Index - reaches `G` too)\n• Right Hand Home Row: `J` (Index - reaches `H` too), `K` (Middle), `L` (Ring), `;` (Pinky - reaches `'` and `Enter`)\n• Thumbs: Hover lightly over the `Spacebar`."
 ],
 diagram:
"8-Finger Home-Row Anchor (Eyes Stay on Screen 100% of the Time!):\n" +
" Left Hand : [A:Pinky] [S:Ring] [D:Middle] [F_:Index] (->G)\n" +
" Right Hand: (H<-) [J_:Index] [K:Middle] [L:Ring] [;:Pinky] (->' Enter)\n" +
" [ Spacebar : Thumbs ]",
 takeaway: "Never float aimlessly: extend one finger to strike its key, then snap it right back to its A-S-D-F / J-K-L-; home-row anchor!"
 },
 {
 heading: "2. Vertical Finger Columns: Alphabet & Number Row Triangulation",
 body: [
 "Standard keyboards are organized into diagonal-vertical **finger columns**. Each finger owns one column (index fingers own two center columns):\n• Left Pinky: `1 Q A Z` | Left Ring: `2 W S X` | Left Middle: `3 E D C` | Left Index: `4 R F V` & `5 T G B`\n• Right Index: `6 Y H N` & `7 U J M` | Right Middle: `8 I K ,` | Right Ring: `9 O L .` | Right Pinky: `0 P ; /` plus `- = [ ] \\ '`\n• **The Opposite-Hand Shift Law**: Whenever you type a capital letter or shifted symbol, hold `Shift` with the **OPPOSITE hand's pinky**! Typing `T` (`Left Index`) uses `Right Shift` (`Right Pinky`); typing `{` or `P` (`Right Pinky`) uses `Left Shift` (`Left Pinky`). Same-hand twisting is the #1 cause of developer wrist strain and adjacent-key typos!"
 ],
 diagram:
"Column Ownership Map:\n" +
" LPinky LRing LMid LIndex | RIndex RMid RRing RPinky\n" +
" 1 2 3 4 5 | 6 7 8 9 0 - =\n" +
" Q W E R T | Y U I O P [ ] \\\n" +
" A S D [F] G | H [J] K L ; '\n" +
" Z X C V B | N M , . /",
 takeaway: "Opposite-hand Shift keeps both wrists straight and home-row anchors intact."
 }
 ],
 concepts: [
 scenarioBankConcept({
 id: "s4m1_c1",
 title: "F & J Physical Tactile Bumps & Home-Row Base",
 zeroTeach: "Physical keyboards mold raised bumps on `F` (Left Index) and `J` (Right Index) so you can align all 8 fingers (`A S D F` and `J K L ;`) purely by touch in total darkness without ever looking down.",
 concreteExample: "After reaching `Backspace` or `{`, feeling the `J` ridge under your Right Index instantly recalibrates your entire right hand.",
 reteachCheck: { instruction: "Type the 8 home-row keys with space:", target: "asdf jkl;" }
 }, [
 {
 prompt: "Why do `F` and `J` have physical raised ridges on every standard keyboard, and which fingers rest on them?",
 options: [
 { text: "**Left Index (`F`)** and **Right Index (`J`)** feel those tactile bumps to calibrate all 8 home-row fingers (`A S D F` / `J K L ;`) without looking down!", isCorrect: true, whyWrong: "" },
 { text: "Left Pinky (`F`) and Right Pinky (`J`) rest on them to reach `Ctrl`.", isCorrect: false, whyWrong: "Pinkies rest on `A` and `;`! Index fingers anchor on `F` and `J`." },
 { text: "Thumbs rest on `F` and `J` while index fingers press `Space`.", isCorrect: false, whyWrong: "Thumbs rest on `Spacebar`; index fingers rest on `F` and `J`." },
 { text: "They indicate broken keys from manufacturing.", isCorrect: false, whyWrong: "They are precision ergonomic homing bars standardized across ISO/ANSI keyboards!" }
 ],
 lockInInstruction: "Type the home-row calibration drill blindfolded:",
 lockInTarget: "asdf jkl; fjdk slei"
 }
 ]),
 {
 id: "s4m1_c2",
 title: "Left-Hand Vertical Finger Columns (`1QAZ` .. `5TGB`)",
 zeroTeach: "Left-hand column map: Left Pinky = `1 Q A Z`; Left Ring = `2 W S X`; Left Middle = `3 E D C`; Left Index = `4 R F V` AND inner column `5 T G B`.",
 concreteExample: "From `D` (Left Middle), moving 1 row up hits `E`, 2 rows up hits `3`, and 1 row down hits `C`.",
 reteachCheck: { instruction: "Type the Left-Middle and Left-Index columns:", target: "3edc 4rfv 5tgb" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cols = [
 { finger: "Left Middle (`D` anchor)", keys: "`3`, `E`, `D`, `C`", drill: "3edc ded cec 3de" },
 { finger: "Left Ring (`S` anchor)", keys: "`2`, `W`, `S`, `X`", drill: "2wsx sws xsx 2ws" },
 { finger: "Left Index (`F` anchor)", keys: "`4`, `R`, `F`, `V` and `5`, `T`, `G`, `B`", drill: "4rfv 5tgb frf fgf" }
 ];
 var c = cols[Math.abs(variantIdx || 0) % cols.length];
 var lock = adaptLockIn(c.drill, "Type this left-hand column drill without glancing down:", weakKeys, stageNum);
 return {
 conceptId: "s4m1_c2",
 conceptTitle: "Left-Hand Vertical Finger Columns",
 variantIdx: variantIdx || 0,
 prompt: "In proper touch-typing technique, which vertical set of keys belongs to your **" + c.finger + "**?",
 options: rotateOptions([
 { text: c.keys, isCorrect: true, whyWrong: "" },
 { text: "`7`, `U`, `J`, `M`", isCorrect: false, whyWrong: "`7 U J M` is on the RIGHT hand (`Right Index` anchored on `J`)." },
 { text: "`9`, `O`, `L`, `.`", isCorrect: false, whyWrong: "`9 O L .` belongs to `Right Ring` (`L` anchor)." },
 { text: "Every key on the top row is pressed only with the index finger.", isCorrect: false, whyWrong: "Each finger moves vertically within its own column (`Q W E R T`) rather than hunting horizontally with one finger!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m1_c3",
 title: "Right-Hand Vertical Finger Columns (`6YHN` .. `0P;/`)",
 zeroTeach: "Right-hand column map: Right Index = `6 Y H N` & `7 U J M`; Right Middle = `8 I K ,`; Right Ring = `9 O L .`; Right Pinky = `0 P ; /` (plus `- = [ ] \\ '`).",
 concreteExample: "From `K` (Right Middle), 1 row up is `I`, 2 rows up is `8`, and 1 row down is comma `,`.",
 reteachCheck: { instruction: "Type the Right-Hand columns blindfolded:", target: "7ujm 8ik, 9ol. 0p;/" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cols = [
 { finger: "Right Middle (`K` anchor)", keys: "`8`, `I`, `K`, `,`", drill: "8ik, kik ,k, 8ik" },
 { finger: "Right Ring (`L` anchor)", keys: "`9`, `O`, `L`, `.`", drill: "9ol. lol .l. 9ol" },
 { finger: "Right Index (`J` anchor)", keys: "`6`, `Y`, `H`, `N` and `7`, `U`, `J`, `M`", drill: "6yhn 7ujm juj jhj" }
 ];
 var c = cols[Math.abs(variantIdx || 0) % cols.length];
 var lock = adaptLockIn(c.drill, "Type this right-hand column drill eyes-on-screen:", weakKeys, stageNum);
 return {
 conceptId: "s4m1_c3",
 conceptTitle: "Right-Hand Vertical Finger Columns",
 variantIdx: variantIdx || 0,
 prompt: "Which set of keys is struck by your **" + c.finger + "** while your hand stays centered near `J`?",
 options: rotateOptions([
 { text: c.keys, isCorrect: true, whyWrong: "" },
 { text: "`3`, `E`, `D`, `C`", isCorrect: false, whyWrong: "`3 E D C` belongs to `Left Middle` (`D` anchor)." },
 { text: "`1`, `Q`, `A`, `Z`", isCorrect: false, whyWrong: "`1 Q A Z` belongs to `Left Pinky` (`A` anchor)." },
 { text: "`Spacebar` only", isCorrect: false, whyWrong: "Thumbs own the `Spacebar`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m1_c4",
 title: "The Opposite-Hand `Shift` Law",
 zeroTeach: "Always hold `Shift` with the pinky of the hand NOT pressing the character key! Left-hand keys (`Q W E R T A S D F G Z X C V B 1..5`) pair with `Right Shift`; Right-hand keys (`Y U I O P H J K L N M 6..0 [ ] ; ' , . /`) pair with `Left Shift`.",
 concreteExample: "To type `{` (shifted `[`, Right Pinky), hold `Left Shift` with Left Pinky and tap `[` with Right Pinky - zero wrist twist!",
 reteachCheck: { instruction: "Type mixed-case words using opposite Shift:", target: "True False Null Array" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var items = [
 { ch: "{", keyHand: "Right Pinky (`[`)", shiftUsed: "Left Shift (Left Pinky)", drill: "if (ok) { return True; }" },
 { ch: "R", keyHand: "Left Index (`r`)", shiftUsed: "Right Shift (Right Pinky)", drill: "Result = ReadRow(4);" },
 { ch: "(", keyHand: "Right Ring (`9`)", shiftUsed: "Left Shift (Left Pinky)", drill: "fn(a, b) + calc(x, y)" }
 ];
 var it = items[Math.abs(variantIdx || 0) % items.length];
 var wrongShift = it.shiftUsed.indexOf("Left") === 0 ? "Right Shift (twisting the same right hand)" : "Left Shift (twisting the same left hand)";
 var lock = adaptLockIn(it.drill, "Type using strict opposite-hand Shift:", weakKeys, stageNum);
 return {
 conceptId: "s4m1_c4",
 conceptTitle: "Opposite-Hand Shift Discipline",
 variantIdx: variantIdx || 0,
 prompt: "To type `" + it.ch + "` (located on " + it.keyHand + ") cleanly at speed without pulling your fingers off home row, which modifier key should you hold?",
 options: rotateOptions([
 { text: "**" + it.shiftUsed + "** - opposite-hand `Shift` keeps both wrists neutral and anchors intact!", isCorrect: true, whyWrong: "" },
 { text: wrongShift, isCorrect: false, whyWrong: "Same-hand Shift forces awkward hand contortion and pulls your index finger off its `F`/`J` bump, causing adjacent-key slips!" },
 { text: "Toggle `Caps Lock` ON, press the key, then toggle `Caps Lock` OFF.", isCorrect: false, whyWrong: "`Caps Lock` doesn't even shift symbol/number keys like `{` or `(`, and adds two wasted keystrokes per capital!" },
 { text: "Press `Shift` with your thumb.", isCorrect: false, whyWrong: "Thumbs stay on `Spacebar`; pinkies press outer `Shift` keys." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s4m1_c5",
 title: "Thumb Spacebar & Rhythm Discipline",
 zeroTeach: "Only thumbs press `Spacebar` (most touch typists use Right Thumb, or alternate thumbs smoothly). Using an index finger on Spacebar yanks your hand downward off `F`/`J` on every single word!",
 concreteExample: "Typing 60 WPM triggers ~60 spaces/minute - keeping `F`/`J` parked while the thumb taps Space eliminates 60 hand resets per minute.",
 reteachCheck: { instruction: "Type steady spaced words keeping index on F/J:", target: "fast clean code flows from calm hands" }
 }, [
 {
 prompt: "Why must `Spacebar` strictly be pressed with a **Thumb** rather than dropping an Index finger down from `F` or `J`?",
 options: [
 { text: "Your thumbs naturally rest right above `Spacebar`, keeping `F` and `J` index anchors parked for zero-latency transition into the next word!", isCorrect: true, whyWrong: "" },
 { text: "Index fingers are too weak to actuate the Spacebar switch.", isCorrect: false, whyWrong: "It's about positional geometry, not strength: dropping an index finger breaks your home-row reference every word!" },
 { text: "Pressing Spacebar with an index finger types two spaces.", isCorrect: false, whyWrong: "Any finger actuates one space, but index-dropping destroys blind home-row alignment." },
 { text: "Spacebar is owned by the Right Pinky.", isCorrect: false, whyWrong: "Right Pinky owns `; ' [ ] Enter`, never `Spacebar`." }
 ],
 lockInInstruction: "Type smoothly with thumb spaces:",
 lockInTarget: "let sum = left + right + carry;"
 }
 ]),
 scenarioBankConcept({
 id: "s4m1_c6",
 title: "Inner-Column Index Reaches (`G`, `H`, `T`, `Y`, `B`, `N`)",
 zeroTeach: "Because 8 fingers cover 10 letter columns, your strongest, most agile fingers - Left Index (`F`) and Right Index (`J`) - each cover ONE adjacent inner column (`G, T, B, 5` for Left Index; `H, Y, N, 6` for Right Index), then snap right back to the `F`/`J` bump!",
 concreteExample: "Typing `the`: Left Index reaches `t`, Right Index reaches `h`, Left Middle taps `e`.",
 reteachCheck: { instruction: "Type inner-index reach words blindfolded:", target: "the byte high night bright" }
 }, [
 {
 prompt: "Which fingers properly press the center keys `G` and `H` on the home row?",
 options: [
 { text: "**Left Index** reaches laterally from `F` to `G` (and snaps back to `F`); **Right Index** reaches laterally from `J` to `H` (and snaps back to `J`).", isCorrect: true, whyWrong: "" },
 { text: "Thumbs reach up over the bottom row to press `G` and `H`.", isCorrect: false, whyWrong: "Curling thumbs up two rows collides with your index fingers and ruins posture." },
 { text: "Right Index presses both `G` and `H`.", isCorrect: false, whyWrong: "Crossing the keyboard midline pulls Right Index two columns away from `J`." },
 { text: "Middle fingers cross over index fingers to hit `G` and `H`.", isCorrect: false, whyWrong: "Never cross fingers; lateral index extension is 1 key wide." }
 ],
 lockInInstruction: "Type this inner-column reach phrase:",
 lockInTarget: "growth through bright logic gates"
 }
 ]),
 {
 id: "s4m1_c7",
 title: "Blind Number-Row Triangulation (`1-5` Left, `6-0` Right)",
 zeroTeach: "Numbers sit two rows up along the exact same finger columns: `1`(LP), `2`(LR), `3`(LM), `4,5`(LI), `6,7`(RI), `8`(RM), `9`(RR), `0`(RP). Keep at least one anchor finger grazing home row while reaching up so your hand springs right back!",
 concreteExample: "For `256`: `2` (Left Ring), `5` (Left Index), `6` (Right Index).",
 reteachCheck: { instruction: "Type powers of two without looking down:", target: "1 2 4 8 16 32 64 128 256 512 1024" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var drills = [
 { seq: "128 + 64 + 32 = 224", ask: "`8` and `9`", ans: "`8` with Right Middle (`K` column) and `9` with Right Ring (`L` column)" },
 { seq: "256 * 4 = 1024", ask: "`2` and `4`", ans: "`2` with Left Ring (`S` column) and `4` with Left Index (`F` column)" },
 { seq: "port = 8080; max = 65535;", ask: "`8` and `0`", ans: "`8` with Right Middle (`K` column) and `0` with Right Pinky (`;` column)" }
 ];
 var d = drills[Math.abs(variantIdx || 0) % drills.length];
 var lock = adaptLockIn(d.seq, "Type the numeric expression without looking at the number row:", weakKeys, stageNum);
 return {
 conceptId: "s4m1_c7",
 conceptTitle: "Blind Number-Row Triangulation",
 variantIdx: variantIdx || 0,
 prompt: "Without looking down at the top number row, which fingers reach up to type " + d.ask + "?",
 options: rotateOptions([
 { text: d.ans, isCorrect: true, whyWrong: "" },
 { text: "Lift your entire right hand off the keyboard and poke every number with your right index finger.", isCorrect: false, whyWrong: "Single-finger pecking forces your eyes down and loses home-row alignment!" },
 { text: "Use thumbs for all digits `0` through `9`.", isCorrect: false, whyWrong: "Thumbs stay on `Spacebar`; each column finger reaches two rows up to its matching digit." },
 { text: "Left Pinky types all ten numbers from `1` to `0`.", isCorrect: false, whyWrong: "Left Pinky only owns `` ` `` and `1`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s4m1_c8",
 title: "Zero-Glance Error Recovery (`Backspace` & `Ctrl+Backspace`)",
 zeroTeach: "Everyone makes occasional keystroke slips! The pro habit is correcting WITHOUT looking down: extend Right Pinky to `Backspace` for 1-character slips, or tap `Ctrl+Backspace` to clear a garbled word cleanly in 1 chord while keeping `J` within index reach.",
 concreteExample: "Mistyped `funtcion`? Instead of tapping Backspace 6 times, `Ctrl+Backspace` deletes the whole token instantly.",
 reteachCheck: { instruction: "Type this clean recovery reminder:", target: "eyes on screen; Right Pinky reaches Backspace" }
 }, [
 {
 prompt: "When you spot a typo on screen mid-word, what is the fastest touch-typing recovery habit?",
 options: [
 { text: "Keep your eyes strictly on the screen, extend Right Pinky to `Backspace` (or `Ctrl+Backspace` for a whole word), and immediately re-feel the `J` bump.", isCorrect: true, whyWrong: "" },
 { text: "Look down at the keyboard to locate `Backspace`, then look down again to find `F` and `J`.", isCorrect: false, whyWrong: "Two downward glances waste >1 second and prevent your pinky from learning the physical distance to `Backspace`!" },
 { text: "Use the mouse to drag-select the typo and right-click Cut.", isCorrect: false, whyWrong: "Reaching for the mouse mid-typing costs 1.5-2.5 seconds compared to a 120ms pinky tap!" },
 { text: "Leave all syntax typos in code so you type faster.", isCorrect: false, whyWrong: "Unfixed typos in variable names or brackets cause immediate syntax/reference errors!" }
 ],
 lockInInstruction: "Type this clean accuracy phrase:",
 lockInTarget: "keep eyes up; feel J bump after Backspace"
 }
 ]),
 scenarioBankConcept({
 id: "s4m1_c9",
 title: "Visual Context-Switch Penalty vs. Muscle Memory",
 zeroTeach: "Cognitive ergonomics research shows shifting gaze from monitor -> keyboard -> monitor costs ~400-700 ms per glance plus eye refocusing fatigue. Using the on-screen visual keyboard guide trains muscle memory (proprioception) while keeping gaze 100% in the code viewport!",
 concreteExample: "Even at a calm 35 WPM eyes-up, zero-glance typing beats 55 WPM burst-and-peek on code full of `{ } ( ) ; =>`!",
 reteachCheck: { instruction: "Type the on-screen guide rule:", target: "check on-screen guide, never physical keys" }
 }, [
 {
 prompt: "Why should you glance at the **on-screen visual keyboard** (if unsure of a symbol's position) rather than looking down at your physical keyboard?",
 options: [
 { text: "Keeping your gaze on the screen avoids focal-distance switching, preserves cursor awareness, and forces your fingers to map keys by physical touch (`F`/`J` reference)!", isCorrect: true, whyWrong: "" },
 { text: "Physical keycaps display random wrong letters.", isCorrect: false, whyWrong: "Physical legends are accurate, but looking down trains visual dependence instead of tactile proprioception!" },
 { text: "Looking down disables browser `localStorage`.", isCorrect: false, whyWrong: "It's purely neuromuscular training: tactile feedback builds permanent blind accuracy." },
 { text: "Touch typists never type numbers or symbols.", isCorrect: false, whyWrong: "Touch typing shines MOST on dense developer symbols (`{} [] () => ===`)!" }
 ],
 lockInInstruction: "Type the proprioception principle:",
 lockInTarget: "eyes stay on code; fingers map by touch"
 }
 ]),
 scenarioBankConcept({
 id: "s4m1_c10",
 title: "Metronomic Cadence Over Rushed Error Bursts",
 zeroTeach: "Every 1 typo requires detecting the error + pressing Backspace + retyping the right key = **3+ keystrokes of time**! Slowing down 10% on tricky symbol transitions (like `=> {`) to hit 98%+ accuracy yields HIGHER Net WPM than rushing at 82% accuracy.",
 concreteExample: "100 keys with 0 errors = 100 keystrokes; 100 keys with 12 errors = ~124+ keystrokes plus hesitation stalls!",
 reteachCheck: { instruction: "Type the cadence principle:", target: "smooth accuracy builds real net speed" }
 }, [
 {
 prompt: "Why does maintaining a smooth, steady rhythm at `97-99%` accuracy produce higher real coding WPM than frantic bursting at `84%` accuracy?",
 options: [
 { text: "Each error costs at least 3 keystrokes (wrong key + Backspace + correct key) plus hesitation recovery, destroying Net WPM and breaking flow!", isCorrect: true, whyWrong: "" },
 { text: "Keyboards lock out for 5 seconds whenever you press Backspace.", isCorrect: false, whyWrong: "There is no hardware lockout - the 3x stroke penalty and cognitive stall alone explain why accuracy drives speed!" },
 { text: "Net WPM ignores errors completely.", isCorrect: false, whyWrong: "Net WPM explicitly penalizes errors and wasted correction time!" },
 { text: "Typing slowly is only useful on mechanical relays.", isCorrect: false, whyWrong: "Even cadence reduces key-to-key hesitation spikes (`p90` latency) on every keyboard." }
 ],
 lockInInstruction: "Type this smooth rhythm code line:",
 lockInTarget: "const netSpeed = accuracy * rhythm;"
 }
 ])
 ]
 },
 {
 id: "s4m2",
 stageId: "stage4",
 stageNumber: 4,
 code: "4.2",
 title: "Heavy Developer Symbols & Safe In-App Shortcut Mastery",
 subtitle: "Right-pinky braces/brackets/quotes/operators without looking down, plus word navigation, line editing, selection, and terminal shortcuts.",
 estimatedMinutes: 25,
 simulatorType: "symbol-chord-map",
 lessonSections: [
 {
 heading: "1. Mastering the Right-Pinky Developer Symbol Cluster",
 body: [
 "Prose uses mostly `a-z`, space, comma, and period. Code is packed with punctuation concentrated around your **Right Pinky**! Memorize their exact landmarks relative to your home-row `;` pinky and `P` above it:\n• **Brackets & Braces** (`[` `]` and `{` `}`): One row UP from `;` is `P`. Immediately right of `P` sit `[` and `]`! Tap unshifted for array brackets `[i]`, or hold **Left Shift** + `[` / `]` for block braces `{ }`!\n• **Semicolon, Colon & Quotes** (`;` `:` and `'` `\"`): `;` is literally sitting right under your Right Pinky on home row! Hold `Left Shift + ;` for `:`. One key right of `;` is single quote `'`, and `Left Shift + '` gives double quote `\"`! Backtick `` ` `` and tilde `~` live at top-left (`Left Pinky` left of `1`).\n• **Parentheses & Angle Brackets** (`(` `)` and `<` `>`): Hold `Left Shift` + `9` (Right Ring) for `(` and `0` (Right Pinky) for `)`. Hold `Left Shift` + `,` (Right Middle) for `<` and `.` (Right Ring) for `>`."
 ],
 diagram:
"Right-Hand Symbol Landmarks (Hold LEFT SHIFT for top legend!):\n" +
" Number Row: ... [ 8/* ] [ 9/( ] [ 0/) ] [ -/_ ] [ =/+ ]\n" +
" Top Row : ... [ I ] [ O ] [ P ] [ [/{ ] [ ]/} ] [ \\/| ]\n" +
" Home Row : ... [ K ] [ L ] [ ;/: ] [ '/\" ] [ Enter ]\n" +
" Bottom Row: ... [ ,/< ] [ ./> ] [ //? ]",
 takeaway: "Every pair lives side-by-side: `()` on `9,0`, `[]`/`{}` right of `P`, `<>` on `,.`, `;:` and `'\"` on home row!"
 },
 {
 heading: "2. Operators, Slashes & Pipes (`===`, `!==`, `=>`, `&&`, `||`, `/`, `\\`)",
 body: [
 "• **Equals, Plus & Arrow (`=`, `+`, `===`, `=>`)**: Two keys right of `0` sits `=` (unshifted! `+` is `Left Shift + =`). That means `=>` (arrow function) is `=` -> `Left Shift + .` (`>`), and strict equality `===` is three crisp taps of `=`!\n• **Boolean & Bitwise Operators (`!`, `&&`, `||`)**: `!` is `Right Shift + 1` (Left Pinky); `&` is `Left Shift + 7` (Right Index, so `&&` is a double tap right above `U`/`J`!); `|` (pipe) is `Left Shift + \\` (Right Pinky at the far right of top row, so `||` is double-tapping shifted backslash!).\n• **Forward Slash vs. Backslash (`/` vs. `\\`)**: Forward slash `/` (division, URLs, `//` comments) sits on bottom row right of `.` (`Right Pinky`). Backslash `\\` (escape sequences like `\\n`) sits above `Enter`!"
 ],
 diagram:
"High-Frequency Developer Bigrams:\n" +
" () -> LShift + (9 then 0) {} -> LShift + ([ then ])\n" +
" => -> = then (LShift + .) === -> = = =\n" +
" !== -> (RShift+1) then = = && -> LShift + 7 7\n" +
" || -> LShift + \\ \\ // -> / / (bottom-right pinky)",
 takeaway: "Pause 100ms before symbol chords to place Left Shift cleanly first, then strike with Right Hand."
 },
 {
 heading: "3. High-Leverage Editor & Terminal Keyboard Shortcuts",
 body: [
 "Watching a developer hold the Left Arrow key for 4 seconds to cross a line - or grab the mouse to delete one line - is watching wasted energy. Four families of universal shortcuts work across VS Code, JetBrains, browsers, and terminals:\n1) **Word & Line Navigation**: `Ctrl+Left` / `Ctrl+Right` jumps whole words (`Opt+Left/Right` on Mac); `Home` / `End` teleports to start/end of the line.\n2) **Precision Selection**: Add `Shift` to ANY navigation move! `Ctrl+Shift+Left/Right` selects whole words; `Shift+Home` / `Shift+End` selects to line start/end; `Ctrl+A` selects all.\n3) **Fast Line Editing**: `Ctrl+Backspace` deletes previous word; `Ctrl+/` toggles `//` line comment; `Alt+Up` / `Alt+Down` moves the current line up/down without copy-paste; `Ctrl+Shift+K` deletes the entire line.\n4) **Terminal / Readline Control**: `Ctrl+C` sends `SIGINT` to stop a runaway command; `Ctrl+L` clears terminal viewport; `Ctrl+A` / `Ctrl+E` jumps to start/end of shell command; `Ctrl+U` clears text before cursor; `Ctrl+R` searches command history!"
 ],
 diagram:
"Composable Shortcut Grammar:\n" +
" Move 1 char : Left / Right\n" +
" Move 1 WORD : Ctrl + Left / Right\n" +
" SELECT 1 word: Ctrl + Shift + Left / Right (Shift = Select!)\n" +
" DELETE 1 word: Ctrl + Backspace",
 takeaway: "`Ctrl` scales movement from characters to words; `Shift` turns any movement into a selection!"
 }
 ],
 concepts: [
 {
 id: "s4m2_c1",
 title: "Braces `{ }` & Square Brackets `[ ]` Without Looking",
 zeroTeach: "Right of `P` on the top row sit `[` and `]` (Right Pinky). Unshifted gives square brackets `[0]` for arrays; holding `Left Shift` gives curly braces `{ }` for code blocks and objects!",
 concreteExample: "`const box = { items: [1, 2] };`",
 reteachCheck: { instruction: "Type nested braces and brackets blindfolded:", target: "{ a: [0], b: [1, 2] }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var snippets = [
 "if (ready) { list[0] = 1; }",
 "const map = { ids: [4, 8] };",
 "while (ok) { arr[i] = 0; }"
 ];
 var sn = snippets[Math.abs(variantIdx || 0) % snippets.length];
 var lock = adaptLockIn(sn, "Type the brace & bracket snippet without looking down:", weakKeys, stageNum);
 return {
 conceptId: "s4m2_c1",
 conceptTitle: "Braces { } & Brackets [ ] Landmark",
 variantIdx: variantIdx || 0,
 prompt: "Where do `[ ]` and `{ }` live on a standard ANSI keyboard, and how do you switch between them cleanly?",
 options: rotateOptions([
 { text: "One row up right of `P` (`Right Pinky`): tap unshifted for `[ ]`, or hold `Left Shift` (`Left Pinky`) + `[ ]` for `{ }`.", isCorrect: true, whyWrong: "" },
 { text: "On digits `7` and `8` using `Right Shift`.", isCorrect: false, whyWrong: "Shifted `7` and `8` are `&` and `*`; `[ ]` and `{ }` sit to the right of `P`." },
 { text: "On comma `,` and period `.`.", isCorrect: false, whyWrong: "Shifted `,` and `.` produce angle brackets `< >`, not `[ ]` or `{ }`." },
 { text: "Hold `Right Shift` and press `[` with the same right pinky.", isCorrect: false, whyWrong: "You can't cleanly hold `Right Shift` and tap `[` with the same Right Pinky - always use `Left Shift`!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m2_c2",
 title: "Parentheses `( )` & Angle Brackets `< >`",
 zeroTeach: "Parentheses `( )` sit on `Left Shift + 9` (`Right Ring`) and `Left Shift + 0` (`Right Pinky`). Angle brackets `< >` sit on `Left Shift + ,` (`Right Middle`) and `Left Shift + .` (`Right Ring`).",
 concreteExample: "`if (a < b && c > 0) { run(); }`",
 reteachCheck: { instruction: "Type parentheses and comparisons blindfolded:", target: "fn(x) < max(a, b) && y > 0" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var snippets = [
 "if (x < 10 && y > 2) { go(x); }",
 "const ok = (min < val) && (val > 0);",
 "check(a < b, c > d);"
 ];
 var sn = snippets[Math.abs(variantIdx || 0) % snippets.length];
 var lock = adaptLockIn(sn, "Type the parentheses & angle-bracket line blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s4m2_c2",
 conceptTitle: "Parentheses ( ) & Angle Brackets < >",
 variantIdx: variantIdx || 0,
 prompt: "Which exact key chords produce `(` `)` and `<` `>` without looking down?",
 options: rotateOptions([
 { text: "`Left Shift` + `9`/`0` (`Right Ring`/`Pinky`) for `( )`, and `Left Shift` + `,`/`.` (`Right Middle`/`Ring`) for `< >`.", isCorrect: true, whyWrong: "" },
 { text: "`Right Shift` + `1`/`2` for `( )`.", isCorrect: false, whyWrong: "Shifted `1` and `2` are `!` and `@`; `( )` live on `9` and `0`!" },
 { text: "Unshifted `[` and `]` produce `( )`.", isCorrect: false, whyWrong: "Unshifted `[` and `]` are square brackets; `( )` are shifted `9` and `0`." },
 { text: "`Alt` + `K`/`L` produces `< >`.", isCorrect: false, whyWrong: "`<` and `>` sit directly on shifted `,` and `.` on the bottom row." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m2_c3",
 title: "Semicolons `;`, Colons `:`, Quotes `' \"` & Backticks `` ` ``",
 zeroTeach: "`;` is directly under your Right Pinky home anchor! `Left Shift + ;` = `:`. One key right of `;` is `'`, and `Left Shift + '` = `\"`. Backtick `` ` `` (for JS template strings) sits at the top-left corner left of `1` (`Left Pinky`).",
 concreteExample: "``const msg = `id: ${id}`; const tag = \"ok\";``",
 reteachCheck: { instruction: "Type quotes, colons, and semicolons:", target: "const cfg = { mode: 'dev', label: \"v1\" };" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var snippets = [
 "const user = { name: \"Ada\", role: 'eng' };",
 "let msg = `sum: ${a + b}`;",
 "const host = { ip: '127.0.0.1', port: \"8080\" };"
 ];
 var sn = snippets[Math.abs(variantIdx || 0) % snippets.length];
 var lock = adaptLockIn(sn, "Type all delimiters cleanly without glancing down:", weakKeys, stageNum);
 return {
 conceptId: "s4m2_c3",
 conceptTitle: "Semicolons, Colons, Quotes & Backticks",
 variantIdx: variantIdx || 0,
 prompt: "Starting from your Right Pinky's home-row anchor `;`, how do you type `:`, `'`, and `\"`?",
 options: rotateOptions([
 { text: "`Left Shift + ;` types `:`; moving 1 key right of `;` types `'`; `Left Shift + '` types `\"`.", isCorrect: true, whyWrong: "" },
 { text: "`;` requires holding Shift on the period `.` key.", isCorrect: false, whyWrong: "`;` is unshifted right on home row, and shifted `.` is `>`." },
 { text: "Typing `' '` twice automatically merges into `\"` in compilers.", isCorrect: false, whyWrong: "Two single quotes `''` form an empty string literal, NOT a double-quote character `\"`!" },
 { text: "`:` is located on `Shift + 5`.", isCorrect: false, whyWrong: "`Shift + 5` is `%`; `:` is `Left Shift + ;`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m2_c4",
 title: "Compound Operators (`===`, `!==`, `=>`, `<=`, `>=`, `+=`)",
 zeroTeach: "`=` sits two keys right of `0` (`Right Pinky`). Combine it smoothly with `Left Shift + .` (`>`) for arrow `=>`, `Right Shift + 1` (`!`) for `!==`, and `Left Shift + =` (`+`) for `+=`!",
 concreteExample: "`const isPos = (n) => n >= 1 && n !== 0;`",
 reteachCheck: { instruction: "Type arrow & strict equality operators:", target: "const eq = (a, b) => a === b && a !== null;" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var snippets = [
 "const add = (a, b) => a + b;",
 "if (x !== 0 && x >= 10) { sum += x; }",
 "const valid = (n) => n === 42 || n <= 8;"
 ];
 var sn = snippets[Math.abs(variantIdx || 0) % snippets.length];
 var lock = adaptLockIn(sn, "Type the operator expression blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s4m2_c4",
 conceptTitle: "Compound Developer Operators (===, !==, =>, +=)",
 variantIdx: variantIdx || 0,
 prompt: "What physical key sequence forms the JavaScript arrow operator `=>`?",
 options: rotateOptions([
 { text: "Unshifted `=` (`Right Pinky` two keys right of `0`), followed by `Left Shift + .` (`Right Ring` `>`).", isCorrect: true, whyWrong: "" },
 { text: "Hyphen `-` followed by `>`.", isCorrect: false, whyWrong: "`->` is C/Rust pointer/return syntax; JavaScript arrow functions use fat arrow `=>` (`=` then `>`)." },
 { text: "`Shift + =` followed by `Shift + ,`.", isCorrect: false, whyWrong: "`Shift + =` then `Shift + ,` types `+<`, not `=>`!" },
 { text: "There is a dedicated single `=>` key on standard keyboards.", isCorrect: false, whyWrong: "`=>` is a two-character bigram typed as `=` then `>`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s4m2_c5",
 title: "Logical & Path Symbols (`&&`, `||`, `!`, `/`, `\\`, `%`)",
 zeroTeach: "`&&` = `Left Shift + 7 7` (`Right Index`); `||` = `Left Shift + \\ \\` (`Right Pinky` above `Enter`); `!` = `Right Shift + 1` (`Left Pinky`); `//` = unshifted `/` twice (`Right Pinky` bottom row); `%` = `Right Shift + 5` (`Left Index`).",
 concreteExample: "`const even = (n % 2 === 0) && (!busy || force); // check`",
 reteachCheck: { instruction: "Type boolean pipes, ampersands, and modulo:", target: "(n % 2 === 0) && (ok || retry)" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var snippets = [
 "const pass = (a && b) || !blocked; // gate",
 "const rem = (n % 4 === 0) && (ok || override);",
 "const esc = \"line1\\nline2\"; // slash"
 ];
 var sn = snippets[Math.abs(variantIdx || 0) % snippets.length];
 var lock = adaptLockIn(sn, "Type logical & slash symbols eyes-up:", weakKeys, stageNum);
 return {
 conceptId: "s4m2_c5",
 conceptTitle: "Pipes ||, Ampersands &&, Modulo % & Slashes / \\",
 variantIdx: variantIdx || 0,
 prompt: "Where is the vertical **pipe** character `|` (used in `||` logical OR and Unix shell pipes `cmd1 | cmd2`) located on an ANSI keyboard?",
 options: rotateOptions([
 { text: "`Left Shift + \\` (the Backslash key on `Right Pinky` at the far right of the `QWERTY` row / above `Enter`).", isCorrect: true, whyWrong: "" },
 { text: "Capital letter `'I'` or lowercase `'l'`.", isCorrect: false, whyWrong: "Typing `II` or `ll` in code creates an identifier `II`/`ll` and causes a ReferenceError instead of logical `||`!" },
 { text: "`Shift + /` on the bottom row.", isCorrect: false, whyWrong: "`Shift + /` types question mark `?`, whereas `Shift + \\` types pipe `|`!" },
 { text: "`Shift + 6`.", isCorrect: false, whyWrong: "`Shift + 6` types caret/XOR `^`, not pipe `|`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s4m2_c6",
 title: "Word-By-Word Cursor Navigation (`Ctrl+Left` / `Ctrl+Right`)",
 zeroTeach: "Holding `Ctrl` (or `Option` on macOS) turns `ArrowLeft` and `ArrowRight` from 1-character steps into **whole-word / token leaps**, jumping across `calculateTotalPrice` in 1-2 taps instead of 19!",
 concreteExample: "To move from the end of `const count = 42;` to `count`, tap `Ctrl+Left` three times.",
 reteachCheck: { instruction: "Type the word-navigation chord name:", target: "Ctrl+Left and Ctrl+Right" }
 }, [
 {
 prompt: "Your cursor sits at the end of `const maxRetryLimit = 5;`. Which shortcut jumps backward across whole words/tokens instead of stepping 1 character at a time?",
 options: [
 { text: "`Ctrl+Left` (`Option+Left` on macOS).", isCorrect: true, whyWrong: "" },
 { text: "`Shift+Left`.", isCorrect: false, whyWrong: "`Shift+Left` selects 1 single character at a time without jumping words." },
 { text: "`Alt+Up`.", isCorrect: false, whyWrong: "In code editors `Alt+Up` moves the entire current line upward!" },
 { text: "`CapsLock+Left`.", isCorrect: false, whyWrong: "`CapsLock` is not a cursor navigation modifier." }
 ],
 lockInInstruction: "Type the word-navigation rule:",
 lockInTarget: "Ctrl+Left / Ctrl+Right jumps whole tokens"
 }
 ]),
 scenarioBankConcept({
 id: "s4m2_c7",
 title: "Word Deletion & Line-Boundary Jumps (`Ctrl+Backspace`, `Home`, `End`)",
 zeroTeach: "`Ctrl+Backspace` deletes the entire word to the left of the cursor (`Ctrl+Delete` deletes the word to the right). `Home` jumps straight to the start of the line; `End` jumps straight to the end of the line (e.g., to append a missing `;`!).",
 concreteExample: "Forgot `;` at the end of a long line? Tap `End`, tap `;` - done in 250 ms without touching the mouse!",
 reteachCheck: { instruction: "Type the whole-word delete and line-end chords:", target: "Ctrl+Backspace; End" }
 }, [
 {
 prompt: "Your cursor is in the middle of a line and you realize you forgot a semicolon `;` at the very end of the line. What is the fastest mouse-free sequence?",
 options: [
 { text: "Tap `End` to teleport to the end of the line, then tap `;`.", isCorrect: true, whyWrong: "" },
 { text: "Hold `Right Arrow` for 3 seconds until the cursor reaches the end.", isCorrect: false, whyWrong: "Auto-repeat arrow scrolling is 10x slower than a single `End` keypress!" },
 { text: "Press `Ctrl+Backspace`.", isCorrect: false, whyWrong: "`Ctrl+Backspace` deletes the word to the left of your cursor." },
 { text: "Press `PageDown`.", isCorrect: false, whyWrong: "`PageDown` scrolls down an entire screen of lines rather than moving to the end of the current line." }
 ],
 lockInInstruction: "Type the line-boundary pair:",
 lockInTarget: "Home = line start, End = line end"
 }
 ]),
 scenarioBankConcept({
 id: "s4m2_c8",
 title: "Mouse-Free Text Selection (`Shift` + Navigation)",
 zeroTeach: "Holding `Shift` anchors one end of a selection while any cursor-movement chord moves the active end! Combine `Shift` with `Ctrl+Left/Right` to select whole words (`Ctrl+Shift+Right`), or `Shift+End` / `Shift+Home` to highlight to the end/start of a line.",
 concreteExample: "To replace `oldVariableName` right ahead of the cursor: `Ctrl+Shift+Right` highlights the entire identifier, then just start typing the new name!",
 reteachCheck: { instruction: "Type the whole-word selection chord:", target: "Ctrl+Shift+Right" }
 }, [
 {
 prompt: "How do you highlight and select the next three words to the right of the cursor without touching the mouse?",
 options: [
 { text: "Hold `Ctrl+Shift` and tap `Right Arrow` three times (`Ctrl+Shift+Right`).", isCorrect: true, whyWrong: "" },
 { text: "Tap `Ctrl+Right` without `Shift`.", isCorrect: false, whyWrong: "`Ctrl+Right` moves the cursor across three words WITHOUT selecting them - adding `Shift` creates the selection!" },
 { text: "Press `Ctrl+A`.", isCorrect: false, whyWrong: "`Ctrl+A` selects the ENTIRE file/buffer, not just the next three words." },
 { text: "Press `Ctrl+Z` three times.", isCorrect: false, whyWrong: "`Ctrl+Z` undoes edits rather than selecting text." }
 ],
 lockInInstruction: "Type the composable selection formula:",
 lockInTarget: "Shift + Movement = Text Selection"
 }
 ]),
 scenarioBankConcept({
 id: "s4m2_c9",
 title: "Structural Code Line Editing (`Ctrl+/`, `Alt+Up/Down`, `Ctrl+Shift+K`)",
 zeroTeach: "Modern code editors share structural line shortcuts that work WITHOUT even selecting the line first: `Ctrl+/` toggles line comment (`//`), `Alt+Up` / `Alt+Down` swaps the current line up/down, and `Ctrl+Shift+K` deletes the entire line cleanly.",
 concreteExample: "Need to move `let sum = 0;` above a `for` loop? Place cursor anywhere on `let sum = 0;` and tap `Alt+Up`!",
 reteachCheck: { instruction: "Type the comment, move-line, and delete-line chords:", target: "Ctrl+/ | Alt+Up | Ctrl+Shift+K" }
 }, [
 {
 prompt: "In modern code editors (and our Shortcut Lab), which shortcut comments or uncomments the current line (`// ...`) instantly without moving your cursor to column 0?",
 options: [
 { text: "`Ctrl+/` (`Cmd+/` on macOS).", isCorrect: true, whyWrong: "" },
 { text: "`Ctrl+Shift+K`.", isCorrect: false, whyWrong: "`Ctrl+Shift+K` DELETES the entire current line rather than commenting it out!" },
 { text: "`Alt+Down`.", isCorrect: false, whyWrong: "`Alt+Down` moves the current line down by 1 row." },
 { text: "`Ctrl+C`.", isCorrect: false, whyWrong: "`Ctrl+C` copies selection in an editor (or interrupts a process in a terminal)." }
 ],
 lockInInstruction: "Type the toggle-comment shortcut:",
 lockInTarget: "Ctrl+/ toggles line comment"
 }
 ]),
 scenarioBankConcept({
 id: "s4m2_c10",
 title: "Terminal & Shell Shortcuts (`Ctrl+C`, `Ctrl+L`, `Ctrl+A/E`, `Ctrl+U`, `Ctrl+R`)",
 zeroTeach: "Inside a terminal (`bash`/`zsh`), `Ctrl+C` does NOT copy text - it sends `SIGINT` to stop an infinite loop or server! `Ctrl+L` clears the screen, `Ctrl+A` / `Ctrl+E` jumps to start/end of command line, `Ctrl+U` deletes back to line start, and `Ctrl+R` searches past command history.",
 concreteExample: "Accidentally started an infinite `while (true)` script in terminal? Press `Ctrl+C` to interrupt it cleanly!",
 reteachCheck: { instruction: "Type the 4 core terminal chords:", target: "Ctrl+C stop, Ctrl+L clear, Ctrl+A start, Ctrl+R search" }
 }, [
 {
 prompt: "In a Linux/macOS/Windows terminal running an infinite loop script, what does pressing `Ctrl+C` do, and what clears the terminal viewport?",
 options: [
 { text: "`Ctrl+C` sends an interrupt signal (`SIGINT`) to terminate the running foreground command; `Ctrl+L` clears the terminal screen.", isCorrect: true, whyWrong: "" },
 { text: "`Ctrl+C` copies the terminal window to the clipboard, and `Ctrl+Alt+Del` clears text.", isCorrect: false, whyWrong: "Crucial terminal rule: `Ctrl+C` sends `SIGINT` (interrupt) in terminals - use `Ctrl+Shift+C` to copy terminal text!" },
 { text: "`Ctrl+C` formats the SSD.", isCorrect: false, whyWrong: "`Ctrl+C` safely interrupts only the active foreground process." },
 { text: "`Ctrl+R` stops processes and `Ctrl+C` searches command history.", isCorrect: false, whyWrong: "Other way around: `Ctrl+C` interrupts (`SIGINT`), while `Ctrl+R` opens reverse incremental history search!" }
 ],
 lockInInstruction: "Type the terminal survival pair:",
 lockInTarget: "Ctrl+C = SIGINT stop; Ctrl+R = history search"
 }
 ])
 ]
 }
 ];

 // ==========================================================================
 // STAGE 5: STRONG CODING FOUNDATIONS FROM SCRATCH
 // ==========================================================================

 var stage5Modules = [
 {
 id: "s5m1",
 stageId: "stage5",
 stageNumber: 5,
 code: "5.1",
 title: "Variables as Memory Boxes, Data Types, Expressions & Conditionals",
 subtitle: "Connecting RAM slots to `let`/`const`, primitive types, `===` vs `==`, `%`, boolean short-circuiting, and `if / else` branching.",
 estimatedMinutes: 25,
 simulatorType: "memory-boxes",
 lessonSections: [
 {
 heading: "1. Variables as Named Memory Boxes (`let` vs. `const` & Assignment `=`)",
 body: [
 "Remember Stage 3 where Assembly had to track raw hex RAM addresses like `[0x2048]`? A **Variable** is simply a human-readable label attached to a memory slot so the compiler/engine tracks the address for you!",
 "• `const taxRate = 0.08;` creates a read-only binding - attempting to reassign `taxRate = 0.1` throws an immediate TypeError, preventing accidental state mutation bugs. Default to `const`!\n• `let score = 0;` creates a mutable box whose stored value can be updated (`score = score + 10;` or `score += 10;`).\n• **Crucial First-Principles Trap**: Single equals `=` in code is NOT an algebraic promise that two sides stay equal forever - it is an **imperative copy action**: 1) evaluate the expression on the RIGHT completely first, 2) store that resulting value into the box on the LEFT!"
 ],
 diagram:
"Tracing Assignment Step-by-Step:\n" +
" let a = 5; // Box [a: 5]\n" +
" let b = a + 3; // Evaluates 5 + 3 -> 8; Box [a: 5] [b: 8]\n" +
" a = 20; // Updates ONLY [a: 20]! [b] STILL holds 8!",
 takeaway: "`=` evaluates the right-hand side NOW and copies that value into the left-hand box; `b` does not magically track future edits to `a`."
 },
 {
 heading: "2. Primitive Data Types, Precedence, Modulo `%` & Strict Equality `===`",
 body: [
 "Every value in memory carries a **Data Type** telling operations how to interpret its bits:\n• `number` (`42`, `3.14`, `-7`), `string` (`'hello'`, `\"42\"`, `` `sum=${x}` ``), `boolean` (`true`, `false`), `null` (deliberate 'empty' value), and `undefined` (declared box not yet assigned, or missing key/index).",
 "• Watch string vs. number `+`: `5 + 3` adds numbers (`8`), whereas `\"5\" + 3` concatenates text (`\"53\"`)! Convert strings explicitly with `Number(\"5\")`.\n• Modulo `a % b` returns the integer **remainder** after dividing `a` by `b`: `14 % 4 === 2`, and `n % 2 === 0` tests if `n` is even!\n• Always use **Strict Equality `===` and `!==`** (never loose `==`), because loose `==` silently coerces types (`0 == false` and `\"\" == 0` evaluate to `true`!), whereas `===` requires BOTH type and value to match (`\"5\" === 5` is `false`)."
 ],
 diagram:
"Essential Expression Truths:\n" +
" 17 % 5 === 2 (5 * 3 = 15, remainder 2)\n" +
" \"5\" + 2 === \"52\" (string concatenation!)\n" +
" \"5\" === 5 -> false (string !== number)\n" +
" 5 === 5 -> true (same type AND value)",
 takeaway: "Use `const` by default, `Number()` before math on text inputs, `%` for remainders/parity, and `===` / `!==` for comparisons."
 },
 {
 heading: "3. Boolean Logic (`&&`, `||`, `!`) & `if / else if / else` Control Flow",
 body: [
 "Remember Stage 2's AND, OR, NOT gates, and Stage 3's `CMP` + `JZ` conditional jumps? High-level `if / else if / else` statements compile directly to them!\n• In `if (cond1) { ... } else if (cond2) { ... } else { ... }`, the engine checks top-to-bottom and executes **AT MOST ONE** branch - the first one whose condition evaluates to `true`!\n• **Short-Circuit Evaluation**: In `user !== null && user.isAdmin`, if `user !== null` is `false`, `&&` immediately stops ('short-circuits') without evaluating `user.isAdmin`, preventing a null-dereference crash!"
 ],
 diagram:
"Range Check Order Matters!\n" +
" if (score >= 90) { grade = 'A'; } // Checked 1st (90..100)\n" +
" else if (score >= 80) { grade = 'B'; } // Checked 2nd (80..89)\n" +
" else { grade = 'C'; } // Fallback (< 80)",
 takeaway: "Order `if / else if` from most specific (highest threshold) to broadest, and use early `return` guard clauses to keep code flat."
 }
 ],
 concepts: [
 {
 id: "s5m1_c1",
 title: "Variables as Memory Boxes & Sequential Assignment",
 zeroTeach: "`=` evaluates the right side at that exact moment in time and copies the resulting primitive value into the variable on the left. Reassigning `a` later does NOT retroactively change `b`!",
 concreteExample: "`let a = 4; let b = a * 2; a = 10;` leaves `a === 10` and `b === 8`.",
 reteachCheck: { instruction: "Type a two-variable swap using a temp box:", target: "const tmp = a; a = b; b = tmp;" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var cases = [
 { a0: 6, add: 4, a1: 20 },
 { a0: 10, add: 5, a1: 3 },
 { a0: 8, add: 7, a1: 50 }
 ];
 var c = cases[Math.abs(variantIdx || 0) % cases.length];
 var bVal = c.a0 + c.add;
 var lock = adaptLockIn("let a = " + c.a0 + "; let b = a + " + c.add + "; a = " + c.a1 + ";", "Type this variable trace snippet without looking down:", weakKeys, stageNum);
 return {
 conceptId: "s5m1_c1",
 conceptTitle: "Variables as Memory Boxes & Sequential Assignment",
 variantIdx: variantIdx || 0,
 prompt: "Trace these three lines in order:\n`let a = " + c.a0 + ";`\n`let b = a + " + c.add + ";`\n`a = " + c.a1 + ";`\nWhat values are stored in `a` and `b` at the end?",
 options: rotateOptions([
 { text: "`a === " + c.a1 + "` and `b === " + bVal + "` (`b` copied `" + c.a0 + " + " + c.add + "` on line 2 and does not re-run when `a` changes on line 3!)", isCorrect: true, whyWrong: "" },
 { text: "`a === " + c.a1 + "` and `b === " + (c.a1 + c.add) + "` (treating `b` like a live spreadsheet formula)", isCorrect: false, whyWrong: "Variables are memory boxes, NOT spreadsheet formulas! Line 2 computed `" + c.a0 + " + " + c.add + " = " + bVal + "` once and stored `" + bVal + "` in `b`." },
 { text: "`a === " + c.a0 + "` and `b === " + bVal + "`", isCorrect: false, whyWrong: "Line 3 overwrote mutable `let a` with `" + c.a1 + "`." },
 { text: "SyntaxError because `a` was assigned twice.", isCorrect: false, whyWrong: "`let a` allows reassignment; only `const a` forbids reassignment!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s5m1_c2",
 title: "`const` vs. `let` & Primitive Data Types",
 zeroTeach: "`const` locks a variable identifier so it cannot be reassigned (`x = newVal` throws `TypeError`); `let` permits reassignment. Primitive types include `number`, `string`, `boolean`, `null` (explicit empty value), and `undefined` (unassigned variable).",
 concreteExample: "`let x;` has value `undefined`; `const empty = null;` intentionally signals 'no object present'.",
 reteachCheck: { instruction: "Type const and let declarations blindfolded:", target: "const limit = 100; let count = 0;" }
 }, [
 {
 prompt: "Why do senior engineers declare variables with `const` by default and only switch to `let` when a variable genuinely needs to be reassigned (like a loop counter)?",
 options: [
 { text: "`const` guarantees the binding won't be accidentally reassigned 50 lines later, shrinking mental state tracking and catching mutation mistakes immediately.", isCorrect: true, whyWrong: "" },
 { text: "`let` variables cannot hold strings or booleans.", isCorrect: false, whyWrong: "Both `let` and `const` hold any data type (`number`, `string`, `boolean`, `object`, `array`)." },
 { text: "`const` stores values on the SSD while `let` uses RAM.", isCorrect: false, whyWrong: "Both live in RAM/registers at runtime; `const` is a language-enforced immutability rule on the binding." },
 { text: "`let` runs only on interpreters.", isCorrect: false, whyWrong: "Modern JS engines compile both `const` and `let` cleanly." }
 ],
 lockInInstruction: "Type clean const & let bindings:",
 lockInTarget: "const base = 2; let total = 0;"
 }
 ]),
 {
 id: "s5m1_c3",
 title: "String Concatenation vs. Numeric Addition",
 zeroTeach: "In JavaScript, if EITHER operand of `+` is a `string`, `+` performs string concatenation (`\"12\" + 5 === \"125\"`). Convert text input first with `Number(str)` so `+` performs numeric addition (`12 + 5 === 17`)!",
 concreteExample: "`Number(\"12\") + 5 === 17`, whereas `\"12\" + 5 === \"125\"`.",
 reteachCheck: { instruction: "Type explicit numeric conversion:", target: "const sum = Number(input) + 5;" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var pairs = [
 { s: "20", n: 5, cat: "205", num: 25 },
 { s: "7", n: 3, cat: "73", num: 10 },
 { s: "40", n: 2, cat: "402", num: 42 }
 ];
 var p = pairs[Math.abs(variantIdx || 0) % pairs.length];
 var lock = adaptLockIn("const total = Number(\"" + p.s + "\") + " + p.n + ";", "Type the bug-free numeric conversion line:", weakKeys, stageNum);
 return {
 conceptId: "s5m1_c3",
 conceptTitle: "String Concatenation vs. Numeric Addition",
 variantIdx: variantIdx || 0,
 prompt: "An HTML `<input>` gives `const raw = \"" + p.s + "\";` (a string!). What does `raw + " + p.n + "` evaluate to, and how do you compute `" + p.num + "` instead?",
 options: rotateOptions([
 { text: "`\"" + p.cat + "\"` (string concatenation); fix it with `Number(raw) + " + p.n + "` to get `" + p.num + "`.", isCorrect: true, whyWrong: "" },
 { text: "`" + p.num + "` automatically because JavaScript converts strings to numbers on `+`.", isCorrect: false, whyWrong: "Classic web bug! `+` favors string concatenation whenever either side is a string, turning `\"" + p.s + "\" + " + p.n + "` into `\"" + p.cat + "\"`!" },
 { text: "`NaN`.", isCorrect: false, whyWrong: "`\"" + p.s + "\" + " + p.n + "` concatenates cleanly to `\"" + p.cat + "\"` (`NaN` occurs on `Number(\"abc\")`)." },
 { text: "Throws a hardware divide-by-zero fault.", isCorrect: false, whyWrong: "String concatenation never throws; it silently produces the wrong type/value unless you parse with `Number(raw)`!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m1_c4",
 title: "Operator Precedence & Modulo `%` Remainder",
 zeroTeach: "Multiplication `*`, division `/`, and modulo `%` bind tighter than `+` and `-` (unless grouped with parentheses `( )`). Modulo `a % b` gives the remainder after integer division - essential for even/odd checks (`n % 2 === 0`) and circular buffer wrap-around (`(i + 1) % len`).",
 concreteExample: "`2 + 3 * 4 === 14` (whereas `(2 + 3) * 4 === 20`), and `17 % 5 === 2`.",
 reteachCheck: { instruction: "Type the circular wrap expression:", target: "const next = (idx + 1) % len;" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var items = [
 { a: 17, b: 5, rem: 2, q: 3 },
 { a: 23, b: 4, rem: 3, q: 5 },
 { a: 18, b: 6, rem: 0, q: 3 },
 { a: 29, b: 10, rem: 9, q: 2 }
 ];
 var it = items[Math.abs(variantIdx || 0) % items.length];
 var lock = adaptLockIn("const rem = " + it.a + " % " + it.b + "; // " + it.rem, "Type the modulo expression blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m1_c4",
 conceptTitle: "Modulo (%) Remainder & Precedence",
 variantIdx: variantIdx || 0,
 prompt: "What value does `" + it.a + " % " + it.b + "` evaluate to?",
 options: rotateOptions([
 { text: "`" + it.rem + "` (since `" + it.b + " * " + it.q + " = " + (it.b * it.q) + "`, leaving remainder `" + it.rem + "`)", isCorrect: true, whyWrong: "" },
 { text: "`" + it.q + "` (returning the integer quotient instead of the remainder)", isCorrect: false, whyWrong: "`" + it.q + "` is `Math.floor(" + it.a + " / " + it.b + ")`; `%` returns the leftover **remainder** `" + it.rem + "`!" },
 { text: "`" + (it.a / it.b).toFixed(2) + "` (decimal division)", isCorrect: false, whyWrong: "Decimal division uses `/`; `%` computes remainder `" + it.rem + "`." },
 { text: "`" + (it.a * it.b / 100) + "` (computing percentage)", isCorrect: false, whyWrong: "In C, Python, Rust, and JS, `%` is the **modulo remainder** operator, never 'percent'!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s5m1_c5",
 title: "Strict Equality `===` vs. Loose Coercion `==`",
 zeroTeach: "`===` (strict equality) checks that BOTH data type AND value match with zero implicit conversion. Loose `==` converts types behind the scenes (`0 == false` is `true`, `\"\" == 0` is `true`, `\"0\" == false` is `true`), causing subtle bugs when `0` is a valid answer!",
 concreteExample: "`0 === false` -> `false`; `\"42\" === 42` -> `false`; `42 === 42` -> `true`.",
 reteachCheck: { instruction: "Type strict equality and inequality checks:", target: "if (val !== null && val === 0) { ok = true; }" }
 }, [
 {
 prompt: "Why should you write `input === 0` (`===`) rather than `input == 0` (`==`) in JavaScript?",
 options: [
 { text: "`===` verifies both **type and value** without coercion, whereas `\"\" == 0` and `false == 0` both evaluate to `true` under loose `==`!", isCorrect: true, whyWrong: "" },
 { text: "`==` assigns `0` into `input`.", isCorrect: false, whyWrong: "Single `=` assigns; `==` compares with dangerous implicit type coercion, while `===` compares strictly." },
 { text: "`===` only works on strings.", isCorrect: false, whyWrong: "`===` works cleanly on numbers, booleans, strings, null, undefined, and object references." },
 { text: "`===` is slower because the CPU runs three `CMP` instructions.", isCorrect: false, whyWrong: "`===` is actually FASTER and simpler because the engine skips complex type-coercion rules!" }
 ],
 lockInInstruction: "Type the strict comparison guard:",
 lockInTarget: "const isZero = (x === 0);"
 }
 ]),
 {
 id: "s5m1_c6",
 title: "Boolean Short-Circuit Evaluation (`&&` and `||`)",
 zeroTeach: "In `A && B`, if `A` is `false`, the result CANNOT be true, so `B` is never even executed (protecting `obj !== null && obj.count > 0` from crashing!). In `A || B`, if `A` is `true`, `B` is skipped.",
 concreteExample: "`const ok = arr !== null && arr.length > 0;` safely returns `false` when `arr` is `null` instead of throwing `TypeError`!",
 reteachCheck: { instruction: "Type a null-safe short-circuit guard:", target: "if (node !== null && node.val > 0)" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var v = Math.abs(variantIdx || 0) % 2;
 var lock = adaptLockIn("if (user !== null && user.active) { run(); }", "Type the short-circuit guard blindfolded:", weakKeys, stageNum);
 if (v === 0) {
 return {
 conceptId: "s5m1_c6",
 conceptTitle: "Boolean Short-Circuit Guarding",
 variantIdx: variantIdx || 0,
 prompt: "Suppose `user` is `null`. Why does `if (user !== null && user.active)` run safely without crashing, whereas `if (user.active && user !== null)` throws a `TypeError`?",
 options: rotateOptions([
 { text: "`&&` evaluates left-to-right and **short-circuits**: once `user !== null` is `false`, JavaScript skips `user.active` completely!", isCorrect: true, whyWrong: "" },
 { text: "`&&` always evaluates right-to-left.", isCorrect: false, whyWrong: "Both `&&` and `||` evaluate strictly LEFT-to-RIGHT - that's why the null check MUST come first on the left!" },
 { text: "`null.active` returns `true` when placed on the right.", isCorrect: false, whyWrong: "Evaluating `null.active` ALWAYS throws `TypeError`; short-circuiting prevents `user.active` from running at all." },
 { text: "Using `||` instead (`user !== null || user.active`) would also protect against `null`.", isCorrect: false, whyWrong: "Careful! With `||`, when `user === null`, `user !== null` is `false`, forcing `||` to evaluate `user.active` and CRASH!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 return {
 conceptId: "s5m1_c6",
 conceptTitle: "Boolean Compound Logic Trace",
 variantIdx: variantIdx || 0,
 prompt: "Given `const hasKey = false; const isOwner = true; const locked = false;`, what does `(hasKey || isOwner) && !locked` evaluate to?",
 options: rotateOptions([
 { text: "`true` (since `(false || true)` is `true`, `!false` is `true`, and `true && true` is `true`)", isCorrect: true, whyWrong: "" },
 { text: "`false` (thinking `hasKey = false` makes `hasKey || isOwner` false)", isCorrect: false, whyWrong: "In `OR` (`||`), one `true` (`isOwner`) makes `(false || true) === true`!" },
 { text: "`false` (forgetting `!locked` inverts `false` to `true`)", isCorrect: false, whyWrong: "Since `locked` is `false`, `!locked` evaluates to `true`." },
 { text: "`undefined`", isCorrect: false, whyWrong: "Boolean operators here return a clean `boolean` (`true`)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m1_c7",
 title: "`if / else if / else` Branch Ordering",
 zeroTeach: "An `if / else if / else` chain stops at the VERY FIRST condition that evaluates to `true`! If you put a broad condition like `if (x >= 50)` BEFORE `else if (x >= 90)`, an input of `95` gets caught by `x >= 50` and NEVER reaches `x >= 90`!",
 concreteExample: "Always test `>= 90` first, then `else if (>= 80)`, then `else if (>= 70)`.",
 reteachCheck: { instruction: "Type an ordered threshold check:", target: "if (n >= 90) return 'A'; else if (n >= 80) return 'B';" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var scores = [95, 92, 98];
 var sc = scores[Math.abs(variantIdx || 0) % scores.length];
 var lock = adaptLockIn("if (s >= 90) { g = 'A'; } else if (s >= 60) { g = 'P'; }", "Type the properly ordered conditional:", weakKeys, stageNum);
 return {
 conceptId: "s5m1_c7",
 conceptTitle: "if / else if / else Threshold Ordering",
 variantIdx: variantIdx || 0,
 prompt: "Spot the subtle bug when `s = " + sc + "` runs through:\n`if (s >= 60) { g = 'Pass'; } else if (s >= 90) { g = 'Honors'; }`\nWhat gets assigned to `g`?",
 options: rotateOptions([
 { text: "`'Pass'`! Because `" + sc + " >= 60` is `true` on the first `if`, the `else if (s >= 90)` branch is skipped completely (`s >= 90` must go FIRST!).", isCorrect: true, whyWrong: "" },
 { text: "`'Honors'`, because `else if` overrides earlier `if` blocks.", isCorrect: false, whyWrong: "Once an `if` branch matches (`" + sc + " >= 60`), ALL subsequent `else if` and `else` blocks in that chain are skipped!" },
 { text: "Both `'Pass'` and `'Honors'` execute.", isCorrect: false, whyWrong: "`if / else if` branches are mutually exclusive - at most one executes." },
 { text: "SyntaxError.", isCorrect: false, whyWrong: "It is valid syntax - which makes threshold-ordering a classic logic bug to watch for!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s5m1_c8",
 title: "Guard Clauses & Early `return`",
 zeroTeach: "Instead of wrapping an entire function inside 4 levels of nested `if (...) { if (...) { ... } }`, check invalid/edge cases at the very top and `return` immediately (**Guard Clause**). The main happy path stays unindented and crystal clear!",
 concreteExample: "`if (!items || items.length === 0) return 0;` right at line 1 of `average(items)`.",
 reteachCheck: { instruction: "Type a clean guard clause:", target: "if (items.length === 0) return 0;" }
 }, [
 {
 prompt: "What is a **Guard Clause** inside a function, and why does it make systems code safer?",
 options: [
 { text: "An early `if (invalidCondition) return ...;` at the top of a function that handles edge cases immediately and prevents deep `if/else` nesting.", isCorrect: true, whyWrong: "" },
 { text: "A hardware firewall chip on the network card.", isCorrect: false, whyWrong: "In code structure, a guard clause is an early-exit precondition check." },
 { text: "Putting every line inside `try/catch` instead of checking `length === 0`.", isCorrect: false, whyWrong: "Explicit guard checks (`if (len === 0) return 0;`) are clearer, faster, and more predictable than relying on exceptions." },
 { text: "Writing the entire program on a single 500-character line.", isCorrect: false, whyWrong: "Guard clauses improve vertical readability by exiting invalid states early." }
 ],
 lockInInstruction: "Type an early-return guard clause:",
 lockInTarget: "if (n <= 0) return 0;"
 }
 ]),
 scenarioBankConcept({
 id: "s5m1_c9",
 title: "Block Scope (`{ ... }` Lifetime of `let` & `const`)",
 zeroTeach: "Variables declared with `let` or `const` inside curly braces `{ ... }` (an `if` block, `for` loop, or function) exist ONLY inside that block! Once execution passes the closing `}`, that block-scoped name is out of scope.",
 concreteExample: "To assign a value inside `if/else` and read it afterward, declare `let status;` BEFORE the `if` (or extract a helper function with `return`)!",
 reteachCheck: { instruction: "Type an outer-scoped let updated across branches:", target: "let tag = 'low'; if (x > 9) { tag = 'high'; }" }
 }, [
 {
 prompt: "Why does `if (ok) { const msg = 'yes'; } console.log(msg);` throw a `ReferenceError: msg is not defined`?",
 options: [
 { text: "`const` and `let` are **block-scoped** to the nearest enclosing `{ ... }`, so `msg` ceases to exist right after the `if` block's closing `}`!", isCorrect: true, whyWrong: "" },
 { text: "`console.log` cannot print string variables.", isCorrect: false, whyWrong: "`console.log` prints strings fine; `msg` is simply invisible outside the `{ ... }` block where it was declared." },
 { text: "`'yes'` must use double quotes.", isCorrect: false, whyWrong: "Single and double quotes are identical in JS." },
 { text: "`if` blocks delete all global variables.", isCorrect: false, whyWrong: "`if` blocks only scope declarations written *inside* their own `{ ... }` braces." }
 ],
 lockInInstruction: "Type the properly scoped fix:",
 lockInTarget: "const msg = ok ? 'yes' : 'no';"
 }
 ]),
 {
 id: "s5m1_c10",
 title: "Authoring Expressions & Conditionals Blindfolded",
 zeroTeach: "Synthesizing Stage 4 symbol fluency with Stage 5 logic lets you write complete conditional expressions (`const abs = x < 0 ? -x : x;` or `if (n % 2 === 0) { ... }`) cleanly with eyes strictly on screen.",
 concreteExample: "`function clamp(x, hi) { return x > hi ? hi : x; }`",
 reteachCheck: { instruction: "Type a complete clamp function blindfolded:", target: "const clamp = (x, hi) => (x > hi ? hi : x);" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var tasks = [
 { desc: "even-number parity check", code: "const isEven = (n) => n % 2 === 0;", valIn: 14, valOut: "true" },
 { desc: "non-negative floor clamp", code: "const nonNeg = (n) => (n < 0 ? 0 : n);", valIn: -7, valOut: "0" },
 { desc: "in-bounds range check", code: "const inRange = (x) => x >= 0 && x < 8;", valIn: 8, valOut: "false" }
 ];
 var t = tasks[Math.abs(variantIdx || 0) % tasks.length];
 var lock = adaptLockIn(t.code, "Type this complete function expression from scratch without looking down:", weakKeys, stageNum);
 return {
 conceptId: "s5m1_c10",
 conceptTitle: "Synthesizing Expressions & Conditionals",
 variantIdx: variantIdx || 0,
 prompt: "Evaluate `" + t.code + "` when called with argument `" + t.valIn + "`. What value does it return?",
 options: rotateOptions([
 { text: "`" + t.valOut + "`", isCorrect: true, whyWrong: "" },
 { text: "`" + (t.valOut === "true" ? "false" : (t.valOut === "false" ? "true" : "-7")) + "`", isCorrect: false, whyWrong: "Trace `" + t.valIn + "` carefully through `" + t.code + "`: note strict `<` vs `<=` and `% 2 === 0`!" },
 { text: "`undefined` (thinking arrow `=> expr` doesn't return)", isCorrect: false, whyWrong: "Concise arrow syntax `(x) => expression` (without `{}`) implicitly returns the evaluated expression!" },
 { text: "`NaN`", isCorrect: false, whyWrong: "All operands are valid numbers/booleans, returning `" + t.valOut + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 }
 ]
 },
 {
 id: "s5m2",
 stageId: "stage5",
 stageNumber: 5,
 code: "5.2",
 title: "Loops, Functions & Call Stacks, Arrays/Objects & Systematic Debugging",
 subtitle: "Iteration invariants, 0-indexed arrays, key-value objects, LIFO call-stack frames, reference aliasing, and writing real code blindfolded.",
 estimatedMinutes: 28,
 simulatorType: "callstack-tracer",
 lessonSections: [
 {
 heading: "1. Loops (`for` & `while`) and `0`-Indexed Arrays",
 body: [
 "An **Array** (`const nums = [10, 20, 30];`) stores an ordered sequence of elements in contiguous slots. Why does indexing start at `0` (`nums[0] === 10`) instead of `1`? Because in Stage 3 RAM math, `element_address = base_address + index * element_size` - the first element sits at offset `0` from the start (`nums[0]`), and the LAST element of an array of length `N` sits at `nums[N - 1]`!",
 "A `for (let i = 0; i < nums.length; i++)` loop visits every valid index `0, 1, ..., N - 1` cleanly:\n1) Init `let i = 0` runs ONCE before starting.\n2) Guard `i < nums.length` checks BEFORE each pass - as soon as `i === nums.length`, the loop exits safely (writing `i <= nums.length` is the classic **off-by-one bug** that reads `nums[nums.length] === undefined`!).\n3) Step `i++` runs at the end of each pass."
 ],
 diagram:
"0-Indexed Array Memory Layout: const arr = [ 40, 70, 90 ]; (arr.length === 3)\n" +
" Index : [0] [1] [2] [3] <-- OUT OF BOUNDS (undefined!)\n" +
" Value : 40 70 90\n" +
" Loop : for (let i = 0; i < arr.length; i++) --> visits i = 0, 1, 2",
 takeaway: "Valid indices of an array of length N are strictly `0` through `N - 1`, matched by `i < arr.length`."
 },
 {
 heading: "2. Functions, `return` vs. `console.log`, and the LIFO Call Stack",
 body: [
 "A **Function** packages reusable logic with named inputs (**parameters**) and hands back an output via **`return`**. Crucial distinction: `console.log(x)` merely prints text for a human looking at a terminal and evaluates to `undefined`! Only `return value;` hands a computed value back to the caller expression AND immediately exits the function.",
 "How does the CPU remember where to jump back when Function `A()` calls `B()`, which calls `C()`? Using a region of RAM called the **Call Stack** (Last-In, First-Out / LIFO):\n• Every function call **pushes** a new **Stack Frame** holding its local variables and its **Return Address** (saved `PC`).\n• When `C()` hits `return`, its frame **pops** off the top and execution resumes right inside `B()`! If a recursive function forgets its **base case** (`if (n <= 1) return 1;`), it pushes frames endlessly until RAM runs out (**Stack Overflow**!)."
 ],
 diagram:
"Call Stack (LIFO - Last Frame Pushed is First Frame Popped):\n" +
" | Frame 3: add(2, 3) -> returns 5, POPS! |\n" +
" | Frame 2: doubleSum() -> receives 5 |\n" +
" | Frame 1: main() |\n" +
" +------------------------------------------+",
 takeaway: "`return` hands data back and pops the stack frame; recursion ALWAYS needs a terminating base case."
 },
 {
 heading: "3. Objects (`{ key: value }`), Reference Aliasing & Systematic Debugging",
 body: [
 "• **Objects / Hash Maps** (`const user = { id: 7, role: 'admin' };`) store named `key: value` pairs for instant `O(1)` lookup: use dot `user.role` when you know the literal property name, or dynamic brackets `counts[word]` when the key is stored inside a variable!\n• **Primitive Copy vs. Object/Array Reference**: Primitives (`number`, `boolean`, `string`) copy by value; Objects and Arrays hold a **memory reference (pointer)** to heap data! If you write `const alias = arr; alias.push(99);`, BOTH `alias` and `arr` point to the exact same array in RAM (`arr` now contains `99` too!). Copy with `const copy = [...arr];` when you want an independent clone.\n• **Systematic Debugging Protocol**: Never randomly change operators hoping tests pass! 1) Read the exact Error Type + Line Number (`TypeError` vs `ReferenceError`), 2) Shrink input to the smallest failing case (`[]`, `[1]`), 3) Inspect intermediate state at boundaries (`i = 0`, `i = length - 1`), and 4) Fix the root invariant."
 ],
 diagram:
"Reference Aliasing vs. Shallow Clone in Heap RAM:\n" +
" const a = [1, 2];\n" +
" const b = a; // b ---> SAME [1, 2] box as a! (b.push(3) mutates a!)\n" +
" const c = [...a]; // c ---> NEW [1, 2] box! (independent copy)",
 takeaway: "Use `counts[key] = (counts[key] || 0) + 1` for frequency maps, watch shared references, and test boundary inputs `[]` and `[x]`."
 }
 ],
 concepts: [
 {
 id: "s5m2_c1",
 title: "Tracing `for` Loop Accumulators",
 zeroTeach: "An accumulator starts at an identity value BEFORE the loop (`let sum = 0;` for addition, `let prod = 1;` for multiplication) and folds each item inside the loop (`sum += arr[i];`). Never put `let sum = 0;` INSIDE the loop body or it resets on every pass!",
 concreteExample: "Summing `[3, 5, 2]`: `sum` goes `0 -> 3 -> 8 -> 10`.",
 reteachCheck: { instruction: "Type a clean array-sum loop header and body:", target: "let sum = 0; for (let i = 0; i < a.length; i++) { sum += a[i]; }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var lists = [
 { arr: [2, 4, 6], sum: 12, last: 6 },
 { arr: [5, 1, 7, 3], sum: 16, last: 3 },
 { arr: [10, 20, 5], sum: 35, last: 5 }
 ];
 var l = lists[Math.abs(variantIdx || 0) % lists.length];
 var lock = adaptLockIn("for (let i = 0; i < arr.length; i++) { sum += arr[i]; }", "Type the standard accumulator loop blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c1",
 conceptTitle: "Tracing for Loop Accumulators",
 variantIdx: variantIdx || 0,
 prompt: "Given `const arr = [" + l.arr.join(", ") + "];`, what happens if a beginner accidentally writes `let sum = 0;` **INSIDE** the `for` loop body right before `sum += arr[i];`?",
 options: rotateOptions([
 { text: "`sum` resets to `0` on every iteration, ending with only the last element `" + l.last + "` (and `sum` is also block-scoped inside the loop!). Declare `let sum = 0;` BEFORE the loop to get `" + l.sum + "`.", isCorrect: true, whyWrong: "" },
 { text: "It still computes `" + l.sum + "` because `let` ignores re-initialization inside loops.", isCorrect: false, whyWrong: "Every pass of `{ let sum = 0; sum += arr[i]; }` creates a fresh `0` box!" },
 { text: "It multiplies the array elements.", isCorrect: false, whyWrong: "`+=` adds; putting `let sum = 0` inside discards previous iterations." },
 { text: "It causes an infinite loop.", isCorrect: false, whyWrong: "The loop still terminates at `i === arr.length`; its accumulator state is simply reset each pass." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m2_c2",
 title: "`while` Loops & Termination Invariants",
 zeroTeach: "A `while (condition)` loop repeats as long as `condition` stays `true`. Every non-infinite `while` loop MUST update at least one variable in `condition` monotonically toward the exit state (e.g., halving `n = Math.floor(n / 2)` when counting binary bits!).",
 concreteExample: "Counting steps dividing 8 by 2 while `n > 1`: `8 -> 4 -> 2 -> 1` (3 iterations).",
 reteachCheck: { instruction: "Type a terminating while loop:", target: "while (n > 1) { n = Math.floor(n / 2); steps++; }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var starts = [
 { n0: 8, steps: 3 },
 { n0: 16, steps: 4 },
 { n0: 32, steps: 5 }
 ];
 var st = starts[Math.abs(variantIdx || 0) % starts.length];
 var lock = adaptLockIn("while (n > 1) { n = n / 2; steps += 1; }", "Type the halving while loop blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c2",
 conceptTitle: "while Loop Trace & Termination",
 variantIdx: variantIdx || 0,
 prompt: "Trace: `let n = " + st.n0 + "; let steps = 0; while (n > 1) { n = n / 2; steps += 1; }`\nWhat is `steps` when the loop finishes?",
 options: rotateOptions([
 { text: "`" + st.steps + "` (computing `log2(" + st.n0 + ")` as `n` halves down to `1` and stops because `1 > 1` is `false`)", isCorrect: true, whyWrong: "" },
 { text: "`" + (st.steps + 1) + "` (running one extra pass when `n === 1`)", isCorrect: false, whyWrong: "When `n` reaches `1`, the guard `1 > 1` is `false`, so the loop exits immediately after `" + st.steps + "` passes!" },
 { text: "Infinite loop because `n` never reaches `0`.", isCorrect: false, whyWrong: "The condition is `n > 1` (not `n > 0`), which terminates cleanly as soon as `n` reaches `1`!" },
 { text: "`" + (st.n0 / 2) + "`", isCorrect: false, whyWrong: "`steps` increments by `+1` per halving (`" + st.steps + "` times), not `n / 2`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m2_c3",
 title: "`0`-Indexed Arrays & Last-Element Access",
 zeroTeach: "In a `0`-indexed array `arr` with `arr.length === N`, the first item is `arr[0]` and the last item is ALWAYS `arr[arr.length - 1]`. `arr[arr.length]` is 1 slot past the end (`undefined`)!",
 concreteExample: "For `const p = ['CPU', 'RAM', 'SSD'];` (`length === 3`), `p[0]` is `'CPU'` and `p[p.length - 1]` is `p[2] === 'SSD'`.",
 reteachCheck: { instruction: "Type the universal last-element expression:", target: "const last = arr[arr.length - 1];" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var arrays = [
 { items: [10, 30, 50, 70], idx: 2, val: 50, last: 70 },
 { items: [4, 8, 16, 32, 64], idx: 3, val: 32, last: 64 },
 { items: [9, 18, 27], idx: 1, val: 18, last: 27 }
 ];
 var a = arrays[Math.abs(variantIdx || 0) % arrays.length];
 var lock = adaptLockIn("const last = arr[arr.length - 1];", "Type the last-element lookup blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c3",
 conceptTitle: "0-Indexed Arrays & Last-Element Lookup",
 variantIdx: variantIdx || 0,
 prompt: "Given `const arr = [" + a.items.join(", ") + "];`, what do `arr[" + a.idx + "]` and `arr[arr.length - 1]` evaluate to?",
 options: rotateOptions([
 { text: "`arr[" + a.idx + "] === " + a.val + "` and `arr[arr.length - 1] === " + a.last + "`", isCorrect: true, whyWrong: "" },
 { text: "`arr[" + a.idx + "] === " + a.items[a.idx - 1] + "` (counting from `1` instead of `0`)", isCorrect: false, whyWrong: "Arrays are `0`-indexed! `arr[0]` is `" + a.items[0] + "`, so index `" + a.idx + "` holds `" + a.val + "`." },
 { text: "`arr[arr.length]` returns `" + a.last + "`", isCorrect: false, whyWrong: "`arr.length` is `" + a.items.length + "`, while the last valid index is `" + (a.items.length - 1) + "`. `arr[arr.length]` is `undefined`!" },
 { text: "`arr[-1]` returns `" + a.last + "` in standard JS bracket indexing.", isCorrect: false, whyWrong: "Unlike Python, `arr[-1]` in JavaScript looks up property `'-1'` (`undefined`); use `arr[arr.length - 1]` (or `arr.at(-1)`)." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s5m2_c4",
 title: "Off-By-One Loop Bug (`i <= arr.length` -> `NaN`)",
 zeroTeach: "Writing `for (let i = 0; i <= arr.length; i++)` executes ONE extra pass at `i = arr.length`, where `arr[arr.length]` is `undefined`. Adding `sum += undefined` in JavaScript turns your entire numeric sum into `NaN` ('Not-a-Number')!",
 concreteExample: "`[10, 20]`: `i=0 -> 10`, `i=1 -> 30`, `i=2 -> 30 + undefined = NaN`! Fix `<=` to `<`.",
 reteachCheck: { instruction: "Type the off-by-one bug-free loop bound:", target: "for (let i = 0; i < arr.length; i++)" }
 }, [
 {
 prompt: "A student writes `let sum = 0; for (let i = 0; i <= nums.length; i++) { sum += nums[i]; }` on `nums = [5, 10, 15]` and gets `NaN`! Why?",
 options: [
 { text: "Using `i <= nums.length` runs a 4th pass at `i = 3`, where `nums[3]` is `undefined`, and `30 + undefined` evaluates to `NaN`! Use `i < nums.length`.", isCorrect: true, whyWrong: "" },
 { text: "`[5, 10, 15]` exceeds JavaScript's maximum number size.", isCorrect: false, whyWrong: "`30` is tiny; the culprit is `nums[nums.length] === undefined` caused by `<=` instead of `<`!" },
 { text: "`sum` should start at `undefined` instead of `0`.", isCorrect: false, whyWrong: "Starting `sum` at `undefined` would make `sum += 5` produce `NaN` on the very first iteration!" },
 { text: "`i++` increments by 2.", isCorrect: false, whyWrong: "`i++` adds `1`; the boundary condition `<=` ran one index too far." }
 ],
 lockInInstruction: "Type the corrected boundary check:",
 lockInTarget: "for (let i = 0; i < nums.length; i++)"
 }
 ]),
 {
 id: "s5m2_c5",
 title: "Functions: `return` vs. `console.log`",
 zeroTeach: "A function without an explicit `return expr;` statement ALWAYS returns `undefined`! `console.log(a + b)` only writes text to the developer console - it hands `undefined` back to `const x = add(2, 3);` unless you `return a + b;`!",
 concreteExample: "`function sq(n) { return n * n; }` lets you compose `sq(3) + sq(4) === 25`.",
 reteachCheck: { instruction: "Type a pure returning function:", target: "function area(w, h) { return w * h; }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var lock = adaptLockIn("function double(n) { return n * 2; }", "Type a clean returning function blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c5",
 conceptTitle: "Functions: return vs. console.log",
 variantIdx: variantIdx || 0,
 prompt: "Consider `function calc(x) { console.log(x * 3); }` (with NO `return` keyword). After `const ans = calc(4) + 1;`, what is stored in `ans`?",
 options: rotateOptions([
 { text: "`NaN`! Because `calc(4)` has no `return`, it returns `undefined`, and `undefined + 1` evaluates to `NaN`.", isCorrect: true, whyWrong: "" },
 { text: "`13` (`4 * 3 + 1`).", isCorrect: false, whyWrong: "`12` was printed to the console screen, NOT returned to the `+ 1` expression! Without `return x * 3;`, `calc(4)` evaluates to `undefined`." },
 { text: "`undefined`.", isCorrect: false, whyWrong: "`calc(4)` itself is `undefined`, and then adding `+ 1` turns `undefined + 1` into `NaN`!" },
 { text: "`\"121\"`.", isCorrect: false, whyWrong: "`console.log` does not return a string." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m2_c6",
 title: "The Call Stack (LIFO Frames & Recursion Base Cases)",
 zeroTeach: "Function calls push Stack Frames onto the Call Stack in Last-In, First-Out (LIFO) order: the most recently called inner function finishes and pops FIRST. In recursion (`fact(n)` calling `fact(n - 1)`), an explicit base case (`if (n <= 1) return 1;`) stops pushing frames and unwinds the stack!",
 concreteExample: "`fact(3)` pushes `fact(3) -> fact(2) -> fact(1)=1`, then unwinds `2*1=2 -> 3*2=6`.",
 reteachCheck: { instruction: "Type recursive factorial with base case:", target: "function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var nums = [
 { n: 4, ans: 24 },
 { n: 3, ans: 6 },
 { n: 5, ans: 120 }
 ];
 var item = nums[Math.abs(variantIdx || 0) % nums.length];
 var lock = adaptLockIn("if (n <= 1) return 1;", "Type the recursion base-case guard:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c6",
 conceptTitle: "Call Stack Frames & Base Cases",
 variantIdx: variantIdx || 0,
 prompt: "In `function fact(n) { if (n <= 1) return 1; return n * fact(n - 1); }`, what value does `fact(" + item.n + ")` return, and what happens if `if (n <= 1) return 1;` is deleted?",
 options: rotateOptions([
 { text: "Returns `" + item.ans + "`; deleting the base case pushes infinite stack frames (`fact(0), fact(-1)...`) until `RangeError: Maximum call stack size exceeded` (Stack Overflow)!", isCorrect: true, whyWrong: "" },
 { text: "Returns `" + item.n + "`; deleting the base case simply stops automatically at `0`.", isCorrect: false, whyWrong: "Without an explicit base case, `n - 1` keeps recursing into `-1, -2, -3...` until Call Stack memory overflows!" },
 { text: "Call Stack frames pop in First-In, First-Out queue order.", isCorrect: false, whyWrong: "A Call Stack is **LIFO** (Last-In, First-Out): `fact(1)` must finish and pop BEFORE `fact(2)` can multiply its result!" },
 { text: "Each recursive call overwrites the exact same local `n` box.", isCorrect: false, whyWrong: "Every call gets its OWN isolated Stack Frame with its own local `n`!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m2_c7",
 title: "Objects / Hash Maps: Dot vs. Bracket Dynamic Keys",
 zeroTeach: "Inside `{ id: 10, role: 'eng' }`, `obj.key` looks up a literal property named `'key'`. When the key name is stored in a variable `const k = 'role'`, you MUST use bracket notation `obj[k]` (`obj.k` looks for a literal property named `'k'`, returning `undefined`!).",
 concreteExample: "Counting characters: `counts[ch] = (counts[ch] || 0) + 1;` uses dynamic `[ch]`!",
 reteachCheck: { instruction: "Type the classic frequency-counter update:", target: "counts[ch] = (counts[ch] || 0) + 1;" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var lock = adaptLockIn("counts[key] = (counts[key] || 0) + 1;", "Type the dynamic bracket counter idiom blindfolded:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c7",
 conceptTitle: "Objects: Dot vs. Dynamic Bracket Lookup",
 variantIdx: variantIdx || 0,
 prompt: "Given `const cpu = { cores: 6, arch: 'x64' }; const field = 'cores';`, what is the difference between `cpu[field]` and `cpu.field`?",
 options: rotateOptions([
 { text: "`cpu[field]` evaluates `field` (`'cores'`) and returns `6`, whereas `cpu.field` looks for a literal key named `'field'` and returns `undefined`!", isCorrect: true, whyWrong: "" },
 { text: "Both `cpu[field]` and `cpu.field` return `6`.", isCorrect: false, whyWrong: "Dot notation `cpu.field` NEVER evaluates a variable named `field` - it looks strictly for `{ field: ... }`!" },
 { text: "Objects only accept numeric indices like arrays.", isCorrect: false, whyWrong: "Objects map arbitrary string/symbol keys to values in `O(1)` average time." },
 { text: "`cpu[field]` throws a SyntaxError.", isCorrect: false, whyWrong: "Dynamic bracket lookup `obj[expr]` is core to dictionaries and hash maps!" }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 {
 id: "s5m2_c8",
 title: "Value Copy vs. Heap Reference Aliasing",
 zeroTeach: "Assigning an array or object (`const b = a;`) copies only the **memory address reference**, NOT the underlying array! Mutating `b.push(9)` mutates `a` too because both names point to the exact same heap allocation. Clone with `const b = [...a];` or `{ ...obj }`.",
 concreteExample: "`const a = [1, 2]; const b = a; b[0] = 99;` -> `a[0]` is now `99`! With `const c = [...a];`, `c` is separate.",
 reteachCheck: { instruction: "Type shallow array & object clones:", target: "const arrCopy = [...arr]; const objCopy = { ...obj };" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var lock = adaptLockIn("const safeCopy = [...items];", "Type the non-mutating spread clone:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c8",
 conceptTitle: "Reference Aliasing vs. Shallow Cloning",
 variantIdx: variantIdx || 0,
 prompt: "Trace:\n`const a = [10, 20];`\n`const b = a;`\n`b.push(30);`\nWhat is `a.length` now, and why?",
 options: rotateOptions([
 { text: "`3`! Because `const b = a;` copied the memory reference to the SAME heap array, so `b.push(30)` mutated `[10, 20, 30]` seen by `a` too!", isCorrect: true, whyWrong: "" },
 { text: "`2`, because `a` was declared with `const` so its contents can never change.", isCorrect: false, whyWrong: "Crucial distinction: `const a` prevents reassigning `a = somethingElse`, NOT mutating elements inside the heap array `a` points to!" },
 { text: "`2`, because `const b = a` automatically clones the entire array.", isCorrect: false, whyWrong: "Plain `=` copies only the 64-bit reference pointer; use `[...a]` or `a.slice()` to clone!" },
 { text: "Throws a `TypeError` on `b.push(30)`.", isCorrect: false, whyWrong: "`push` mutates the array in place cleanly without reassigning the `b` binding." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 },
 scenarioBankConcept({
 id: "s5m2_c9",
 title: "Systematic Debugging & Boundary Testing",
 zeroTeach: "Great engineers debug scientifically: 1) Read the exact Error Type + File:Line stack trace, 2) Reproduce with a tiny deterministic input (e.g., `[]`, `[42]`, `0`, negative), 3) Form ONE falsifiable hypothesis about expected vs. actual variable state at a line, and 4) Add a regression test!",
 concreteExample: "`max([-5, -2, -9])` returning `0` immediately exposes initializing `let best = 0` instead of `let best = arr[0]`!",
 reteachCheck: { instruction: "Type the safe max initialization:", target: "let best = arr[0];" }
 }, [
 {
 prompt: "A `findMax(nums)` function initializes `let best = 0;` and passes on `[3, 9, 4]`, yet returns `0` (wrong!) on `[-8, -2, -5]`. What root cause did boundary testing expose?",
 options: [
 { text: "Initializing `best = 0` assumes at least one non-negative input! Initializing `let best = nums[0];` (with an empty-array guard) works across negative and positive numbers alike.", isCorrect: true, whyWrong: "" },
 { text: "JavaScript `<` and `>` operators do not work on negative numbers.", isCorrect: false, whyWrong: "`-2 > -8` works cleanly in JS; comparing against a hardcoded `0` beat `-2`!" },
 { text: "Arrays cannot hold negative integers.", isCorrect: false, whyWrong: "Arrays hold negative numbers fine." },
 { text: "Randomly changing `>` to `<` fixes it.", isCorrect: false, whyWrong: "Flipping `>` to `<` computes minimum instead of fixing the `0` seed bug!" }
 ],
 lockInInstruction: "Type the bug-free max loop start:",
 lockInTarget: "if (nums.length === 0) return null; let best = nums[0];"
 }
 ]),
 {
 id: "s5m2_c10",
 title: "Writing Real Functions from Scratch Blindfolded",
 zeroTeach: "You now own the entire vertical stack: transistors -> noise margins -> gates -> adders/latches -> CPU Fetch-Decode-Execute -> blindfolded symbol mastery -> clean functions, loops, arrays, and maps!",
 concreteExample: "`function countPos(a) { let c = 0; for (const x of a) { if (x > 0) c++; } return c; }`",
 reteachCheck: { instruction: "Type this complete filter-count snippet blindfolded:", target: "function countPos(a) { let c = 0; for (const x of a) { if (x > 0) c++; } return c; }" },
 generate: function (variantIdx, weakKeys, stageNum) {
 var challenges = [
 {
 code: "function sumEven(a) { let s = 0; for (const n of a) { if (n % 2 === 0) s += n; } return s; }",
 call: "sumEven([1, 4, 5, 6])",
 ans: "10",
 wrong1: "20",
 wrong2: "16"
 },
 {
 code: "function countVal(a, t) { let c = 0; for (const x of a) { if (x === t) c++; } return c; }",
 call: "countVal([2, 7, 2, 9, 2], 2)",
 ans: "3",
 wrong1: "6",
 wrong2: "5"
 },
 {
 code: "function maxOf(a) { let m = a[0]; for (const x of a) { if (x > m) m = x; } return m; }",
 call: "maxOf([-9, -3, -12])",
 ans: "-3",
 wrong1: "0",
 wrong2: "-9"
 }
 ];
 var ch = challenges[Math.abs(variantIdx || 0) % challenges.length];
 var lock = adaptLockIn(ch.code, "Author the complete function blindfolded to lock in Stage 5:", weakKeys, stageNum);
 return {
 conceptId: "s5m2_c10",
 conceptTitle: "Writing Complete Functions Blindfolded",
 variantIdx: variantIdx || 0,
 prompt: "Trace this complete function:\n`" + ch.code + "`\nWhat does `" + ch.call + "` return?",
 options: rotateOptions([
 { text: "`" + ch.ans + "`", isCorrect: true, whyWrong: "" },
 { text: "`" + ch.wrong1 + "`", isCorrect: false, whyWrong: "Trace each element through the `if (...)` condition inside the `for...of` loop: `" + ch.call + "` returns `" + ch.ans + "`." },
 { text: "`" + ch.wrong2 + "`", isCorrect: false, whyWrong: "Only elements matching the `if` guard update the accumulator, yielding `" + ch.ans + "`." },
 { text: "`undefined`", isCorrect: false, whyWrong: "The explicit `return` statement at the end hands back `" + ch.ans + "`." }
 ], variantIdx || 0),
 lockInInstruction: lock.instruction,
 lockInTarget: lock.target,
 zeroTeach: this.zeroTeach,
 concreteExample: this.concreteExample,
 reteachCheck: this.reteachCheck
 };
 }
 }
 ]
 }
 ];

 // ==========================================================================
 // CURRICULUM REGISTRY & PUBLIC API
 // ==========================================================================

 var STAGES = [
 {
 id: "stage1",
 number: 1,
 title: "Stage 1: Pre-Computer History & Physical Laws",
 summary: "Tally marks, positional bases, Abacus, Jacquard punch cards, Babbage & Lovelace, Ohm's Law, relays, tubes, and silicon transistors.",
 modules: stage1Modules
 },
 {
 id: "stage2",
 number: 2,
 title: "Stage 2: How Binary & Logic Were Born",
 summary: "Voltage noise margins, why Base-2 beats Base-10 physically, NOT/AND/OR/NAND/XOR switch gates, Half/Full-Adders, and 1-bit latches/flip-flops.",
 modules: stage2Modules
 },
 {
 id: "stage3",
 number: 3,
 title: "Stage 3: How a Computer Runs Instructions",
 summary: "System clock, CPU registers, ALU, Control Unit, Fetch-Decode-Execute, RAM vs. SSD, machine opcodes, Assembly, Compilers/Interpreters, and OS Kernel.",
 modules: stage3Modules
 },
 {
 id: "stage4",
 number: 4,
 title: "Stage 4: No-Look Touch Typing, Symbols & Shortcuts",
 summary: "F & J tactile bumps, 8-finger columns, opposite-hand Shift, heavy developer symbol clusters, and safe editor/terminal keyboard shortcuts.",
 modules: stage4Modules
 },
 {
 id: "stage5",
 number: 5,
 title: "Stage 5: Strong Coding Foundations from Scratch",
 summary: "Variables as memory boxes, types, expressions, conditionals, loops, 0-indexed arrays, objects, functions & call stacks, and systematic debugging.",
 modules: stage5Modules
 }
 ];

 var ALL_MODULES = [];
 var MODULE_BY_ID = {};
 var CONCEPT_BY_ID = {};

 (function indexCurriculum() {
 for (var s = 0; s < STAGES.length; s++) {
 var st = STAGES[s];
 for (var m = 0; m < st.modules.length; m++) {
 var mod = st.modules[m];
 ALL_MODULES.push(mod);
 MODULE_BY_ID[mod.id] = mod;
 for (var c = 0; c < mod.concepts.length; c++) {
 var con = mod.concepts[c];
 CONCEPT_BY_ID[con.id] = {
 concept: con,
 module: mod,
 stage: st
 };
 }
 }
 }
 })();

 window.CSTrainer.Curriculum = {
 STAGES: STAGES,
 ALL_MODULES: ALL_MODULES,
 getModuleById: function (id) { return MODULE_BY_ID[id] || null; },
 getConceptEntry: function (cid) { return CONCEPT_BY_ID[cid] || null; },
 getTotalModuleCount: function () { return ALL_MODULES.length; },
 getTotalConceptCount: function () { return Object.keys(CONCEPT_BY_ID).length; }
 };
})();
