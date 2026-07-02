'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  QrCode,
  Sparkles,
  Shield,
  Download,
  Globe,
  Megaphone,
  Calendar,
  UtensilsCrossed,
  Headphones,
  Package,
  Video,
  ShoppingBag,
  CheckCircle2,
  Zap,
  Eye,
  Palette,
  ChevronRight,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

const stagger = {
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
}

const styleExamples = [
  { name: 'Premium Luxury', colors: ['#1a1a2e', '#d4af37', '#0f0f1a'], desc: 'Gold linework, deep navy' },
  { name: 'Organic Nature', colors: ['#2d5016', '#8fbc5a', '#f4f1de'], desc: 'Botanical textures, warm light' },
  { name: 'Tech Circuitboard', colors: ['#0a192f', '#64ffda', '#e63946'], desc: 'Metallic traces, microchip textures' },
  { name: 'Podcast Artwork', colors: ['#6c63ff', '#ff6584', '#2d2d2d'], desc: 'Bold gradients, audio vibes' },
  { name: 'Minimal Editorial', colors: ['#fafafa', '#333333', '#e0e0e0'], desc: 'Clean, typographic, Swiss design' },
  { name: 'Cyberpunk Neon', colors: ['#0d0221', '#ff2975', '#00fff5'], desc: 'Glowing neon, dark cyber' },
  { name: 'Dark Futuristic', colors: ['#0a0a0a', '#00d4ff', '#1a1a2e'], desc: 'Sci-fi panels, HUD elements' },
  { name: 'Corporate Clean', colors: ['#ffffff', '#1e3a5f', '#4a90d9'], desc: 'Professional, trustworthy' },
]

const useCases = [
  { icon: Megaphone, title: 'Agencies', desc: 'Deliver branded QR assets as part of every campaign package.' },
  { icon: Globe, title: 'Marketers', desc: 'Track scans and optimize multi-channel campaigns in real time.' },
  { icon: Calendar, title: 'Event Organizers', desc: 'Create event-themed QR codes for tickets, venues, and activations.' },
  { icon: UtensilsCrossed, title: 'Restaurants', desc: 'Design menu QR codes that match your brand\'s interior style.' },
  { icon: Headphones, title: 'Podcasters', desc: 'Generate artwork-style QR codes linking to your latest episodes.' },
  { icon: Package, title: 'Packaging Designers', desc: 'Print-ready QR codes that integrate seamlessly with packaging.' },
  { icon: Video, title: 'Content Creators', desc: 'Link followers to your content with visually stunning QR codes.' },
  { icon: ShoppingBag, title: 'E-commerce Brands', desc: 'Add branded QR codes to products, inserts, and packaging.' },
]

const validationChecks = [
  'QR decoded successfully',
  'URL matches target exactly',
  'Contrast ratio verified',
  'Quiet zone intact',
  'Finder patterns readable',
  'Minimum resolution met',
  'Export suitability confirmed',
]

const artShowcaseStyles = [
  { bg: 'from-purple-900/80 via-indigo-900/60 to-blue-900/80', accent: '#a78bfa', label: 'Cyberpunk' },
  { bg: 'from-amber-900/80 via-orange-800/60 to-red-900/80', accent: '#f59e0b', label: 'Warm Art' },
  { bg: 'from-emerald-900/80 via-teal-800/60 to-cyan-900/80', accent: '#34d399', label: 'Nature' },
  { bg: 'from-rose-900/80 via-pink-800/60 to-fuchsia-900/80', accent: '#fb7185', label: 'Creative' },
]

