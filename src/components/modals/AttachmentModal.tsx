'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import Modal from './Modal';
import AddPostImage from '../inputs/AddPostImage';
import AddPostLocation from '../inputs/AddPostLocation';
import AddTagInput from '../inputs/AddTagInput';
import useAttachmentModal from '@/app/hooks/useAttachmentModal';
import { SafeUser } from '@/app/types'; // Ensure this import is correct according to your project structure


const AttachmentModal = () => {
    const attachmentModal = useAttachmentModal();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            imageSrc: '',
            location: '',
            
        }
    });

    const imageSrc = watch('imageSrc');
    const location = watch('location');
   

    const onSubmit: SubmitHandler<FieldValues> = data => {
        setIsLoading(true);
        axios.post('/api/post', {
            imageSrc: data.imageSrc,
            location: data.location,
        
            // Assume content or other fields if needed
        }).then(() => {
            toast.success('Attachments updated!');
            attachmentModal.onClose();
        }).catch(error => {
            console.error('Error updating attachments:', error.response?.data);
            toast.error('Something went wrong.');
        }).finally(() => setIsLoading(false));
    };

    const modalBody = (
        <div className="flex justify-center items-center space-x-4">
            <div className="flex flex-col items-center">
             <div className="mb-2 text-center font-medium text-white">Add Image</div>
            <AddPostImage
                onImageUpload={(value) => setValue('imageSrc', value)}
            />
            </div>
            <div className="flex flex-col items-center">
                <div className="mb-2 text-center font-medium text-white">Add Location</div>
            <AddPostLocation
                onLocationSubmit={(value) => setValue('location', value)}
            />
            </div>
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
