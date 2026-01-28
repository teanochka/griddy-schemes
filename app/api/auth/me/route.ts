import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
