import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const returnUrl = searchParams.get('returnUrl') || '/demo-sq-fixed.html'
  
  // Redirect to NextAuth Facebook sign-in
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
  const redirectUrl = `${baseUrl}/api/auth/signin/facebook?callbackUrl=${encodeURIComponent(returnUrl)}`
  
  return NextResponse.redirect(redirectUrl)
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return res
}

