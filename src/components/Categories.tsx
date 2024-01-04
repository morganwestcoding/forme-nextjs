'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {TbPool } from 'react-icons/tb';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Beach',
    color: 'bg-blue-400',
    description: 'This property is close to the beach!',
  },
  {
    label: 'Windmills',
    color: 'bg-blue-400',
    description: 'This property is has windmills!',
  },
  {
    label: 'Modern',
    color: 'bg-blue-400',
    description: 'This property is modern!'
  },
  {
    label: 'Countryside',
    color: 'bg-blue-400',
    description: 'This property is in the countryside!'
  },
  {
    label: 'Pools',
    color: 'bg-blue-400',
    description: 'This is property has a beautiful pool!'
  },
  {
    label: 'Islands',
    color: 'bg-blue-400',
    description: 'This property is on an island!'
  },
  {
    label: 'Lake',
    color: 'bg-blue-400',
    description: 'This property is near a lake!'
  },
  {
    label: 'Skiing',
    color: 'bg-blue-400',
    description: 'This property has skiing activies!'
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
    pt-4
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