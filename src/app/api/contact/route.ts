import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const contactSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  message: z.string().min(10),
  companyName: z.string().optional()
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
    const validatedData = contactSchema.parse(body)

    // Send email to company
    const emailSubject = validatedData.companyName 
      ? `Mesazh i ri nga klient për ${validatedData.companyName}`
      : 'Mesazh i ri nga klient'

    const emailText = `
Mesazh i ri nga klient:

Email: ${validatedData.from}
${validatedData.companyName ? `Kompania: ${validatedData.companyName}` : ''}

Mesazhi:
${validatedData.message}

---
Ky mesazh u dërgua përmes platformës Pastro.com
    `.trim()

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Mesazh i ri nga klient</h2>
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Email:</strong> ${validatedData.from}</p>
          ${validatedData.companyName ? `<p><strong>Kompania:</strong> ${validatedData.companyName}</p>` : ''}
        </div>
        <div style="background: #ffffff; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong>Mesazhi:</strong></p>
          <p style="white-space: pre-wrap;">${validatedData.message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0;">
        <p style="color: #6b7280; font-size: 0.875rem;">
          Ky mesazh u dërgua përmes platformës Pastro.com
        </p>
      </div>
    `

    const result = await sendEmail({
      to: validatedData.to,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    })

    if (result.skipped) {
      return NextResponse.json(
        { error: 'Email service not configured. Please configure SMTP settings.' },
        { status: 503, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    }, { headers: { 'Access-Control-Allow-Origin': '*' } })

  } catch (error) {
    console.error('Contact email error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}




