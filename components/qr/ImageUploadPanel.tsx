'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Crop } from 'lucide-react'

interface ImageUploadPanelProps {
  onImageSelect: (file: File, dataUrl: string) => void
  onClear: () => void
  imageDataUrl?: string
  className?: string
}

export function ImageUploadPanel({ onImageSelect, onClear, imageDataUrl, className }: ImageUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(100)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) onImageSelect(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onImageSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (imageDataUrl) {
    return (
      <div className={className}>
        <div className="glass rounded-xl overflow-hidden">
          <div className="relative aspect-square max-h-[400px] overflow-hidden bg-black/20">
            <img
              src={imageDataUrl}
              alt="Uploaded"
              className="w-full h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            />
            <button
              onClick={onClear}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-red-500/60 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-3 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1.5 rounded-md glass hover:bg-white/[0.04] transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5 text-muted" />
              </button>
              <span className="text-xs text-muted w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1.5 rounded-md glass hover:bg-white/[0.04] transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5 text-muted" />
              </button>
            </div>
            <button
              onClick={() => { onClear(); if (inputRef.current) inputRef.current.value = '' }}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Replace Image
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`glass rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-white/10 hover:border-accent/30 hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4"
          >
            {isDragging ? (
              <Upload className="w-8 h-8 text-accent" />
            ) : (
              <ImageIcon className="w-8 h-8 text-accent" />
            )}
          </motion.div>
          <h3 className="font-semibold text-sm mb-1">
            {isDragging ? 'Drop your image here' : 'Upload your image'}
          </h3>
          <p className="text-xs text-muted max-w-[260px] mb-4">
            Drag and drop your artwork, logo, product photo, or brand asset. We&apos;ll analyze it and create a bespoke QR design.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted/60">
            <span>PNG</span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted/30" />
            <span>JPG</span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted/30" />
            <span>WEBP</span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted/30" />
            <span>SVG</span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted/30" />
            <span>Max 10MB</span>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
