'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from "react";

import useProfileGalleryModal from '@/app/hooks/useProfileGalleryModal';

import Modal from "./Modal";
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/Input';
import Heading from '../Heading';

enum STEPS {
  IMAGE = 0,
  CAPTION = 1,
}

const ProfileGalleryModal = () => {
  const router = useRouter();
  const profileGalleryModal = useProfileGalleryModal();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.IMAGE);

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
      imageSrc: '',
      caption: '',
    }
  });

  const imageSrc = watch('imageSrc');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
  }

  const onBack = () => {
    setStep((value) => value - 1);
  }

  const onNext = () => {
    setStep((value) => value + 1);
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.CAPTION) {
      return onNext();
    }
    
    setIsLoading(true);
    
    axios.post('/api/profile', {
      action: 'addGalleryImage',
      galleryImage: data.imageSrc,
      caption: data.caption
    })
    .then(() => {
      toast.success('Image added successfully!');
      router.refresh();
      reset();
      setStep(STEPS.IMAGE)
      profileGalleryModal.onClose();
    })
    .catch(() => {
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
    })

   
  }

  const actionLabel = useMemo(() => {
    if (step === STEPS.CAPTION) {
      return 'Add'
    }

    return 'Next'
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.IMAGE) {
      return undefined
    }

    return 'Back'
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Add a new image to your gallery"
        subtitle="Show off your best moments!"
      />
      <ImageUpload
        onChange={(value) => setCustomValue('imageSrc', value)}
        value={imageSrc}
      />
    </div>
  )

  if (step === STEPS.CAPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add a caption to your image"
          subtitle="Describe your image in a few words"
        />
        <Input
          id="caption"
          label="Caption"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    )
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={profileGalleryModal.isOpen}
      title="Add to Gallery"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.IMAGE ? undefined : onBack}
      onClose={profileGalleryModal.onClose}
      body={bodyContent}
    />
  );
}

export default ProfileGalleryModal;