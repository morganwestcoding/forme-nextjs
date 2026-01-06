'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import { Service } from '@/components/inputs/ServiceSelector';

interface ServicesListStepProps {
  services: Service[];
  onEditService: (index: number) => void;
  onAddService: () => void;
}

export default function ServicesListStep({
  services,
  onEditService,
  onAddService,
}: ServicesListStepProps) {
  const validServices = services.filter(
    s => (s.serviceName?.trim() || '') || s.category || s.price
  );

  return (
    <div>
      <TypeformHeading
        question="What services do you offer?"
        subtitle="Add services that customers can book"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {validServices.map((s, i) => (
          <button
            key={`svc-card-${s.id ?? i}`}
            type="button"
            onClick={() => onEditService(i)}
            className="group relative overflow-hidden rounded-xl flex flex-col items-center justify-center gap-3 p-6 cursor-pointer select-none transition-all duration-300 ease-out will-change-transform transform-gpu focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md hover:text-gray-700"
          >
            <div className="relative z-10 flex flex-col items-center gap-2.5">
              <div className="rounded-full bg-gray-50 p-2.5 transition-all duration-300 group-hover:bg-gray-100 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-all duration-300 ease-out transform-gpu"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M9 12h6M9 16h6" />
                </svg>
              </div>

              <span className="text-sm font-medium leading-tight transition-all duration-300 ease-out text-gray-700 group-hover:text-gray-900 transform-gpu text-center line-clamp-2 px-1">
                {s.serviceName || 'Untitled'}
              </span>

              {Number(s.price) > 0 && (
                <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                  ${Number(s.price)}
                </span>
              )}
            </div>
          </button>
        ))}

        {/* Add Service tile */}
        <button
          type="button"
          onClick={onAddService}
          className="group relative overflow-hidden rounded-xl flex flex-col items-center justify-center gap-3 p-6 cursor-pointer select-none transition-all duration-300 ease-out will-change-transform transform-gpu focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:shadow-md hover:from-gray-100 hover:to-gray-150"
        >
          <div className="relative z-10 flex flex-col items-center gap-2.5">
            <div className="rounded-full bg-white p-2.5 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <span className="text-sm font-semibold leading-tight transition-all duration-300 ease-out text-gray-600 group-hover:text-gray-800 transform-gpu">
              Add service
            </span>
          </div>
        </button>
      </div>

      {validServices.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          No services added yet. Click above to add your first service.
        </p>
      )}
    </div>
  );
}
