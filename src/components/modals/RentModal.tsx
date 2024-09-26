'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback} from "react";

import useRentModal from '@/app/hooks/useRentModal';

import Modal from "./Modal";
import CategoryInput from '../inputs/CategoryInput';
import { categories } from '../Categories';
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/Input';
import Heading from '../Heading';
import ServiceSelector, { Service } from '../inputs/ServiceSelector';
import ListLocationSelect from '../inputs/ListLocationSelect';

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [services, setServices] = useState([
    { serviceName: '', price: 0, category: '' },
    { serviceName: '', price: 0, category: '' },
    { serviceName: '', price: 0, category: '' },
  ]);

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
      services: Array(3).fill({ serviceName: "", price: 0, category: "" }),
      category: '',
      location: null,
      imageSrc: '',
      title: '',
      description: '',
      phoneNumber: '',
      website: '',
      // Address and zipCode are now handled in ListLocationSelect
    }
  });

  const category = watch('category');
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

  const handleServicesChange = useCallback((newServices: Service[]) => {
    setServices(newServices);
  }, []);

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
  } | null) => {
    if (locationData) {
      setValue('location', `${locationData.city}, ${locationData.state}`);
      setValue('address', locationData.address);
      setValue('zipCode', locationData.zipCode);
    } else {
      setValue('location', null);
      setValue('address', '');
      setValue('zipCode', '');
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.DESCRIPTION) {
      return onNext();
    }
    
    setIsLoading(true);

    const payload = { ...data, services };

    console.log('Submitting data:', data, services);
    axios.post('/api/listings', payload)
    .then(() => {
      toast.success('Listing created!');
      router.refresh();
      reset();
      setStep(STEPS.CATEGORY)
      rentModal.onClose();
    })
    .catch((error) => {
      console.error('Error submitting listing:', error.response.data);
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
    })
  }

  const actionLabel = useMemo(() => {
    if (step === STEPS.DESCRIPTION) {
      return 'Create'
    }

    return 'Next'
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined
    }

    return 'Back'
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Define your establishment"
        subtitle="Pick a category"
      />
      <div 
        className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
      >
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => 
                setCustomValue('category', category)}
              selected={category === item.label}
              label={item.label}
              color={item.color}
            />
          </div>
        ))}
      </div>
    </div>
  )

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <ListLocationSelect
          onLocationSubmit={handleLocationSubmit}
          register={register}
          errors={errors}
        />   
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Share some basics about your place"
          subtitle="What amenities do you have?"
        />
        <ServiceSelector onServicesChange={handleServicesChange} existingServices={services} />
      </div>
    )
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add a photo of your place"
          subtitle="Show guests what your place looks like!"
        />
        <ImageUpload
          onChange={(value) => setCustomValue('imageSrc', value)}
          value={imageSrc}
        />
      </div>
    )
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-3">
        <Heading
          title="How would you describe your place?"
          subtitle="Short and sweet works best!"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      <div className="relative">
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          maxLength={300}
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-neutral-800 px-1 rounded">
          {watch('description')?.length || 0}/300
        </div>
      </div>
        <Input
          id="phoneNumber"
          label="Phone Number"
          disabled={isLoading}
          register={register}
          errors={errors}
        />
        <Input
          id="website"
          label="Website"
          disabled={isLoading}
          register={register}
          errors={errors}
        />

      </div>
    )
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={rentModal.isOpen}
      title="Join the fun!"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModal.onClose}
      body={bodyContent}
    />
  );
}

export default RentModal;