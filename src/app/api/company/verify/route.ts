import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Lista e fjalëve të ndaluara (në shqip dhe anglisht)
const BANNED_WORDS = [
  // Profanity in Albanian and English
  'shit', 'fuck', 'damn', 'hell', 'asshole', 'bastard', 'bitch',
  'kar', 'pidh', 'byth', 'xha', 'mut', 'pidh', 'kar', 'bythe',
  
  // Offensive terms
  'spam', 'scam', 'fraud', 'fake', 'test123', 'abc123',
  'kurv', 'prostitut', 'lut', 'javash',
  
  // Add more as needed
]

// Normalize text for comparison (remove accents, lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
}

// Check if company name contains banned words
function containsBannedWords(companyName: string): { isValid: boolean; reason?: string } {
  const normalized = normalizeText(companyName)
  const words = normalized.split(/\s+/)
  
  for (const word of words) {
    for (const bannedWord of BANNED_WORDS) {
      const normalizedBanned = normalizeText(bannedWord)
      if (word.includes(normalizedBanned) || normalizedBanned.includes(word)) {
        return {
          isValid: false,
          reason: `Emri i kompanisë përmban fjalë të papërshtatshme. Ju lutemi zgjidhni një emër tjetër.`
        }
      }
    }
  }
  
  // Check if name is too short or suspicious
  if (companyName.trim().length < 2) {
    return {
      isValid: false,
      reason: 'Emri i kompanisë duhet të jetë të paktën 2 karaktere.'
    }
  }
  
  // Check if name contains only numbers or special characters
  if (/^[0-9\s\-_\.]+$/.test(companyName)) {
    return {
      isValid: false,
      reason: 'Emri i kompanisë duhet të përmbajë shkronja.'
    }
  }
  
  // Check if name is suspicious (repeated characters, etc.)
  if (/(.)\1{4,}/.test(companyName)) {
    return {
      isValid: false,
      reason: 'Emri i kompanisë duket i dyshimtë. Ju lutemi zgjidhni një emër tjetër.'
    }
  }
  
  return { isValid: true }
}

const verifySchema = z.object({
  companyName: z.string().min(1)
})

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifySchema.parse(body)
    
    const result = containsBannedWords(validatedData.companyName)
    
    return NextResponse.json({
      isValid: result.isValid,
      reason: result.reason
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error) {
    console.error('Company name verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to verify company name' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}




