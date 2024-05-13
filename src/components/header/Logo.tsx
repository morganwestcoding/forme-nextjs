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
            className='hidden md:block mb-8'
            height="35"
            width="35"
            src="/logos/black.png"
            />
    </Link>
  )
}

export default Logo