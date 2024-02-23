import React from 'react'
import Image from 'next/image'

function CloseFriends() {
  return (
    <div className='pt-4'>
    <div className='pb-5 font-bold text-xs flex flex-col items-center justify-center text-[#4d4d4d] opacity-75'>
      FRIENDS</div>
    <div className='w-20 rounded-2xl flex-col items-center  h-60 border'>
    <ul className='w-full h-full flex flex-col items-center justify-center'>
          {/* Circle 1 */}
          <li className='w-11 h-11 drop-shadow rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-1.png" width={46} height={46}  alt="Friend 1" className=' object-cover'/>
          </li>
          {/* Circle 2*/}
          <li className='w-11 h-11 drop-shadow rounded-full my-1.5  border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-2.png" width={46} height={46} alt="Friend 1" className=' object-cover'/>
          </li>
          {/* Circle 3 */}
          <li className='w-11 h-11 drop-shadow rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-3.png" width={46} height={46} alt="Friend 2" className=' object-cover'/>
          </li>
          {/* Circle 4 */}
          <li className='w-11 h-11  drop-shadow rounded-full my-1.5 border border-white flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-4.png" width={46} height={46} alt="Friend 3" className=' object-cover'/>
          </li>
        </ul>
    </div>
     </div>
  )
}

export default CloseFriends