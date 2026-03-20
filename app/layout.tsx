import './globals.css'
import WalletProviders from '../components/WalletProviders'

export const metadata = { title: 'Modus Operandi' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  )
}
