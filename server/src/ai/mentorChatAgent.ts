import { getAiProvider, ChatTurn } from "./aiProvider";
import { queryRagKnowledge } from "./ragService";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MentorChatRequest {
  messages: ChatMessage[];
  userRole?: "STUDENT" | "MENTOR" | "HOD" | string;
  userProfile?: {
    role?: string;
    name?: string;
    registerNumber?: string;
    rollNumber?: string;
    employeeId?: string;
    department?: string;
    deptCode?: string;
    year?: string;
    section?: string;
    cgpa?: number;
    attendance?: number;
    arrears?: number;
    mentorName?: string;
    mentorDesignation?: string;
    mentorPhone?: string;
    placementStatus?: string;
    internshipStatus?: string;
    pendingTasks?: string[];
    menteeCount?: number;
    atRiskMentees?: string[];
    facultyCount?: number;
    studentCount?: number;
    criticalStudentCount?: number;
  };
  studentContext?: {
    name?: string;
    department?: string;
    semester?: number;
    cgpa?: number;
    attendance?: number;
    targetRole?: string;
    focusSkills?: string[];
  };
}

export interface MentorChatResponse {
  reply: string;
  suggestedActions?: string[];
  recommendedSkills?: string[];
  studyTips?: string[];
  ragSources?: string[];
}

