import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('file') as Blob

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API Key not configured. Please add GROQ_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    // Pass the audio to Groq Whisper
    const groqFormData = new FormData()
    groqFormData.append('file', audioFile, 'audio.webm')
    groqFormData.append('model', 'whisper-large-v3')
    groqFormData.append('temperature', '0.0')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: groqFormData
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Groq Whisper Error:', errorText)
      return NextResponse.json({ error: `Groq transcription failed: ${errorText}` }, { status: 500 })
    }

    const data = await res.json()
    
    return NextResponse.json({ text: data.text })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 })
  }
}
