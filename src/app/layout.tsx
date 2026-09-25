import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NCOF Platform',
  description: 'Nigerian Committee of Friends association platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
