'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback, useEffect } from "react";

import useRentModal from '@/app/hooks/useRentModal';
import Modal from "./Modal";
import CategoryInput from '../inputs/CategoryInput';
import { categories } from '../Categories';
import Input from '../inputs/Input';
import Heading from '../Heading';
import ServiceSelector, { Service } from '../inputs/ServiceSelector';
import ListLocationSelect from '../inputs/ListLocationSelect';
import EmployeeSelector from '../inputs/EmployeeSelector';
import StoreHours, { StoreHourType }  from '../inputs/StoreHours';
import ImageUploadGrid from '../inputs/ImageUploadGrid';

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  HOURS = 5,
  EMPLOYEE = 6,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const listing = rentModal.listing;
  const isEditMode = !!listing;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);

  const [services, setServices] = useState<Service[]>(
    listing?.services || [
      { serviceName: '', price: 0, category: '' },
      { serviceName: '', price: 0, category: '' },
      { serviceName: '', price: 0, category: '' },
    ]
  );

  const [employees, setEmployees] = useState<string[]>(
    listing?.employees.map(emp => emp.fullName) || ['', '', '']
  );

  const [storeHours, setStoreHours] = useState<StoreHourType[]>(
    listing?.storeHours || [
      { dayOfWeek: 'Monday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Tuesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Wednesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Thursday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Friday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Saturday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
      { dayOfWeek: 'Sunday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
    ]
  );

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
      category: listing?.category || '',
      location: listing?.location || null,
      address: listing?.address || '',
      zipCode: listing?.zipCode || '',
      imageSrc: listing?.imageSrc || '',
      title: listing?.title || '',
      description: listing?.description || '',
      phoneNumber: listing?.phoneNumber || '',
      website: listing?.website || '',
      galleryImages: listing?.galleryImages || [],
    }
  });

  useEffect(() => {
    if (listing) {
      Object.entries(listing).forEach(([key, value]) => {
        setValue(key, value);
      });
      setServices(listing.services);
      setEmployees(listing.employees.map(emp => emp.fullName));
      setStoreHours(listing.storeHours || []);
    }
  }, [listing, setValue]);

  const category = watch('category');
  const imageSrc = watch('imageSrc');
  const location = watch('location');
  const address = watch('address');
  const zipCode = watch('zipCode');

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
    if (step === STEPS.CATEGORY && !category) {
      return toast.error('Please select a category.');
    }
    if (step === STEPS.LOCATION && (!address || !zipCode)) {
      return toast.error('Please fill in all location fields.');
    }
    setStep((value) => value + 1);
  }

  const handleServicesChange = useCallback((newServices: Service[]) => {
    setServices(newServices);
  }, []);

  const handleEmployeesChange = useCallback((newEmployees: string[]) => {
    setEmployees(newEmployees);
  }, []);

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
  } | null) => {
    if (locationData) {
      setValue('location', `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
      setValue('address', locationData.address, { shouldValidate: true });
      setValue('zipCode', locationData.zipCode, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.EMPLOYEE) {
      return onNext();
    }
    
    setIsLoading(true);
    const payload = { 
      ...data, 
      services,
      employees,
      storeHours,
    };

    try {
      if (isEditMode && listing) {
        await axios.put(`/api/listings/${listing.id}`, payload);
        toast.success('Listing updated successfully!');
      } else {
        await axios.post('/api/listings', payload);
        toast.success('Listing created successfully!');
      }
      
      router.refresh();
      reset();
      setStep(STEPS.CATEGORY);
      rentModal.onClose();
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalWidthClasses = useMemo(() => {
    if (step === STEPS.HOURS) {
      return 'w-full md:w-[950px]'
    }
    return 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5'
  }, [step]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.EMPLOYEE) {
      return isEditMode ? 'Update' : 'Create'
    }
    return 'Next'
  }, [step, isEditMode]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined
    }
    return 'Back'
  }, [step]);

  let bodyContent = (
    <div id="category-section" className="flex flex-col gap-8">
      <Heading
        title={isEditMode ? "Edit your establishment" : "Define your establishment"}
        subtitle="Pick a category"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue('category', category)}
              selected={category === item.label}
              label={item.label}
              color={item.color}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div id="location-section" className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <ListLocationSelect
          id="location"
          onLocationSubmit={handleLocationSubmit}
          register={register}
          errors={errors}
        />   
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div id="services-section" className="flex flex-col gap-8">
        <Heading
          title="Share some basics about your place"
          subtitle="What amenities do you have?"
        />
        <ServiceSelector 
          id="service-selector"
          onServicesChange={handleServicesChange} 
          existingServices={services}
        />
        <div id="add-service-button"></div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div id="images-section" className="flex flex-col gap-8">
        <Heading
          title={isEditMode ? "Update your photos" : "Add photos of your place"}
          subtitle="Show guests what your place looks like!"
        />
        <ImageUploadGrid
          id="image-upload"
          onChange={(value) => setCustomValue('imageSrc', value)}
          onGalleryChange={(values) => setCustomValue('galleryImages', values)}
          value={imageSrc}
          galleryImages={watch('galleryImages') || []}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div id="description-section" className="flex flex-col gap-3">
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
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input
          id="phone"
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
    );
  }

  if (step === STEPS.HOURS) {
    bodyContent = (
      <div id="hours-section" className="flex flex-col gap-8">
        <Heading
          title="Share your store hours"
          subtitle="What hours each day is your store open?"
        />
        <StoreHours 
          id="store-hours"
          onChange={(hours) => setStoreHours(hours)}
        />
      </div>
    );
  }

  if (step === STEPS.EMPLOYEE) {
    bodyContent = (
      <div id="employees-section" className="flex flex-col gap-8">
        <Heading
          title={isEditMode ? "Update your employees" : "Add your employees"}
          subtitle="Let us know who is available for work!"
        />
        <EmployeeSelector 
          id="employee-selector"
          onEmployeesChange={handleEmployeesChange} 
          existingEmployees={employees}
        />
      </div>
    );
  }

  return (
    <Modal
    id="rent-modal"
    modalContentId="modal-content-with-actions"
      disabled={isLoading}
      isOpen={rentModal.isOpen}
      title={isEditMode ? "Edit your listing" : "Join the fun!"}
      actionLabel={actionLabel}
      actionId="submit-button"
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModal.onClose}
      body={bodyContent}
      className={modalWidthClasses}
    />
  );
}

export default RentModal;