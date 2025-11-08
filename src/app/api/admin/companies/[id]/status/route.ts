import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.string().transform((val) => val.toUpperCase()),
  reason: z.string().optional()
}).refine((data) => ['APPROVED', 'REJECTED'].includes(data.status), {
  message: 'Status must be APPROVED or REJECTED'
})

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    // Update company status
    const company = await prisma.company.update({
      where: { id },
      data: {
        status: validatedData.status,
        isActive: validatedData.status === 'APPROVED'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    // TODO: Send email notification to company about status change
    // if (validatedData.status === 'APPROVED') {
    //   await sendEmail({
    //     to: company.user.email,
    //     subject: 'Kompania juaj u miratua',
    //     html: '<p>Kompania juaj u miratua me sukses dhe tani shfaqet në platformë.</p>'
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: `Company ${validatedData.status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      company: {
        id: company.id,
        name: company.name,
        status: company.status.toLowerCase()
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Error updating company status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update company status', message: (error as any)?.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}

