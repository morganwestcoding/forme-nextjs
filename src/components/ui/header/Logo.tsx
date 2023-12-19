import LogoImage from '@logos/logo-black.svg';
import Link from "next/link";
import Image from 'next/image';

function Logo() {
  return (
    <Link href="/" prefetch={false} className='overflow-hidden'>
      <div className='flex items-center w-12 h-12'>
      <Image
        priority
        src={LogoImage}
        alt="Logo"
        layout="responsive"
/>
      </div>
       
    </Link>
  )
}

export default Logo