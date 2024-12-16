'use client';

import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  isMobile?: boolean;
}

const Logo = ({ isMobile }: LogoProps) => {
  const router = useRouter();

  return (
    <Link href="/" prefetch={false} className='overflow-hidden'>
      <Image
        alt="ForMe Logo"
        className={isMobile ? 'block w-7 h-9' : 'hidden md:block mb-8'}
        height={isMobile ? "24" : "32"}
        width={isMobile ? "24" : "32"}
        src="/logos/black.png"
      />
    </Link>
  )
}

export default Logo