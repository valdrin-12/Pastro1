import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const includeCategory = searchParams.get('includeCategory') === 'true'

    const where: any = {}
    if (categoryId) {
      where.categoryId = categoryId
    }

    const services = await prisma.service.findMany({
      where,
      include: includeCategory ? {
        category: true
      } : undefined,
      orderBy: {
        name: 'asc'
      }
    })

    const res = NextResponse.json({
      success: true,
      services
    })
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res
  } catch (error) {
    console.error('Error fetching services:', error)
    const res = NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return res
}
