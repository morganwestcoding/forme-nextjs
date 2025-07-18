'use client';

import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  variant?: 'horizontal' | 'vertical';
}

const Logo = ({ variant = 'horizontal' }: LogoProps) => {
  const router = useRouter();

  return (
    <div className="mt-2 mb-6">
    <Link href="/" prefetch={false} className='overflow-hidden'>
      {variant === 'horizontal' ? (
        <Image
          alt="ForMe Logo"
          className="h-7 w-11" 
          height={32}
          width={140}
          src="/logos/forme-long.png"
        />
      ) : (
        <Image
          alt="ForMe Logo"
          className=" block w-7 h-11" 
          height={36}
          width={24}
          src="/logos/black.png"
        />
      )}
    </Link>
    </div>
  )
}

export default Logo;