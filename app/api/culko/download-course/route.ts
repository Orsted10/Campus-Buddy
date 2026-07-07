import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://student.culko.in'
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { eventTarget } = body

    if (!eventTarget) {
      return NextResponse.json(
        { error: 'eventTarget is required' },
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
    const cookieHeader = Object.entries(sessionObj).map(([k, v]) => `${k}=${v}`).join('; ')

    // 1. Fetch initial page to get ViewState
    const url = BASE_URL + '/frmMyCourse.aspx'
    const getRes = await fetch(url, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': USER_AGENT
      }
    })
    
    const html = await getRes.text()
    const $ = cheerio.load(html)
    
    const viewState = $('#__VIEWSTATE').val() as string || ''
    const eventValidation = $('#__EVENTVALIDATION').val() as string || ''
    const viewStateGen = $('#__VIEWSTATEGENERATOR').val() as string || ''

    // 2. Perform Postback to trigger download
    const formData = new URLSearchParams()
    formData.append('__EVENTTARGET', eventTarget)
    formData.append('__EVENTARGUMENT', '')
    formData.append('__VIEWSTATE', viewState)
    formData.append('__EVENTVALIDATION', eventValidation)
    if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen)

    const postRes = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeader,
        'User-Agent': USER_AGENT,
        'Referer': url
      }
    })

    if (!postRes.ok) {
      throw new Error(`Failed to download from culko: ${postRes.status}`)
    }

    // Set headers for file download
    const contentType = postRes.headers.get('content-type') || 'application/pdf'
    const contentDisposition = postRes.headers.get('content-disposition') || 'attachment; filename="course_plan.pdf"'
    
    // Stream response back to client
    return new NextResponse(postRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    })
  } catch (error) {
    console.error('Error proxying PDF download:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
