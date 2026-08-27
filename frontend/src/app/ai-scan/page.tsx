import { redirect } from 'next/navigation'

export default function LegacyAiScanPage() {
  redirect('/student/explore?mode=scan')
}
