import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { validateEnv } from './utils/env'

validateEnv();
import NotificationsModal from '@/components/modals/NotificationModal';
import ToasterProvider from './providers/ToasterProvider';
import LoginModal from '@/components/modals/LoginModal';
import getCurrentUser from './actions/getCurrentUser';
import ClientProviders from '@/components/ClientProviders';
import MessageModal from '@/components/modals/MessageModal';
import { CategoryProvider } from '@/CategoryContext';
import { FilterProvider } from '@/FilterContext';
import FilterModal from '@/components/modals/FilterModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import InboxModal from '@/components/modals/InboxModal';
import { ThemeProvider } from './context/ThemeContext';
import StripeCheckoutModal from '@/components/modals/StripeCheckoutModal';
import ReviewModal from '@/components/modals/ReviewModal';
import ComingSoonGate from '@/ComingSoonGate';
import LayoutContent from '@/LayoutContent';
import UserMenuModal from '@/components/modals/UserMenuModal';
import CreateModal from '@/components/modals/CreateModal';
import LocationModal from '@/components/modals/LocationModal';
import WelcomeModal from '@/components/modals/WelcomeModal';
import WalkthroughOverlay from '@/components/walkthrough/WalkthroughOverlay';
import UpgradeModal from '@/components/modals/UpgradeModal';
import UnreadBadgeProvider from '@/components/UnreadBadgeProvider';

export const metadata: Metadata = {
  title: {
    default: 'ForMe — Your Complete Business Ecosystem',
    template: '%s | ForMe',
  },
  description: 'Book services, manage your business, and grow your professional presence — all in one platform.',
  openGraph: {
    type: 'website',
    siteName: 'ForMe',
    title: 'ForMe — Your Complete Business Ecosystem',
    description: 'Book services, manage your business, and grow your professional presence — all in one platform.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://forme.app'),
}

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children, 
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser();

  const isFirstTimeUser =
    currentUser &&
    new Date().getTime() - new Date(currentUser.createdAt).getTime() < 5 * 60 * 1000;

  return (
    <FilterProvider>
      <CategoryProvider>
        <ClientProviders>
          <ThemeProvider>
            <html lang="en">
              <body className={inter.className}>
              <ComingSoonGate>
                <div className="min-h-screen">
                  <LayoutContent>
                    {children}
                  </LayoutContent>
                </div>

                {/* Modals */}
                <ToasterProvider/>
                <ReviewModal/>
                <InboxModal/>
                <StripeCheckoutModal />
                <ForgotPasswordModal/>
                <ResetPasswordModal/>
                <MessageModal />
                <NotificationsModal />
                <FilterModal/>
                <LoginModal />
                <UserMenuModal currentUser={currentUser} />
                <CreateModal />
                <LocationModal />
                <WelcomeModal />
                <UpgradeModal />
                <WalkthroughOverlay />
                <UnreadBadgeProvider />
              </ComingSoonGate>
              </body>
            </html>
          </ThemeProvider>
        </ClientProviders>
      </CategoryProvider>
    </FilterProvider>
  )
}