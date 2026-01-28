import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/projects/${projectId}/invite`,
      {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Invite user error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
