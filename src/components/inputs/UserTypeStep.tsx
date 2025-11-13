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
    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14H10C7.23858 14 5 16.2386 5 19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19C19 16.2386 16.7614 14 14 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const TeamIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className={`block ${className || ''}`}>
    <path d="M15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 4C17.6568 4 19 5.34315 19 7C19 8.22309 18.268 9.27523 17.2183 9.7423" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.7143 14H10.2857C7.91876 14 5.99998 15.9188 5.99998 18.2857C5.99998 19.2325 6.76749 20 7.71426 20H16.2857C17.2325 20 18 19.2325 18 18.2857C18 15.9188 16.0812 14 13.7143 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.7143 13C20.0812 13 22 14.9188 22 17.2857C22 18.2325 21.2325 19 20.2857 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4C6.34315 4 5 5.34315 5 7C5 8.22309 5.73193 9.27523 6.78168 9.7423" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.71429 19C2.76751 19 2 18.2325 2 17.2857C2 14.9188 3.91878 13 6.28571 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      title: 'Simple\nShopper',
      info: 'Perfect for discovering services, booking appointments, and making purchases. This option is designed for personal use—not for promoting or managing a business.',
    },
    {
      type: 'individual' as const,
      icon: UserIcon,
      title: 'Individual\nProvider',
      info: "Ideal for independent professionals operating solo. Create your own business profile, showcase your services, and manage your bookings—all without being part of a larger organization.",
    },
    {
      type: 'team' as const,
      icon: TeamIcon,
      title: 'Team\nMember',
      info: "For professionals working within an established business. Connect to your company's existing profile and set up your individual service offerings as part of the team.",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="How will you use Forme?"
        subtitle="Choose your account type to get started with the right experience."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  : 'hover:scale-[1.02] hover:shadow shadow-sm'
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
              <div className="relative z-10 flex flex-col p-8 min-h-[170px]">
                {/* Icon container - fixed at top */}
                <div className="flex justify-center">
                  <div
                    className={`
                      w-16 h-16 rounded-md
                      flex items-center justify-center
                      transition-all duration-300 mb-2
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
                          ${isSelected ? '' : 'text-gray-600/90 group-hover:text-gray-900'}
                        `}
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
                  <h3
                    className={`
                     text-xs leading-tight
                      transition-colors duration-300
                      text-gray-900
                      whitespace-pre-line
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
