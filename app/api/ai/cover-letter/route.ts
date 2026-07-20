import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
       return new Response(
         "Error: Groq API Key is missing. Please add GROQ_API_KEY to your .env.local file.", 
         { status: 400 }
       )
    }

    const { company, role, jobDescription, studentContext } = await req.json()

    const systemPrompt = `You are an expert career coach and professional copywriter. 
    Your task is to write a highly compelling, modern, and personalized cover letter for a university student.
    
    Context about the student:
    - Degree: ${studentContext.degree}
    - Relevant Courses Completed: ${studentContext.courses}
    
    Target Company: ${company}
    Target Role: ${role}
    Job Description: ${jobDescription}
    
    Instructions:
    1. Write a 3-4 paragraph cover letter.
    2. Do NOT include placeholder addresses at the top (e.g. [Your Name], [Your Address]). Start directly with "Dear Hiring Manager," or "Dear [Company] Team,"
    3. Explicitly connect the student's Degree and specific Courses to the requirements mentioned in the Job Description.
    4. Make the tone enthusiastic, professional, and confident.
    5. End with a strong call to action.
    6. Return ONLY the cover letter text.`

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      prompt: `Write the cover letter for the ${role} position at ${company}.`,
    })

    return result.toDataStreamResponse()

  } catch (error: any) {
    console.error('Groq Cover Letter Error:', error)
    return new Response(error.message || 'Failed to generate cover letter', { status: 500 })
  }
}
