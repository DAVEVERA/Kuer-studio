'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ColorControls } from './ColorControls'
import { LogoUpload } from './LogoUpload'
import { ModuleStyleSelector } from './ModuleStyleSelector'
import { FrameStyleSelector } from './FrameStyleSelector'
import { ExportPanel } from './ExportPanel'
import { CORNER_STYLES, CTA_PRESETS } from '@/lib/constants'
import { RefreshCw, Shield } from 'lucide-react'
import type { QrEditorState, CornerStyle } from '@/types/qr'
import type { ExportFormat } from '@/types/export'

interface QrEditorPanelProps {
  state: QrEditorState
  onChange: (updates: Partial<QrEditorState>) => void
  onRegenerate?: () => void
  onValidate?: () => void
  onExport?: (format: ExportFormat) => void
}

export function QrEditorPanel({ state, onChange, onRegenerate, onValidate, onExport }: QrEditorPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full flex">
          <TabsTrigger value="style" className="flex-1 text-xs">Style</TabsTrigger>
          <TabsTrigger value="colors" className="flex-1 text-xs">Colors</TabsTrigger>
          <TabsTrigger value="logo" className="flex-1 text-xs">Logo</TabsTrigger>
          <TabsTrigger value="frame" className="flex-1 text-xs">Frame</TabsTrigger>
          <TabsTrigger value="export" className="flex-1 text-xs">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label>Target URL</Label>
            <Input
              value={state.targetUrl}
              onChange={(e) => onChange({ targetUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <ModuleStyleSelector
            value={state.moduleStyle}
            onChange={(moduleStyle) => onChange({ moduleStyle })}
          />

          <div className="space-y-2">
            <Label>Corner Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {CORNER_STYLES.map(({ value: style, label }) => (
                <button
                  key={style}
                  onClick={() => onChange({ cornerStyle: style as CornerStyle })}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    state.cornerStyle === style
                      ? 'border-accent bg-accent/5 text-foreground'
                      : 'border-border text-muted hover:border-border-hover'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Quiet Zone</Label>
              <span className="text-xs text-muted">{state.quietZone} modules</span>
            </div>
            <Slider
              value={[state.quietZone]}
              min={1}
              max={8}
              step={1}
              onValueChange={([v]) => onChange({ quietZone: v })}
            />
          </div>

          <div className="flex gap-2">
            {onRegenerate && (
              <Button variant="secondary" size="sm" className="flex-1" onClick={onRegenerate}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Regenerate
              </Button>
            )}
            {onValidate && (
              <Button variant="secondary" size="sm" className="flex-1" onClick={onValidate}>
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Validate
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-4">
          <ColorControls
            fgColor={state.fgColor}
            bgColor={state.bgColor}
            brandColors={state.brandColors}
            onFgChange={(fgColor) => onChange({ fgColor })}
            onBgChange={(bgColor) => onChange({ bgColor })}
          />
        </TabsContent>

        <TabsContent value="logo" className="mt-4">
          <LogoUpload
            logoUrl={state.logoUrl}
            logoSize={state.logoSize}
            onLogoChange={(logoUrl) => onChange({ logoUrl })}
            onSizeChange={(logoSize) => onChange({ logoSize })}
          />
        </TabsContent>

        <TabsContent value="frame" className="space-y-5 mt-4">
          <FrameStyleSelector
            value={state.frameStyle}
            onChange={(frameStyle) => onChange({ frameStyle })}
          />

          <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input
              value={state.ctaText}
              onChange={(e) => onChange({ ctaText: e.target.value })}
              placeholder="Scan Me"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CTA_PRESETS.map((cta) => (
                <button
                  key={cta}
                  onClick={() => onChange({ ctaText: cta })}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    state.ctaText === cta
                      ? 'bg-accent/15 text-accent border border-accent/20'
                      : 'bg-background border border-border text-muted hover:text-foreground'
                  }`}
                >
                  {cta}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <ExportPanel onExport={onExport || (() => {})} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
