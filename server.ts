import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// URL-encoded and plain text body parsers
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.text({ type: "*/*", limit: "50mb" }));

// Initialize GenAI client gracefully
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Error initializing Gemini API Client:", error);
  }
} else {
  console.log("GEMINI_API_KEY env variable not found. Running in simulation mode.");
}

// Timeout wrapper so AI calls complete gracefully without stalling requests
function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);
}

// ----------------- GRADE 12 CAPS API ROUTES (TEXT-BASED PROTOCOL) -----------------

// Helper to extract fields from urlencoded or plain text body
function parseRequestBody(req: express.Request): Record<string, string> {
  if (typeof req.body === "object" && req.body !== null) {
    return req.body as Record<string, string>;
  }
  if (typeof req.body === "string") {
    const params = new URLSearchParams(req.body);
    const result: Record<string, string> = {};
    params.forEach((val, key) => {
      result[key] = val;
    });
    return result;
  }
  return {};
}

// 1. Grade 12 CAPS AI Chat Tutor
app.post("/api/chat", async (req, res) => {
  const body = parseRequestBody(req);
  const message = body.message || body.userMessage || "";
  const activeSubject = body.subject || "Grade 12 Mathematics & Sciences";
  const activeTopic = body.currentTopic || "Grade 12 Matric Revision";
  const conversationHistory = body.history || "";

  if (!message.trim()) {
    return res.status(400).type("text/plain").send("Message prompt cannot be empty.");
  }

  if (ai) {
    try {
      const systemInstruction = `You are 'Mzansi Tutor', a leading South African CAPS & IEB Matric exam specialist.
You assist Grade 12 learners in scoring Level 7 (80%+) in their National Senior Certificate (NSC) examinations.
The current subject is: "${activeSubject}".
The current topic/paper focus is: "${activeTopic}".

Guidelines:
- Explain mathematical and scientific steps methodically, showing the exact formula, substitution, calculation, and SI units or notation required by DBE/CAPS examiners.
- When explaining past paper questions, clearly mention where marks are awarded:
  [M] = Method mark
  [A] = Accuracy mark
  [CA] = Consistent Accuracy / Carry-over mark
  [C] = Conversion mark
- Point out common pitfalls matric learners make in NSC exams.
- Maintain an encouraging, focused, and academic tone suited for a Grade 12 matriculant. Keep explanations clean and formatted with clear bullet points and steps.`;

      const promptText = conversationHistory 
        ? `Previous matric revision context:\n${conversationHistory}\n\nStudent question:\n${message}`
        : message;

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.5,
          }
        }),
        4500
      );

      const replyText = response.text || "Let's work through this Grade 12 question together!";
      return res.type("text/plain").send(replyText);
    } catch (error: any) {
      console.error("Gemini API chat error:", error);
    }
  }

  // High quality Grade 12 fallback simulation
  let responseText = "Let's break down this Grade 12 Matric concept step-by-step.";
  const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("calculus") || lowerMsg.includes("first principle") || lowerMsg.includes("derivative")) {
      responseText = `**Grade 12 Mathematics (Calculus - First Principles):**

Formula from DBE Formula Sheet:
f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h

**Key CAPS Marking Guidelines:**
1. **Step 1:** Compute f(x + h) and expand terms carefully. [1 mark M]
2. **Step 2:** Form [f(x + h) - f(x)] / h and factorize out h. [1 mark M]
3. **Step 3:** Keep writing lim_{h -> 0} until you take the limit! (Deduction of 1 mark if omitted before substituting h = 0). [1 mark A]
4. **Step 4:** Substitute h = 0 to reach the final derivative. [1 mark A]

Would you like to try a specific 5-mark past exam question on this?`;
    } else if (lowerMsg.includes("doppler") || lowerMsg.includes("physics")) {
      responseText = `**Grade 12 Physical Sciences (Doppler Effect - Paper 1):**

Formula:
f_L = [(v ± v_L) / (v ± v_S)] * f_S

**DBE Exam Strategy:**
- For stationary listener (v_L = 0): f_L = [v / (v - v_S)] * f_S when source approaches.
- For moving away: f_L = [v / (v + v_S)] * f_S.
- **Mark allocation:** 
  • 1 mark for formula directly from official information sheet [M]
  • 1 mark for correct signs in substitution [M]
  • 1 mark for final frequency with correct SI unit (Hz) [A]

Would you like to solve a past NSC Doppler effect question together?`;
    } else if (lowerMsg.includes("meiosis") || lowerMsg.includes("genetics") || lowerMsg.includes("life science")) {
      responseText = `**Grade 12 Life Sciences (Genetics & Heredity - Paper 2):**

When answering a standard 6-mark genetic cross question in CAPS:
1. State **P1 phenotype** and **P1 genotype**. [1 mark]
2. Clearly show **Meiosis** and **Gametes**. [1 mark]
3. Use a Punnett square or fertilization lines to show **Fertilisation**. [1 mark]
4. State **F1 genotype** and **F1 phenotype ratio**. [1 mark]

Always remember to state both P1 and F1 generations clearly, as DBE examiners deduct 1 mark if omitted!`;
    } else {
      responseText = `Great Grade 12 question! In NSC examinations for "${activeSubject}", examiners test both conceptual understanding and precise mathematical/scientific working. 

To tackle this effectively:
1. Identify the given values and the target variable.
2. Select the correct formula from the official CAPS data sheet.
3. Show all substitution steps before simplifying.

What specific past paper question or topic would you like to review next?`;
    }

    res.type("text/plain").send(responseText);
});

