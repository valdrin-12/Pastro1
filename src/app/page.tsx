'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Phone, Mail, Building2, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Company {
  id: string
  name: string
  description: string
  phone: string
  logo?: string
  cities: { city: { name: string } }[]
  services: { service: { name: string }, price: number }[]
}

interface City {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
}

export default function Home() {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<Company[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [companiesRes, citiesRes, servicesRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/cities'),
        fetch('/api/services')
      ])
      
      const [companiesData, citiesData, servicesData] = await Promise.all([
        companiesRes.json(),
        citiesRes.json(),
        servicesRes.json()
      ])

      setCompanies(companiesData.companies || [])
      setCities(citiesData.cities || [])
      setServices(servicesData.services || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = !selectedCity || company.cities.some(c => c.city.id === selectedCity)
    const matchesService = !selectedService || company.services.some(s => s.service.id === selectedService)
    
    return matchesSearch && matchesCity && matchesService
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Pastro.com</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {session.user?.email}</span>
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth/signin" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register Company
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Professional
            <span className="text-blue-600"> Cleaning Services</span>
            <br />in Kosovo
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted cleaning companies across Kosovo cities. 
            From house cleaning to office maintenance, we've got you covered.
          </p>
          
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{companies.length}</h3>
              <p className="text-gray-600">Registered Companies</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{cities.length}</h3>
              <p className="text-gray-600">Cities Covered</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{services.length}</h3>
              <p className="text-gray-600">Service Types</p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {filteredCompanies.length} Companies Found
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading companies...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map(company => (
                <div key={company.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">{company.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.cities.map(c => c.city.name).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Services & Prices:</h5>
                    <div className="space-y-1">
                      {company.services.slice(0, 3).map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{service.service.name}</span>
                          <span className="font-medium text-green-600">€{service.price}</span>
                        </div>
                      ))}
                      {company.services.length > 3 && (
                        <p className="text-xs text-gray-500">+{company.services.length - 3} more services</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a 
                      href={`tel:${company.phone}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all companies.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <h3 className="ml-2 text-xl font-bold">Pastro.com</h3>
              </div>
              <p className="text-gray-400">
                Connecting customers with professional cleaning services across Kosovo.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors">All Companies</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Register Company</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Need help? Contact us at support@pastro.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pastro.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}