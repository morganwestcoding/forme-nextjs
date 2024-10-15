'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import Modal from './Modal';
import AddPostImage from '../inputs/AddPostImage';
import AddPostLocation from '../inputs/AddPostLocation';

interface AttachmentModalProps {
    setImageSrc: (imageSrc: string) => void;
    setLocation: (location: { label: string; value: string } | null) => void; 
    isOpen: boolean; // Indicates whether the modal is open
    onClose: () => void; // Function to close the modal
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({ setImageSrc, setLocation, isOpen, onClose }) => {
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
        setImageSrc(data.imageSrc);
        setLocation(data.location);
        setIsLoading(false);
        onClose(); // Close the modal after submitting
    };

    const modalBody = (
        <div className="flex">
            <div className="flex flex-col w-1/2">
                <div className="mb-2 text-center font-medium text-white">Add Image</div>
                <AddPostImage
                    onImageUpload={(value) => setValue('imageSrc', value)}
                />
            </div>
            <div className="flex flex-col w-1/2 ml-4">
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
            isOpen={isOpen} // Pass the isOpen prop to control modal visibility
            onClose={onClose} // Pass the onClose prop to handle modal close
            title="Update Attachments"
            actionLabel="Save"
            onSubmit={handleSubmit(onSubmit)}
            body={modalBody}
        />
    );
};

export default AttachmentModal;