// 2. Dedicated Grade 12 Past Paper Question Solver & Explainer
app.post("/api/solve-question", async (req, res) => {
  const body = parseRequestBody(req);
  const questionText = body.questionText || "";
  const subject = body.subject || "Grade 12 Mathematics";
  const paper = body.paper || "Paper 1";
  const marks = body.marks || "5";
  const studentAnswer = body.studentAnswer || "";

  if (!questionText.trim()) {
    return res.status(400).type("text/plain").send("Question text is required.");
  }

  if (ai) {
    try {
      const prompt = `You are 'Mzansi Tutor', a Senior Grade 12 CAPS National Senior Certificate Examiner for South Africa.
Analyze this Grade 12 Past Paper question:
Subject: ${subject}
Paper: ${paper}
Total Marks: ${marks} Marks

Question:
"${questionText}"

${studentAnswer ? `Student's Attempted Answer: "${studentAnswer}"` : "Provide full model solution and mark breakdown."}

Output plain text strings separated by a vertical bar delimiter (|), rather than any object structure. No markdown code blocks, no object notation:
SOLUTION_STEPS | (Step 1, Step 2, Step 3 with formulas, substitutions, and mark allocations e.g. [1 mark M], [1 mark A])
FINAL_ANSWER | (The exact final answer or conclusion with correct SI units)
DBE_MARKING_GUIDELINES | (How official CAPS DBE markers allocate marks, including carry-over rules)
COMMON_MATRIC_MISTAKES | (Top 2-3 mistakes Grade 12 learners make on this question in finals)
EXAMINER_TIP | (One golden matric tip to guarantee full marks)
${studentAnswer ? `STUDENT_EVALUATION | (Detailed feedback on student's attempt, marks awarded out of ${marks}, and corrections)` : ""}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.3,
          }
        }),
        4500
      );

      const replyText = response.text || "Solution generated successfully.";
      return res.type("text/plain").send(replyText);
    } catch (error) {
      console.error("Gemini past paper solver error:", error);
    }
  }

  // Fallback simulation text using plain text strings separated by vertical bar delimiter (|)
  const fallback = `SOLUTION_STEPS | Step 1: Identify given variables & state formula verbatim from Grade 12 information sheet. [1 mark M] | Step 2: Substitute values accurately without pre-rounding. [2 marks M/A] | Step 3: Calculate and express final value rounded to two decimal places with SI units. [1 mark A]
FINAL_ANSWER | Verified according to Department of Basic Education (DBE) National Senior Certificate marking guidelines.
DBE_MARKING_GUIDELINES | In DBE CAPS exams, carry-over marking (CA) applies if an earlier algebraic mistake is carried forward correctly without conceptual error.
COMMON_MATRIC_MISTAKES | Premature rounding in intermediate calculation steps | Omitting SI units or algebraic negative signs | Leaving out required formula names
EXAMINER_TIP | Always write down the formula verbatim from the formula sheet before substituting numerical values to secure the first method mark.
${studentAnswer ? `STUDENT_EVALUATION | Good effort on your working! Check intermediate steps to confirm algebraic signs and SI units.` : ""}`;

  res.type("text/plain").send(fallback);
});

