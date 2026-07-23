export interface NavItem {
  label: string
  href: string
  icon: string
}

export const sidebarNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Create QR', href: '/create', icon: 'Plus' },
  { label: 'Projects', href: '/projects', icon: 'FolderOpen' },
  { label: 'Brand Kits', href: '/brand-kits', icon: 'Palette' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Exports', href: '/exports', icon: 'Download' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'My Account', href: '/account', icon: 'UserRound' },
]
