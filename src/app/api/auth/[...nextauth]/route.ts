import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AppleProvider from 'next-auth/providers/apple'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            company: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          company: user.company
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in - create or find user
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'apple') {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email || '' },
            include: { company: true }
          })

          if (!dbUser) {
            // Create new user from OAuth
            const nameParts = (user.name || '').split(' ')
            const firstName = nameParts[0] || null
            const lastName = nameParts.slice(1).join(' ') || null
            const fullName = user.name || null

            // Generate a random password (OAuth users don't need password, but it's required in schema)
            const randomPassword = await bcrypt.hash(Math.random().toString(36), 10)

            dbUser = await prisma.user.create({
              data: {
                email: user.email || '',
                password: randomPassword,
                firstName,
                lastName,
                fullName,
                role: 'USER'
              },
              include: { company: true }
            })
          }

          // Update user object with database user info
          user.id = dbUser.id
          user.role = dbUser.role
          user.company = dbUser.company
        } catch (error) {
          console.error('Error in OAuth signIn callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.company = user.company
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.company = token.company
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/signin-sq.html',
    error: '/signin-sq.html'
  }
}

export default NextAuth(authOptions)