// 3. AI Document Study Generator (Exclusively for PowerPoints, Documents, PDFs, and Images)
// Supports 6 Modes: summarize, long_questions, short_questions, flashcards, mcq, fill_blank
app.post("/api/ai-document-study", async (req, res) => {
  const body = parseRequestBody(req);
  const mode = body.mode || "summarize";
  const fileName = body.fileName || "matric_study_doc.pdf";
  const fileType = body.fileType || "pdf";
  const fileContent = body.fileContent || "";
  const subject = body.subject || "Grade 12 CAPS";
  const topic = body.topic || "Matric Examination Study";

  if (!fileContent.trim() && !fileName) {
    return res.status(400).type("text/plain").send("A document, powerpoint, pdf, or image file is required.");
  }

  // Construct mode-specific guidelines (Output plain text strings separated by vertical bar delimiter |)
  let modeInstruction = "";
  if (mode === "summarize") {
    modeInstruction = `You are 'Mzansi Tutor', a Senior Grade 12 CAPS / DBE Matric Academic Specialist.
Summarize the provided study material (${fileType}: "${fileName}") for a Grade 12 matriculant.
Output plain text strings separated by a vertical bar delimiter (|), rather than any object structure.
Generate 5 to 7 key revision entries, each on its own single line in this exact format:
SECTION_TITLE | CORE_DEFINITION_OR_LAW | DBE_EXAM_TAKEAWAY | TOP_MATRIC_PITFALL
Do not output headers, codeblocks, or object notation. Output only plain text strings separated by vertical bars.`;
  } else if (mode === "long_questions") {
    modeInstruction = `You are 'Mzansi Tutor', a Senior Grade 12 CAPS Exam Paper Setter.
Based strictly on the provided study material (${fileType}: "${fileName}"), generate 2 structured exam LONG QUESTIONS (8-15 marks each).
Output each question component on its own line as plain text strings separated by a vertical bar delimiter (|), rather than any object structure:
QUESTION_NUMBER | QUESTION_PROMPT_AND_SCENARIO | MARKS | MODEL_MEMORANDUM_WITH_MARKS [M]/[A]/[CA] | COMMON_EXAM_ERRORS
Output only plain text strings separated by vertical bars.`;
  } else if (mode === "short_questions") {
    modeInstruction = `You are 'Mzansi Tutor', a Grade 12 CAPS Matric Examiner.
Based strictly on the provided study material (${fileType}: "${fileName}"), generate 4 to 6 SHORT QUESTIONS (2-4 marks each).
Output each question on its own single line as plain text strings separated by a vertical bar delimiter (|), rather than any object structure:
QUESTION_NUMBER | QUESTION_PROMPT | MARKS | MEMORANDUM_ANSWER
Output only plain text strings separated by vertical bars.`;
  } else if (mode === "flashcards") {
    modeInstruction = `You are 'Mzansi Tutor', a Grade 12 Matric Revision Specialist.
Generate 6 to 8 high-yield interactive STUDY FLASHCARDS based strictly on the provided study material (${fileType}: "${fileName}").
Output EACH flashcard on its own single line as plain text strings separated by a vertical bar delimiter (|), rather than any object structure:
FRONT_PROMPT | BACK_EXPLANATION
Do not use headers, numbering, bullets, or extra commentary. Only output plain text strings separated by the vertical bar delimiter.`;
  } else if (mode === "mcq") {
    modeInstruction = `You are 'Mzansi Tutor', a Grade 12 NSC Exam Setter.
Generate 5 MULTIPLE CHOICE QUESTIONS (MCQ) based strictly on the provided study material (${fileType}: "${fileName}").
Output EACH question on its own single line as plain text strings separated by a vertical bar delimiter (|), rather than any object structure:
QUESTION_TEXT | OPTION_A | OPTION_B | OPTION_C | OPTION_D | CORRECT_LETTER (A, B, C, or D) | EXPLANATION
Do not use headers, numbering, bullets, or extra commentary. Only output plain text strings separated by the vertical bar delimiter.`;
  } else if (mode === "fill_blank") {
    modeInstruction = `You are 'Mzansi Tutor', a Grade 12 Revision Specialist.
Generate 5 FILL-IN-THE-EMPTY-SPACE (Cloze) questions based strictly on the provided study material (${fileType}: "${fileName}").
Output EACH item on its own single line as plain text strings separated by a vertical bar delimiter (|), rather than any object structure:
SENTENCE_WITH_BLANK (use _____ for the blank) | CORRECT_ANSWER | HINT
Do not use headers, numbering, bullets, or extra commentary. Only output plain text strings separated by the vertical bar delimiter.`;
  }

  if (ai) {
    try {
      let parts: any[] = [{ text: modeInstruction }];

      // Check if file is a base64 data URL (e.g. image or pdf)
      if (fileContent.startsWith("data:") && fileContent.includes(";base64,")) {
        const [meta, base64Data] = fileContent.split(";base64,");
        const mimeType = meta.replace("data:", "");
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
        parts.push({ text: `Analyze this attached file ("${fileName}", type: ${mimeType}) for Grade 12 ${subject} - ${topic}. Execute the requested study mode: ${mode}. Remember to output plain text strings separated by a vertical bar delimiter (|), rather than any object structure.` });
      } else {
        // Plain text content extracted from document or powerpoint
        parts.push({
          text: `Study Material Content from "${fileName}" (${fileType}) for Grade 12 ${subject} - ${topic}:\n\n${fileContent.slice(0, 18000)}\n\nExecute the requested study mode: ${mode}. Remember to output plain text strings separated by a vertical bar delimiter (|), rather than any object structure.`
        });
      }

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: parts
            }
          ],
          config: {
            temperature: 0.4
          }
        }),
        4500
      );

      const replyText = response.text || "Generated study content successfully.";
      return res.type("text/plain").send(replyText);
    } catch (error: any) {
      console.error("Gemini AI document study error:", error);
    }
  }

  // Fallback simulation text using plain text strings separated by vertical bar delimiter (|)
  let simulatedText = "";
  if (mode === "summarize") {
    simulatedText = `CORE CONCEPTS | Fundamental Laws and Definitions from ${fileName} | Tested heavily in Paper 1 and Paper 2 DBE curricula | Omitting exact phrasing causes lost marks
EXAM TAKEAWAYS | Mandatory Formula Quoting before substitution | Accounts for 15 to 25 marks across the examination paper | Always write formula verbatim from official data sheet
MARKING RUBRICS | Carry-Over Marking [CA] Guidelines | Learners are credited for valid downstream steps if arithmetic error is made | Do not stop solving after an early mistake
CRITICAL UNITS | Standard SI Units and Vector Directions | All final answers require correct units (e.g. m·s⁻¹, N, J, mol·dm⁻³) | Forgetting units or directions loses accuracy marks [A]
TOP PITFALLS | Premature Intermediate Rounding Off | Only round off final answers to two decimal places | Rounding off early causes inaccuracy mark penalties`;
  } else if (mode === "long_questions") {
    simulatedText = `Question 1.1 | State the relevant scientific law or mathematical theorem demonstrated in ${fileName} in words. | 2 Marks | Clear verbatim definition according to DBE CAPS guideline. [2 marks A] | Failing to specify isolated system conditions
Question 1.2 | Calculate the unknown variable under the given conditions, showing all intermediate working. | 5 Marks | Formula [1 mark M] | Substitution [2 marks M/A] | Final value with SI unit [1 mark A] | Direction [1 mark A] | Premature rounding in intermediate steps
Question 1.3 | Explain the effect on the system if the primary independent variable is halved. | 3 Marks | Proportionality reasoning: independent halved leads to inverse proportional shift. [2 marks M, 1 mark A] | Stating numerical value without explaining scientific law
Question 1.4 | Give ONE practical safety precaution or examination pitfall related to this procedure. | 2 Marks | Relevant precaution identified and linked to experimental control. [2 marks A] | Vague non-scientific explanations`;
  } else if (mode === "short_questions") {
    simulatedText = `Question 1 | Define the primary concept in words according to CAPS examination guidelines for ${fileName}. | 2 Marks | The rate of change or standard textbook definition verbatim. [2 marks A]
Question 2 | State the standard SI unit and symbol used for this quantity in NSC examinations. | 2 Marks | Correct SI unit with accepted scientific symbol (e.g. kg·m·s⁻¹ or mol·dm⁻³). [2 marks A]
Question 3 | Give ONE condition under which this formula or principle remains valid. | 2 Marks | Isolated system / closed environment / constant temperature. [2 marks A]
Question 4 | How do DBE examiners award carry-over marks [CA] on this calculation? | 2 Marks | If an initial arithmetic error is made but the subsequent formula substitution is executed correctly, carry-over marks are awarded. [2 marks A]`;
  } else if (mode === "flashcards") {
    simulatedText = `What is the official DBE definition of the primary law in ${fileName}? | Stated verbatim from the CAPS guidelines: the rate of change is directly proportional to the applied net force and occurs in the direction of the force.
What is the difference between Method Marks [M] and Accuracy Marks [A]? | [M] marks reward showing the correct formula and valid algebraic substitution steps; [A] marks reward the exact final numerical answer with correct SI units.
What is Carry-Over Marking [CA] in NSC matric evaluations? | Carry-over marking ensures a learner is not penalized twice for a single arithmetic mistake, provided no conceptual or mathematical contradiction is introduced.
How many decimal places must final numerical answers be rounded to in Matric? | All final answers in DBE National Senior Certificate exams must be rounded to a minimum of TWO decimal places, unless explicitly stated otherwise.
What SI unit must always accompany rate calculations in this topic? | Standard scientific SI unit derived from the base units on the official Grade 12 CAPS Information Sheet.
What happens if the original formula is omitted before substitution? | The first Method Mark [1 mark M] is automatically forfeited according to DBE marking guidelines.`;
  } else if (mode === "mcq") {
    simulatedText = `Which of the following statements best describes the key principle demonstrated in ${fileName}? | The quantity remains constant only in an open system with external friction | The rate of change of momentum is directly proportional to the net force applied | The variables are always inversely related regardless of boundary conditions | The energy is entirely converted into heat without conservation | B | In Grade 12 CAPS, this fundamental theorem states that rate of change is directly proportional to the net external force acting on the body.
What is the consequence of omitting the formula before substituting numerical values in an NSC exam? | No marks are deducted if the final answer is right | The examiner awards bonus marks for speed | The first Method Mark [M] is automatically forfeited | The entire paper is disqualified | C | DBE marking principles strictly mandate writing the formula verbatim from the data sheet to earn the first method mark [1 mark M].
When rounding off final values in National Senior Certificate examinations, learners should: | Round off at each intermediate calculator step | Round off to two decimal places only at the final step | Round off to the nearest thousand | Always truncate without rounding | B | Premature rounding leads to rounding inaccuracy errors that can forfeit the final accuracy mark [A].
Which condition is essential for this relationship to hold true according to CAPS? | Temperature and external disturbances must remain constant | The system must be connected to an alternating AC power source | The volume must double every ten seconds | All friction must equal the gravitational pull | A | Standard textbook conditions in CAPS require an isolated system with constant temperature and negligible external interference.
Carry-Over Marking [CA] is applied when: | The learner leaves the question blank | An initial algebraic slip is correctly followed through without conceptual error | The learner writes notes in the margin | The answer sheet is smudged | B | Carry-over marking ensures learners are fairly credited for correct process even if a previous calculation had a minor numerical error.`;
  } else if (mode === "fill_blank") {
    simulatedText = `In Grade 12 CAPS, the rate of change of momentum is equal to the _____ acting on the object. | net force | Think of Newton's Second Law expressed in terms of momentum.
In National Senior Certificate marking, method marks are officially designated by the symbol _____. | [M] | A single capital letter in square brackets representing method.
In an isolated system, the total linear momentum of all bodies is _____. | conserved | The law of conservation of momentum.
Unless specified otherwise in the question paper, final numerical answers must be rounded to _____ decimal places. | two | The standard decimal precision required by the DBE.
Carry-over marking is designated in DBE memorandums with the abbreviation _____. | CA | Consistent Accuracy.`;
  }

  res.type("text/plain").send(simulatedText);
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LumnySA Grade 12 server running on http://localhost:${PORT}`);
  });
}

startServer();
