'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import Modal from './Modal';
import AddPostImage from '../inputs/AddPostImage';
import AddPostLocation from '../inputs/AddPostLocation';
import AddTagInput from '../inputs/AddTagInput';
import useAttachmentModal from '@/app/hooks/useAttachmentModal';// Assuming you have a similar hook for this modal

const AttachmentModal = () => {
    const attachmentModal = useAttachmentModal();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            image: '',
            location: '',
            tag: '',
        }
    });

    const image = watch('image');
    const location = watch('location');
    const tag = watch('tag');

    const onSubmit: SubmitHandler<FieldValues> = data => {
        setIsLoading(true);
        axios.post('/api/attachment', data)
            .then(() => {
                toast.success('Attachments updated!');
                attachmentModal.onClose();
            })
            .catch(error => {
                console.error('Error updating attachments:', error.response?.data);
                toast.error('Something went wrong.');
            })
            .finally(() => setIsLoading(false));
    };

    const modalBody = (
        <div className="flex flex-col gap-4">
            <AddPostImage
                currentUser={null} // Pass the correct user context or null
                onImageUpload={(value) => setValue('image', value)}
            />
            <AddPostLocation
                currentUser={null} // Pass the correct user context or null
                onLocationSubmit={(value) => setValue('location', value)}
            />
            <AddTagInput
                currentUser={null} // Pass the correct user context or null
                onTagSubmit={(value) => setValue('tag', value)}
            />
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={attachmentModal.isOpen}
            onClose={attachmentModal.onClose}
            title="Update Attachments"
            actionLabel="Save"
            onSubmit={handleSubmit(onSubmit)}
            body={modalBody}
        />
    );
};

export default AttachmentModal;