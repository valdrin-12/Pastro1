import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
      },
      include: {
        user: {
          select: { email: true }
        },
        companyCities: {
          include: {
            city: {
              select: { name: true }
            }
          }
        },
        companyServices: {
          include: {
            service: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = companies.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      phone: c.phone,
      email: c.user?.email || '',
      logo: c.logo || null,
      cities: (c.companyCities || []).map(cc => cc?.city?.name).filter(Boolean) || [],
      services: (c.companyServices || []).map(cs => ({ 
        name: cs?.service?.name || 'Unknown', 
        price: cs?.price || 0 
      })).filter(s => s.name !== 'Unknown') || [],
      createdAt: c.createdAt
    }))

    const res = NextResponse.json({ success: true, companies: formatted })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  } catch (error) {
    console.error('Error fetching companies:', error)
    const res = NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  }
}
