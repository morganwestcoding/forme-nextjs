import React from 'react'

function CloseFriends() {
  return (
    <div className='pt-4'>
    <h1 className='pb-6'>Close Friends</h1>
    <div className='w-24 rounded-2xl flex-col items-center bg-white bg-opacity-80 h-60'>
    <ul className='w-full h-full flex flex-col justify-around items-center'>
          {/* Circle 1 */}
          <li className='w-10 h-10 rounded-full border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/path-to-your-image1.jpg" alt="Friend 1" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 2 */}
          <li className='w-10 h-10 rounded-full border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/path-to-your-image2.jpg" alt="Friend 2" className='w-full h-full object-cover'/>
          </li>
          {/* Circle 3 */}
          <li className='w-10 h-10 rounded-full border-2 border-gray-300 flex justify-center items-center overflow-hidden'>
            <img src="/path-to-your-image3.jpg" alt="Friend 3" className='w-full h-full object-cover'/>
          </li>
        </ul>
    </div>
     </div>
  )
}

export default CloseFriends