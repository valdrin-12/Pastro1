import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, 'Fjalëkalimi duhet të jetë të paktën 6 karaktere'),
})

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)
    const { token, email, password } = validatedData

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email-i nuk ekziston në sistemin tonë.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: token,
        used: false,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token-i i rivendosjes është i pavlefshëm ose ka skaduar. Ju lutemi kërkoni një link të ri.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Fjalëkalimi u rivendos me sukses! Tani mund të hyni me fjalëkalimin tuaj të ri.'
    }, { headers: { 'Access-Control-Allow-Origin': '*' } })

  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}




