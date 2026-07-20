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

    const systemPrompt = `You are an expert AI tutor. 
The user has provided raw text extracted via OCR from their handwritten notes or whiteboard.
Your task is to analyze the text and generate a list of 5 multiple choice questions to test their knowledge.
Format your response as a strict JSON array of objects. 
EACH object must have exactly these keys:
- "question": string
- "options": array of 4 string options
- "correctAnswer": string (must exactly match one of the options)
- "explanation": string (why the answer is correct)
Do NOT wrap the JSON in markdown code blocks. Output ONLY valid JSON.`

    const { text: resultText } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      prompt: `Here are the OCR notes:\n\n${text}`,
    })

    // Safely parse the JSON
    let mcqs = []
    try {
       // Attempt to strip any markdown formatting if the LLM accidentally included it
       const cleanJson = resultText.replace(/```json/gi, '').replace(/```/gi, '').trim()
       mcqs = JSON.parse(cleanJson)
    } catch (e) {
       console.error("Failed to parse JSON from Groq:", resultText)
       throw new Error("Failed to generate valid quiz format from notes.")
    }

    return NextResponse.json({ mcqs })

  } catch (error: any) {
    console.error('Groq OCR Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate MCQs' }, { status: 500 })
  }
}
