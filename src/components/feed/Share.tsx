import React from 'react';
import UserAvatar from '../UserAvatar';
import { Image, MapPin, SmilePlus, Tags } from 'lucide-react';
import { Button } from '../ui/button';

export default function Share() {
  return (
    <div className='w-full h-44 rounded-lg shadow-md bg-white dark:shadow-lg dark:border dark:border-gray-600'>
        <div className="p-2.5">
            <div className="flex items-center ml-5 mt-2.5">
                <UserAvatar />
            </div>
            <hr className='my-5 mx-5'/>
            <div className="flex items-center justify-between">
                <div className="flex ml-5">
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <Image className='mr-0.5' color="#C19065"/>
                        <span className="text-base font-medium"> Photos </span>
                    </div>
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <Tags className='mr-0.5' color="#C19065"/>
                        <span className="text-base font-medium"> Tag </span>
                    </div>
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <MapPin className='mr-0.5' color="#C19065"/>
                        <span className="text-base font-medium"> Location</span>
                    </div>
                    <div className='flex items-center cursor-pointer'>
                        <SmilePlus className='mr-1' color="#C19065"/>
                        <span className="text-base font-medium"> Mood</span>
                    </div>
                </div>
                <div className="pr-4">
                <Button className='rounded-sm bg-[#B67171]'>Share</Button>
                </div>
            </div>
        </div>
    </div>
  )
}
