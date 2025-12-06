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
    <div className="mt-3.5 mb-6">
    <Link href="/" prefetch={false} className='overflow-hidden'>
      {variant === 'horizontal' ? (
        <div className="-mb-6 bg-blue-50 mt-6 border-[#60A5FA] border shadow rounded-xl px-6 py-3.5">
        <Image
          alt="ForMe Logo"

          height={15}
          width={120}
          src="/logos/forme-long-blue.png"
        />
        </div>
      ) : (
        <Image
          alt="ForMe Logo"
          className="block h-12 w-8"
          height={48}
          width={32}
          src="/logos/black.png"
        />
      )}
    </Link>
    </div>
  )
}

export default Logo;