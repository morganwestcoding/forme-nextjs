'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
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

const initialServices: Service[] = [
  { serviceName: '', price: 0, category: '' },
  { serviceName: '', price: 0, category: '' },
  { serviceName: '', price: 0, category: '' },
];

const initialEmployees: string[] = ['', '', ''];

const initialStoreHours: StoreHourType[] = [
  { dayOfWeek: 'Monday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Tuesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Wednesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Thursday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Friday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Saturday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Sunday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
];

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const listing = rentModal.listing;
  const isEditMode = !!listing;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);

  // For remounting child inputs with internal state (selects, etc.)
  const [resetKey, setResetKey] = useState(0);

  const [services, setServices] = useState<Service[]>(listing?.services || initialServices);
  const [employees, setEmployees] = useState<string[]>(
    (listing?.employees || []).map((emp: any) => emp.fullName) || initialEmployees
  );
  const [storeHours, setStoreHours] = useState<StoreHourType[]>(listing?.storeHours || initialStoreHours);

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      category: listing?.category || '',
      location: listing?.location || null,
      address: listing?.address || '',
      zipCode: listing?.zipCode || '',
      imageSrc: listing?.imageSrc || '',
      title: listing?.title || '',
      description: listing?.description || '',
      phoneNumber: (listing as any)?.phoneNumber || '',
      website: listing?.website || '',
      galleryImages: listing?.galleryImages || [],
      // Hidden fields we validate through ListLocationSelect
      state: '',
      city: '',
    }
  });

  // Reset step each time modal opens (and blank everything when creating)
  useEffect(() => {
    if (!rentModal.isOpen) return;
    setStep(STEPS.CATEGORY);

    if (!isEditMode) {
      reset({
        category: '',
        location: null,
        address: '',
        zipCode: '',
        imageSrc: '',
        title: '',
        description: '',
        phoneNumber: '',
        website: '',
        galleryImages: [],
        state: '',
        city: '',
      });
      setServices(initialServices);
      setEmployees(initialEmployees);
      setStoreHours(initialStoreHours);
      setResetKey((k) => k + 1); // remount children (AddressAutocomplete, selects, etc.)
    }
  }, [rentModal.isOpen, isEditMode, reset]);

  // ---- helpers to clear per-step data
  const clearLocation = () => {
    setValue('location', null, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('address', '',   { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('zipCode', '',   { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('state',  '',    { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('city',   '',    { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setResetKey((k) => k + 1); // remount selects/autocomplete so UI really blanks
  };

  const clearInfo = () => setServices(initialServices);

  const clearImages = () => {
    setValue('imageSrc', '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('galleryImages', [], { shouldDirty: true, shouldValidate: true, shouldTouch: true });
  };

  const clearDescription = () => {
    setValue('title', '',        { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('description', '',  { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('phoneNumber', '',  { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('website', '',      { shouldDirty: true, shouldValidate: true, shouldTouch: true });
  };

  const clearHours = () => setStoreHours(initialStoreHours);
  const clearEmployees = () => setEmployees(initialEmployees);

  const handleClose = useCallback(() => {
    // full reset
    reset({
      category: '',
      location: null,
      address: '',
      zipCode: '',
      imageSrc: '',
      title: '',
      description: '',
      phoneNumber: '',
      website: '',
      galleryImages: [],
      state: '',
      city: '',
    });
    setServices(initialServices);
    setEmployees(initialEmployees);
    setStoreHours(initialStoreHours);
    setStep(STEPS.CATEGORY);
    setResetKey((k) => k + 1); // remount children w/ internal state
    rentModal.onClose();
  }, [reset, rentModal]);

  // Pre-fill when editing
  useEffect(() => {
    if (!listing) return;
    reset({
      category: listing.category || '',
      location: listing.location || null,
      address: listing.address || '',
      zipCode: listing.zipCode || '',
      imageSrc: listing.imageSrc || '',
      title: listing.title || '',
      description: listing.description || '',
      phoneNumber: (listing as any).phoneNumber || '',
      website: listing.website || '',
      galleryImages: listing.galleryImages || [],
      state: listing.state || '',
      city: listing.city || '',
    });
    setServices(listing.services || initialServices);
    setEmployees((listing.employees || []).map((emp: any) => emp.fullName));
    setStoreHours(listing.storeHours || initialStoreHours);
    setResetKey((k) => k + 1);
  }, [listing, reset]);

  const category = watch('category');
  const imageSrc = watch('imageSrc');
  const address = watch('address');
  const zipCode = watch('zipCode');

  // watch hidden fields (from ListLocationSelect hidden inputs)
  const stateVal = watch('state');
  const cityVal  = watch('city');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  /**
   * onBack: clear the step you're returning to
   */
  const onBack = () => {
    if (step === STEPS.CATEGORY) return;

    const goingTo = (step - 1) as STEPS;

    switch (goingTo) {
      case STEPS.LOCATION:
        clearLocation();
        break;
      case STEPS.INFO:
        clearInfo();
        break;
      case STEPS.IMAGES:
        clearImages();
        break;
      case STEPS.DESCRIPTION:
        clearDescription();
        break;
      case STEPS.HOURS:
        clearHours();
        break;
      case STEPS.EMPLOYEE:
        clearEmployees();
        break;
    }

    setStep(goingTo);
  };

  /**
   * onNext: validate LOCATION fully (state, city, address, zip)
   * and set RHF errors so selects/inputs turn red.
   */
  const onNext = () => {
    if (step === STEPS.CATEGORY && !category) {
      return toast.error('Please select a category.');
    }

    if (step === STEPS.LOCATION) {
      let invalid = false;

      if (!stateVal) {
        setError('state', { type: 'required', message: 'State is required' });
        invalid = true;
      } else {
        clearErrors('state');
      }

      if (!cityVal) {
        setError('city', { type: 'required', message: 'City is required' });
        invalid = true;
      } else {
        clearErrors('city');
      }

      if (!address) {
        setError('address', { type: 'required', message: 'Address is required' });
        invalid = true;
      } else {
        clearErrors('address');
      }

      if (!zipCode) {
        setError('zipCode', { type: 'required', message: 'ZIP is required' });
        invalid = true;
      } else {
        clearErrors('zipCode');
      }

      if (invalid) {
        return toast.error('Please fill in all location fields.');
      }
    }

    setStep((value) => value + 1);
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
      handleClose();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalWidthClasses = useMemo(() => 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5', [step]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.EMPLOYEE) {
      return isEditMode ? 'Update' : 'Create';
    }
    return 'Next';
  }, [step, isEditMode]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) return undefined;
    return 'Back';
  }, [step]);

  // ----- BODY
  let bodyContent = (
    <div className="flex flex-col gap-3">
      <Heading
        title={isEditMode ? "Edit your establishment" : "Define your establishment"}
        subtitle="Pick a category"
      />
      <div className="grid grid-cols-4 gap-3">
        {categories.slice(0, 4).map((item) => (
          <CategoryInput
            key={item.label}
            onClick={(category) => setCustomValue('category', category)}
            selected={category === item.label}
            label={item.label}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {categories.slice(4).map((item) => (
          <CategoryInput
            key={item.label}
            onClick={(category) => setCustomValue('category', category)}
            selected={category === item.label}
            label={item.label}
          />
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Where is your place located?" subtitle="Help guests find you!" />
        <ListLocationSelect
          key={`loc-${resetKey}`}          // remount to clear selects/labels
          id="location"
          onLocationSubmit={(locationData) => {
            if (locationData) {
              setValue('location', `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
              setValue('address', locationData.address, { shouldValidate: true });
              setValue('zipCode', locationData.zipCode, { shouldValidate: true });
              setValue('state', locationData.state, { shouldValidate: true });
              setValue('city', locationData.city, { shouldValidate: true });
            }
          }}
          register={register}
          errors={errors}
        />   
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Share some basics about your place" subtitle="What amenities do you have?" />
        <ServiceSelector 
          key={`svc-${resetKey}`}          // remount if we cleared Info
          id="service-selector"
          onServicesChange={setServices} 
          existingServices={services}
        />
        <div />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={isEditMode ? "Update your photos" : "Add photos of your place"}
          subtitle="Show guests what your place looks like!"
        />
        <ImageUploadGrid
          key={`img-${resetKey}`}          // remount when images cleared
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
      <div className="flex flex-col gap-3">
        <Heading title="How would you describe your place?" subtitle="Short and sweet works best!" />
        <Input id="title" label="Title" disabled={isLoading} register={register} errors={errors} required />
        <Input id="description" label="Description" disabled={isLoading} register={register} errors={errors} required />
      </div>
    );
  }

  if (step === STEPS.HOURS) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Share your store hours" subtitle="What hours each day is your store open?" />
        <StoreHours key={`hrs-${resetKey}`} onChange={(hours) => setStoreHours(hours)} />
      </div>
    );
  }

  if (step === STEPS.EMPLOYEE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title={isEditMode ? "Update your employees" : "Add your employees"} subtitle="Let us know who is available for work!" />
        <EmployeeSelector
          key={`emp-${resetKey}`}          // remount when we clear employees
          onEmployeesChange={setEmployees}
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
      onClose={handleClose}
      body={bodyContent}
      className={modalWidthClasses}
    />
  );
}

export default RentModal;
