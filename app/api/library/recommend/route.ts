import { NextResponse } from 'next/server'
import { chatWithGroq } from '@/lib/ai/groq'
import { chatWithOpenRouter } from '@/lib/ai/openrouter'

export async function POST(req: Request) {
  try {
    const { subjects } = await req.json()
    
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ success: true, queries: ['computer science', 'programming', 'engineering'] })
    }

    const systemPrompt = `You are a university librarian AI. Based on the following subjects the student is enrolled in, provide exactly 3 to 5 highly relevant ONE-WORD or TWO-WORD search queries that can be used on Project Gutenberg (Gutendex API) to find useful textbooks, classic literature, or reference books. 
Respond ONLY with a valid JSON array of strings. Do not include any markdown formatting, backticks, or other text.
Example output: ["calculus", "algorithms", "physics"]

Subjects: ${subjects.join(', ')}`

    let result = await chatWithOpenRouter([{ role: 'user', content: systemPrompt }])
    if (!result.success) {
      result = await chatWithGroq([{ role: 'user', content: systemPrompt }], true)
    }

    if (!result.success) {
       return NextResponse.json({ success: true, queries: subjects.slice(0, 3).map((s: string) => s.split(' ')[0]) })
    }

    try {
      const text = result.content.replace(/```json/g, '').replace(/```/g, '').trim()
      const queries = JSON.parse(text)
      return NextResponse.json({ success: true, queries })
    } catch {
       return NextResponse.json({ success: true, queries: subjects.slice(0, 3).map((s: string) => s.split(' ')[0]) })
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
