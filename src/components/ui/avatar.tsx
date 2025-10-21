'use client'; 
import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  className?: string; 
}

const Avatar: React.FC<AvatarProps> = ({ src, className = "rounded-full"  }) => {
  const defaultImage = "/people/rooster.webp";
  const imageSrc = src || defaultImage;

  return (
    <div className={`relative border border-gray-400 w-10 h-10 overflow-hidden ${className}`}>
      <Image
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        alt="Avatar"
        src={imageSrc}
        className={`object-cover ${className}`}
      />
    </div>
  );
}

export default Avatar;