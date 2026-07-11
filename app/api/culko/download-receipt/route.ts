import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://student.culko.in'
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

export async function POST(req: Request) {
  try {
    const { eventTarget } = await req.json()
    if (!eventTarget) {
      return NextResponse.json({ error: 'Missing eventTarget parameter' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const culkoCookies = cookieStore.get('culko_session')?.value

    if (!culkoCookies) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sessionCookies = JSON.parse(culkoCookies)
    const cookieStr = Object.entries(sessionCookies).map(([k, v]) => `${k}=${v}`).join('; ')

    const listUrl = `${BASE_URL}/frmAccountsStudentReceiptList.aspx`
    const listRes = await fetch(listUrl, {
      headers: {
        'Cookie': cookieStr,
        'User-Agent': USER_AGENT
      }
    })

    if (!listRes.ok) {
      throw new Error(`Failed to load receipt list page: HTTP ${listRes.status}`)
    }

    const listHtml = await listRes.text()
    const $ = cheerio.load(listHtml)

    const viewState = $('#__VIEWSTATE').val() as string || ''
    const eventValidation = $('#__EVENTVALIDATION').val() as string || ''
    const viewStateGen = $('#__VIEWSTATEGENERATOR').val() as string || ''

    const formData = new URLSearchParams()
    
    // Some buttons use the name attribute as POST data (not eventTarget in ASP.NET terms)
    if (eventTarget.includes('$')) {
        formData.append(eventTarget, 'Download')
    } else {
        formData.append('__EVENTTARGET', eventTarget)
        formData.append('__EVENTARGUMENT', '')
    }
    
    if (viewState) formData.append('__VIEWSTATE', viewState)
    if (eventValidation) formData.append('__EVENTVALIDATION', eventValidation)
    if (viewStateGen) formData.append('__VIEWSTATEGENERATOR', viewStateGen)

    const downloadRes = await fetch(listUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookieStr,
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': listUrl
      },
      body: formData
    })

    if (!downloadRes.ok) {
      throw new Error(`Failed to download receipt: HTTP ${downloadRes.status}`)
    }

    const contentType = downloadRes.headers.get('content-type') || 'application/pdf'
    let contentDisposition = downloadRes.headers.get('content-disposition')
    
    const buffer = await downloadRes.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition || 'attachment; filename="Receipt.pdf"'
      }
    })

  } catch (error) {
    console.error('Error downloading receipt:', error)
    return NextResponse.json({ error: 'Failed to download receipt' }, { status: 500 })
  }
}
