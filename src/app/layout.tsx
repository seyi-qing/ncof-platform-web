import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NCOF Platform — Association operations',
  description:
    'One platform for cooperative and association members, dues, meetings, elections and governance.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
