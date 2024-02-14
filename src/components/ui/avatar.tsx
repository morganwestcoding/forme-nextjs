// Avatar.tsx
import React from 'react';
import Image from 'next/image';
import useUserStore from '../../app/hooks/userStore'; // Adjust the import path as necessary

const Avatar: React.FC<{ src?: string }> = ({ src }) => {
  const userImage = useUserStore((state) => state.user?.image) || src || "/people/rooster.jpg";

  return (
    <Image
      className="rounded-full" 
      height="46" 
      width="46" 
      alt="Avatar"
      src={userImage}
    />
  );
}

export default Avatar;
