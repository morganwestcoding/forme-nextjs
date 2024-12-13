'use client';

import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Logo = () => {
  const router = useRouter();

  return (
    <Link href="/" prefetch={false} className='overflow-hidden'>
      <Image
        alt="ForMe Logo"
        className='block' // Changed from 'hidden md:block mb-8'
        height="32"
        width="32"
        src="/logos/black.png"
      />
    </Link>
  )
}

export default Logo