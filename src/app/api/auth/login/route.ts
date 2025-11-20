import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[login] incoming body:', body)
    const validatedData = loginSchema.parse(body)
    console.log('[login] validated data for:', validatedData.email)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        company: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kredencialet janë të pavlefshme' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Kredencialet janë të pavlefshme' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company ? {
          id: user.company.id,
          name: user.company.name,
          phone: user.company.phone,
          description: user.company.description,
          status: user.company.status,
          isActive: user.company.isActive
        } : null
      }
    })

    // CORS headers for demo static pages (file:// origin)
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res

  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Të dhënat e dërguara nuk janë të vlefshme', details: error.errors },
        { status: 400 }
      )
    }

    const res = NextResponse.json(
      { error: 'Gabim i brendshëm i serverit', message: String(error?.message || error) },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res
  }
}

// Preflight for CORS from file:// demo pages
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  return res
}

