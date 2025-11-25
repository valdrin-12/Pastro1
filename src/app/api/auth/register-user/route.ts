import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[register-user] incoming body:', body)
    const validatedData = registerUserSchema.parse(body)
    console.log('[register-user] validated data for:', validatedData.email)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      const res = NextResponse.json(
        { error: 'Përdoruesi me këtë email ekziston tashmë' },
        { status: 400 }
      )
      res.headers.set('Access-Control-Allow-Origin', '*')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      return res
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user with USER role
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER'
      }
    })

    console.log('[register-user] User created:', user.id, user.email, 'Role:', user.role)

    // Fire-and-forget welcome email (do not block the response if it fails)
    sendEmail({
      to: validatedData.email,
      subject: 'Mirë se erdhët në Pastro.com',
      text: 'Ju jeni regjistruar me sukses ne platformen pastro',
      html: '<p>Ju jeni regjistruar me sukses ne platformen <strong>Pastro</strong>.</p>'
    }).catch((e) => {
      console.warn('Failed to send registration email:', e)
    })

    const res = NextResponse.json({
      success: true,
      message: 'Përdoruesi u regjistrua me sukses',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

    // CORS headers for demo static pages (file:// origin)
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res

  } catch (error: any) {
    console.error('User registration error:', error)
    
    if (error instanceof z.ZodError) {
      const res = NextResponse.json(
        { error: 'Të dhënat e dërguara nuk janë të vlefshme', details: error.errors },
        { status: 400 }
      )
      res.headers.set('Access-Control-Allow-Origin', '*')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      return res
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

