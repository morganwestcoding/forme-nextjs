'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Nails',
    color: 'bg-[#dac6be]',
    description: 'This property is close to the beach!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Barber',
    color: 'bg-[#cdb3a8]',
    description: 'This property is has windmills!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Salon',
    color: 'bg-[#c1a093]',
    description: 'This property is modern!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Massage',
    color: 'bg-[#b58d7d]',
    description: 'This property is in the countryside!'
  },
  {
    label: 'Eyebrows',
    color: 'bg-[#a87a67]',
    description: 'This is property has a beautiful pool!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Facial',
    color: 'bg-[#9c6751]',
    description: 'This property is on an island!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Trainor',
    color: 'bg-[#8f543c]',
    description: 'This property is near a lake!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Flex',
    color: 'bg-[#834126]',
    description: 'This property has skiing activies!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  }
]

const Categories = () => {
  const params = useSearchParams();
  const category = params?.get('category');
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  if (!isMainPage) {
    return null;
  }

  return (
<div>
   <div className='
    pt-14
    flex 
    flex-col 
    items-center 
    justify-between
    overflow-x-auto'>
{categories.map((item) => (
          <CategoryChoice
            key={item.label}
            label={item.label}
            color={item.color}
            selected={category === item.label}/>
            ))}
   </div>
</div>
  );
}
 
export default Categories;