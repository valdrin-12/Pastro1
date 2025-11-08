import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        cities: {
          include: {
            city: true
          }
        },
        services: {
          include: {
            service: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company
    })
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    )
  }
}
