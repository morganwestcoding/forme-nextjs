import React from 'react'
import { SafeUser } from '@/app/types';
import { Button } from '../ui/button';
import Avatar
 from '../ui/avatar';
interface PostHeadProps {
    currentUser?: SafeUser | null;
  }
  
  const PostHead: React.FC<PostHeadProps> = ({
    currentUser,
  }) => {
  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-90 p-6 '>
    <div className="flex items-center">
      <Button variant="outline" size="icon">
      <Avatar src={currentUser?.image} />
      </Button>
      </div>
      </div>
  )
}

export default PostHead