function HeroQrShowcase() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Rotating art cards behind */}
      {artShowcaseStyles.map((style, i) => (
        <motion.div
          key={style.label}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.bg} overflow-hidden`}
          initial={{ rotate: -8 + i * 4, scale: 0.9, opacity: 0 }}
          animate={{
            rotate: [-8 + i * 4, -4 + i * 4, -8 + i * 4],
            scale: [0.88 - i * 0.02, 0.9 - i * 0.02, 0.88 - i * 0.02],
            opacity: 0.3 - i * 0.05,
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          style={{ zIndex: 4 - i }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-40 p-8">
            <rect x="15" y="15" width="35" height="35" rx="6" fill={style.accent} />
            <rect x="21" y="21" width="23" height="23" rx="3" fill="#0B1117" />
            <rect x="27" y="27" width="11" height="11" rx="2" fill={style.accent} />
            <rect x="150" y="15" width="35" height="35" rx="6" fill={style.accent} />
            <rect x="156" y="21" width="23" height="23" rx="3" fill="#0B1117" />
            <rect x="162" y="27" width="11" height="11" rx="2" fill={style.accent} />
            <rect x="15" y="150" width="35" height="35" rx="6" fill={style.accent} />
            <rect x="21" y="156" width="23" height="23" rx="3" fill="#0B1117" />
            <rect x="27" y="162" width="11" height="11" rx="2" fill={style.accent} />
          </svg>
        </motion.div>
      ))}
      {/* Main card */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ zIndex: 5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1030] to-[#0a1628]" />
        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 p-6">
          <defs>
            <linearGradient id="heroQrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E07856" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <radialGradient id="heroGlow">
              <stop offset="0%" stopColor="#E07856" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#heroGlow)" />
          {/* Finder patterns with glow */}
          <g filter="url(#glow)">
            <rect x="12" y="12" width="38" height="38" rx="6" fill="url(#heroQrGrad)" />
            <rect x="17" y="17" width="28" height="28" rx="4" fill="#0B1117" />
            <rect x="22" y="22" width="18" height="18" rx="3" fill="url(#heroQrGrad)" />
            <rect x="150" y="12" width="38" height="38" rx="6" fill="url(#heroQrGrad)" />
            <rect x="155" y="17" width="28" height="28" rx="4" fill="#0B1117" />
            <rect x="160" y="22" width="18" height="18" rx="3" fill="url(#heroQrGrad)" />
            <rect x="12" y="150" width="38" height="38" rx="6" fill="url(#heroQrGrad)" />
            <rect x="17" y="155" width="28" height="28" rx="4" fill="#0B1117" />
            <rect x="22" y="160" width="18" height="18" rx="3" fill="url(#heroQrGrad)" />
          </g>
          {/* Artistic data modules — organic shapes */}
          {Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => {
              const x = 58 + col * 9
              const y = 58 + row * 9
              const show = ((row * 7 + col * 13) % 5) < 3
              if (!show) return null
              const hue = (row * 30 + col * 20) % 360
              return (
                <circle key={`h-${row}-${col}`} cx={x + 3.5} cy={y + 3.5} r={3 + ((row + col) % 3) * 0.5}
                  fill={`hsl(${hue}, 70%, 60%)`} opacity={0.5 + ((row + col) % 4) * 0.15} />
              )
            })
          )}
        </svg>
        {/* AI badge */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/20">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-semibold text-accent">AI Generated</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/20">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-[10px] font-semibold text-green-400">96/100</span>
          </div>
        </div>
      </motion.div>
      {/* Glow effects */}
      <div className="absolute -inset-8 rounded-3xl bg-accent/5 blur-3xl" />
      <motion.div
        className="absolute -inset-2 rounded-3xl"
        animate={{ boxShadow: ['0 0 40px rgba(224,120,86,0.1)', '0 0 80px rgba(224,120,86,0.2)', '0 0 40px rgba(224,120,86,0.1)'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">KUER Studio</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#use-cases" className="text-sm text-muted hover:text-foreground transition-colors">Use Cases</a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">How It Works</a>
            <a href="#styles" className="text-sm text-muted hover:text-foreground transition-colors">Styles</a>
            <a href="#validation" className="text-sm text-muted hover:text-foreground transition-colors">Validation</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link
              href="/create"
              className="px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-deep-blue/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted mb-6">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                AI-Powered QR Art Studio
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Turn any image into{' '}
                <span className="text-gradient-accent">scannable art.</span>
              </h1>
              <p className="text-lg text-muted max-w-xl mb-8 leading-relaxed">
                Upload your artwork, photo, or brand asset. Our AI transforms it into a
                bespoke QR code that looks like a custom design — and scans perfectly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition-all glow-accent hover:glow-accent-strong"
                >
                  Create Your First Branded QR
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass text-foreground font-medium hover:bg-white/5 transition-all"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroQrShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Plain QR to{' '}
              <span className="text-gradient-accent">AI Artwork</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Your QR code becomes part of the design — not a black box sitting on top of it.
              Every output is validated for 100% scanability.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="grid md:grid-cols-[1fr,auto,1fr] gap-8 items-center">
            {/* Before */}
            <div className="glass rounded-2xl p-8 text-center">
              <div className="text-xs uppercase tracking-wider text-muted mb-4 font-medium">Before</div>
              <div className="w-40 h-40 mx-auto bg-white rounded-lg p-3 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="5" y="5" width="25" height="25" fill="#000" />
                  <rect x="8" y="8" width="19" height="19" fill="#fff" />
                  <rect x="11" y="11" width="13" height="13" fill="#000" />
                  <rect x="70" y="5" width="25" height="25" fill="#000" />
                  <rect x="73" y="8" width="19" height="19" fill="#fff" />
                  <rect x="76" y="11" width="13" height="13" fill="#000" />
                  <rect x="5" y="70" width="25" height="25" fill="#000" />
                  <rect x="8" y="73" width="19" height="19" fill="#fff" />
                  <rect x="11" y="76" width="13" height="13" fill="#000" />
                  {Array.from({ length: 8 }, (_, r) =>
                    Array.from({ length: 8 }, (_, c) => {
                      const show = (r * 7 + c * 3) % 4 < 2
                      return show ? (
                        <rect key={`b-${r}-${c}`} x={35 + c * 5} y={35 + r * 5} width="4" height="4" fill="#000" />
                      ) : null
                    })
                  )}
                </svg>
              </div>
              <p className="text-muted text-sm">Standard QR — functional but forgettable</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center gap-2">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-8 h-8 text-accent" />
              </motion.div>
              <span className="text-xs text-accent font-medium">AI Transform</span>
            </div>

            {/* After */}
            <div className="glass rounded-2xl p-8 text-center glow-accent relative">
              <div className="text-xs uppercase tracking-wider text-accent mb-4 font-medium">After</div>
              <div className="w-40 h-40 mx-auto rounded-lg overflow-hidden mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#f5e6a3" />
                    </linearGradient>
                  </defs>
                  <rect x="5" y="5" width="25" height="25" rx="3" fill="url(#goldGrad)" />
                  <rect x="9" y="9" width="17" height="17" rx="2" fill="#1a1a2e" />
                  <rect x="12" y="12" width="11" height="11" rx="1" fill="url(#goldGrad)" />
                  <rect x="70" y="5" width="25" height="25" rx="3" fill="url(#goldGrad)" />
                  <rect x="74" y="9" width="17" height="17" rx="2" fill="#1a1a2e" />
                  <rect x="77" y="12" width="11" height="11" rx="1" fill="url(#goldGrad)" />
                  <rect x="5" y="70" width="25" height="25" rx="3" fill="url(#goldGrad)" />
                  <rect x="9" y="74" width="17" height="17" rx="2" fill="#1a1a2e" />
                  <rect x="12" y="77" width="11" height="11" rx="1" fill="url(#goldGrad)" />
                  {Array.from({ length: 8 }, (_, r) =>
                    Array.from({ length: 8 }, (_, c) => {
                      const show = (r * 7 + c * 3) % 4 < 2
                      return show ? (
                        <rect key={`a-${r}-${c}`} x={35 + c * 5} y={35 + r * 5} width="4" height="4" rx="1"
                          fill="url(#goldGrad)" opacity={0.6 + Math.random() * 0.4} />
                      ) : null
                    })
                  )}
                </svg>
              </div>
              <p className="text-foreground text-sm font-medium">Branded QR — scannable &amp; stunning</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 md:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-panel/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every{' '}
              <span className="text-gradient-accent">Industry</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Whether you&apos;re an agency delivering client assets or a restaurant designing menus —
              KUER Studio adapts to your brand.
            </p>
          </motion.div>
          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass rounded-xl p-6 hover:bg-white/[0.04] transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <uc.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Steps to a{' '}
              <span className="text-gradient-accent">Branded QR</span>
            </h2>
            <p className="text-muted text-lg">No design skills needed. No complex software.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Globe,
                title: 'Enter Your URL',
                desc: 'Paste any URL — website, social media, video, menu, or campaign link. Choose static or dynamic tracking.',
              },
              {
                step: '02',
                icon: Palette,
                title: 'Upload & Style',
                desc: 'Upload your image, artwork, or brand asset. Choose a style direction or write a custom prompt. Our AI does the rest.',
              },
              {
                step: '03',
                icon: Download,
                title: 'Validate & Export',
                desc: 'Get four AI-generated art variants. Each is scan-tested and scored. Export production-ready files in any format.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-colors">
                  <span className="text-5xl font-black text-accent/10 absolute top-6 right-6">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-6 h-6 text-muted/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Style Examples */}
      <section id="styles" className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-panel/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              12 AI Style{' '}
              <span className="text-gradient-accent">Directions</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              From luxury gold to cyberpunk neon — pick a direction for the AI,
              or describe your own custom style in natural language.
            </p>
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin">
            {styleExamples.map((style, i) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex-shrink-0 w-56 snap-center"
              >
                <div className="glass rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors group">
                  <div
                    className="h-32 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${style.colors[0]}, ${style.colors[1]}, ${style.colors[2]})`,
                    }}
                  >
                    <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full opacity-50 p-4">
                      <rect x="5" y="5" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      <rect x="8" y="8" width="12" height="12" rx="1" fill={style.colors[0]} />
                      <rect x="57" y="5" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      <rect x="60" y="8" width="12" height="12" rx="1" fill={style.colors[0]} />
                      <rect x="5" y="57" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      <rect x="8" y="60" width="12" height="12" rx="1" fill={style.colors[0]} />
                      {Array.from({ length: 5 }, (_, r) =>
                        Array.from({ length: 5 }, (_, c) => {
                          const show = (r + c) % 2 === 0
                          return show ? (
                            <rect key={`s-${r}-${c}`} x={28 + c * 6} y={28 + r * 6} width="4" height="4" rx="0.5"
                              fill="white" fillOpacity="0.5" />
                          ) : null
                        })
                      )}
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{style.name}</h3>
                    <p className="text-xs text-muted">{style.desc}</p>
                    <div className="flex gap-1.5 mt-3">
                      {style.colors.map((c, ci) => (
                        <div key={ci} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scanability Guarantee */}
      <section id="validation" className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-accent mb-6 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Scanability Guarantee
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Every QR Code is{' '}
                <span className="text-gradient-accent">Validated</span>
              </h2>
              <p className="text-muted text-lg mb-8 leading-relaxed">
                Beautiful design means nothing if the QR code doesn&apos;t scan.
                Every generated variant passes through our multi-step validation pipeline
                before it earns a &ldquo;Validated&rdquo; badge.
              </p>
              <div className="space-y-3">
                {validationChecks.map((check, i) => (
                  <motion.div
                    key={check}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{check}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Validation Report</h3>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                    Score: 96/100
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Contrast', status: 'pass' },
                    { label: 'Quiet Zone', status: 'pass' },
                    { label: 'Finder Patterns', status: 'pass' },
                    { label: 'Resolution', status: 'pass' },
                    { label: 'URL Match', status: 'pass' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-muted">{item.label}</span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pass
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted">Demo Validation — simulated pipeline</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 px-4">
        <motion.div
          {...fadeUp}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-deep-blue/5" />
            <div className="relative">
              <Zap className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Create Something{' '}
                <span className="text-gradient-accent">Stunning</span>?
              </h2>
              <p className="text-muted text-lg mb-8 max-w-lg mx-auto">
                Start generating branded, validated QR codes in minutes.
                No design skills required.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-accent text-white font-semibold text-lg hover:opacity-90 transition-all glow-accent hover:glow-accent-strong"
              >
                Create Your First Branded QR
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-accent flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold">KUER Studio</span>
            <span className="text-xs text-muted ml-2">by MNRV</span>
          </div>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} MNRV. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
