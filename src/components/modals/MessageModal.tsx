// MessageModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import useMessageModal from '@/app/hooks/useMessageModal';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Heading from '../Heading';
import Input from '../inputs/Input';

const MessageModal: React.FC = () => {
  const router = useRouter();
  const messageModal = useMessageModal();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    'Hi there!',
    'How are you?',
    'Let\'s meet up tomorrow.'
  ]); // Placeholder messages

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      recipient: '',
    }
  });

  const recipient = watch('recipient');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // Here you can handle form submission, e.g., sending messages
    console.log('Submitting data:', data);

    // Mocking a successful submission
    setTimeout(() => {
      setIsLoading(false);
      messageModal.onClose();
      reset();
    }, 2000);
  }

  const actionLabel = 'Send';

  const modalBody = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Send a Message"
        subtitle="Compose your message"
      />
      <Input
        id="recipient"
        label="Recipient"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <div className="flex flex-col flex-grow p-4 overflow-y-auto bg-gray-800">
        <div className="mb-2 font-medium text-white">Current Messages:</div>
        <div className="flex flex-col space-y-2">
          {messages.map((message, index) => (
            <div key={index} className="p-2 bg-gray-700 rounded-md text-white">
              {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={messageModal.isOpen}
      title="Messenger"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      onClose={messageModal.onClose}
      body={modalBody}
    />
  );
};

export default MessageModal;
