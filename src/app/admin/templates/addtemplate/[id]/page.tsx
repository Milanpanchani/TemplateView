"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@radix-ui/react-label'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik'
import * as Yup from 'yup'

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
  templateTags?: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

interface TemplateResponse {
  success: boolean
  template: Template
  error?: string
}

interface FormValues {
  title: string
  description: string
  content: string
  price: number
  offerPrice?: number
  lastUpdated: string
  version: string
  builtWith: string
  resource: string
  coverImage: string
  tagIds: string[]
}

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(1, 'Description is required')
    .required('Description is required'),
  content: Yup.string()
    .min(1, 'Content is required')
    .required('Content is required'),
  price: Yup.number()
    .min(0, 'Price must be positive')
    .required('Price is required'),
  offerPrice: Yup.number()
    .min(0, 'Offer price must be positive')
    .optional(),
  lastUpdated: Yup.string().optional(),
  version: Yup.string().optional(),
  builtWith: Yup.string().optional(),
  resource: Yup.string().optional(),
  coverImage: Yup.string()
    .url('Invalid cover image URL')
    .required('Cover image is required'),
  tagIds: Yup.array().of(Yup.string()).optional(),
})

export default function AddTemplate() {
    const router = useRouter()
    const params = useParams()
    const templateId = params.id as string
    const isEditMode = Boolean(templateId && templateId !== 'new')
    
    // File upload states
    const [file, setFile] = useState<File | null>(null)
    const [resourceFile, setResourceFile] = useState<File | null>(null)
    const [loadingUpload, setLoadingUpload] = useState(false)
    const [loadingResourceUpload, setLoadingResourceUpload] = useState(false)
    const [loadingTemplate, setLoadingTemplate] = useState(false)
    
    // Tags management
    const [availableTags, setAvailableTags] = useState<Array<{id: string, name: string}>>([])
    const [loadingTags, setLoadingTags] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [loadingTagOps, setLoadingTagOps] = useState(false)
    const [showAddTagInput, setShowAddTagInput] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const resourceFileInputRef = useRef<HTMLInputElement | null>(null)
    const editorRef = useRef<HTMLTextAreaElement | null>(null)
    const editorPaneRef = useRef<HTMLDivElement | null>(null)
    const previewPaneRef = useRef<HTMLDivElement | null>(null)
    const isDraggingRef = useRef<boolean>(false)
    const isSyncingScrollRef = useRef<boolean>(false)
    const [split, setSplit] = useState<number>(50) // percentage width for editor
    const [initialValues, setInitialValues] = useState<FormValues>({
        title: '',
        description: '',
        content: '',
        price: 0,
        offerPrice: undefined,
        lastUpdated: '',
        version: '',
        builtWith: '',
        resource: '',
        coverImage: '',
        tagIds: []
    })

    function insertSyntax(kind: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'strike' | 'inlineCode' | 'codeBlock' | 'quote' | 'ul' | 'ol' | 'link' | 'image' | 'hr' | 'table', setFieldValue: (field: string, value: any) => void, content: string) {
        const el = editorRef.current
        if (!el) return
        const start = el.selectionStart ?? 0
        const end = el.selectionEnd ?? 0
        const before = content.slice(0, start)
        const sel = content.slice(start, end) || 'text'
        const after = content.slice(end)

        let snippet = ''
        switch (kind) {
            case 'h1': snippet = `# ${sel}`; break
            case 'h2': snippet = `## ${sel}`; break
            case 'h3': snippet = `### ${sel}`; break
            case 'bold': snippet = `**${sel}**`; break
            case 'italic': snippet = `_${sel}_`; break
            case 'strike': snippet = `~~${sel}~~`; break
            case 'inlineCode': snippet = `\`${sel}\``; break
            case 'codeBlock': snippet = `\n\n\`\`\`ts\n${sel}\n\`\`\`\n\n`; break
            case 'quote': snippet = `> ${sel}`; break
            case 'ul': snippet = `- ${sel}`; break
            case 'ol': snippet = `1. ${sel}`; break
            case 'link': snippet = `[${sel}](https://example.com)`; break
            case 'image': snippet = `![Alt Text](https://example.com/image.png)`; break
            case 'hr': snippet = `\n\n---\n\n`; break
            case 'table': snippet = `\n\n| Column A | Column B |\n| --- | --- |\n| ${sel} | value |\n\n`; break
        }
        const next = `${before}${snippet}${after}`
        setFieldValue('content', next)
        requestAnimationFrame(() => {
            el.focus()
            const caret = before.length + snippet.length
            el.setSelectionRange(caret, caret)
        })
    }

    // Load saved split
    useEffect(() => {
        const saved = localStorage.getItem('addtemplate_md_split')
        if (saved) {
            const n = Number(saved)
            if (!Number.isNaN(n) && n >= 20 && n <= 80) setSplit(n)
        }
    }, [])

    // Fetch available tags
    useEffect(() => {
        const fetchTags = async () => {
            setLoadingTags(true)
            try {
                const res = await fetch('/api/tag')
                const json = await res.json()
                if (res.ok && json.success) {
                    setAvailableTags(json.tags)
                } else {
                    console.error('Failed to fetch tags:', json.error)
                }
            } catch (_error) {
                console.error('Error fetching tags:', _error)
            } finally {
                setLoadingTags(false)
            }
        }
        fetchTags()
    }, [])

    // Fetch template data for edit mode
    useEffect(() => {
        if (isEditMode && templateId) {
            const fetchTemplate = async () => {
                setLoadingTemplate(true)
                try {
                    const res = await fetch(`/api/templates?id=${templateId}&includeTags=true`)
                    const json: TemplateResponse = await res.json()
                    if (res.ok && json.success && json.template) {
                        const template = json.template
                        const formValues: FormValues = {
                            title: template.title,
                            description: template.description,
                            content: template.content,
                            price: template.price,
                            offerPrice: template.offerPrice,
                            lastUpdated: template.details?.lastUpdated || '',
                            version: template.details?.version || '',
                            builtWith: template.details?.builtWith?.join(', ') || '',
                            resource: template.resource || '',
                            coverImage: template.coverImage,
                            tagIds: template.templateTags?.map(tt => tt.tag.id) || []
                        }
                        setInitialValues(formValues)
                    } else {
                        alert('Failed to fetch template: ' + (json.error || 'Unknown error'))
                        router.push('/admin/templates')
                    }
                } catch (error) {
                    console.error('Error fetching template:', error)
                    alert('Error fetching template')
                    router.push('/admin/templates')
                } finally {
                    setLoadingTemplate(false)
                }
            }
            fetchTemplate()
        }
    }, [isEditMode, templateId, router])

    // Tag management functions
    const addNewTag = async () => {
        if (!newTagName.trim()) return alert('Please enter a tag name')
        setLoadingTagOps(true)
        try {
            const res = await fetch('/api/tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagName.trim() })
            })
            const json = await res.json()
            if (res.ok && json.success) {
                setAvailableTags(prev => [...prev, json.tag])
                setNewTagName('')
                setShowAddTagInput(false)
                alert('Tag added successfully')
            } else {
                alert(json.error || 'Failed to add tag')
            }
        } catch (error) {
            alert('Error adding tag')
        } finally {
            setLoadingTagOps(false)
        }
    }


    const selectTag = (tagId: string, currentTagIds: string[], setFieldValue: (field: string, value: any) => void) => {
        if (!currentTagIds.includes(tagId)) {
            setFieldValue('tagIds', [...currentTagIds, tagId])
        }
    }

    const removeSelectedTag = (tagId: string, currentTagIds: string[], setFieldValue: (field: string, value: any) => void) => {
        setFieldValue('tagIds', currentTagIds.filter(id => id !== tagId))
    }


    // Drag to resize panes
    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            if (!isDraggingRef.current) return
            const container = editorPaneRef.current?.parentElement
            if (!container) return
            const rect = container.getBoundingClientRect()
            const x = e.clientX - rect.left
            const pct = Math.min(80, Math.max(20, (x / rect.width) * 100))
            setSplit(pct)
            localStorage.setItem('addtemplate_md_split', String(pct))
        }
        function onMouseUp() {
            isDraggingRef.current = false
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [])

    function startDrag() {
        isDraggingRef.current = true
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'col-resize'
    }

    // Scroll sync
    useEffect(() => {
        const editorEl = editorPaneRef.current as HTMLElement | null
        const previewEl = previewPaneRef.current as HTMLElement | null
        if (!editorEl || !previewEl) return

        function sync(from: HTMLElement, to: HTMLElement) {
            if (isSyncingScrollRef.current) return
            isSyncingScrollRef.current = true
            const ratio = from.scrollTop / (from.scrollHeight - from.clientHeight || 1)
            to.scrollTop = ratio * (to.scrollHeight - to.clientHeight)
            // allow next frame updates
            requestAnimationFrame(() => { isSyncingScrollRef.current = false })
        }

        function onEditorScroll() { if (editorEl && previewEl) sync(editorEl, previewEl) }
        function onPreviewScroll() { if (editorEl && previewEl) sync(previewEl, editorEl) }

        editorEl.addEventListener('scroll', onEditorScroll)
        previewEl.addEventListener('scroll', onPreviewScroll)
        return () => {
            editorEl.removeEventListener('scroll', onEditorScroll)
            previewEl.removeEventListener('scroll', onPreviewScroll)
        }
    }, [])

    const uploadCover = async (setFieldValue: (field: string, value: any) => void) => {
        if (!file) return alert('Select a file first')
        setLoadingUpload(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/uploads', { method: 'POST', body: fd })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
            setFieldValue('coverImage', json.url)
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setLoadingUpload(false)
        }
    }

    const uploadResource = async (setFieldValue: (field: string, value: any) => void) => {
        if (!resourceFile) return alert('Select a resource file first')
        // Optional client-side size guard (matches backend)
        const maxBytes = 100 * 1024 * 1024
        if (resourceFile.size > maxBytes) {
            alert('Max resource size is 100MB')
            return
        }
        setLoadingResourceUpload(true)
        try {
            const fd = new FormData()
            fd.append('file', resourceFile)
            const res = await fetch('/api/templates/upload', { method: 'POST', body: fd })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
            if (json.url) setFieldValue('resource', json.url)
            else if (json.key) setFieldValue('resource', json.key)
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setLoadingResourceUpload(false)
        }
    }

    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        try {
            const body: Record<string, unknown> = {
                title: values.title,
                description: values.description,
                coverImage: values.coverImage,
                content: values.content,
                price: values.price,
            }
            if (values.offerPrice && values.offerPrice >= 0) {
                body.offerPrice = values.offerPrice
            }
            const details: Record<string, unknown> = {}
            if (values.lastUpdated.trim()) details.lastUpdated = values.lastUpdated.trim()
            if (values.version.trim()) details.version = values.version.trim()
            const builtWithArray = values.builtWith.split(',').map(s => s.trim()).filter(Boolean)
            if (builtWithArray.length > 0) details.builtWith = builtWithArray
            // resource is top-level, not inside details
            if (values.resource.trim()) body.resource = values.resource.trim()
            if (Object.keys(details).length > 0) body.details = details
            // Include selected tags
            if (values.tagIds.length > 0) body.tagIds = values.tagIds
            
            const url = isEditMode ? `/api/templates/${templateId}` : '/api/templates'
            const method = isEditMode ? 'PUT' : 'POST'
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(JSON.stringify(json.error || json))
            
            alert(isEditMode ? 'Template updated successfully' : 'Template created successfully')
            
            if (isEditMode) {
                // Redirect to template view page after successful update
                router.push(`/admin/templates/${templateId}`)
            } else {
                // Reset form fields after successful creation
                setFile(null)
                setResourceFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
                if (resourceFileInputRef.current) resourceFileInputRef.current.value = ''
                // Reset initial values for create mode
                setInitialValues({
                    title: '',
                    description: '',
                    content: '',
                    price: 0,
                    offerPrice: undefined,
                    lastUpdated: '',
                    version: '',
                    builtWith: '',
                    resource: '',
                    coverImage: '',
                    tagIds: []
                })
            }
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : (isEditMode ? 'Update failed' : 'Create failed'))
        } finally {
            setSubmitting(false)
        }
    }

    // Show loading state while fetching template data in edit mode
    if (isEditMode && loadingTemplate) {
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
                    <h1 className="text-2xl font-bold">Edit Template</h1>
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

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href={isEditMode ? `/admin/templates/${templateId}` : "/admin/templates"}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Template' : 'Add Template'}</h1>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                    <Form className="grid gap-5 max-w-lg">
                        <Field name="title">
                            {({ field, meta }: FieldProps) => (
                                <div>
                                    <Input
                                        {...field}
                                        placeholder="Title"
                                        className={meta.touched && meta.error ? 'border-red-500' : ''}
                                    />
                                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            )}
                        </Field>

                        <Field name="description">
                            {({ field, meta }: FieldProps) => (
                                <div>
                                    <Textarea
                                        {...field}
                                        placeholder="Description"
                                        className={meta.touched && meta.error ? 'border-red-500' : ''}
                                    />
                                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            )}
                        </Field>

                        <div className="grid gap-2">
                            <Label>Content</Label>
                            <div className="flex items-center gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
                                <Button type="button" variant="outline" onClick={() => insertSyntax('h1', setFieldValue, values.content)}>H1</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('h2', setFieldValue, values.content)}>H2</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('h3', setFieldValue, values.content)}>H3</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('bold', setFieldValue, values.content)}>Bold</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('italic', setFieldValue, values.content)}>Italic</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('strike', setFieldValue, values.content)}>Strike</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('ul', setFieldValue, values.content)}>List</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('ol', setFieldValue, values.content)}>1.</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('inlineCode', setFieldValue, values.content)}>`code`</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('codeBlock', setFieldValue, values.content)}>Code</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('quote', setFieldValue, values.content)}>Quote</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('link', setFieldValue, values.content)}>Link</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('image', setFieldValue, values.content)}>Image</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('hr', setFieldValue, values.content)}>HR</Button>
                                <Button type="button" variant="outline" onClick={() => insertSyntax('table', setFieldValue, values.content)}>Table</Button>
                            </div>

                            <div className="hidden md:flex gap-0 items-stretch border rounded-md overflow-hidden" style={{ height: 460 }}>
                                <div ref={editorPaneRef} className="w-full h-full overflow-auto" style={{ width: `${split}%` }}>
                                    <Field name="content">
                                        {({ field, meta }: FieldProps) => (
                                            <Textarea
                                                {...field}
                                                ref={editorRef}
                                                placeholder="Write Markdown..."
                                                rows={20}
                                                className={`h-full min-h-full rounded-none border-0 font-mono text-sm leading-6 resize-none ${meta.touched && meta.error ? 'border-red-500' : ''}`}
                                            />
                                        )}
                                    </Field>
                                </div>
                                <div onMouseDown={startDrag} title="Drag to resize" className="w-2 cursor-col-resize bg-border hover:bg-primary/50 relative">
                                    <div className="absolute inset-y-0 left-0 right-0 mx-auto w-px bg-muted" />
                                </div>
                                <div ref={previewPaneRef} className="w-full h-full overflow-auto p-4" style={{ width: `${100 - split}%` }}>
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {values.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            <div className="md:hidden grid gap-2">
                                <Field name="content">
                                    {({ field, meta }: FieldProps) => (
                                        <Textarea
                                            {...field}
                                            ref={editorRef}
                                            placeholder="Write Markdown..."
                                            rows={16}
                                            className={meta.touched && meta.error ? 'border-red-500' : ''}
                                        />
                                    )}
                                </Field>
                                <div className="prose prose-sm max-w-none dark:prose-invert border rounded-md p-3">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {values.content || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <Field name="price">
                            {({ field, meta }: FieldProps) => (
                                <div>
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="Price"
                                        className={meta.touched && meta.error ? 'border-red-500' : ''}
                                    />
                                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            )}
                        </Field>

                        <Field name="offerPrice">
                            {({ field, meta }: FieldProps) => (
                                <div>
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="Offer Price"
                                        min={0}
                                        className={meta.touched && meta.error ? 'border-red-500' : ''}
                                    />
                                    <ErrorMessage name="offerPrice" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            )}
                        </Field>

                        <div className="grid gap-2">
                            <Label htmlFor="lastUpdated">Last Updated</Label>
                            <Field name="lastUpdated">
                                {({ field, meta }: FieldProps) => (
                                    <div>
                                        <Input
                                            {...field}
                                            id="lastUpdated"
                                            type="date"
                                            className={meta.touched && meta.error ? 'border-red-500' : ''}
                                        />
                                        <ErrorMessage name="lastUpdated" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="version">Version</Label>
                            <Field name="version">
                                {({ field, meta }: FieldProps) => (
                                    <div>
                                        <Input
                                            {...field}
                                            id="version"
                                            placeholder="e.g., 1.0.0"
                                            className={meta.touched && meta.error ? 'border-red-500' : ''}
                                        />
                                        <ErrorMessage name="version" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                )}
                            </Field>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="builtWith">Built With</Label>
                            <Field name="builtWith">
                                {({ field, meta }: FieldProps) => (
                                    <div>
                                        <Input
                                            {...field}
                                            id="builtWith"
                                            placeholder="Comma-separated, e.g., Next.js, Tailwind"
                                            className={meta.touched && meta.error ? 'border-red-500' : ''}
                                        />
                                        <ErrorMessage name="builtWith" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                )}
                            </Field>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <div className="grid gap-2">
                                <Label htmlFor="resource">Resource URL</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="file"
                                    accept="*/*"
                                    ref={resourceFileInputRef}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] || null
                                        if (!f) { setResourceFile(null); return }
                                        const maxBytes = 100 * 1024 * 1024
                                        if (f.size > maxBytes) {
                                            alert('Max resource size is 100MB')
                                            e.currentTarget.value = ''
                                            setResourceFile(null)
                                            return
                                        }
                                        setResourceFile(f)
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => uploadResource(setFieldValue)}
                                    disabled={loadingResourceUpload}
                                    variant="secondary"
                                    className="flex items-center gap-2"
                                >
                                    {loadingResourceUpload ? "Uploading..." : "Upload Resource"}
                                </Button>
                            </div>
                            <Field name="resource">
                                {({ field, meta }: FieldProps) => (
                                    <div>
                                        <Input
                                            {...field}
                                            placeholder="Resource URL"
                                            className={meta.touched && meta.error ? 'border-red-500' : ''}
                                        />
                                        <ErrorMessage name="resource" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                )}
                            </Field>
                        </div>


                        <div className="grid gap-2">
                            <Label>Available Tags</Label>
                            <div className="space-y-2">
                                {/* Available Tags Dropdown */}
                                <div className="space-y-2">
                                    <select
                                        id="tagSelect"
                                        className="w-full p-2 border rounded-md"
                                        onChange={(e) => {
                                            if (e.target.value === 'add-new') {
                                                setShowAddTagInput(true)
                                                e.target.value = '' // Reset selection
                                            } else if (e.target.value) {
                                                selectTag(e.target.value, values.tagIds, setFieldValue)
                                                e.target.value = '' // Reset selection
                                            }
                                        }}
                                        disabled={loadingTags}
                                    >
                                        <option value="" >Select a tag to add...</option>
                                        {availableTags.map((tag) => (
                                            <option key={tag.id} value={tag.id}>
                                                {tag.name}
                                            </option>
                                        ))}
                                        <option value="add-new" className="font-bold text-blue-600">
                                            + Add New Tag
                                        </option>
                                    </select>
                                    {loadingTags && (
                                        <div className="text-sm text-muted-foreground">Loading tags...</div>
                                    )}
                                    
                                    {/* Add New Tag Input - Shows when "Add New Tag" is selected */}
                                    {showAddTagInput && (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Enter new tag name"
                                                value={newTagName}
                                                onChange={(e) => setNewTagName(e.target.value)}
                                                disabled={loadingTagOps}
                                                autoFocus
                                            />
                                            <Button
                                                type="button"
                                                onClick={addNewTag}
                                                disabled={loadingTagOps || !newTagName.trim()}
                                                size="sm"
                                            >
                                                {loadingTagOps ? "Adding..." : "Add"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddTagInput(false)
                                                    setNewTagName('')
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Selected Tags Display */}
                                <div className="space-y-2">
                                    <div className="min-h-[60px] p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                        {values.tagIds.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic">
                                                No tags selected yet
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {values.tagIds.map((tagId) => {
                                                    const tag = availableTags.find(t => t.id === tagId)
                                                    return tag ? (
                                                        <span
                                                            key={tagId}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                                                        >
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSelectedTag(tagId, values.tagIds, setFieldValue)}
                                                                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ) : null
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <Button
                                type="button"
                                onClick={() => uploadCover(setFieldValue)}
                                disabled={loadingUpload}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                {loadingUpload ? "Uploading..." : "Upload Cover"}
                            </Button>
                        </div>

                        {values.coverImage ? (
                            <img
                                src={values.coverImage}
                                alt="cover"
                                className="max-w-xs rounded-md border mt-2"
                            />
                        ) : null}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center"
                        >
                            {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Template" : "Create Template")}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
