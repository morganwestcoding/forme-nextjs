'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface ServicesStepProps {
  serviceOptions: SelectedService[];
  selectedServices: SelectedService[];
  onToggleService: (service: SelectedService) => void;
  totalPrice: number;
}

export default function ServicesStep({
  serviceOptions,
  selectedServices,
  onToggleService,
  totalPrice,
}: ServicesStepProps) {
  const isServiceSelected = (serviceValue: string) =>
    selectedServices.some(s => s.value === serviceValue);

  return (
    <div>
      <TypeformHeading
        question="Which services are you interested in?"
        subtitle="Choose one or more services to continue"
      />

      <div className="max-h-[400px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          {serviceOptions.map(service => (
            <button
              key={service.value}
              type="button"
              onClick={() => onToggleService(service)}
              className={`aspect-square p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center hover:shadow-md relative ${
                isServiceSelected(service.value) ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isServiceSelected(service.value) ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'
              }`}>
                {isServiceSelected(service.value) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isServiceSelected(service.value) ? 'bg-gray-100 text-gray-900' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M7.99805 16H11.998M7.99805 11H15.998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                    <path d="M7.5 3.5C5.9442 3.54667 5.01661 3.71984 4.37477 4.36227C3.49609 5.24177 3.49609 6.6573 3.49609 9.48836L3.49609 15.9944C3.49609 18.8255 3.49609 20.241 4.37477 21.1205C5.25345 22 6.66767 22 9.49609 22L14.4961 22C17.3245 22 18.7387 22 19.6174 21.1205C20.4961 20.241 20.4961 18.8255 20.4961 15.9944V9.48836C20.4961 6.6573 20.4961 5.24177 19.6174 4.36228C18.9756 3.71984 18.048 3.54667 16.4922 3.5" stroke="currentColor" strokeWidth="1.5"></path>
                    <path d="M7.49609 3.75C7.49609 2.7835 8.2796 2 9.24609 2H14.7461C15.7126 2 16.4961 2.7835 16.4961 3.75C16.4961 4.7165 15.7126 5.5 14.7461 5.5H9.24609C8.2796 5.5 7.49609 4.7165 7.49609 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-medium ${isServiceSelected(service.value) ? 'text-gray-900' : 'text-gray-900'}`}>
                    {service.label.split(' - ')[0]}
                  </span>
                  <span className={`text-xs font-semibold ${isServiceSelected(service.value) ? 'text-gray-700' : 'text-gray-600'}`}>
                    ${service.price}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedServices.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-500">
                {selectedServices.map(s => s.label.split(' - ')[0]).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${totalPrice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
