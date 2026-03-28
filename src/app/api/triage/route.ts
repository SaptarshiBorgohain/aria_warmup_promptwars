import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

// The @google/genai SDK often reads GEMINI_API_KEY from process.env automatically if {} is passed
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const textData = formData.get('text') as string | null;
    const fileData = formData.get('file') as File | null;
    
    // Construct parts array
    const parts: any[] = [];
    if (textData) {
      parts.push({ text: textData });
    }
    
    if (fileData) {
      const arrayBuffer = await fileData.arrayBuffer();
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

    // System instructions specifically for ARIA triage
    const systemInstruction = `You are ARIA... Always return a JSON object matching this schema:
{
  "triage_level": "P1" | "P2" | "P3",
  "patient_summary": "A brief summary...",
  "critical_flags": ["list"...],
  "immediate_actions": ["list"...],
  "recommended_resources": ["list"...],
  "confidence_score": 0.95
}`;

    // Matching the user's requested snippet pattern
    // Note: Using generateContentStream for that hackathon wow-factor
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: 'user', parts: parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
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
    console.error("POST /api/triage error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
