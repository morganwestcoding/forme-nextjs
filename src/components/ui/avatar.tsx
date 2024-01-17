"use client"

import * as React from "react"
import Image from "next/image"

interface AvatarProps {
  src: string | null | undefined;
}

const Avatar: React.FC<AvatarProps> = ({
  src
}) => {
  return (
    <Image
    className="rounded-full" 
    height="46" 
    width="46" 
    alt="Avatar"
    src={src || "/people/headshot-5.jpg"}
    />
  );
}

export default Avatar;
