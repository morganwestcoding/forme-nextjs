import LogoImage from '@logos/logo-black.svg';
import Link from "next/link";
import Image from 'next/image';
import { AspectRatio } from '../aspect-ratio';

function Logo() {
  return (
    <Link href="/" prefetch={false} className='overflow-hidden'>
      <div className='flex items-center w-24 h-7'>
       

      <AspectRatio ratio={16 / 9}
      className='flex items-center justify-center'>
          <Image
            priority
            src={LogoImage}
            alt="ForMe Logo"
            />
        </AspectRatio>

    
      </div>  
    </Link>
  )
}

export default Logo