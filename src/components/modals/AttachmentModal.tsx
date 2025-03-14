'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import Modal from './Modal';
import MediaUpload from '../inputs/MediaUpload';
import AddPostLocation from '../inputs/AddPostLocation';
import { MediaData } from '@/app/types';

interface AttachmentModalProps {
    setMediaData: (mediaData: MediaData | null) => void;
    setLocation: (location: { label: string; value: string } | null) => void; 
    isOpen: boolean;
    onClose: () => void;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({ 
    setMediaData, 
    setLocation, 
    isOpen, 
    onClose 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { handleSubmit, setValue, watch, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            mediaData: null,
            location: null,
        }
    });

    const mediaData = watch('mediaData');
    const location = watch('location');

    const onSubmit: SubmitHandler<FieldValues> = data => {
        setIsLoading(true);
        setMediaData(data.mediaData);
        setLocation(data.location);
        setIsLoading(false);
        onClose();
    };

    const modalBody = (
        <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
                <div className="mb-2 text-center font-medium ">Add Media</div>
                <div className="w-full" style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <MediaUpload
                        onMediaUpload={(data: MediaData) => setValue('mediaData', data)}
                    />
                </div>
            </div>
            <div className="flex flex-col w-1/2">
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
            isOpen={isOpen}
            onClose={onClose}
            title="Update Attachments"
            actionLabel="Save"
            onSubmit={handleSubmit(onSubmit)}
            body={modalBody}
        />
    );
};

export default AttachmentModal;