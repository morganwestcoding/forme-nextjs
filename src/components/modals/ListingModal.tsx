'use client';

import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState, useCallback, useEffect } from "react";
import ServiceCard from '../listings/ServiceCard';
import useListingModal from '@/app/hooks/useListingModal';
import Modal from "./Modal";
import CategoryInput from '../inputs/CategoryInput';
import { categories } from '../Categories';
import Input from '../inputs/Input';
import Heading from '../Heading';
import ServiceSelector, { Service } from '../inputs/ServiceSelector';
import ListLocationSelect from '../inputs/ListLocationSelect';
import EmployeeSelector from '../inputs/EmployeeSelector';
import StoreHours, { StoreHourType } from '../inputs/StoreHours';
import ImageUploadGrid from '../inputs/ImageUploadGrid';
import EditOverview from './EditOverview';

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    imageSrc: string | null;
  };
}

function splitLocation(loc?: string | null): { city: string; state: string } {
  if (!loc) return { city: '', state: '' };
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0] ?? '', state: parts[1] ?? '' };
  return { city: parts[0] ?? '', state: '' };
}

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

// ✅ Fixed: Start with empty array instead of 3 empty services
const initialServices: Service[] = [];

const initialEmployees: EmployeeInput[] = [];

const initialStoreHours: StoreHourType[] = [
  { dayOfWeek: 'Monday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Tuesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Wednesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Thursday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Friday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Saturday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Sunday', openTime: '10:00 AM', closeTime: '6:00 PM', isClosed: false },
];

const ListingModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const listingModal = useListingModal();
  const listing = listingModal.listing;
  const isEditMode = !!listing;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(isEditMode ? EDIT_HUB_STEP : STEPS.CATEGORY);
  const [resetKey, setResetKey] = useState(0);
  const [services, setServices] = useState<Service[]>(listing?.services || initialServices);
  const [employees, setEmployees] = useState<EmployeeInput[]>(() => {
    if (listing?.employees) {
      return listing.employees.map((emp: any) => ({
        userId: emp.userId,
        jobTitle: emp.jobTitle,
        serviceIds: emp.serviceIds || [],
        user: emp.user ? {
          id: emp.user.id,
          name: emp.user.name,
          email: null,
          image: emp.user.image,
          imageSrc: emp.user.imageSrc,
        } : undefined
      }));
    }
    return initialEmployees;
  });

  const [storeHours, setStoreHours] = useState<StoreHourType[]>(listing?.storeHours || initialStoreHours);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastUpdatedKey, setLastUpdatedKey] = useState<number | null>(null);

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
      location: listing?.location || '',
      address: listing?.address || '',
      zipCode: listing?.zipCode || '',
      imageSrc: listing?.imageSrc || '',
      title: listing?.title || '',
      description: listing?.description || '',
      phoneNumber: (listing as any)?.phoneNumber || '',
      website: listing?.website || '',
      galleryImages: listing?.galleryImages || [],
    }
  });

  useEffect(() => {
    if (!listingModal.isOpen) return;
    setStep(isEditMode ? EDIT_HUB_STEP : STEPS.CATEGORY);
    setEditingServiceIndex(null);
    setSaveStatus(null);
    setLastUpdatedKey(null);

    if (!isEditMode) {
      reset({
        category: '',
        location: '',
        address: '',
        zipCode: '',
        imageSrc: '',
        title: '',
        description: '',
        phoneNumber: '',
        website: '',
        galleryImages: [],
      });
      setServices(initialServices);
      setEmployees(initialEmployees);
      setStoreHours(initialStoreHours);
      setResetKey((k) => k + 1);
    }
  }, [listingModal.isOpen, isEditMode, reset]);

  useEffect(() => {
    if (!listing) return;
    reset({
      category: listing.category || '',
      location: listing.location || '',
      address: listing.address || '',
      zipCode: listing.zipCode || '',
      imageSrc: listing.imageSrc || '',
      title: listing.title || '',
      description: listing.description || '',
      phoneNumber: (listing as any).phoneNumber || '',
      website: listing.website || '',
      galleryImages: listing.galleryImages || [],
    });
    setServices(listing.services || initialServices);
    
    if (listing.employees) {
      const convertedEmployees = listing.employees.map((emp: any) => ({
        userId: emp.userId,
        jobTitle: emp.jobTitle,
        serviceIds: emp.serviceIds || [],
        user: emp.user ? {
          id: emp.user.id,
          name: emp.user.name,
          email: null,
          image: emp.user.image,
          imageSrc: emp.user.imageSrc,
        } : undefined
      }));
      setEmployees(convertedEmployees);
    } else {
      setEmployees(initialEmployees);
    }
    
    setStoreHours(listing.storeHours || initialStoreHours);
    setEditingServiceIndex(null);
    setResetKey((k) => k + 1);
  }, [listing, reset]);

  useEffect(() => {
    if (saveStatus?.type !== 'success') return;
    const t = setTimeout(() => setSaveStatus(null), 2500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  useEffect(() => {
    if (lastUpdatedKey == null) return;
    const t = setTimeout(() => setLastUpdatedKey(null), 3000);
    return () => clearTimeout(t);
  }, [lastUpdatedKey]);

  const category = watch('category');
  const locationVal = watch('location');
  const address = watch('address');
  const zipCode = watch('zipCode');
  const imageSrc = watch('imageSrc');
  const galleryImages = (watch('galleryImages') as string[]) || [];
  const title = watch('title');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const clearLocation = () => {
    setValue('location', '', { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('address', '',  { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    setValue('zipCode', '',  { shouldDirty: true, shouldValidate: true, shouldTouch: true });
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
      location: '',
      address: '',
      zipCode: '',
      imageSrc: '',
      title: '',
      description: '',
      phoneNumber: '',
      website: '',
      galleryImages: [],
    });
    setServices(initialServices);
    setEmployees(initialEmployees);
    setStoreHours(initialStoreHours);
    setStep(STEPS.CATEGORY);
    setEditingServiceIndex(null);
    setResetKey((k) => k + 1);
    setSaveStatus(null);
    setLastUpdatedKey(null);
    listingModal.onClose();
  }, [reset, listingModal]);

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
    const goingTo = (step - 1) as STEPS;
    switch (goingTo) {
      case STEPS.LOCATION: clearLocation(); break;
      case STEPS.DESCRIPTION: clearDescription(); break;
      case STEPS.HOURS: clearHours(); break;
      case STEPS.EMPLOYEE: clearEmployees(); break;
      default: break;
    }
    setStep(goingTo);
  };

  const onNext = () => {
    if (step === STEPS.CATEGORY && !category) {
      return;
    }

    if (step === STEPS.LOCATION) {
      let invalid = false;
      if (!locationVal) { setError('location', { type: 'required', message: 'Location is required' }); invalid = true; } else { clearErrors('location'); }
      if (!address)     { setError('address',  { type: 'required', message: 'Address is required'  }); invalid = true; } else { clearErrors('address'); }
      if (!zipCode)     { setError('zipCode',  { type: 'required', message: 'ZIP is required'      }); invalid = true; } else { clearErrors('zipCode'); }
      if (invalid) return;
    }

    if (step === STEPS.SERVICES_LIST) {
      setStep(STEPS.IMAGES);
      return;
    }

    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step === EDIT_HUB_STEP) return;

    // ✅ Filter out incomplete services before submission
    const validServices = services.filter(s => 
      s.serviceName?.trim() && 
      s.category?.trim() && 
      Number(s.price) > 0
    );

    if (isEditMode && listing) {
      try {
        setIsLoading(true);
        setSaveStatus(null);
        const { city, state } = splitLocation(String(data.location || ''));

        const payload = { 
          ...data,
          city,
          state,
          services: validServices, // ✅ Use filtered services
          employees,
          storeHours,
        };

        const justUpdatedKey = step;

        await axios.put(`/api/listings/${listing.id}`, payload);

        router.refresh();
        setLastUpdatedKey(justUpdatedKey);
        setSaveStatus({ type: 'success', message: 'Changes saved.' });
        setStep(EDIT_HUB_STEP);
        return;
      } catch (e: any) {
        console.error('[LISTING_UPDATE]', e?.response?.data || e);
        setSaveStatus({ type: 'error', message: typeof e?.response?.data === 'string' ? e.response.data : 'Update failed.' });
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // CREATE MODE: keep wizard behavior
    if (step !== STEPS.EMPLOYEE) {
      return onNext();
    }
    
    setIsLoading(true);

    const { city, state } = splitLocation(String(data.location || ''));

    const payload = { 
      ...data,
      city,
      state,
      services: validServices, // ✅ Use filtered services
      employees,
      storeHours,
    };

    try {
      await axios.post('/api/listings', payload);
      router.refresh();
      handleClose();
    } catch (e) {
      console.error('[LISTING_SAVE]', e);
    } finally {
      setIsLoading(false);
    }
  };

  const modalWidthClasses = useMemo(() => 'w-full md:w-4/6 lg:w-3/6 xl:w-2/5', [step]);

  const actionLabel = useMemo(() => {
    if (step === EDIT_HUB_STEP) return undefined;
    if (isEditMode) return 'Update';
    if (step === STEPS.EMPLOYEE) return 'Create';
    if (step === STEPS.SERVICES_FORM) return 'Save';
    return 'Next';
  }, [step, isEditMode]);

  const secondaryActionLabel = useMemo(() => {
    if (step === EDIT_HUB_STEP) return undefined;
    return 'Back';
  }, [step]);

  const servicesCount = useMemo(
    () => (services || []).filter(s => (s.serviceName?.trim() || '') && (Number(s.price) > 0)).length,
    [services]
  );
  
  const employeesCount = useMemo(
    () => employees.filter(e => e.userId && e.userId.trim().length > 0).length,
    [employees]
  );
  
  const imagesCount = (imageSrc ? 1 : 0) + (Array.isArray(galleryImages) ? galleryImages.length : 0);

  const overviewItems = useMemo(() => ([
    {
      key: STEPS.CATEGORY,
      title: 'Category',
      description: category ? `Selected: ${category}` : 'Pick a category',
    },
    {
      key: STEPS.LOCATION,
      title: 'Location',
      description: locationVal ? locationVal : 'Address, City, State, ZIP',
    },
    {
      key: STEPS.SERVICES_LIST,
      title: 'Services',
      description: servicesCount ? `${servicesCount} service${servicesCount > 1 ? 's' : ''}` : 'Add services',
    },
    {
      key: STEPS.IMAGES,
      title: 'Images',
      description: imagesCount ? `${imagesCount} image${imagesCount > 1 ? 's' : ''}` : 'Add photos',
    },
    {
      key: STEPS.DESCRIPTION,
      title: 'Details',
      description: title ? `Title: ${title}` : 'Title & Description',
    },
    {
      key: STEPS.HOURS,
      title: 'Hours',
      description: 'Set store hours',
    },
    {
      key: STEPS.EMPLOYEE,
      title: 'Employees',
      description: employeesCount ? `${employeesCount} added` : 'Add employees',
    },
  ]), [category, locationVal, servicesCount, imagesCount, title, employeesCount]);

  const openEditForIndex = (i: number) => {
    setEditingServiceIndex(i);
    setStep(STEPS.SERVICES_FORM);
  };

  const addNewService = () => {
    const next = [...(services || []), { serviceName: '', price: 0, category: '' }]; 
    setServices(next);
    const newIndex = next.length - 1;
    setEditingServiceIndex(newIndex);
    setStep(STEPS.SERVICES_FORM);
  };

  useEffect(() => {
    if (!listingModal.isOpen) return;

    const spStr =
      searchParams?.toString() ??
      (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '');

    const sp = new URLSearchParams(spStr);
    const wantsAdd = sp.get('addService') === '1';
    if (!wantsAdd) return;

    setServices(prev => {
      const next = [...prev, { serviceName: '', price: 0, category: '', imageSrc: '' }];
      setEditingServiceIndex(next.length - 1);
      return next;
    });
    setStep(STEPS.SERVICES_FORM);

    const nextParams = new URLSearchParams(spStr);
    nextParams.delete('addService');
    const basePath = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const href = nextParams.toString() ? `${basePath}?${nextParams}` : basePath;
    router.replace(href, { scroll: false });
  }, [listingModal.isOpen]);

  // ----- BODY
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
      <div className="flex flex-col gap-4">
        {saveStatus?.type === 'success' && (
          <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-2 text-sm">
            {saveStatus.message}
          </div>
        )}
        {saveStatus?.type === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2 text-sm">
            {saveStatus.message}
          </div>
        )}

        <Heading title="Quick Edit" subtitle="Jump straight to the section you want to update." />
        <EditOverview
          items={overviewItems}
          onSelect={(k) => { setSaveStatus(null); setLastUpdatedKey(null); setStep(k); }}
          updatedKey={lastUpdatedKey ?? undefined}
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
          onLocationSubmit={(value) => {
            setCustomValue('location', value ?? '');
            if (value) clearErrors('location');
          }}
          onAddressSelect={(data) => {
            setCustomValue('address', data.address);
            setCustomValue('zipCode', data.zipCode);
            const locStr = `${data.city}, ${data.state}`;
            setCustomValue('location', locStr);
            clearErrors(['address', 'zipCode', 'location']);
          }}
          register={register}
          errors={errors}
        />
      </div>
    );
  }

  if (step === STEPS.SERVICES_LIST) {
    const validServices = (services || []).filter(
      s => (s.serviceName?.trim() || '') || s.category || s.price
    );

    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading title="Your services" subtitle="Review and edit each one." />

        <div className="grid grid-cols-2 gap-3">
          {validServices.map((s, i) => (
            <ServiceCard
              key={`svc-card-${s.id ?? i}`}
              service={{
                id: String(s.id ?? i),
                serviceName: s.serviceName || 'Untitled Service',
                price: Number(s.price) || 0,
                category: s.category || '',
              }}
              currentUser={undefined}
              onClick={() => openEditForIndex(i)}
              onEdit={() => openEditForIndex(i)}
            />
          ))}

          {/* Add Service tile */}
          <button
            type="button"
            onClick={addNewService}
            className={[
              'group relative w-full',
              'rounded-2xl border-2 border-gray-200 bg-white p-4',
              'flex flex-col items-center justify-center text-center gap-2.5',
              'hover:border-blue-500 hover:shadow-md transition-all duration-200',
              'h-[140px]',
            ].join(' ')}
          >
            <div className="rounded-full flex items-center justify-center bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">Add a service</p>
              <p className="text-xs text-gray-500">Name, price, category</p>
            </div>
          </button>
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
          singleIndex={editingServiceIndex ?? undefined}
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title={isEditMode ? "Update your photos" : "Add photos of your place"} subtitle="Show guests what your place looks like!" />
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
    const validServices = services
      .filter(s => s.id && s.serviceName?.trim())
      .map(s => ({
        id: s.id!,
        serviceName: s.serviceName!,
        price: s.price || 0,
        category: s.category || '',
      }));

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title={isEditMode ? "Update your employees" : "Add your employees"} subtitle="Let us know who is available for work!" />
        <EmployeeSelector
          key={`emp-${resetKey}`}
          onEmployeesChange={setEmployees}
          existingEmployees={employees}
          services={validServices}
        />
      </div>
    );
  }

  return (
    <Modal
      id="listing-modal"
      modalContentId="modal-content-with-actions"
      disabled={isLoading}
      isOpen={listingModal.isOpen}
      title={isEditMode ? "Edit your listing" : "Join the fun!"}
      actionLabel={actionLabel}
      actionId="submit-button"
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={step === EDIT_HUB_STEP ? undefined : secondaryActionLabel}
      secondaryAction={step === EDIT_HUB_STEP ? undefined : onBack}
      onClose={handleClose}
      body={bodyContent}
      className={modalWidthClasses}
    />
  );
};

export default ListingModal;