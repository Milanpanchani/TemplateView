"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  useEffect(() => {
    if (templateId) {
      // Redirect to add template page with the template ID for editing
      router.replace(`/admin/templates/addtemplate/${templateId}`)
    } else {
      router.replace('/admin/templates')
    }
  }, [templateId, router])

  return (
    <div className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to edit page...</p>
        </div>
      </div>
    </div>
  )
}
