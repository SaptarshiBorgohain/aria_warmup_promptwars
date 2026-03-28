import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY;

// Log key status for server-side debugging (visible in terminal)
if (!apiKey) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing from environment variables.");
}

const googleAI = new GoogleGenerativeAI(apiKey || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const textData = formData.get('text') as string | null;
    const fileData = formData.get('file') as File | null;
    
    const parts: Part[] = [];
    if (textData) {
      parts.push({ text: textData });
    }
    
    if (fileData) {
      const arrayBuffer = await fileData.arrayBuffer();
      // Using Buffer.from in edge runtime
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      parts.push({
        inlineData: {
          data: base64,
          mimeType: fileData.type
        }
      });
    }

    if (parts.length === 0) {
      return new Response('No data provided', { status: 400 });
    }

    const model = googleAI.getGenerativeModel({
      model: "gemini-1.5-pro", // You can use "gemini-3.1-pro" here if you have specific access
      systemInstruction: `You are ARIA, an advanced medical and disaster emergency triage system.
Analyze the provided multimodal inputs (which may include medical scanned text, voice transcripts or recordings, generic images, or manual typed text).
Your primary goal is to extract critical entities, classify urgency (P1, P2, P3), provide immediate actionable steps, and recommend resource types (like "Trauma Center" or "Urgent Care").
Always return a JSON object matching this schema:
{
  "triage_level": "P1" | "P2" | "P3",
  "patient_summary": "A brief summary of the patient or situation",
  "critical_flags": ["list", "of", "important", "flags", "like allergies or severe symptoms"],
  "immediate_actions": ["step 1", "step 2"],
  "recommended_resources": ["nearest applicable resource types"],
  "confidence_score": 0.95
}
Ensure the output is strictly valid JSON format continuously. P1 is life-threatening, P2 is urgent, P3 is non-urgent.`
    });

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: parts }],
      tools: [{ googleSearch: {} } as any], 
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (e: any) {
          console.error("Stream error:", e);
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("POST /api/triage error:", errorMsg);
    
    return new Response(JSON.stringify({ error: errorMsg }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
