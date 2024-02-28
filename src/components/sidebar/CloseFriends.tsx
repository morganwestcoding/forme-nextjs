import React from 'react'
import Image from 'next/image'

function CloseFriends() {
  return (
    <div className='pt-4'>
      <div className='pb-5 font-medium text-xs flex flex-col items-center justify-center text-[#4d4d4d]'>Recents
  
      </div>
      
      <div className='w-full rounded-2xl flex items-center justify-center h-38 bg-white drop-shadow-sm'>
        <ul className='w-full h-full grid grid-cols-2 gap-3 p-4 justify-items-center '>
          {/* Circle 1 */}
          <li className='w-11 h-11 drop-shadow rounded-full flex justify-center items-center overflow-hidden '>
            <Image src="/people/headshot-1.png" width={45} height={45} alt="Friend 1" className='object-cover drop-shadow-md'/>
          </li>
          {/* Circle 2 */}
          <li className='w-11 h-11 drop-shadow rounded-full flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-2.png" width={45} height={45} alt="Friend 2" className='object-cover drop-shadow-md'/>
          </li>
          {/* Circle 3 */}
          <li className='w-11 h-11 drop-shadow rounded-full flex justify-center items-center overflow-hidden '>
            <Image src="/people/headshot-3.png" width={45} height={45} alt="Friend 3" className='object-cover drop-shadow-md'/>
          </li>
          {/* Circle 4 */}
          <li className='w-11 h-11 drop-shadow rounded-full flex justify-center items-center overflow-hidden'>
            <Image src="/people/headshot-4.png" width={45} height={45} alt="Friend 4" className='object-cover drop-shadow-md'/>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CloseFriends
