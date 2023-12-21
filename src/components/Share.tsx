import React from 'react';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import LabelIcon from '@mui/icons-material/Label';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import UserAvatar from './UserAvatar';
import { Image, MapPin, SmilePlus, Tags } from 'lucide-react';
import { Button } from './ui/button';

export default function Share() {
  return (
    <div className='w-full h-44 rounded-lg shadow-md dark:shadow-lg dark:border dark:border-gray-600 dark-bg-'>
        <div className="p-2.5">
            <div className="flex items-center ml-5 mt-2.5">
                <UserAvatar/>
            </div>
            <hr className='my-5 mx-5'/>
            <div className="flex items-center justify-between">
                <div className="flex ml-5">
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <Image className='mr-0.5'/>
                        <span className="text-base font-medium"> Photo or Video </span>
                    </div>
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <Tags className='mr-0.5'/>
                        <span className="text-base font-medium"> Tag </span>
                    </div>
                    <div className='flex items-center mr-3.5 cursor-pointer'>
                        <MapPin className='mr-0.5'/>
                        <span className="text-base font-medium"> Location</span>
                    </div>
                    <div className='flex items-center cursor-pointer'>
                        <SmilePlus className='mr-1'/>
                        <span className="text-base font-medium"> Mood</span>
                    </div>
                </div>
                <div className="pr-4">
                <Button className='rounded-sm'>Share</Button>
                </div>
            </div>
        </div>
    </div>
  )
}
