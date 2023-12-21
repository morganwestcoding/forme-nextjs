import LogoImage from '@logos/logo-black.svg';
import Link from "next/link";
import Image from 'next/image';
import { AspectRatio } from '../ui/aspect-ratio';

function Logo() {
  return (
    <Link href="/" prefetch={false} className='overflow-hidden'>
      <div className='flex items-center w-28 h-14'>
       

      <AspectRatio ratio={16 / 9}
      className='flex items-center justify-center'>
          <Image
            priority
            src={LogoImage}
            alt="ForMe Logo"
            className='dark:filter dark:invert'
            />
        </AspectRatio>

    
      </div>  
    </Link>
  )
}

export default Logo