import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email është i nevojshëm' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            status: true,
            phone: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { exists: false, message: 'Përdoruesi nuk u gjet' },
        { status: 404 }
      )
    }

    const res = NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        company: user.company
      }
    })

    // CORS headers
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res

  } catch (error: any) {
    console.error('Check user error:', error)
    const res = NextResponse.json(
      { error: 'Gabim i brendshëm i serverit', message: String(error?.message || error) },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  }
}

// Preflight for CORS
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return res
}

