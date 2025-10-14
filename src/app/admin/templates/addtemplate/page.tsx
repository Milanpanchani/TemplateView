"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddTemplatePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the dynamic route for adding a new template
    router.replace('/admin/templates/addtemplate/new')
  }, [router])

  return (
    <div className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to add template page...</p>
        </div>
      </div>
    </div>
  )
}