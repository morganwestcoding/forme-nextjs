'use client';

import { useState } from 'react';

interface SocialLinksInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

const socialPlatforms = [
  {
    name: 'instagram',
    label: 'Instagram',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    placeholder: 'instagram.com/yourprofile'
  },
  {
    name: 'facebook',
    label: 'Facebook',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
    placeholder: 'facebook.com/yourpage'
  },
  {
    name: 'twitter',
    label: 'Twitter',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-1-4.8 4-8.2 7.5-5.5 1.3 1 2.3 2.5 2.5 4.2 0 0 1.1-.2 2-.8 0 0-.6 1.6-2 2.1z"></path>
      </svg>
    ),
    placeholder: 'twitter.com/yourhandle'
  },
  {
    name: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
        <path d="M15 8c0-2.21-1.79-4-4-4H7v8h2a2 2 0 0 1 4 0"></path>
        <path d="M17 17c2.76 0 5-2.24 5-5v-7h-4"></path>
      </svg>
    ),
    placeholder: 'tiktok.com/@yourusername'
  },
  {
    name: 'youtube',
    label: 'YouTube',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
      </svg>
    ),
    placeholder: 'youtube.com/channel/yourchannel'
  }
];

const SocialLinksInput: React.FC<SocialLinksInputProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  // Make sure value is defined and is an object
  const socialLinks = value || {};
  
  const handleChange = (platform: string, url: string) => {
    onChange({
      ...socialLinks,
      [platform]: url
    });
  };

  return (
    <div className="space-y-4">
      {socialPlatforms.map((platform) => (
        <div key={platform.name} className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            {platform.icon}
          </div>
          <div className="flex-grow">
            <label htmlFor={`social-${platform.name}`} className="block text-sm font-medium text-gray-700 mb-1">
              {platform.label}
            </label>
            <input
              id={`social-${platform.name}`}
              type="text"
              value={socialLinks[platform.name] || ''}
              onChange={(e) => handleChange(platform.name, e.target.value)}
              disabled={disabled}
              placeholder={platform.placeholder}
              className="w-full p-3 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      ))}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Tip: Enter full URLs including https:// for better user experience
        </p>
      </div>
    </div>
  );
};

export default SocialLinksInput;