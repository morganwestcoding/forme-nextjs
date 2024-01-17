import React from 'react'
import Image from 'next/image'

function CloseFriends() {
  return (
    <div className='pt-4'>
    <div className='pb-5 font-bold text-xs flex flex-col items-center justify-center text-[#4d4d4d] opacity-75'>
      MESSAGES</div>
    <div className='w-20 rounded-xl flex-col items-center bg-white bg-opacity-70 h-60 drop-shadow-md'>
    <ul className='w-full h-full flex flex-col items-center justify-center'>
          {/* Circle 1 */}
          <li className='w-11 h-11 shadow-lg rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-1.png" width={6} height={6} alt="Friend 1" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 2*/}
          <li className='w-11 h-11 shadow-lg rounded-full my-1.5  border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-2.png" width={6} height={6} alt="Friend 1" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 3 */}
          <li className='w-11 h-11 shadow-lg rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-3.png" width={6} height={6} alt="Friend 2" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 4 */}
          <li className='w-11 h-11  shadow-lg rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-4.png" width={6} height={6} alt="Friend 3" className='w-full h-full object-cover'/>
          </li>
        </ul>
    </div>
     </div>
  )
}

export default CloseFriends