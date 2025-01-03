'use client'; 
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  isSidebar?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ src, isSidebar }) => {
  const defaultImage = "/people/rooster.jpg";
  const imageSrc = src || defaultImage;

  return (
    <div className={`relative ${isSidebar ? 'w-10 h-10 rounded-lg' : 'w-11 h-11 rounded-full'} overflow-hidden`}>
      <Image
        fill
        objectFit="cover" 
        alt="Avatar"
        src={imageSrc}
        className='object-cover'
      />
    </div>
  );
}

export default Avatar;