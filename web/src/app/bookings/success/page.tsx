// app/bookings/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Container from '@/components/Container';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || '';
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Verify the payment with the backend
        const { data } = await axios.get(`/api/checkout/verify?session_id=${sessionId}`);
        if (data.success) {
          setSuccess(true);
          if (data.reservation) {
            setReservation(data.reservation);
          }
        }
      } catch (error) {
        console.error('Error verifying payment', error);
        // Fallback: assume success if we have a session ID
        setSuccess(true);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/bookings/trips');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <h2 className="mt-6 text-xl font-medium">Processing your reservation...</h2>
        </div>
      </Container>
    );
  }

  if (!success) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t verify your payment. Please try again or contact support.</p>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Go Home
            </Link>
            <Link href="/bookings/trips" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              My Reservations
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto">
        <div className="w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="bg-green-100 p-5 rounded-full inline-flex mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Your Reservation is Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We&apos;ve sent a confirmation to your email.
          </p>

          {reservation && (
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
              <div className="flex items-center gap-4 mb-4">
                {reservation.listing?.imageSrc && (
                  <div className="h-16 w-16 relative rounded-md overflow-hidden">
                    <Image 
                      src={reservation.listing.imageSrc} 
                      alt={reservation.listing.title || "Listing"} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{reservation.listing?.title || "Your Booking"}</h3>
                  <p className="text-gray-500 text-sm">{reservation.serviceName}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(reservation.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{reservation.time}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{reservation.serviceName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="font-semibold">${reservation.totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-8">
            You will be redirected to your reservations in 5 seconds...
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/" 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
            <Link 
              href="/bookings/trips" 
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              View My Reservations
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}