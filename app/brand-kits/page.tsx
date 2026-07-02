'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Palette, Pencil, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'

interface BrandKitItem {
  id: string
  name: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontPreference: string
}

const initialBrandKits: BrandKitItem[] = [
  { id: '1', name: 'MNRV Default', primaryColor: '#E07856', secondaryColor: '#2C3E50', accentColor: '#E8B89F', fontPreference: 'Inter' },
  { id: '2', name: 'Tech Startup', primaryColor: '#6366F1', secondaryColor: '#0F172A', accentColor: '#A78BFA', fontPreference: 'Space Grotesk' },
  { id: '3', name: 'Restaurant Brand', primaryColor: '#D4A574', secondaryColor: '#2C1810', accentColor: '#F5F0EB', fontPreference: 'Playfair Display' },
  { id: '4', name: 'Podcast Network', primaryColor: '#FF6584', secondaryColor: '#6C63FF', accentColor: '#2D2D2D', fontPreference: 'Poppins' },
]

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKitItem[]>(initialBrandKits)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKit, setEditingKit] = useState<BrandKitItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#E07856',
    secondaryColor: '#2C3E50',
    accentColor: '#E8B89F',
    fontPreference: 'Inter',
  })

  const openCreate = () => {
    setEditingKit(null)
    setFormData({ name: '', primaryColor: '#E07856', secondaryColor: '#2C3E50', accentColor: '#E8B89F', fontPreference: 'Inter' })
    setIsDialogOpen(true)
  }

  const openEdit = (kit: BrandKitItem) => {
    setEditingKit(kit)
    setFormData({
      name: kit.name,
      primaryColor: kit.primaryColor,
      secondaryColor: kit.secondaryColor,
      accentColor: kit.accentColor,
      fontPreference: kit.fontPreference,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    if (editingKit) {
      setBrandKits(kits => kits.map(k =>
        k.id === editingKit.id ? { ...k, ...formData } : k
      ))
    } else {
      setBrandKits(kits => [...kits, {
        id: Date.now().toString(),
        ...formData,
      }])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setBrandKits(kits => kits.filter(k => k.id !== id))
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Brand Kits</h1>
            <p className="text-muted text-sm mt-1">Manage your brand colors, logos, and fonts</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Brand Kit
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandKits.map((kit, i) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass rounded-xl overflow-hidden group"
            >
              <div className="h-24 relative" style={{
                background: `linear-gradient(135deg, ${kit.primaryColor}, ${kit.secondaryColor}, ${kit.accentColor})`
              }}>
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(kit)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(kit.id)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/60 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-3">{kit.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {[kit.primaryColor, kit.secondaryColor, kit.accentColor].map((color, ci) => (
                    <div key={ci} className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-muted font-mono">{color}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Palette className="w-3 h-3" />
                  {kit.fontPreference}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty state / Add card */}
          <button
            onClick={openCreate}
            className="glass rounded-xl p-8 border-2 border-dashed border-white/10 hover:border-accent/30 transition-colors flex flex-col items-center justify-center gap-3 text-muted hover:text-foreground min-h-[180px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Brand Kit</span>
          </button>
        </div>
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editingKit ? 'Edit Brand Kit' : 'New Brand Kit'}
                </h2>
                <button onClick={() => setIsDialogOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Brand Kit"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-sm focus:outline-none focus:border-accent/30"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'primaryColor' as const, label: 'Primary' },
                    { key: 'secondaryColor' as const, label: 'Secondary' },
                    { key: 'accentColor' as const, label: 'Accent' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-muted mb-1.5 block">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          className="flex-1 px-2 py-1.5 rounded bg-background border border-white/5 text-xs font-mono min-w-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Font Preference</label>
                  <select
                    value={formData.fontPreference}
                    onChange={(e) => setFormData({ ...formData, fontPreference: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-sm focus:outline-none focus:border-accent/30"
                  >
                    {['Inter', 'Poppins', 'Space Grotesk', 'Playfair Display', 'Montserrat', 'Roboto', 'DM Sans'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className="rounded-lg overflow-hidden">
                  <div className="h-16" style={{
                    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor}, ${formData.accentColor})`
                  }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-lg glass text-sm hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name.trim()}
                  className="px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {editingKit ? 'Save Changes' : 'Create Brand Kit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
