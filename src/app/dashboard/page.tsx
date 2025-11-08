'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building2, Phone, Mail, MapPin, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string
  phone: string
  logo?: string
  cities: { city: { name: string } }[]
  services: { service: { name: string }, price: number }[]
}

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  date: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchCompanyData()
    }
  }, [status, router])

  const fetchCompanyData = async () => {
    try {
      const [companyRes, transactionsRes] = await Promise.all([
        fetch('/api/company/profile'),
        fetch('/api/company/transactions')
      ])

      const [companyData, transactionsData] = await Promise.all([
        companyRes.json(),
        transactionsRes.json()
      ])

      setCompany(companyData.company)
      setTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error('Error fetching company data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Company not found</h2>
          <p className="text-gray-600">Please contact support if this is an error.</p>
        </div>
      </div>
    )
  }

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Pastro.com</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user?.email}</span>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <button 
                onClick={() => router.push('/api/auth/signout')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start space-x-6">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="h-20 w-20 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h2>
              <p className="text-gray-600 mb-4">{company.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {company.phone}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {company.cities.map(c => c.city.name).join(', ')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Link 
                href="/dashboard/profile"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">€{totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">€{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{company.services.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Services</h3>
            <Link 
              href="/dashboard/services"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage Services
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{service.service.name}</h4>
                <p className="text-2xl font-bold text-green-600">€{service.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link 
              href="/dashboard/finances"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <Link 
                href="/dashboard/finances"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'INCOME' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
