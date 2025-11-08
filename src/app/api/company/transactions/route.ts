import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
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
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: company.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      transactions
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, amount, description, date } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: type.toUpperCase(),
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
