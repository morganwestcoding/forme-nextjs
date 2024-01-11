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
    className="rounded-full border " 
    height="42" 
    width="42" 
    alt="Avatar"
    src={src || "/people/headshot-5.jpg"}
    />
  );
}

export default Avatar;
