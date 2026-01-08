'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Massage',
    color: 'bg-[#D4B185]',
    description: 'This storefront provides Massages!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Wellness',
    color: 'bg-[#C4D4A9]',
    description: 'This property has skiing activies!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Fitness',
    color: 'bg-[#86A4BB]',
    description: 'This property is near a lake!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Nails',
    color: 'bg-[#E5B9AD]',
    description: 'This property is close to the beach!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#6d635f]'
  },
  {
    label: 'Spa',
    color: 'bg-[#D8C3CE]',
    description: 'This property is on an island!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Barber',
    color: 'bg-[#D6C3B6]',
    description: 'This property is has windmills!',
    gradient: 'bg-gradient-to-b from-[#cdb3a8] to-[#907d76]'
  },

  {
    label: 'Beauty',
    color: 'bg-[#E6C9B3]',
    description: 'This is property has a beautiful pool!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Salon',
    color: 'bg-[#B3C5D1]',
    description: 'This property is modern!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },


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