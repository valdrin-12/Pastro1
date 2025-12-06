import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/signin-sq.html?error=no_session', request.url))
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/signin-sq.html?error=user_not_found', request.url))
    }

    // Create user object for localStorage
    const userForStorage = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      name: user.company?.name || user.fullName || user.firstName || user.email,
      role: user.role.toLowerCase(),
      type: user.company ? 'company' : 'user',
      fromDatabase: true,
      company: user.company
    }

    // Redirect to a page that will store user in localStorage
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/demo-sq-fixed.html'
    const redirectUrl = new URL(returnUrl, request.url)
    redirectUrl.searchParams.set('oauth_success', 'true')
    redirectUrl.searchParams.set('user_data', encodeURIComponent(JSON.stringify(userForStorage)))

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/signin-sq.html?error=callback_failed', request.url))
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return res
}

