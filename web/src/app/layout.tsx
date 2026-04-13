import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
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
import UnreadBadgeProvider from '@/components/UnreadBadgeProvider';

export const metadata: Metadata = {
  title: 'ForMe App',
  description: 'Your complete business ecosystem',
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