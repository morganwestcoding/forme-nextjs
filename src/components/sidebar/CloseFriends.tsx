import React from 'react';
import Image from 'next/image';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';

function CloseFriends() {
  return (
    <div className='pt-4'>
      <div className='pb-3 font-medium text-xs flex flex-col items-center justify-center text-[#8d8d8d]'>
        Genre
      </div>
      
      {/* Adjust the container to manage rows of circles */}
      <div className="flex items-center justify-start mb-5 p-2  rounded-2xl shadow-sm  bg-[#b1dafe]  w-36" >
          <div className="flex flex-col  hover:bg-white rounded-full p-1 cursor-pointer" >
            
          <NavigateBeforeRoundedIcon className="w-4 h-4 hover:text-[#48DBFB] text-[#ffffff]"/>
          </div>
                  <span className="ml-6 text-white text-xs font-normal hover:text-white">Home</span>

          </div>
          </div>
  );
}

export default CloseFriends;
