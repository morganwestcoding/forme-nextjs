'use client';

import React from 'react';
import Heading from '../Heading';

export type UserType = 'customer' | 'individual' | 'team';

interface UserTypeStepProps {
  userType: UserType | '';
  onUserTypeChange: (userType: UserType) => void;
  isLoading?: boolean;
}

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className={`block ${className || ''}`}>
    <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 10.75H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className={`block ${className || ''}`}>
    <path d="M17 8.5C17 5.73858 14.7614 3.5 12 3.5C9.23858 3.5 7 5.73858 7 8.5C7 11.2614 9.23858 13.5 12 13.5C14.7614 13.5 17 11.2614 17 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 20.5C19 16.634 15.866 13.5 12 13.5C8.13401 13.5 5 16.634 5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TeamIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className={`block ${className || ''}`}>
    <path d="M15.5 11C15.5 9.067 13.933 7.5 12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 12.933 10.067 14.5 12 14.5C13.933 14.5 15.5 12.933 15.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.4827 11.3499C15.8047 11.4475 16.1462 11.5 16.5 11.5C18.433 11.5 20 9.933 20 8C20 6.067 18.433 4.5 16.5 4.5C14.6851 4.5 13.1928 5.8814 13.0173 7.65013" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.9827 7.65013C10.8072 5.8814 9.31492 4.5 7.5 4.5C5.567 4.5 4 6.067 4 8C4 9.933 5.567 11.5 7.5 11.5C7.85381 11.5 8.19535 11.4475 8.51727 11.3499" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 16.5C22 13.7386 19.5376 11.5 16.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 19.5C17.5 16.7386 15.0376 14.5 12 14.5C8.96243 14.5 6.5 16.7386 6.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 11.5C4.46243 11.5 2 13.7386 2 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserTypeStep: React.FC<UserTypeStepProps> = ({
  userType,
  onUserTypeChange,
  isLoading = false,
}) => {
  const options = [
    {
      type: 'customer' as const,
      icon: ShoppingBagIcon,
      title: 'Simple Shopper',
      info: 'Perfect for discovering services, booking appointments, and making purchases. This option is designed for personal use—not for promoting or managing a business.',
    },
    {
      type: 'individual' as const,
      icon: UserIcon,
      title: 'Individual Provider',
      info: "Ideal for independent professionals operating solo. Create your own business profile, showcase your services, and manage your bookings—all without being part of a larger organization.",
    },
    {
      type: 'team' as const,
      icon: TeamIcon,
      title: 'Team Member',
      info: "For professionals working within an established business. Connect to your company's existing profile and set up your individual service offerings as part of the team.",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Heading
        title="How will you use Forme?"
        subtitle="Choose your account type to get started with the right experience."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = userType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onUserTypeChange(option.type)}
              disabled={isLoading}
              className={`
                group relative overflow-hidden rounded-lg
                transition-all duration-300 ease-out
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'ring-2 ring-offset-2 shadow scale-[1.02]'
                  : 'hover:scale-[1.02] hover:shadow shadow'
                }
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              `}
              style={{
                ...(isSelected && { '--tw-ring-color': '#60A5FA' } as React.CSSProperties),
              }}
            >
              {/* Background */}
              <div
                className={`
                  absolute inset-0 ${isSelected ? 'bg-blue-50' : 'bg-gray-50'}
                  transition-all duration-300
                  ${!isSelected && 'group-hover:bg-gray-100'}
                `}
              />

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#60A5FA' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col p-8 min-h-[200px]">
                {/* Icon container - fixed at top */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`
                      w-16 h-16 rounded-md
                      flex items-center justify-center
                      transition-all duration-300
                      ${isSelected
                        ? 'bg-white shadow'
                        : 'bg-white shadow-sm group-hover:shadow'
                      }
                    `}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={isSelected ? { color: '#60A5FA' } : undefined}
                    >
                      <Icon
                        className={`
                          transition-all duration-300
                          ${isSelected ? '' : 'text-gray-700 group-hover:text-gray-900'}
                        `}
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
                  <h3
                    className={`
                     font-semibold leading-tight
                      transition-colors duration-300
                      text-gray-900
                    `}
                  >
                    {option.title}
                  </h3>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className={`
                  absolute bottom-0 left-0 right-0 h-1
                  transition-all duration-300
                  ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                `}
                style={{ backgroundColor: '#60A5FA' }}
              />
            </button>
          );
        })}
      </div>

      {/* Additional information based on selection */}
      {userType && (
        <div className="relative overflow-hidden rounded-lg bg-blue-50 p-6 border border-blue-200">
          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{ backgroundColor: '#60A5FA' }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
                  <path d="M12 16V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M12 8.01172V8.00172" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {userType === 'customer' && "What's a Simple Shopper?"}
                  {userType === 'individual' && "What's an Individual Provider?"}
                  {userType === 'team' && "What's a Team Member?"}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {options.find(opt => opt.type === userType)?.info}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTypeStep;
