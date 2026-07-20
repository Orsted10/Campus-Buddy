import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ 
         error: 'Groq API Key is missing. Please add GROQ_API_KEY to your .env.local file.' 
       }, { status: 500 })
    }

    const { text } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 })
    }

    const systemPrompt = `You are an expert study assistant. 
The user has provided a raw transcription of a lecture.
Your task is to:
1. Condense the lecture into exactly 10 high-yield bullet points.
2. Generate 5 Anki-style spaced-repetition flashcards based on the most important concepts.

Format your response as a strict JSON object with this exact schema:
{
  "bullets": ["point 1", "point 2", ...],
  "flashcards": [
     { "front": "Question/Concept", "back": "Answer/Definition" },
     ...
  ]
}
Do NOT wrap the JSON in markdown code blocks. Output ONLY valid JSON.`

    const { text: resultText } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      prompt: `Here is the lecture transcription:\n\n${text}`,
    })

    // Safely parse the JSON
    let result = null
    try {
       const cleanJson = resultText.replace(/```json/gi, '').replace(/```/gi, '').trim()
       result = JSON.parse(cleanJson)
    } catch (e) {
       console.error("Failed to parse JSON from Groq:", resultText)
       throw new Error("Failed to generate valid JSON format from lecture.")
    }

    return NextResponse.json({ data: result })

  } catch (error: any) {
    console.error('Groq Summarizer Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 })
  }
}
