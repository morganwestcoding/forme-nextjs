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
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        alt="Avatar"
        src={imageSrc}
        className="object-cover rounded-full"  // Add rounded-full here too
      />
    </div>
  );
}

export default Avatar;