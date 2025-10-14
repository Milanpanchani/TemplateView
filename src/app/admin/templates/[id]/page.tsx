"use client"

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  title: string
  description: string
  coverImage: string
  content: string
  price: number
  offerPrice?: number
  resource?: string
  details?: {
    lastUpdated?: string
    version?: string
    builtWith?: string[]
    githubRepo?: string
    documentation?: string
  }
  createdAt: string
  updatedAt: string
  templateTags?: Array<{
    tag: {
      id: string
      name: string
    }
    createdAt: string
  }>
}

interface TemplateResponse {
  success: boolean
  template: Template
  error?: string
}

export default function TemplateViewPage() {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/templates?id=${templateId}&includeTags=true`)
      const data: TemplateResponse = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch template')
      }
      
      setTemplate(data.template)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching template:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (templateId) {
      fetchTemplate()
    }
  }, [templateId])

  const handleDelete = async () => {
    if (!template) return
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${template.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeleting(true)
      
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete template')
      }
      
      alert('Template deleted successfully')
      router.push('/admin/templates')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete template')
      console.error('Error deleting template:', err)
    } finally {
      setDeleting(false)
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/templates">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Template Details</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/templates">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Template Details</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error || 'Template not found'}</p>
            <Button onClick={() => fetchTemplate()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/templates">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{template.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/templates/${templateId}/edit`)}
          >
            Edit Template
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={template.coverImage}
              alt={template.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA1MEgxMjBWODBIODBWNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik05MCA2MEgxMTBWODBIOTBWNTBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
              }}
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{template.description}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Content</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {template.content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(template.price)}
                </span>
              </div>
              {template.offerPrice && template.offerPrice < template.price && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offer Price:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatPrice(template.offerPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {template.templateTags && template.templateTags.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.templateTags.map((templateTag) => (
                  <span
                    key={templateTag.tag.id}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {templateTag.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          {template.details && Object.keys(template.details).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-3">
                {template.details.version && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Version:</span>
                    <p className="text-sm text-gray-900">{template.details.version}</p>
                  </div>
                )}
                {template.details.lastUpdated && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                    <p className="text-sm text-gray-900">{template.details.lastUpdated}</p>
                  </div>
                )}
                {template.details.builtWith && template.details.builtWith.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Built With:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.details.builtWith.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {template.details.githubRepo && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">GitHub:</span>
                    <a
                      href={template.details.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      View Repository
                    </a>
                  </div>
                )}
                {template.details.documentation && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Documentation:</span>
                    <a
                      href={template.details.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      View Docs
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resource */}
          {template.resource && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Resource</h3>
              <a
                href={template.resource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download Resource
              </a>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-900">{formatDate(template.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Modified:</span>
                <p className="text-gray-900">{formatDate(template.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
