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
import EditOverview from './EditOverview';

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  SERVICES_LIST = 2,
  SERVICES_FORM = 3,
  IMAGES = 4,
  DESCRIPTION = 5,
  HOURS = 6,
  EMPLOYEE = 7,
}

const EDIT_HUB_STEP = -1;
const MAX_SERVICES = 6;

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
  const [step, setStep] = useState<number>(isEditMode ? EDIT_HUB_STEP : STEPS.CATEGORY);

  const [resetKey, setResetKey] = useState(0);

  const [services, setServices] = useState<Service[]>(listing?.services || initialServices);
  const [employees, setEmployees] = useState<string[]>(
    (listing?.employees || []).map((emp: any) => emp.fullName) || initialEmployees
  );
  const [storeHours, setStoreHours] = useState<StoreHourType[]>(listing?.storeHours || initialStoreHours);

  // which service index is being edited in the ServiceSelector (single row mode)
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

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
      state: listing?.state || '',
      city: listing?.city || '',
    }
  });

  useEffect(() => {
    if (!rentModal.isOpen) return;
    setStep(isEditMode ? EDIT_HUB_STEP : STEPS.CATEGORY);
    setEditingServiceIndex(null);

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
      setResetKey((k) => k + 1);
    }
  }, [rentModal.isOpen, isEditMode, reset]);

  const clearLocation = () => {
    setValue('location', null, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('address', '',   { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('zipCode', '',   { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('state',  '',    { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('city',   '',    { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setResetKey((k) => k + 1);
  };

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
    setEditingServiceIndex(null);
    setResetKey((k) => k + 1);
    rentModal.onClose();
  }, [reset, rentModal]);

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
    setEditingServiceIndex(null);
    setResetKey((k) => k + 1);
  }, [listing, reset]);

  const category = watch('category');
  const imageSrc = watch('imageSrc');
  const address = watch('address');
  const zipCode = watch('zipCode');
  const galleryImages = watch('galleryImages') || [];
  const title = watch('title');
  const description = watch('description');

  const stateVal = watch('state');
  const cityVal  = watch('city');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const onBack = () => {
    if (isEditMode) {
      setStep(EDIT_HUB_STEP);
      return;
    }
    if (step === STEPS.CATEGORY) return;

    if (step === STEPS.IMAGES) {
      setStep(STEPS.SERVICES_LIST);
      return;
    }
    setStep((s) => (s - 1) as STEPS);
  };

  const onNext = () => {
    if (step === STEPS.CATEGORY && !category) {
      return toast.error('Please select a category.');
    }

    if (step === STEPS.LOCATION) {
      let invalid = false;
      if (!stateVal) { setError('state', { type: 'required', message: 'State is required' }); invalid = true; } else { clearErrors('state'); }
      if (!cityVal)  { setError('city',  { type: 'required', message: 'City is required'  }); invalid = true; } else { clearErrors('city'); }
      if (!address)  { setError('address',{ type: 'required', message: 'Address is required' }); invalid = true; } else { clearErrors('address'); }
      if (!zipCode)  { setError('zipCode',{ type: 'required', message: 'ZIP is required'     }); invalid = true; } else { clearErrors('zipCode'); }
      if (invalid) return toast.error('Please fill in all location fields.');
    }

    if (step === STEPS.SERVICES_LIST) {
      setStep(STEPS.IMAGES);
      return;
    }

    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step === EDIT_HUB_STEP) return;

    if (step === STEPS.SERVICES_FORM) {
      setEditingServiceIndex(null);
      setStep(STEPS.SERVICES_LIST);
      return;
    }

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
    if (step === EDIT_HUB_STEP) return undefined;
    if (step === STEPS.EMPLOYEE) return isEditMode ? 'Update' : 'Create';
    if (step === STEPS.SERVICES_FORM) return 'Save';
    return 'Next';
  }, [step, isEditMode]);

  const secondaryActionLabel = useMemo(() => {
    if (step === EDIT_HUB_STEP) return undefined;
    if (isEditMode && step === STEPS.CATEGORY) return 'Back';
    return step === STEPS.CATEGORY ? undefined : 'Back';
  }, [step, isEditMode]);

  const servicesCount = useMemo(
    () => (services || []).filter(s => (s.serviceName?.trim() || '') && (Number(s.price) > 0)).length,
    [services]
  );
  const employeesCount = useMemo(
    () => employees.filter(e => (e || '').trim().length > 0).length,
    [employees]
  );
  const imagesCount = (imageSrc ? 1 : 0) + (Array.isArray(galleryImages) ? galleryImages.length : 0);

  const overviewItems = useMemo(() => ([
    { key: STEPS.CATEGORY,      title: 'Category',   description: category ? `Selected: ${category}` : 'Pick a category' },
    { key: STEPS.LOCATION,      title: 'Location',   description: (cityVal && stateVal) ? `${cityVal}, ${stateVal}` : 'Address, City, State, ZIP' },
    { key: STEPS.SERVICES_LIST, title: 'Services',   description: servicesCount ? `${servicesCount} service${servicesCount > 1 ? 's' : ''}` : 'Add services' },
    { key: STEPS.IMAGES,        title: 'Images',     description: imagesCount ? `${imagesCount} image${imagesCount > 1 ? 's' : ''}` : 'Add photos' },
    { key: STEPS.DESCRIPTION,   title: 'Details',    description: title ? `Title: ${title}` : 'Title & Description' },
    { key: STEPS.HOURS,         title: 'Hours',      description: 'Set store hours' },
    { key: STEPS.EMPLOYEE,      title: 'Employees',  description: employeesCount ? `${employeesCount} added` : 'Add employees' },
  ]), [category, cityVal, stateVal, servicesCount, imagesCount, title, employeesCount]);

  const formatPrice = (p?: number) => {
    const n = Number(p);
    if (!n || n <= 0) return '—';
    return `$${n.toFixed(2)}`;
  };

  const openEditForIndex = (i: number) => {
    setEditingServiceIndex(i);
    setStep(STEPS.SERVICES_FORM);
  };

  const addNewService = () => {
    if ((services?.length || 0) >= MAX_SERVICES) {
      toast.error(`You can only add up to ${MAX_SERVICES} services.`);
      return;
    }
    const next = [...(services || []), { serviceName: '', price: 0, category: '', imageSrc: '' }];
    setServices(next);
    const newIndex = next.length - 1;
    setEditingServiceIndex(newIndex);
    setStep(STEPS.SERVICES_FORM);
  };

  // ---------- BODY ----------
  let bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title={isEditMode ? "Edit your establishment" : "Define your establishment"}
        subtitle="Pick a category"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((item) => (
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

  if (isEditMode && step === EDIT_HUB_STEP) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading title="Quick Edit" subtitle="Jump straight to the section you want to update." />
        <EditOverview
          items={overviewItems}
          onSelect={(k) => setStep(k)}
        />
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Where is your place located?" subtitle="Help guests find you!" />
        <ListLocationSelect
          key={`loc-${resetKey}`}
          id="location"
          initialLocation={isEditMode ? (listing?.location ?? null) : null}
          initialAddress={isEditMode ? (listing?.address ?? null) : null}
          initialZipCode={isEditMode ? (listing?.zipCode ?? null) : null}
          onLocationSubmit={(loc) => {
            if (!loc) return;
            setValue('location', `${loc.city}, ${loc.state}`, { shouldValidate: true });
            setValue('state', loc.state, { shouldValidate: true });
            setValue('city',  loc.city,  { shouldValidate: true });
            if (loc.address) setValue('address', loc.address, { shouldValidate: true });
            if (loc.zipCode) setValue('zipCode', loc.zipCode, { shouldValidate: true });
          }}
          register={register}
          errors={errors}
        />
      </div>
    );
  }

  if (step === STEPS.SERVICES_LIST) {
    const validServices = (services || []).filter(s => (s.serviceName?.trim() || '') || s.category || s.price);

    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading title="Your services" subtitle="Review and edit." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Existing services */}
          {validServices.map((s, i) => {
            const bg = s.imageSrc || imageSrc || '';
            return (
              <div
                key={`svc-card-${i}`}
                className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                {/* Image with over-image edit button */}
                <div
                  className="relative h-32 w-full bg-center bg-cover"
                  style={{ backgroundImage: bg ? `url(${bg})` : 'none', backgroundColor: bg ? undefined : '#f5f5f5' }}
                >
                  <button
                    type="button"
                    onClick={() => openEditForIndex(i)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition"
                    aria-label="Edit service"
                    title="Edit service"
                  >
                    {/* Your SVG (edit/pencil) */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
                      <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
                      <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {s.serviceName || 'Untitled Service'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {s.category || 'No category'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                      {formatPrice(s.price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add new service card */}
          {(services?.length || 0) < MAX_SERVICES && (
            <button
              type="button"
              onClick={addNewService}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left focus:outline-none focus:ring-2 focus:ring-black/10 transition"
            >
              <div className="relative h-32 w-full bg-neutral-100">
                {/* Centered square + */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl border border-neutral-300 bg-white flex items-center justify-center shadow-sm group-hover:bg-neutral-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-neutral-900">Add a service</p>
                <p className="text-xs text-neutral-500 mt-0.5">Name, price, category</p>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === STEPS.SERVICES_FORM) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Edit service" subtitle="Update name, price, category, and image." />
        <ServiceSelector
          key={`svc-${resetKey}-${editingServiceIndex ?? 'all'}`}
          id="service-selector"
          onServicesChange={setServices}
          existingServices={services}
          listingImageSrc={listing?.imageSrc || imageSrc || ''}
          singleIndex={editingServiceIndex ?? undefined}
        />
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
          key={`img-${resetKey}`}
          id="image-upload"
          onChange={(value) => setCustomValue('imageSrc', value)}
          onGalleryChange={(values) => setCustomValue('galleryImages', values)}
          value={imageSrc}
          galleryImages={galleryImages}
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
          key={`emp-${resetKey}`}
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
      secondaryAction={step === EDIT_HUB_STEP ? undefined : onBack}
      onClose={handleClose}
      body={bodyContent}
      className={modalWidthClasses}
    />
  );
}

export default RentModal;
