import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NotificationsModal from '@/components/modals/NotificationModal';
import RegisterModal from '@/components/modals/RegisterModal';
import ToasterProvider from './providers/ToasterProvider';
import LoginModal from '@/components/modals/LoginModal';
import getCurrentUser from './actions/getCurrentUser';
import RentModal from '@/components/modals/ListingModal';
import ProfileModal from '@/components/modals/ProfileModal';
import ProfileGalleryModal from '@/components/modals/profileGalleryModal';
import ClientOnly from '@/components/ClientOnly';
import ClientProviders from '@/components/ClientProviders';
import MessageModal from '@/components/modals/MessageModal';
import ListingGalleryModal from '@/components/modals/listingGalleryModal';
import { CategoryProvider } from '@/CategoryContext';
import { FilterProvider } from '@/FilterContext';
import FilterModal from '@/components/modals/FilterModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import SubscribeModal from '@/components/modals/SubscribeModal';
import InboxModal from '@/components/modals/InboxModal';
import PostModal from '@/components/modals/PostModal';
import { ColorProvider } from './context/ColorContext';
import StripeCheckoutModal from '@/components/modals/StripeCheckoutModal';
import ShopModal from '@/components/modals/ShopModal';
import CreatePostModal from '@/components/modals/CreatePostModal';
import ReservationModal from '@/components/modals/ReservationModal';
import ReviewModal from '@/components/modals/ReviewModal';
import AuthModalController from '@/components/AuthModalController';
import ComingSoonGate from '@/ComingSoonGate';
import LayoutContent from '@/LayoutContent';
import Sidebar from '@/components/sidebar/Sidebar';

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
  console.log('Current User:', currentUser ? 'Logged in' : 'Not logged in');

  const isFirstTimeUser =
    currentUser &&
    new Date().getTime() - new Date(currentUser.createdAt).getTime() < 5 * 60 * 1000;

  return (
    <FilterProvider>
      <CategoryProvider>
        <ClientProviders>
          <html lang="en">
            <body className={inter.className}>
              <ComingSoonGate>
                <div className="min-h-screen flex">
                  <Sidebar currentUser={currentUser ?? null} />
                  <LayoutContent>
                    {children}
                  </LayoutContent>
                </div>

                {/* Modals */}
                <ShopModal/>
                <ToasterProvider/>
                <ReservationModal/>
                <ReviewModal/>
                <RentModal/>
                <CreatePostModal />
                <InboxModal/>
                <ProfileModal/>
                <StripeCheckoutModal />
                <ProfileGalleryModal/>
                <ListingGalleryModal/>
                <ForgotPasswordModal/>
                <ResetPasswordModal/>
                <MessageModal />
                <SubscribeModal/>
                <NotificationsModal />
                <PostModal/>
                <FilterModal/>
                <LoginModal />
                <RegisterModal />
              </ComingSoonGate>
            </body>
          </html>
        </ClientProviders>
      </CategoryProvider>
    </FilterProvider>
  )
}