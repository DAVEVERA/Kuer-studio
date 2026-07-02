'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface LogoUploadProps {
  logoUrl?: string
  logoSize: number
  onLogoChange: (url: string | undefined) => void
  onSizeChange: (size: number) => void
}

export function LogoUpload({ logoUrl, logoSize, onLogoChange, onSizeChange }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      onLogoChange(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [onLogoChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="space-y-4">
      <Label>Logo</Label>

      {logoUrl ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-lg object-contain bg-white/10 border border-border p-1"
            />
            <button
              onClick={() => onLogoChange(undefined)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Logo Size</Label>
              <span className="text-xs text-muted">{logoSize}%</span>
            </div>
            <Slider
              value={[logoSize]}
              min={10}
              max={40}
              step={1}
              onValueChange={([v]) => onSizeChange(v)}
            />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-border-hover hover:bg-white/[0.02]'
          )}
        >
          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
            {isDragging ? (
              <ImageIcon className="h-5 w-5 text-accent" />
            ) : (
              <Upload className="h-5 w-5 text-muted" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-foreground">Drop your logo here</p>
            <p className="text-xs text-muted mt-0.5">PNG, SVG, or JPG</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
