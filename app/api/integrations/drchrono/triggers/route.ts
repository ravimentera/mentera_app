// app/api/integrations/drchrono/triggers/route.ts
import { NextRequest, NextResponse } from 'next/server'

const KERAGON_TRIGGER_URL =
  'https://webhooks.us-1.keragon.com/v2/workflows/a76b1d59-c94d-40c3-8b30-ae9f1c29547d/9D9Kj3WzIBt6GmcwB_FtQ/signal?triggerId=com.keragon.drchrono.trigger&t=9CQm9foNVqJJKYxWiHWEqQ%3D%3D'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { medspaId } = body
    
    if (!medspaId) {
      return NextResponse.json(
        { error: 'Missing required field: medspaId' },
        { status: 400 }
      )
    }

    const keragonRes = await fetch(KERAGON_TRIGGER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medspaId }),
    })

    // Handle the response more carefully
    let data
    const responseText = await keragonRes.text()
    
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse Keragon response as JSON:', parseError)
        console.error('Response text:', responseText)
        data = { message: responseText }
      }
    } else {
      // Empty response
      data = { message: 'Empty response from Keragon' }
    }
    
    if (!keragonRes.ok) {
      return NextResponse.json(
        { error: data },
        { status: keragonRes.status }
      )
    }

    return NextResponse.json(
      { message: 'Workflow triggered', run: data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Trigger error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
