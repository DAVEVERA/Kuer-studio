import type { QrEditorState, DestinationType } from '@/types/qr'
import { DEFAULT_EDITOR_STATE } from '@/lib/constants'

const destinationPresets: Record<DestinationType, Partial<QrEditorState>> = {
  website: {
    fgColor: '#1a1a2e',
    bgColor: '#FFFFFF',
    ctaText: 'Visit Us',
    frameStyle: 'simple',
  },
  'social-media': {
    fgColor: '#0f0f23',
    bgColor: '#FFFFFF',
    ctaText: 'Follow Us',
    frameStyle: 'rounded',
    cornerStyle: 'rounded',
  },
  video: {
    fgColor: '#1a0a2e',
    bgColor: '#FFFFFF',
    ctaText: 'Watch Now',
    frameStyle: 'badge',
    moduleStyle: 'rounded',
  },
  'ar-experience': {
    fgColor: '#0a1628',
    bgColor: '#FFFFFF',
    ctaText: 'Experience AR',
    frameStyle: 'badge',
    moduleStyle: 'dot',
    cornerStyle: 'extra-rounded',
  },
  podcast: {
    fgColor: '#1a1a2e',
    bgColor: '#FFFFFF',
    ctaText: 'Listen Now',
    frameStyle: 'rounded',
    moduleStyle: 'rounded',
  },
  menu: {
    fgColor: '#2c1810',
    bgColor: '#FFFFFF',
    ctaText: 'Open Menu',
    frameStyle: 'simple',
  },
  payment: {
    fgColor: '#0a2540',
    bgColor: '#FFFFFF',
    ctaText: 'Pay Now',
    frameStyle: 'simple',
    cornerStyle: 'square',
  },
  event: {
    fgColor: '#1a0a2e',
    bgColor: '#FFFFFF',
    ctaText: 'Join Us',
    frameStyle: 'banner',
    moduleStyle: 'rounded',
    cornerStyle: 'rounded',
  },
  'product-packaging': {
    fgColor: '#111111',
    bgColor: '#FFFFFF',
    ctaText: 'Scan Me',
    frameStyle: 'simple',
  },
  campaign: {
    fgColor: '#0B1117',
    bgColor: '#FFFFFF',
    ctaText: 'Learn More',
    frameStyle: 'badge',
    moduleStyle: 'soft-pixel',
    cornerStyle: 'rounded',
  },
}

export function getPresetForDestination(destination: DestinationType): QrEditorState {
  const preset = destinationPresets[destination] ?? {}
  return { ...DEFAULT_EDITOR_STATE, ...preset }
}
