'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import Modal from './Modal';
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/Input';
import useProfileModal from '@/app/hooks/useProfileModal';
import ProfilePicUpload from '../inputs/ProfilePicUpload';

const ProfileModal = () => {
    const profileModal = useProfileModal();
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
      image: '',
      imageSrc: '',
      bio: '',
    }
  });


  const image = watch('image');
  const imageSrc = watch('imageSrc');

  const onSubmit: SubmitHandler<FieldValues> = data => {
    setIsLoading(true);
    axios.post('/api/profile', data)
      .then(() => {
        toast.success('Profile updated!');
        profileModal.onClose();
      })
      .catch(error => {
        console.error('Error updating profile:', error.response?.data);
        toast.error('Something went wrong.');
      })
      .finally(() => setIsLoading(false));
  };

  // Constructing the modal body
  const modalBody = (
    <div className="flex flex-col gap-4">
        
      <ProfilePicUpload
        onChange={(value) => setValue('image', value)}
        value={image}
      />
      <ProfilePicUpload
        onChange={(value) => setValue('imageSrc', value)}
        value={imageSrc}
      />
    <Input
          id="bio"
          label="bio"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
    </div>
  );

  return (
    <Modal
        disabled={isLoading}
        isOpen={profileModal.isOpen}
      onClose={profileModal.onClose}
      title="Update Your Profile"
      actionLabel="Save"
      onSubmit={handleSubmit(onSubmit)}
     
      body={modalBody}
    />
  );
};

export default ProfileModal;
