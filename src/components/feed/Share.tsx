import React from 'react';
import Avatar from '../ui/avatar';
import { Image, MapPin, SmilePlus, Tags } from 'lucide-react';
import { Button } from '../ui/button';
import { SafeUser } from '@/app/types';
import { IoMdPhotos } from "react-icons/io";


interface ShareProps {
    currentUser?: SafeUser | null 
  }
  
  const Share: React.FC<ShareProps> = ({
    currentUser
  }) => {

  return (
    <div className='w-full h-44 rounded-lg shadow-md bg-[#ffffff] bg-opacity-80 dark:shadow-lg dark:border dark:border-gray-600'>
        <div className="p-2.5">
            <div className="flex items-center ml-5 mt-2.5 ">
            <Button   variant="outline" size="icon">
                <Avatar src={currentUser?.image}/>
            </Button>
            <input 
                type="text" 
                placeholder="What's on your mind?" 
                className="ml-4 mr-4 text-sm py-2 px-3 border rounded-lg flex-1"
              />
            </div>
            <hr className='my-5 mx-5'/>
            <div className="flex items-center justify-between">
                <div className="flex ml-5">
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                    <img src="/icons/camera.svg" className='mr-0.5' color="#7d8085"/>
                        <span className=" font-black text-sm">Photos</span>
                    </div>
                
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                    <img src="/icons/location.svg" className='mr-0.4' color="#7d8085"/>
                        <span className="font-bold text-sm">Location</span>
                    </div>
                
                    
                    
                </div>
                <div className="pr-4">
                <Button className='rounded-xl bg-[#3d3f42]'>Share</Button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Share;
