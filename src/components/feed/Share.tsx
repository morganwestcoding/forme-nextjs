'use client';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { Button } from '../ui/button';
import { SafeUser } from '@/app/types';


interface ShareProps {
    currentUser: SafeUser | null;
}

  const Share: React.FC<ShareProps> = ({ currentUser }) => {
  
  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-90 p-6 '>
      <div className="flex items-center">
        <Button variant="outline" size="icon">
        <Avatar src={currentUser?.image} />
        </Button>
      
      <ContentInput
      currentUser={currentUser}
      />
      </div>


      <div className="mt-4 flex items-center justify-between bg">
        <div className="flex items-center bg-white p-2 rounded-lg drop-shadow-sm">
        <img src="/icons/image.svg" className='cursor-pointer text-[#48AEFB] mr-2 drop-shadow h-7 w-7 p-0.5'/>
        
        <div className="relative inline-flex items-center">
         <img 
         src="/icons/location-add.svg"
         className='h-7 w-7 cursor-pointer text-[#48AEFB] p-0.5 drop-shadow'/>
        </div>
        <div className='className="relative inline-flex items-center'>

        <img  src="/icons/tag.svg" alt="Home" className="h-7 w-7 ml-2 p-0.5 text-[#7d8085] cursor-pointer"/>
        </div>
        </div>
       
        <div className="relative inline-block">
        <Button className='rounded-xl bg-[#000000]'>
            Share
          </Button>
          
          </div>
      </div>
    </div>
  );
};

export default Share;
