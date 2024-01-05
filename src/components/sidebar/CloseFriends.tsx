import React from 'react'

function CloseFriends() {
  return (
    <div className='pt-4'>
    <div className='pb-5 font-bold text-xs flex flex-col items-center justify-center text-[#7d8085] opacity-75'>
      MESSAGES</div>
    <div className='w-20 rounded-2xl flex-col items-center bg-white bg-opacity-50 h-60'>
    <ul className='w-full h-full flex flex-col items-center justify-center'>
          {/* Circle 1 */}
          <li className='w-10 h-10 rounded-full my-1.5 border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/people/headshot-1.png" alt="Friend 1" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 2*/}
          <li className='w-10 h-10 rounded-full my-1.5  border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/people/headshot-2.png" alt="Friend 1" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 3 */}
          <li className='w-10 h-10 rounded-full my-1.5 border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/people/headshot-3.png" alt="Friend 2" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 4 */}
          <li className='w-10 h-10  rounded-full my-1.5 border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/people/headshot-4.png" alt="Friend 3" className='w-full h-full object-cover'/>
          </li>
        </ul>
    </div>
     </div>
  )
}

export default CloseFriends