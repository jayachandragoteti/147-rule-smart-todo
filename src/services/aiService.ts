const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export interface ParsedTask {
  title: string;
  scheduledDate?: string;
  scheduledTime?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  category?: string;
  apply147Rule?: boolean;
}

export interface AISuggestion {
  taskId: string;
  reason: string;
  priorityScore: number;
}

async function callGemini(prompt: string, jsonMode = true) {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: jsonMode ? {
        responseMimeType: "application/json",
      } : {},
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to call AI Service");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  if (jsonMode) {
    return JSON.parse(text);
  }
  return text;
}

/**
 * Parses natural language into a structured task
 */
export async function parseTask(input: string, currentDate: string): Promise<ParsedTask> {
  const prompt = `
    You are an AI task assistant. Parse the following natural language input into a structured JSON task object.
    Current Date: ${currentDate}
    
    Fields to include:
    - title: string (The main task description)
    - scheduledDate: string (ISO date format YYYY-MM-DD)
    - scheduledTime: string (24h format HH:mm)
    - priority: "low" | "medium" | "high" | "urgent"
    - category: string (Personal, Work, Learning, etc.)
    - apply147Rule: boolean (true if the task mentions learning, studying, revision, or 147 rule)
    
    Input: "${input}"
    
    Return ONLY the JSON object.
  `;
  
  return callGemini(prompt);
}

/**
 * Organizes tasks into an AI daily plan
 */
export async function generateDailyPlan(tasks: any[], currentDate: string): Promise<AISuggestion[]> {
  const taskList = tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, scheduledDate: t.scheduledDate, status: t.status }));
  const prompt = `
    You are a productivity expert. Order the following tasks for today (${currentDate}) based on urgency, deadline, and efficiency.
    Tasks: ${JSON.stringify(taskList)}
    
    Return a JSON array of suggestions:
    [{ "taskId": "string", "reason": "string", "priorityScore": number (1-10) }]
    
    Order them by priorityScore descending.
  `;
  
  return callGemini(prompt);
}

/**
 * Suggests a better time for a task that has been snoozed multiple times
 */
export async function suggestReschedule(todo: any): Promise<{ suggestedTime: string, reason: string }> {
  const prompt = `
    The task "${todo.title}" has been snoozed multiple times. 
    Current scheduled time: ${todo.scheduledTime || "Not set"}.
    Suggest a better time or date to handle this task effectively based on common productivity patterns.
    
    Return JSON: { "suggestedTime": "HH:mm", "reason": "string" }
  `;
  
  return callGemini(prompt);
}

/**
 * Summarizes long notes or diary entries
 */
export async function summarizeContent(content: string): Promise<string> {
  const prompt = `Summarize the following content in 2-3 concise sentences for a productivity app: "${content}"`;
  return callGemini(prompt, false);
}

/**
 * Analyzes mood from diary content
 */
export async function analyzeMood(content: string): Promise<{ mood: string, score: number, keywords: string[] }> {
  const prompt = `
    Analyze the emotional tone of the following journal entry.
    Content: "${content}"
    
    Return JSON: { "mood": "happy" | "neutral" | "sad" | "stressed" | "focused", "score": number (1-10), "keywords": string[] }
  `;
  
  return callGemini(prompt);
}

/**
 * Generates a summary for a link
 */
export async function summarizeLink(url: string, title: string): Promise<string> {
  // In a real app, this would use a backend or scraper. 
  // For this demo, we'll simulate an intelligent prediction based on title and URL if we can't fetch.
  const prompt = `Generate a brief 1-sentence summary of what this link likely contains based on its URL and title: Title: "${title}", URL: "${url}"`;
  return callGemini(prompt, false);
}
