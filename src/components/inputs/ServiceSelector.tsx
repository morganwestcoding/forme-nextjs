'use client';

import React, { useState, useEffect } from 'react';
import { categories } from '../Categories';
import Select, { StylesConfig, SingleValue } from 'react-select';

export type Service = {
 serviceName: string;
 price: number;
 category: string;
};

type ServiceSelectorProps = {
 onServicesChange: (services: Service[]) => void;
 existingServices: Service[];
 id?: string;
};

interface CategoryOption {
 label: string;
 value: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
 onServicesChange, 
 existingServices,
 id 
}) => {
 const [services, setServices] = useState<Service[]>(existingServices);
 const [inputValues, setInputValues] = useState<string[]>(existingServices.map(service => service.price.toFixed(2)));
 const [focusedInputs, setFocusedInputs] = useState<boolean[]>(existingServices.map(() => false));

 useEffect(() => {
   onServicesChange(services.map((service, index) => ({
     ...service,
     price: parseFloat(inputValues[index]) || 0
   })));
 }, [services, inputValues, onServicesChange]);

 const handleInputChange = (index: number, field: keyof Service, value: string) => {
   const updatedServices = [...services];
   const updatedInputValues = [...inputValues];

   if (field === 'price') {
     updatedInputValues[index] = value;
     setInputValues(updatedInputValues);
     updatedServices[index] = {
        ...updatedServices[index],
        [field]: parseFloat(value) || 0,
     };
   } else {
     updatedServices[index] = { ...updatedServices[index], [field]: value };
   }
   setServices(updatedServices);
 };

 const handleFocus = (index: number) => {
   const newFocusedInputs = [...focusedInputs];
   newFocusedInputs[index] = true;
   setFocusedInputs(newFocusedInputs);
 };

 const handleBlur = (index: number) => {
   const updatedInputValues = [...inputValues];
   updatedInputValues[index] = parseFloat(inputValues[index]).toFixed(2);
   setInputValues(updatedInputValues);

   const newFocusedInputs = [...focusedInputs];
   newFocusedInputs[index] = false;
   setFocusedInputs(newFocusedInputs);
 };

 const handleCategoryChange = (index: number, selectedOption: SingleValue<CategoryOption>) => {
   handleInputChange(index, 'category', selectedOption?.value || '');
 };

 const addService = () => {
   if (services.length < 6) {
     setServices([...services, { serviceName: '', price: 0, category: '' }]);
     setInputValues([...inputValues, '0.00']);
     setFocusedInputs([...focusedInputs, false]);
   }
 };

 const removeService = (indexToRemove: number) => {
   const updatedServices = services.filter((_, index) => index !== indexToRemove);
   const updatedInputValues = inputValues.filter((_, index) => index !== indexToRemove);
   const updatedFocusedInputs = focusedInputs.filter((_, index) => index !== indexToRemove);
   
   setServices(updatedServices);
   setInputValues(updatedInputValues);
   setFocusedInputs(updatedFocusedInputs);
 };

 const selectClasses = {
   control: (state: any) => `
     !w-full 
     !p-3 
     !pt-3.5
     !bg-slate-50 
     !border 
     !border-neutral-500
     !rounded-md 
     !outline-none 
     !transition
     !h-[60px]
     ${state.isFocused ? '!border-black' : '!border-neutral-500'}
   `,
   option: (state: any) => `
     !py-4 !px-4 !cursor-pointer
     ${state.isFocused ? '!bg-neutral-100' : '!bg-white'}
     ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
     !text-black hover:!text-neutral-500
     !font-normal
   `,
   singleValue: () => '!text-black pt-3.5',
   input: () => '!text-neutral-500 !font-normal',
   placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
   menu: () => '!bg-white !rounded-md !border !border-neutral-200 !shadow-md !mt-1',
   menuList: () => '!p-0',
   valueContainer: () => '!p-0',
   container: (state: any) => `
     !relative !w-full
     ${state.isFocused ? 'peer-focus:border-black' : ''}
   `
 };

 return (
   <div id={id} className="max-w-2xl -mt-4 -mb-8">
     {services.map((service, index) => (
       <div 
         key={index} 
         id={`service-row-${index}`}
         className="flex flex-row items-center mb-3 gap-3"
       >
         <div className="flex-1 flex gap-3">
           <div className="relative w-1/3">
             <input
               type="text"
               id={`serviceName-${index}`}
               value={service.serviceName}
               onChange={(e) => handleInputChange(index, 'serviceName', e.target.value)}
               onFocus={() => handleFocus(index)}
               onBlur={() => handleBlur(index)}
               className="
                 peer
                 w-full 
                 p-3 
                 pt-3.5
                 font-light 
                 bg-slate-50 
                 border-neutral-500
                 border
                 rounded-md
                 outline-none
                 transition
                 disabled:opacity-70
                 disabled:cursor-not-allowed
                 text-black
                 h-[60px]
               "
               placeholder=" "
             />
             <label 
               htmlFor={`serviceName-${index}`}
               className={`
                 absolute 
                 text-sm
                 duration-150 
                 transform 
                 top-5 
                 left-4
                 origin-[0] 
                 text-neutral-500
                 ${service.serviceName || focusedInputs[index] ? 'scale-100 -translate-y-3' : 'translate-y-0'}
               `}
             >
               Service Name
             </label>
           </div>
           
           <div className="relative w-1/3">
             <input
               type="text"
               id={`service-price-${index}`}
               value={inputValues[index]}
               onChange={(e) => handleInputChange(index, 'price', e.target.value)}
               onFocus={() => handleFocus(index)}
               onBlur={() => handleBlur(index)}
               className="
                 peer
                 w-full 
                 p-3 
                 pt-3.5
                 pl-8
                 font-light 
                 bg-slate-50 
                 border-neutral-500
                 border
                 rounded-md
                 outline-none
                 transition
                 disabled:opacity-70
                 disabled:cursor-not-allowed
                 text-black
                 h-[60px]
               "
               placeholder=" "
             />
             <span className="absolute left-4 top-[52%] transform -translate-y-1/2 text-neutral-500">$</span>
           </div>
           
           <div className="relative w-1/3">
             <Select<CategoryOption>
               id={`service-category-${index}`}
               value={service.category ? { label: service.category, value: service.category } : null}
               onChange={(selectedOption) => handleCategoryChange(index, selectedOption)}
               options={categories.map(category => ({ label: category.label, value: category.label }))}
               classNames={selectClasses}
               placeholder=" "
             />
             <label 
               className={`
                 absolute 
                 text-sm
                 duration-150 
                 transform 
                 top-5 
                 left-4
                 origin-[0] 
                 text-neutral-500
                 ${service.category ? 'scale-100 -translate-y-3' : 'translate-y-0'}
               `}
             >
               Category
             </label>
           </div>
         </div>
         
         {services.length > 1 && (
           <button
             onClick={() => removeService(index)}
             className="ml-2 p-2 hover:bg-slate-100 rounded-full transition"
             aria-label="Remove service"
           >
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               fill="none" 
               viewBox="0 0 24 24" 
               strokeWidth={1.5} 
               stroke="currentColor" 
               className="w-5 h-5 text-neutral-500 hover:text-neutral-800"
             >
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         )}
       </div>
     ))}
     
     {services.length < 6 && (
       <button
         onClick={addService}
         className="mt-2 flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-md p-2 hover:bg-slate-100 transition"
       >
         <svg 
           xmlns="http://www.w3.org/2000/svg" 
           fill="none" 
           viewBox="0 0 24 24" 
           strokeWidth={1.5} 
           stroke="currentColor" 
           className="w-5 h-5"
         >
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
         </svg>
         Add Service
       </button>
     )}
   </div>
 );
};

export default ServiceSelector;