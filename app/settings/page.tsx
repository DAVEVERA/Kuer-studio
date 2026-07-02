'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, CreditCard, AlertTriangle } from 'lucide-react'
import { AppShell } from '@/components/AppShell'

export default function SettingsPage() {
  const [name, setName] = useState('Dave Vera')
  const [email, setEmail] = useState('dave@mnrv.studio')
  const [notifications, setNotifications] = useState({
    scanAlerts: true,
    weeklyReport: true,
    productUpdates: false,
    exportComplete: true,
  })

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted text-sm mt-1">Manage your account and preferences</p>
        </div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-xs text-muted">Your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-sm focus:outline-none focus:border-accent/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-sm focus:outline-none focus:border-accent/30"
              />
            </div>
            <button className="px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Notifications</h2>
              <p className="text-xs text-muted">Choose what you get notified about</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'scanAlerts' as const, label: 'Scan Alerts', desc: 'Get notified when your QR codes are scanned' },
              { key: 'weeklyReport' as const, label: 'Weekly Report', desc: 'Receive a weekly analytics summary' },
              { key: 'productUpdates' as const, label: 'Product Updates', desc: 'New features and improvements' },
              { key: 'exportComplete' as const, label: 'Export Complete', desc: 'Notification when exports finish processing' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between py-2 cursor-pointer group">
                <div>
                  <span className="text-sm font-medium group-hover:text-accent transition-colors">{label}</span>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-accent' : 'bg-panel'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Billing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Billing</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">Coming Soon</span>
              </div>
              <p className="text-xs text-muted">Manage your subscription and billing</p>
            </div>
          </div>
          <div className="glass rounded-lg p-4 text-sm text-muted">
            <p>You&apos;re currently on the <span className="text-foreground font-medium">Free Plan</span>.</p>
            <p className="mt-1">Billing and subscription management will be available in a future update.</p>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="glass rounded-xl p-6 border border-red-500/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-red-400">Danger Zone</h2>
              <p className="text-xs text-muted">Irreversible actions</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Delete Account</p>
              <p className="text-xs text-muted">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
