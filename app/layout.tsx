import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RewardLoop | Synthetic Rewards Portfolio',
  description:
    'AI-powered rewards intelligence and personalisation dashboard for RewardLoop teams, with a customer app simulator.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0f766e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
