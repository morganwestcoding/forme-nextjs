'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import Modal from './Modal';
import ImageUpload from '../inputs/ImageUpload';
import useGalleryModal from '@/app/hooks/useGalleryModal';


const GalleryModal = () => {
    const GalleryModal = useGalleryModal();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { 
        errors
     } 
    }
      = useForm<FieldValues>({
    defaultValues: {
    galleryImages: [],
    }
  });


  const galleryImage = watch('galleryImages');
  

  const onSubmit: SubmitHandler<FieldValues> = data => {
    setIsLoading(true);
    axios.post('/api/profile/', data)
      .then(() => {
        toast.success('Gallery updated!');
        GalleryModal.onClose();
      })
      .catch(error => {
        console.error('Error updating Gallery:', error.response?.data);
        toast.error('Something went wrong.');
      })
      .finally(() => setIsLoading(false));
  };

  // Constructing the modal body
  const modalBody = (
    <div className="flex flex-col gap-4">
        
      <ImageUpload
        onChange={(value) => setValue('galleryImages', value)}
        value={galleryImage}
      />
  
    </div>
  );

  return (
    <Modal
        disabled={isLoading}
        isOpen={GalleryModal.isOpen}
      onClose={GalleryModal.onClose}
      title="Update Your Gallery"
      actionLabel="Save"
      onSubmit={handleSubmit(onSubmit)}
     
      body={modalBody}
    />
  );
};

export default GalleryModal;
