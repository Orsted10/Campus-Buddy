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
         error: 'Groq API Key is missing. Please add GROQ_API_KEY to your .env.local file.',
         mockMode: true 
       })
    }

    const { action, degree, history } = await req.json()

    if (action === 'start') {
       const systemPrompt = `You are an expert technical recruiter conducting a mock interview for a university student studying ${degree}. 
       Introduce yourself briefly (1 sentence) and ask the very first warm-up interview question. 
       Keep your response short and conversational (max 2-3 sentences total). Do not use markdown.`
       
       const { text } = await generateText({
         model: groq('llama-3.1-8b-instant'),
         system: systemPrompt,
         prompt: "Start the interview.",
       })

       return NextResponse.json({ message: text })
    } 
    
    if (action === 'answer' && history) {
       // Convert history to AI SDK message format
       const messages = history.map((msg: any) => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.text
       }))

       const systemPrompt = `You are an expert technical recruiter conducting a mock interview.
       The user just answered your previous question. 
       Evaluate their answer briefly (1 sentence), provide a tiny bit of constructive feedback if needed, and then ask the next technical question.
       Keep the total response under 3 sentences. Be conversational, professional, and do not use markdown.`

       const { text } = await generateText({
         model: groq('llama-3.1-8b-instant'),
         system: systemPrompt,
         messages: messages,
       })

       return NextResponse.json({ message: text })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Groq Interview Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate AI response' }, { status: 500 })
  }
}
