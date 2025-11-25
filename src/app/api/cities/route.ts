import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    const res = NextResponse.json({
      success: true,
      cities
    })
    // CORS headers for demo static pages (file:// origin)
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res
  } catch (error) {
    console.error('Error fetching cities:', error)
    const res = NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res
  }
}

// Preflight for CORS from file:// demo pages
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return res
}
