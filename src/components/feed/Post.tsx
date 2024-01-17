import React from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure
import { SafeUser } from '@/app/types';
import { Button } from '../ui/button';

interface PostProps {
  currentUser: SafeUser | null;
}

const Post: React.FC<PostProps> = ({ currentUser }) => {
  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-70 p-6 mr-8 my-6 relative'>
      <div className="flex items-center">
        <Button variant="outline" size="icon" className='bg-white drop-shadow-md bg-opacity-100'>
          <Avatar src={currentUser?.image} />
        </Button>
        <div className="ml-2 flex flex-col">
          <div className="ml-2 flex items-center">
            <div className="font-semibold pr-2">User</div>
            <div className="text-sm text-gray-500">Date</div> {/* Date on the right side of User */}
          </div>
          <div className="text-sm text-gray-500 ml-2">Location</div> {/* Location under User */}
        </div>
      </div>
      <div className="ml-14 pl-1 mt-2">
        <p>Content</p>
        photo
        <div className="absolute right-1">
        <p className="text-sm text-gray-500 ">Genre</p>
      </div>
      </div>
     
    </div>
  );
};

export default Post;
