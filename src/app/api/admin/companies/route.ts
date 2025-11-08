import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // 'pending', 'approved', 'rejected', or null for all

    console.log('[admin/companies] Fetching companies with filter:', statusFilter || 'all')

    // Build where clause
    const where: any = {}
    if (statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter.toUpperCase())) {
      where.status = statusFilter.toUpperCase()
      console.log('[admin/companies] Filtering by status:', where.status)
    }

    // Fetch companies with related data
    const companies = await prisma.company.findMany({
      where,
      include: {
        user: {
          select: {
            email: true
          }
        },
        companyCities: {
          include: {
            city: {
              select: {
                name: true
              }
            }
          }
        },
        companyServices: {
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('[admin/companies] Found', companies.length, 'companies')
    companies.forEach(c => {
      console.log(`[admin/companies] - ${c.name} (${c.id}): status=${c.status || 'NULL'}, email=${c.user?.email || 'N/A'}`)
    })

    // Transform data to match admin panel format
    const formattedCompanies = companies.map(company => {
      const status = company.status || 'PENDING';
      console.log(`[admin/companies] Formatting company ${company.name}: original status=${company.status}, final status=${status}`);
      
      return {
        id: company.id,
        name: company.name,
        email: company.user?.email || '',
        phone: company.phone,
        description: company.description || '',
        status: status.toLowerCase(), // 'pending', 'approved', 'rejected'
        cities: company.companyCities?.map(cc => cc?.city?.name).filter(Boolean) || [],
        services: company.companyServices?.map(cs => ({
          name: cs?.service?.name || 'Unknown',
          price: cs?.price || 0
        })).filter(s => s.name !== 'Unknown') || [],
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString()
      };
    })
    
    console.log('[admin/companies] Formatted companies count:', formattedCompanies.length)

    // Calculate stats (compatibility-friendly)
    let stats = { pending: 0, approved: 0, rejected: 0 }
    try {
      const [pending, approved, rejected] = await Promise.all([
        prisma.company.count({ where: { status: 'PENDING' } as any }),
        prisma.company.count({ where: { status: 'APPROVED' } as any }),
        prisma.company.count({ where: { status: 'REJECTED' } as any })
      ])
      stats = { pending, approved, rejected }
    } catch (_e) {
      // Fallback: derive from fetched companies if client is outdated
      stats = {
        pending: formattedCompanies.filter(c => c.status === 'pending').length,
        approved: formattedCompanies.filter(c => c.status === 'approved').length,
        rejected: formattedCompanies.filter(c => c.status === 'rejected').length
      }
    }

    return NextResponse.json({
      success: true,
      companies: formattedCompanies,
      stats
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error: any) {
    console.error('Error fetching companies for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies', message: String(error?.message || error) },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}

