"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@radix-ui/react-label'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AddTemplate() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [price, setPrice] = useState<number | ''>('')
    const [offerPrice, setOfferPrice] = useState<number | ''>('')
    const [lastUpdated, setLastUpdated] = useState('')
    const [version, setVersion] = useState('')
    const [builtWith, setBuiltWith] = useState('')
    const [resource, setResource] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [resourceFile, setResourceFile] = useState<File | null>(null)
    const [coverUrl, setCoverUrl] = useState('')
    const [loadingUpload, setLoadingUpload] = useState(false)
    const [loadingResourceUpload, setLoadingResourceUpload] = useState(false)
    const [loadingCreate, setLoadingCreate] = useState(false)
    const [availableTags, setAvailableTags] = useState<Array<{id: string, name: string}>>([])
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
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

    function insertSyntax(kind: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'strike' | 'inlineCode' | 'codeBlock' | 'quote' | 'ul' | 'ol' | 'link' | 'image' | 'hr' | 'table') {
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
        setContent(next)
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


    const selectTag = (tagId: string) => {
        if (!selectedTagIds.includes(tagId)) {
            setSelectedTagIds(prev => [...prev, tagId])
        }
    }

    const removeSelectedTag = (tagId: string) => {
        setSelectedTagIds(prev => prev.filter(id => id !== tagId))
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
    }, [content])

    const uploadCover = async () => {
        if (!file) return alert('Select a file first')
        setLoadingUpload(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/uploads', { method: 'POST', body: fd })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
            setCoverUrl(json.url)
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setLoadingUpload(false)
        }
    }

    const uploadResource = async () => {
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
            if (json.url) setResource(json.url)
            else if (json.key) setResource(json.key)
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Upload failed')
        } finally {
            setLoadingResourceUpload(false)
        }
    }

    const createTemplate = async () => {
        if (!coverUrl) return alert('Please upload cover image first')
        setLoadingCreate(true)
        try {
            const body: Record<string, unknown> = {
                title,
                description,
                coverImage: coverUrl,
                content,
                price: typeof price === 'string' ? Number(price || 0) : price,
            }
            if (offerPrice !== '' && (typeof offerPrice === 'number' ? offerPrice >= 0 : Number(offerPrice) >= 0)) {
                body.offerPrice = typeof offerPrice === 'string' ? Number(offerPrice) : offerPrice
            }
            const details: Record<string, unknown> = {}
            if (lastUpdated.trim()) details.lastUpdated = lastUpdated.trim()
            if (version.trim()) details.version = version.trim()
            const builtWithArray = builtWith.split(',').map(s => s.trim()).filter(Boolean)
            if (builtWithArray.length > 0) details.builtWith = builtWithArray
            // resource is top-level, not inside details
            if (resource.trim()) body.resource = resource.trim()
            if (Object.keys(details).length > 0) body.details = details
            // Include selected tags
            if (selectedTagIds.length > 0) body.tagIds = selectedTagIds
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(JSON.stringify(json.error || json))
            alert('Template created')
            // Reset form fields after successful creation
            setTitle('')
            setDescription('')
            setContent('')
            setPrice('')
            setOfferPrice('')
            setLastUpdated('')
            setVersion('')
            setBuiltWith('')
            setResource('')
            setFile(null)
            setResourceFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (resourceFileInputRef.current) resourceFileInputRef.current.value = ''
            setCoverUrl('')
            setSelectedTagIds([])
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Create failed')
        } finally {
            setLoadingCreate(false)
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add Template</h1>

            <div className="grid gap-5 max-w-lg">
                <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="grid gap-2">
                    <Label>Content</Label>
                    <div className="flex items-center gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
                        <Button type="button" variant="outline" onClick={() => insertSyntax('h1')}>H1</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('h2')}>H2</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('h3')}>H3</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('bold')}>Bold</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('italic')}>Italic</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('strike')}>Strike</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('ul')}>List</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('ol')}>1.</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('inlineCode')}>`code`</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('codeBlock')}>Code</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('quote')}>Quote</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('link')}>Link</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('image')}>Image</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('hr')}>HR</Button>
                        <Button type="button" variant="outline" onClick={() => insertSyntax('table')}>Table</Button>
                    </div>

                    <div className="hidden md:flex gap-0 items-stretch border rounded-md overflow-hidden" style={{ height: 460 }}>
                        <div ref={editorPaneRef} className="w-full h-full overflow-auto" style={{ width: `${split}%` }}>
                            <Textarea
                                ref={editorRef}
                                placeholder="Write Markdown..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={20}
                                className="h-full min-h-full rounded-none border-0 font-mono text-sm leading-6 resize-none"
                            />
                        </div>
                        <div onMouseDown={startDrag} title="Drag to resize" className="w-2 cursor-col-resize bg-border hover:bg-primary/50 relative">
                            <div className="absolute inset-y-0 left-0 right-0 mx-auto w-px bg-muted" />
                        </div>
                        <div ref={previewPaneRef} className="w-full h-full overflow-auto p-4" style={{ width: `${100 - split}%` }}>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content || ''}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden grid gap-2">
                        <Textarea
                            ref={editorRef}
                            placeholder="Write Markdown..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={16}
                        />
                        <div className="prose prose-sm max-w-none dark:prose-invert border rounded-md p-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content || ''}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                <Input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) =>
                        setPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                />

                <Input
                    type="number"
                    placeholder="Offer Price"
                    value={offerPrice}
                    onChange={(e) =>
                        setOfferPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    min={0}
                />

                <div className="grid gap-2">
                    <Label htmlFor="lastUpdated">Last Updated</Label>
                    <Input
                        id="lastUpdated"
                        type="date"
                        value={lastUpdated}
                        onChange={(e) => setLastUpdated(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                        id="version"
                        placeholder="e.g., 1.0.0"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="builtWith">Built With</Label>
                    <Input
                        id="builtWith"
                        placeholder="Comma-separated, e.g., Next.js, Tailwind"
                        value={builtWith}
                        onChange={(e) => setBuiltWith(e.target.value)}
                    />
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
                        onClick={uploadResource}
                        disabled={loadingResourceUpload}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        {loadingResourceUpload ? "Uploading..." : "Upload Resource"}
                    </Button>
                </div>
            </div>


                <div className="grid gap-2">
                    <Label>Available Tags</Label>
                    <div className="space-y-2">
                        {/* Available Tags Dropdown */}
                        <div className="space-y-2">
                            {/* <Label htmlFor="tagSelect">Available Tags</Label> */}
                            <select
                                id="tagSelect"
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => {
                                    if (e.target.value === 'add-new') {
                                        setShowAddTagInput(true)
                                        e.target.value = '' // Reset selection
                                    } else if (e.target.value) {
                                        selectTag(e.target.value)
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
                            {/* <Label>Selected Tags</Label> */}
                            <div className="min-h-[60px] p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                {selectedTagIds.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic">
                                        No tags selected yet
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTagIds.map((tagId) => {
                                            const tag = availableTags.find(t => t.id === tagId)
                                            return tag ? (
                                                <span
                                                    key={tagId}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                                                >
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedTag(tagId)}
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
                        onClick={uploadCover}
                        disabled={loadingUpload}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        {loadingUpload ? "Uploading..." : "Upload Cover"}
                    </Button>
                </div>

                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="cover"
                        className="max-w-xs rounded-md border mt-2"
                    />
                ) : null}

                <Button
                    type="button"
                    onClick={createTemplate}
                    disabled={loadingCreate}
                    className="w-full flex justify-center"
                >
                    {loadingCreate ? "Creating..." : "Create Template"}
                </Button>
            </div>
        </div>

    )
}