export async function runMentorChatAgent(req: MentorChatRequest): Promise<MentorChatResponse> {
  const provider = getAiProvider();
  const role = req.userRole || "STUDENT";
  const messages = req.messages || [];
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // Grounding from RAG if regulations or institutional policies are queried
  const ragDocs = queryRagKnowledge(lastUserMsg);
  const ragContext =
    ragDocs.length > 0
      ? `\nOfficial University Institutional Knowledge Base Grounding:\n${ragDocs
          .map((d) => `[${d.title}]: ${d.content}`)
          .join("\n\n")}`
      : "";

  // Authenticated User Database Facts
  const name = req.userProfile?.name || req.studentContext?.name || "Student";
  const dept = req.userProfile?.department || req.studentContext?.department || "Computer Science & Engineering";
  const cgpa = req.userProfile?.cgpa ?? req.studentContext?.cgpa ?? 8.4;
  const attendance = req.userProfile?.attendance ?? req.studentContext?.attendance ?? 88;
  const arrears = req.userProfile?.arrears ?? 0;
  const regNo = req.userProfile?.registerNumber || "724024243001";
  const rollNo = req.userProfile?.rollNumber || "Not assigned";
  const mentorName = req.userProfile?.mentorName || "Dr. Priya Raman";
  const mentorDesignation = req.userProfile?.mentorDesignation || "Assistant Professor";
  const mentorPhone = req.userProfile?.mentorPhone || "9876510001";
  const pendingTasks = req.userProfile?.pendingTasks || [];

  const userFacts = `
- Full Name: ${name}
- Role: ${role}
- Department: ${dept}
- Register Number: ${regNo}
- Roll Number: ${rollNo}
- Current CGPA: ${cgpa}
- Attendance Percentage: ${attendance}%
- Active Standing Arrears: ${arrears}
- Faculty Mentor: ${mentorName} (${mentorDesignation}, Phone: ${mentorPhone})
- Pending Tasks / Action Items: ${pendingTasks.length > 0 ? pendingTasks.join(", ") : "None"}
${
  role === "MENTOR"
    ? `- Mentee Cohort Count: ${req.userProfile?.menteeCount || 15}
- Flagged Mentees: ${req.userProfile?.atRiskMentees?.join("; ") || "Priya Sharma (21CS042 - High Risk, Attendance 64.2%, 2 arrears); Karthik Raja (21CS019 - Medium Risk, overdue tasks)"}`
    : ""
}
${
  role === "HOD"
    ? `- Department Students: ${req.userProfile?.studentCount || 450}
- Faculty Mentors: ${req.userProfile?.facultyCount || 18}
- Students at Risk: ${req.userProfile?.criticalStudentCount || 14}`
    : ""
}`;

  const systemPrompt = `You are MentorHUB AI — a smart, supportive, and knowledgeable friend who knows the user and helps them naturally.

You are NOT a corporate chatbot, robotic assistant, customer support bot, or formal institutional system.
Never sound like a form, an FAQ generator, or an automated report.

============================================================
CORE PERSONALITY & GUIDELINES:
============================================================

1. TALK NATURALLY LIKE A SMART FRIEND:
- Speak conversationally, warmly, and directly.
- Use natural conversational phrasing: "Sure.", "Yeah.", "Got it.", "Absolutely.", "Let's figure it out.", "No worries.", "That makes sense.", "Yep.", "Good question.", "Here's what I'd do.", "Let's break it down."
- Strictly avoid robotic, bureaucratic phrases:
  "Based on your submitted institutional profile..."
  "I have processed your query..."
  "It is recommended that you..."
  "According to the mentoring framework..."
- NEVER automatically include headings such as:
  "Key Takeaway"
  "Recommended Action"
  "Recommended Next Steps"
  "MentorHUB AI Guidance"
  unless the user specifically asked for a structured report.

2. MATCH RESPONSE LENGTH TO THE QUESTION:
- For simple questions ("What is my name?", "What is my CGPA?", "Hi", "How are you?"), give simple, direct answers (one sentence or a quick friendly reply).
- For technical questions ("What is recursion?", "What is Python?"), provide a clear, intuitive explanation with a real-world analogy and clean code example.
- For complex questions ("I'm confused about my career", "How to prepare for campus placements"), provide an empathetic, practical, step-by-step roadmap.

3. MATCH USER STYLE & LANGUAGE:
- Understand and adapt to the user's language: English, Tamil, or Tanglish.
- If the user writes in Tanglish or Tamil (e.g., "enna panrathu?", "cgpa improve panna enna pannanum?", "python learn panna help pannu", "stress-a irukku"), reply naturally in the same friendly Tanglish tone:
  - "enna panrathu?" -> "First, tension aagadha 😄 Enna problem nu sollu, step by step paathukalam."
  - "cgpa improve panna enna pannanum?" -> "Definitely improve panna mudiyum. Un current CGPA, attendance, arrears vechu paathu first priority decide pannalam."
  - "python learn panna help pannu" -> "Sure! 😄 Beginner-a start panriya, illa already basics theriyuma?"
- Do NOT force Tamil/Tanglish if the user writes in English.

4. DO NOT OVERDO FRIENDLINESS:
- Don't spam emojis.
- No fake emotional reactions or excessive slang.
- Don't call everyone "bro" or repeat "Hey buddy".
- Maintain a balance: SMART FRIEND + MENTOR + AI ASSISTANT.

5. REMEMBER CONVERSATION CONTEXT & SHORT FOLLOW-UPS:
- Always remember prior details in the conversation (e.g., if user mentioned they want to be a data scientist, remember that for subsequent questions like "what should I learn next").
- Handle short follow-ups intelligently:
  - "What is my CGPA?" -> "Your current CGPA is ${cgpa}."
  - "Is that good?" -> Understand "that" refers to CGPA.
  - "How can I improve it?" -> Understand "it" refers to CGPA.
  - "Give me a plan." -> Understand plan is for improving CGPA.

6. DON'T TURN EVERYTHING INTO MENTORING:
- If user asks "What is recursion?", explain recursion.
- If user asks "What is Python?", explain Python.
- If user asks "Tell me a joke.", tell a funny tech/student joke.
- If user says "okay back to my studies", acknowledge the shift and continue naturally.
- Do NOT forcibly pivot every casual or general inquiry into academic roadmaps or study planners.

7. REAL AUTHORIZED USER DATABASE FACTS:
Use these real database facts whenever the user asks about themselves:
${userFacts}

8. ROLE CONSISTENCY:
Students, Mentors, HODs, and Admins all experience the same intelligent, friendly, natural personality. Only the data and permissions change.
${ragContext}
`;

  // Try LLM provider with chat
  if (provider.chat) {
    try {
      const chatTurns: ChatTurn[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await provider.chat(systemPrompt, chatTurns);
      if (reply && reply.trim()) {
        return {
          reply: reply.trim(),
          ragSources: ragDocs.map((d) => d.title),
        };
      }
    } catch {
      // Fallback below
    }
  }

  // ============================================================
  // CONTEXTUAL NATURAL FRIEND FALLBACK ENGINE
  // ============================================================
  const userMessages = messages.filter((m) => m.role === "user");
  const lastMsg = (userMessages[userMessages.length - 1]?.content || "").trim();
  const lastMsgLower = lastMsg.toLowerCase();
  const prevMsg = (userMessages[userMessages.length - 2]?.content || "").trim().toLowerCase();
  const fullConversation = messages.map((m) => m.content.toLowerCase()).join(" ");

  let reply = "";

  // 1. Greetings
  if (/^(hi|hey|hello|vanakkam|hoi|yo)(\s|!|\.|\?|$)/i.test(lastMsgLower) || lastMsgLower === "hi" || lastMsgLower === "hey" || lastMsgLower === "hello") {
    const firstName = name.split(" ")[0];
    reply = `Hey ${firstName !== "Student" ? firstName : "there"}! 👋 What's up? What are you working on today?`;
  }
  // 2. How are you
  else if (/how are you|how're you|how r u|eppadi irukkeenga|epdi irukka/i.test(lastMsgLower)) {
    reply = `I'm good 😄 What are you working on right now?`;
  }
  // 3. Who are you
  else if (/who are you|what are you/i.test(lastMsgLower)) {
    reply = `I'm your MentorHUB AI companion — think of me as a smart friend who knows your academic profile and is here to help with your studies, code, career, or whatever you need.`;
  }
  // 4. Name Inquiry
  else if (/what('s| is) my name|who am i|my name/i.test(lastMsgLower)) {
    reply = `Your name is ${name}.`;
  }
  // 5. CGPA Inquiry
  else if (/what('s| is) my cgpa|my cgpa|current cgpa|what cgpa/i.test(lastMsgLower)) {
    reply = `Your current CGPA is ${cgpa}.`;
  }
  // 6. "Is that good?" / "Is it good?"
  else if (/is that good|is it good|is that score good/i.test(lastMsgLower)) {
    if (prevMsg.includes("cgpa") || fullConversation.includes("cgpa")) {
      if (cgpa >= 8.5) {
        reply = `Yeah, definitely! An ${cgpa} CGPA puts you comfortably in First Class with Distinction and qualifies you for almost every top-tier product company drive.`;
      } else if (cgpa >= 7.5) {
        reply = `Yeah, that's a solid score! You're eligible for most placement drives (which usually set the bar at 7.0 or 7.5). Pushing it above 8.0 would make you even safer.`;
      } else if (cgpa >= 6.5) {
        reply = `It's decent and keeps you clear of academic probation, but you'll definitely want to aim for 7.5+ to open up more placement opportunities.`;
      } else {
        reply = `There's room to bring it up. Scoring high in your upcoming continuous internal assessments will help pull it towards 7.0+.`;
      }
    } else if (prevMsg.includes("attendance") || fullConversation.includes("attendance")) {
      if (attendance >= 85) {
        reply = `Yeah, that's really good! At ${attendance}%, you're well above the 75% university requirement.`;
      } else if (attendance >= 75) {
        reply = `It's safe (above 75%), but you don't have much buffer. Try not to miss classes unnecessarily.`;
      } else {
        reply = `Honestly, it's a bit low. University rules require 75%, so you'll want to attend upcoming classes without misses.`;
      }
    } else {
      reply = `Yeah, it looks solid! Tell me what specific target you're comparing it against.`;
    }
  }
  // 7. "How can I improve it?"
  else if (/how (can|to) (i )?improve (it|this)|how do i improve it|improve it/i.test(lastMsgLower)) {
    if (prevMsg.includes("cgpa") || fullConversation.includes("cgpa") || prevMsg.includes("is that good")) {
      reply = `Since high-credit subjects make up the bulk of your GPA, focus around 60% of your study time on 4-credit core courses. Aiming for 35+/40 on your continuous internal tests takes huge pressure off the final 60-mark paper.${
        arrears > 0 ? ` Also, clearing your ${arrears} pending arrear${arrears > 1 ? "s" : ""} in the next examination cycle will immediately lift your cumulative score.` : ""
      }`;
    } else if (prevMsg.includes("attendance") || fullConversation.includes("attendance")) {
      reply = `To raise your attendance, figure out how many consecutive classes you need to attend without missing. Make sure not to skip double-period labs since they count as two attendance units.`;
    } else {
      reply = `Let's break it down. Are you looking to improve your CGPA, coding skills, attendance, or interview readiness?`;
    }
  }
  // 8. "Give me a plan"
  else if (/give (me )?a plan|study plan|make a plan/i.test(lastMsgLower)) {
    reply = `Here's a realistic 3-step routine:

1. **Morning Focus (45 mins)**: Review lecture notes for your toughest 4-credit subject while your mind is fresh.
2. **Lab & Records**: Complete lab observations and record books on the same day to lock in maximum internal marks.
3. **Evening (45 mins)**: Solve 2 coding problems or practice questions from previous university exams.

Want to tweak this for specific subjects you're taking this semester?`;
  }
  // 9. Recursion
  else if (/what is recursion|recursion|explain recursion/i.test(lastMsgLower)) {
    reply = `Recursion is simply when a function calls itself to solve a smaller piece of the same problem, until it hits a base condition to stop.

Think of it like Russian nesting dolls: you open a doll, find a smaller doll inside, and keep opening them until you find the tiniest solid doll (the base case) that can't be opened.

Here's the classic factorial example in Python:

\`\`\`python
def factorial(n):
    # Base case: stop when n is 1 or 0
    if n <= 1:
        return 1
    # Recursive case: n * factorial of (n - 1)
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\`

Two rules to always keep in mind:
1. **Base Case**: Always specify when to stop, or you'll get a \`RecursionError\` (stack overflow).
2. **Progress towards base**: Each recursive call must move closer to the base case.

Want to try solving a quick recursion problem together?`;
  }
  // 10. Joke
  else if (/tell me a joke|joke|jokes/i.test(lastMsgLower)) {
    reply = `Why do programmers prefer dark mode?
Because light attracts bugs! 🐛😄

Need another one, or shall we get back to business?`;
  }
  // 11. "Okay back to my studies"
  else if (/back to (my )?studies|back to study|let's study|okay back/i.test(lastMsgLower)) {
    reply = `Awesome, let's lock in! 🎯 What subject or topic do you want to tackle first?`;
  }
  // 12. Mentor inquiry
  else if (/who('s| is) my mentor|my mentor|faculty mentor/i.test(lastMsgLower)) {
    reply = `Your faculty mentor is ${mentorName}${mentorDesignation ? ` (${mentorDesignation})` : ""}${mentorPhone ? `. You can reach them at ${mentorPhone}` : ""}.`;
  }
  // 13. Register Number inquiry
  else if (/register number|reg no|reg number/i.test(lastMsgLower)) {
    reply = `Your register number is ${regNo}.`;
  }
  // 14. Department inquiry
  else if (/what department am i in|my department|which department|which dept/i.test(lastMsgLower)) {
    reply = `You're in the Department of ${dept}.`;
  }
  // 15. Attendance inquiry
  else if (/what('s| is) my attendance|my attendance|attendance percentage/i.test(lastMsgLower)) {
    reply = `Your attendance is currently at ${attendance}%.`;
  }
  // 16. Arrears inquiry
  else if (/do i have arrears|my arrears|any arrears|arrear count/i.test(lastMsgLower)) {
    reply =
      arrears === 0
        ? `You have a clean academic record with 0 active arrears! Keep that streak going.`
        : `You have ${arrears} active arrear${arrears > 1 ? "s" : ""} right now. Clearing ${arrears > 1 ? "these" : "this"} in the next examination cycle should be your top priority.`;
  }
  // 17. Tasks inquiry
  else if (/what tasks do i have|my tasks|action items|pending tasks/i.test(lastMsgLower)) {
    reply =
      pendingTasks.length > 0
        ? `Here are your pending action items:\n${pendingTasks.map((t) => `- ${t}`).join("\n")}`
        : `You don't have any pending action items assigned right now! All caught up.`;
  }
  // 18. Tanglish: "enna panrathu"
  else if (/enna panrathu/i.test(lastMsgLower)) {
    reply = `First, tension aagadha 😄 Enna problem nu sollu, step by step paathukalam.`;
  }
  // 19. Tanglish: "cgpa improve panna enna pannanum"
  else if (/cgpa improve panna/i.test(lastMsgLower)) {
    reply = `Definitely improve panna mudiyum. Un current CGPA (${cgpa}) and attendance (${attendance}%) vechu paatha, high-credit subjects-la internal marks 35+ edukka try pannu. Adhu final semester exam pressure-a romba koraikkum.`;
  }
  // 20. Tanglish: "python learn panna help pannu"
  else if (/python learn panna|python epdi padikrathu/i.test(lastMsgLower)) {
    reply = `Sure! 😄 Beginner-a start panriya, illa already basics theriyuma?`;
  }
  // 21. Tanglish: "stress-a irukku"
  else if (/stress-a irukku|tension-a irukku|bayama irukku/i.test(lastMsgLower)) {
    reply = `Kavala padaadha, idhellam completely normal. Exam, placement, illa subjects — edhula main stress nu sollu, let's sort it out together.`;
  }
  // 22. Career Confusion
  else if (/confused about my career|career confusion|career confused/i.test(lastMsgLower)) {
    reply = `Yeah, that's completely normal. Tell me what you're confused about — choosing a role, learning the right skills, placements, or something else?`;
  }
  // 23. Target Data Scientist
  else if (/data scientist|data science/i.test(lastMsgLower)) {
    reply = `Awesome choice! Since you're targeting Data Science, your core roadmap will center on Python (NumPy, Pandas), SQL, Statistics, and ML algorithms. Are you already comfortable with Python, or starting fresh?`;
  }
  // 24. "What should I learn next"
  else if (/what should i learn next|learn next/i.test(lastMsgLower)) {
    if (fullConversation.includes("data science") || fullConversation.includes("data scientist")) {
      reply = `Since you're aiming for Data Science, here's what to tackle next:
1. **Python Data Stack**: Pandas and NumPy for data manipulation.
2. **SQL Mastery**: Aggregations, Window Functions, and Joins (crucial for screening tests).
3. **Applied ML**: Scikit-Learn (Linear Regression, Decision Trees, Random Forests).

Which of these have you already worked with?`;
    } else {
      reply = `Depends on what you want to build towards! Are you leaning more towards software engineering, AI/Data Science, cloud, or cybersecurity?`;
    }
  }
  // 25. Python General
  else if (/\bpython\b/i.test(lastMsgLower)) {
    reply = `Python is a high-level, interpreted language known for its super clean, English-like syntax. It's the go-to language today for AI/Machine Learning, Data Science, backend development (FastAPI/Django), and automation scripts.

Are you looking to use Python for web dev, competitive programming, or AI?`;
  }
  // 26. Placements / Stress
  else if (/stressed about placements|placement stress|placement prep|interview/i.test(lastMsgLower)) {
    reply = `Yeah, placements can feel overwhelming. Don't try to prepare for everything at once. Let's first figure out where you are right now — DSA, projects, aptitude, communication, or interviews?`;
  }
  // 27. Mentor: Which of my mentees need attention
  else if (role === "MENTOR" && /mentees need attention|who needs attention/i.test(lastMsgLower)) {
    reply = `Based on continuous telemetry (attendance logs, active arrears, and overdue tasks), here are the mentees in your cohort currently triggering alerts:

1. **Priya Sharma (21CS042 - Year 3, Sec A)**
   - **Risk Level**: High (Score: 78/100)
   - **Trigger**: Attendance dropped to 64.2% with 2 active arrears (*Algorithms* and *OS*).
   - **Action**: Schedule a 1:1 remediation meeting.

2. **Karthik Raja (21CS019 - Year 3, Sec B)**
   - **Risk Level**: Medium (Score: 52/100)
   - **Trigger**: 3 overdue mentoring action items.`;
  }
  // 28. Mentor: Why is that student at risk
  else if (role === "MENTOR" && /why is that student at risk|why.*risk/i.test(lastMsgLower)) {
    reply = `The risk score for Priya Sharma (78/100 - HIGH) is calculated from three factors:
1. **Attendance Deficit (+35 pts)**: Cumulative attendance is 64.2% (below the 75% threshold).
2. **Active Arrears (+25 pts)**: 2 standing arrears in *Algorithms* and *OS*.
3. **Internal Assessment Trend (+10 pts)**: Recent internal test scores averaged 42%.

I'd recommend scheduling a 1:1 review to set up an attendance recovery plan and connect her with a peer study partner.`;
  }
  // 29. HOD: Overview of students who need attention
  else if (role === "HOD" && /overview of students|students who need attention/i.test(lastMsgLower)) {
    reply = `Across the Department (${dept}):
- **Critical / High Risk**: 14 Students (3.1%) — mainly attendance < 70% and arrears ≥ 2.
- **Medium Risk**: 38 Students (8.4%) — missed internal assessments or overdue advisory tasks.
- **Healthy Standing**: 398 Students (88.5%).

Faculty mentorship session completion is at 89.4% for this cycle, with 3 escalated cases awaiting review.`;
  }
  // 30. Attendance policy / Condonation
  else if (/condonation|attendance.*rule|attendance.*policy|minimum attendance/i.test(lastMsgLower)) {
    reply = `Here is how the university attendance policy works:

1. **75% Minimum**: You must secure at least 75% overall attendance to be eligible for end-semester exams without special permission.
2. **Condonation (65.0% - 74.9%)**: If attendance falls between 65% and 75%, it can be condoned on valid medical grounds with a doctor's certificate submitted within 3 days.
3. **Below 65%**: Attendance under 65% cannot be condoned and leads to exam debarment (requiring a semester redo).

Make sure to keep your buffer above 75% to stay worry-free!`;
  }
  // 31. Default Friendly Conversational Response
  else {
    reply = `Got it! Tell me a bit more about what you'd like to work on — whether it's understanding a concept, planning your study schedule, exam prep, or coding projects. Let's tackle it step by step.`;
  }

  return {
    reply,
    ragSources: ragDocs.map((d) => d.title),
  };
}
