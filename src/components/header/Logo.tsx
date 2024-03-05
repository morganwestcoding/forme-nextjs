import LogoImage from '@logos/logo-white.png';
import Link from "next/link";
import Image from 'next/image';
import { AspectRatio } from '../ui/aspect-ratio';

function Logo() {
  return (
    <Link href="/" prefetch={false}>
    <div className='relative w-24 h-24 p-2 -mb-4 -mt-6 overflow-hidden'>
      <Image
        priority
        src={LogoImage}
        alt="ForMe Logo"
        layout='fill'
        objectFit='contain' // Adjust as needed
        className='invert'
      />
    </div>
  </Link>
  )
}

export default Logo