import { Suspense } from 'react'
import { OtpLoginForm } from '@/components/auth/OtpLoginForm'

export default function LoginPage() {
  return <Suspense fallback={null}><OtpLoginForm /></Suspense>
}
