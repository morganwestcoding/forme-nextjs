// GalleryModal.jsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import Modal from './Modal';
import ImageUpload from '../inputs/ImageUpload';
import useGalleryModal from '@/app/hooks/useGalleryModal'; // You might need to create or adjust this hook to manage the gallery modal's state

const GalleryModal = () => {
    const galleryModal = useGalleryModal();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            galleryImages: [],
        }
    });

    const handleUpload = async (images) => {
        // Logic to handle image upload
        // This could involve setting state, uploading to a server, etc.
        // Example: setValue('galleryImages', images);
    };

    const onSubmit = async data => {
        setIsLoading(true);
        try {
            // Assuming your API expects a multipart/form-data for image upload
            // You might need to adjust how you handle the upload based on your backend setup
            const formData = new FormData();
            data.galleryImages.forEach(image => {
                formData.append('galleryImages', image);
            });

            await axios.post('/api/profile/gallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Gallery updated!');
            galleryModal.onClose();
        } catch (error) {
            console.error('Error updating gallery:', error.response?.data);
            toast.error('Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    // Modal content
    const modalContent = (
        <div className="flex flex-col gap-4">
            <ImageUpload
                multiple
                onChange={handleUpload}
                register={register}
                errors={errors}
            />
            {/* You can add more fields or content here */}
        </div>
    );

    return (
        <Modal
            isOpen={galleryModal.isOpen}
            onClose={galleryModal.onClose}
            title="Update Your Gallery"
            actionLabel="Save"
            onSubmit={handleSubmit(onSubmit)}
            disabled={isLoading}
            body={modalContent} // Pass the modal content as a prop
        />
    );
};

export default GalleryModal;
