'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Lock, Phone, MapPin, DollarSign, Eye, EyeOff, Plus, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface City {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
}

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    description: ''
  })
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [services, setServices] = useState<{ serviceId: string; price: number }[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [citiesRes, servicesRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/services')
      ])
      
      const [citiesData, servicesData] = await Promise.all([
        citiesRes.json(),
        servicesRes.json()
      ])

      setCities(citiesData.cities || [])
      setAvailableServices(servicesData.services || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCityToggle = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  const addService = () => {
    setServices(prev => [...prev, { serviceId: '', price: 0 }])
  }

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: 'serviceId' | 'price', value: string | number) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (selectedCities.length === 0) {
      toast.error('Please select at least one city')
      setLoading(false)
      return
    }

    if (services.length === 0) {
      toast.error('Please add at least one service')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          phone: formData.phone,
          description: formData.description,
          cities: selectedCities,
          services: services.filter(s => s.serviceId && s.price > 0)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Company registered successfully! Please sign in.')
        router.push('/auth/signin')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Register Your Cleaning Company
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Account Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+383 XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell customers about your company and services..."
              />
            </div>
          </div>

          {/* Operating Cities */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Cities *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {cities.map(city => (
                <label key={city.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city.id)}
                    onChange={() => handleCityToggle(city.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{city.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Services & Pricing */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Services & Pricing *</h3>
              <button
                type="button"
                onClick={addService}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <select
                      value={service.serviceId}
                      onChange={(e) => updateService(index, 'serviceId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a service</option>
                      {availableServices.map(svc => (
                        <option key={svc.id} value={svc.id}>{svc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                        className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
