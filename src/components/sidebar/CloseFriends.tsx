import React from 'react';
import Image from 'next/image';

function CloseFriends() {
  return (
    <div className='pt-4'>
      <div className='pb-3 font-medium text-xs flex flex-col items-center justify-center text-[#8d8d8d]'>
        Recents
      </div>
      
      {/* Adjust the container to manage rows of circles */}
      <div className='w-32 rounded-2xl bg-white drop-shadow-sm flex flex-wrap justify-around p-3'>
        {/* Adjustments for rows of two */}
        <div className='flex justify-between w-full mb-2'>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-1.png" layout="fill" objectFit="cover" alt="Friend 1"/>
          </div>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-2.png" layout="fill" objectFit="cover" alt="Friend 2"/>
          </div>
        </div>

        <div className='flex justify-between w-full mb-2'>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-3.png" layout="fill" objectFit="cover" alt="Friend 3"/>
          </div>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-4.png" layout="fill" objectFit="cover" alt="Friend 4"/>
          </div>
        </div>

        <div className='flex justify-between w-full mb-2'>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-1.png" layout="fill" objectFit="cover" alt="Friend 1"/>
          </div>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-2.png" layout="fill" objectFit="cover" alt="Friend 2"/>
          </div>
        </div>

        <div className='flex justify-between w-full mb-2'>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-1.png" layout="fill" objectFit="cover" alt="Friend 1"/>
          </div>
          <div className='w-10 h-10 drop-shadow rounded-full overflow-hidden'>
            <Image src="/people/headshot-2.png" layout="fill" objectFit="cover" alt="Friend 2"/>
          </div>
        </div>

        {/* Add additional rows as needed */}
      </div>
    </div>
  );
}

export default CloseFriends;
