"use client"

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  title: string
  description: string
  coverImage: string
  price: number
  offerPrice?: number
  createdAt: string
  templateTags?: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

interface TemplatesResponse {
  success: boolean
  templates: Template[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<TemplatesResponse['pagination'] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const fetchTemplates = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/templates?page=${page}&limit=12&includeTags=true`)
      const data: TemplatesResponse = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch templates')
      }
      
      setTemplates(data.templates)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates(1)
  }, [])

  const handlePageChange = (page: number) => {
    fetchTemplates(page)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="w-full h-screen p-6 flex items-center justify-center">
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Templates</h1>
          <Button asChild>
            <Link href="/admin/templates/addtemplate">Add Template</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => fetchTemplates(currentPage)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage your template library
            {pagination && ` (${pagination.totalCount} total)`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/addtemplate">Add Template</Link>
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first template.</p>
          <Button asChild>
            <Link href="/admin/templates/addtemplate">Add Template</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/templates/${template.id}`)}
              >
                {/* Cover Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={template.coverImage}
                    alt={template.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA1MEgxMjBWODBIODBWNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik05MCA2MEgxMTBWODBIOTBWNTBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{template.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
                  
                  {/* Tags */}
                  {template.templateTags && template.templateTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.templateTags.slice(0, 3).map((templateTag) => (
                        <span
                          key={templateTag.tag.id}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {templateTag.tag.name}
                        </span>
                      ))}
                      {template.templateTags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{template.templateTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(template.price)}
                      </span>
                      {template.offerPrice && template.offerPrice < template.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(template.offerPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(template.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i
                  if (pageNum > pagination.totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
