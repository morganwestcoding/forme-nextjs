'use client';

import { useEffect } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Nails',
    color: 'bg-yellow-200',
    description: 'This property is close to the beach!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#6d635f]'
  },
  {
    label: 'Barber',
    color: 'bg-rose-200',
    description: 'This property is has windmills!',
    gradient: 'bg-gradient-to-b from-[#cdb3a8] to-[#907d76]'
  },
  {
    label: 'Salon',
    color: 'bg-orange-300',
    description: 'This property is modern!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Massage',
    color: 'bg-teal-500',
    description: 'This property is in the countryside!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Eyebrows',
    color: 'bg-emerald-600',
    description: 'This is property has a beautiful pool!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Facial',
    color: 'bg-cyan-600',
    description: 'This property is on an island!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Trainor',
    color: 'bg-blue-800',
    description: 'This property is near a lake!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Flex',
    color: 'bg-indigo-800',
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