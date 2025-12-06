import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const registerSchema = z.object({
  userId: z.string().optional(), // Optional: if provided, user is already logged in
  email: z.string().email().optional(), // Optional if userId is provided
  password: z.string().min(6).optional(), // Optional if userId is provided
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
    console.log('[register] validated data for company:', validatedData.companyName)

    let user;
    
    // If userId is provided, user is already logged in
    if (validatedData.userId) {
      user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        include: { company: true }
      })

      if (!user) {
        const res = NextResponse.json(
          { error: 'Përdoruesi nuk u gjet' },
          { status: 404 }
        )
        res.headers.set('Access-Control-Allow-Origin', '*')
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return res
      }

      // Check if user already has a company
      if (user.company) {
        const res = NextResponse.json(
          { error: 'Ju keni një kompani tashmë. Një përdorues mund të ketë vetëm një kompani.' },
          { status: 400 }
        )
        res.headers.set('Access-Control-Allow-Origin', '*')
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return res
      }

      // Update user role to COMPANY if they were USER
      if (user.role === 'USER') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'COMPANY' },
          include: { company: true }
        })
      }
    } else {
      // Legacy flow: create new user and company
      if (!validatedData.email || !validatedData.password) {
        const res = NextResponse.json(
          { error: 'Email dhe fjalëkalimi janë të nevojshëm për regjistrim të ri' },
          { status: 400 }
        )
        res.headers.set('Access-Control-Allow-Origin', '*')
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return res
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
        include: { company: true }
      })

      if (existingUser) {
        // Check if user already has a company
        if (existingUser.company) {
          const res = NextResponse.json(
            { error: 'Ju keni një kompani tashmë me këtë email. Një përdorues mund të ketë vetëm një kompani.' },
            { status: 400 }
          )
          res.headers.set('Access-Control-Allow-Origin', '*')
          res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
          res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
          return res
        }
        
        // User exists but doesn't have a company - tell them to log in first
        const res = NextResponse.json(
          { error: 'Përdoruesi me këtë email ekziston tashmë. Ju lutemi kyçuni dhe regjistroni kompaninë tuaj.' },
          { status: 400 }
        )
        res.headers.set('Access-Control-Allow-Origin', '*')
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return res
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)

      // Create user
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: 'COMPANY'
        }
      })
      console.log('[register] User created:', user.id, user.email)
    }

    // Create company in a transaction
    const result = await prisma.$transaction(async (tx) => {

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
      
      // Update user with company name and role
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          companyName: validatedData.companyName, // ✅ Ruaj emrin e kompanisë tek useri
          role: 'COMPANY' // ✅ Update role në COMPANY
        }
      })
      console.log('[register] User updated with company name:', updatedUser.email, 'Company:', validatedData.companyName)
      
      if (hasCities && hasServices) {
        const updatedCompany = await tx.company.update({
          where: { id: company.id },
          data: { status: 'APPROVED' }
        })
        console.log('[register] Company auto-approved:', updatedCompany.id, 'Status:', updatedCompany.status)
        return { user: updatedUser, company: updatedCompany }
      }

      return { user: updatedUser, company }
    }).catch((e) => {
      console.error('[register] transaction error:', e)
      console.error('[register] Error details:', JSON.stringify(e, null, 2))
      throw e
    })
    
    console.log('[register] Transaction completed successfully. Company ID:', result.company.id, 'Status:', result.company.status)
    
    // Update user object with company
    user = result.user

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
