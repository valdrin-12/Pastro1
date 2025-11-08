import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      cities
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
