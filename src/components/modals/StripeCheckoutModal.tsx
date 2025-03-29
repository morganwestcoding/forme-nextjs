'use client';

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import useStripeCheckoutModal from "@/app/hooks/useStripeCheckoutModal";
import { useRouter } from "next/navigation";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const StripeCheckoutModal = () => {
  const stripeCheckoutModal = useStripeCheckoutModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { reservationData } = stripeCheckoutModal;

  const handleCheckout = async () => {
    if (!reservationData) return;

    try {
      setIsLoading(true);
      
      // Call your API to create a checkout session
      const response = await axios.post('/api/checkout', {
        ...reservationData
      });
      
      const { sessionId } = response.data;
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId
      });
      
      if (error) {
        toast.error(error.message || 'Something went wrong');
      }
      
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formattedDate = reservationData?.date 
    ? new Date(reservationData.date).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : '';

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formattedTime = reservationData?.time ? formatTime(reservationData.time) : '';

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Confirm Your Reservation"
        subtitle="Please review the details before proceeding to payment"
      />
      
      {reservationData && (
        <div className="space-y-6">
          <div className="p-5 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">{reservationData.businessName}</h3>
              <div className="h-px w-full bg-gray-200 my-2"></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{reservationData.serviceName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{reservationData.employeeName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formattedTime}</span>
              </div>
              
              <div className="h-px w-full bg-gray-200 my-2"></div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="font-semibold text-lg">${reservationData.totalPrice}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    You'll be redirected to Stripe's secure payment page. Your reservation will be confirmed once payment is complete.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              By clicking "Proceed to Payment", you agree to our Terms of Service and Cancellation Policy.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={stripeCheckoutModal.isOpen}
      title="Checkout"
      actionLabel="Proceed to Payment"
      onClose={stripeCheckoutModal.onClose}
      onSubmit={handleCheckout}
      body={bodyContent}
    />
  );
};

export default StripeCheckoutModal;