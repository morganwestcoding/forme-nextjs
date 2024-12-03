'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../inputs/Input";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";
import { useRouter } from "next/navigation";
import axios from "axios";

const SubscribeModal = () => {
  const subscribeModal = useSubscribeModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('credit');

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      // Add payment processing logic here
      await axios.post('/api/subscribe');
      toast.success('Successfully subscribed!');
      subscribeModal.onClose();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Upgrade to Plus"
        subtitle="Do more with unlimited blocks, files, automations & integrations."
      />
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-neutral-600">Account Name</label>
          <Input
            id="accountName"
            disabled={isLoading}
            required
            errors={{}}
            label="Account Name"
          />
        </div>

        <div>
          <label className="text-neutral-600">Payment Method</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div
              onClick={() => setSelectedPayment('credit')}
              className={`
                p-4 
                flex 
                flex-col 
                items-center 
                border 
                rounded-lg 
                cursor-pointer
                ${selectedPayment === 'credit' ? 'border-rose-500' : 'border-neutral-200'}
              `}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Credit Card</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPayment('bank')}
              className={`
                p-4 
                flex 
                flex-col 
                items-center 
                border 
                rounded-lg 
                cursor-pointer
                ${selectedPayment === 'bank' ? 'border-rose-500' : 'border-neutral-200'}
              `}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Bank Transfer</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPayment('points')}
              className={`
                p-4 
                flex 
                flex-col 
                items-center 
                border 
                rounded-lg 
                cursor-pointer
                ${selectedPayment === 'points' ? 'border-rose-500' : 'border-neutral-200'}
              `}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cosmic Points</span>
              </div>
            </div>
          </div>
        </div>

        {selectedPayment === 'credit' && (
          <div className="flex flex-col gap-4">
            <Input
              id="cardNumber"
              label="Card Number"
              disabled={isLoading}
              required
              errors={{}}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="expiry"
                label="Expiry Date"
                disabled={isLoading}
                required
                errors={{}}
              />
              <Input
                id="cvc"
                label="CVC"
                disabled={isLoading}
                required
                errors={{}}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div className="text-neutral-500 text-sm">
        By providing your card information, you allow us to charge your card for future payment in accordance with their terms.
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={subscribeModal.isOpen}
      title="Subscribe"
      actionLabel="Subscribe"
      onClose={subscribeModal.onClose}
      onSubmit={onSubmit}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default SubscribeModal;