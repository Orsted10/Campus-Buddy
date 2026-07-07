import { NextResponse } from 'next/server'
import { fetchSessionResult } from '@/lib/culko/scraper'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionValue } = body

    if (!sessionValue) {
      return NextResponse.json(
        { error: 'Session value is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const culkoCookies = cookieStore.get('culko_session')?.value
    const customSessionCookie = req.headers.get('x-culko-session') || undefined

    const sessionString = customSessionCookie || culkoCookies

    if (!sessionString) {
      return NextResponse.json(
        { error: 'No active portal session. Please login to portal sync first.' },
        { status: 401 }
      )
    }

    const sessionObj = JSON.parse(sessionString)

    const resultData = await fetchSessionResult(sessionObj, sessionValue)

    return NextResponse.json({
      success: true,
      data: resultData
    })
  } catch (error) {
    console.error('Error fetching session results:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
