import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '安\u0026焕小屋',
  description: '属于安和焕的私密爱情纪念空间',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='zh-CN' className={`${geistSans.variable} h-full`}>
      <body className='min-h-full font-sans antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
