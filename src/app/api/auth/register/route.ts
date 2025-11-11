import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  phone: z.string().min(8),
  description: z.string().optional(),
  cities: z.array(z.string()),
  services: z.array(z.object({
    serviceId: z.string(),
    price: z.number().positive()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[register] incoming body:', body)
    const validatedData = registerSchema.parse(body)
    console.log('[register] validated data for:', validatedData.email)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: 'COMPANY'
        }
      })
      console.log('[register] User created:', user.id, user.email)

      // Create company (status will be set to PENDING by default from schema)
      const company = await tx.company.create({
        data: {
          userId: user.id,
          name: validatedData.companyName,
          phone: validatedData.phone,
          description: validatedData.description || ''
          // status will default to PENDING from schema
        }
      })
      console.log('[register] Company created:', company.id, company.name, 'Status:', company.status || 'PENDING')

      // Add cities
      if (validatedData.cities.length > 0) {
        await tx.companyCity.createMany({
          data: validatedData.cities.map(cityId => ({
            companyId: company.id,
            cityId: cityId
          }))
        })
      }

      // Add services
      if (validatedData.services.length > 0) {
        await tx.companyService.createMany({
          data: validatedData.services.map(service => ({
            companyId: company.id,
            serviceId: service.serviceId,
            price: service.price
          }))
        })
      }

      // Auto-approve company if it has cities and services
      const hasCities = validatedData.cities.length > 0
      const hasServices = validatedData.services.length > 0
      
      console.log('[register] Auto-approval check:', { 
        hasCities, 
        hasServices, 
        citiesCount: validatedData.cities.length, 
        servicesCount: validatedData.services.length 
      })
      
      if (hasCities && hasServices) {
        const updatedCompany = await tx.company.update({
          where: { id: company.id },
          data: { status: 'APPROVED', isActive: true }
        })
        console.log('[register] ✅ Company auto-approved:', updatedCompany.id, 'Status:', updatedCompany.status, 'isActive:', updatedCompany.isActive)
        return { user, company: updatedCompany }
      } else {
        console.log('[register] ⚠️ Company NOT auto-approved (missing cities or services):', {
          companyId: company.id,
          citiesCount: validatedData.cities.length,
          servicesCount: validatedData.services.length
        })
      }

      return { user, company }
    }).catch((e) => {
      console.error('[register] transaction error:', e)
      console.error('[register] Error details:', JSON.stringify(e, null, 2))
      throw e
    })
    
    console.log('[register] Transaction completed successfully. Company ID:', result.company.id, 'Status:', result.company.status)

    // Fire-and-forget welcome email (do not block the response if it fails)
    sendEmail({
      to: validatedData.email,
      subject: 'Mirë se erdhët në Pastro.com',
      text: 'Ju jeni regjistruar me sukses ne platformen pastro',
      html: '<p>Ju jeni regjistruar me sukses ne platformen <strong>Pastro</strong>.</p>'
    }).catch((e) => {
      console.warn('Failed to send registration email:', e)
    })

    const res = NextResponse.json({
      success: true,
      message: 'Company registered successfully',
      userId: result.user.id
    })

    // CORS headers for demo static pages (file:// origin)
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res

  } catch (error: any) {
    console.error('Registration error:', error)
    // Prisma known request error
    if (error?.code) {
      const res = NextResponse.json(
        { error: 'Database error', code: error.code, meta: error.meta },
        { status: 500 }
      )
      res.headers.set('Access-Control-Allow-Origin', '*')
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      return res
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    const res = NextResponse.json(
      { error: 'Internal server error', message: String(error?.message || error) },
      { status: 500 }
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res
  }
}

// Preflight for CORS from file:// demo pages
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  return res
}
