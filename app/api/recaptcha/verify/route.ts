import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { token, action } = body

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'لا يوجد رمز تحقق' },
      { status: 400 }
    )
  }

  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  )

  const data = await response.json()

  if (!data.success || data.score < 0.5 || data.action !== action) {
    return NextResponse.json(
      { success: false, score: data.score },
      { status: 403 }
    )
  }

  return NextResponse.json({ success: true, score: data.score })
}