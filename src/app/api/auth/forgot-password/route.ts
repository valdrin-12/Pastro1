import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
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
    const validatedData = forgotPasswordSchema.parse(body)
    const { email } = validatedData

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Nëse email-i ekziston, ne do t\'ju dërgojmë një link për të rivendosur fjalëkalimin.'
      }, { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false
      }
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password-sq.html?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    const emailSubject = 'Rivendos Fjalëkalimin - Pastro.com'
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Rivendos Fjalëkalimin</h2>
        <p>Përshëndetje,</p>
        <p>Ne kemi marrë një kërkesë për të rivendosur fjalëkalimin për llogarinë tuaj në Pastro.com.</p>
        <p>Klikoni në butonin më poshtë për të rivendosur fjalëkalimin tuaj:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Rivendos Fjalëkalimin
          </a>
        </div>
        <p>Ose kopjoni dhe ngjisni këtë link në shfletuesin tuaj:</p>
        <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        <p><strong>Ky link skadon në 1 orë.</strong></p>
        <p>Nëse nuk keni kërkuar të rivendosni fjalëkalimin, ju lutemi injoroni këtë email.</p>
        <p>Faleminderit,<br>Ekipi i Pastro.com</p>
      </div>
    `
    const emailText = `
      Rivendos Fjalëkalimin
      
      Përshëndetje,
      Ne kemi marrë një kërkesë për të rivendosur fjalëkalimin për llogarinë tuaj në Pastro.com.
      
      Klikoni në këtë link për të rivendosur fjalëkalimin tuaj:
      ${resetUrl}
      
      Ky link skadon në 1 orë.
      
      Nëse nuk keni kërkuar të rivendosni fjalëkalimin, ju lutemi injoroni këtë email.
      
      Faleminderit,
      Ekipi i Pastro.com
    `

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    })

    return NextResponse.json({
      success: true,
      message: 'Nëse email-i ekziston, ne do t\'ju dërgojmë një link për të rivendosur fjalëkalimin.'
    }, { headers: { 'Access-Control-Allow-Origin': '*' } })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Still return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'Nëse email-i ekziston, ne do t\'ju dërgojmë një link për të rivendosur fjalëkalimin.'
    }, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }
}





