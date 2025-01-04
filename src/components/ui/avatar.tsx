'use client'; 
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src }) => {
  const defaultImage = "/people/rooster.jpg";
  const imageSrc = src || defaultImage;

  return (
    <div className="relative w-11 h-11 rounded-full overflow-hidden">
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