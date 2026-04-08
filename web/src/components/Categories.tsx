'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Wellness',
    color: 'bg-[#C4D4A9]',
    description: 'Wellness services',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Training',
    color: 'bg-[#86A4BB]',
    description: 'Training services',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Barber',
    color: 'bg-[#D6C3B6]',
    description: 'Barber services',
    gradient: 'bg-gradient-to-b from-[#cdb3a8] to-[#907d76]'
  },
  {
    label: 'Salon',
    color: 'bg-[#B3C5D1]',
    description: 'Salon services',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Nails',
    color: 'bg-[#E8B4B8]',
    description: 'Nail services',
    gradient: 'bg-gradient-to-b from-[#e8b4b8] to-[#c4868b]'
  },
  {
    label: 'Skincare',
    color: 'bg-[#F5E6D3]',
    description: 'Skincare services',
    gradient: 'bg-gradient-to-b from-[#f5e6d3] to-[#d4c4b0]'
  },
  {
    label: 'Lashes',
    color: 'bg-[#D4B5A0]',
    description: 'Lash services',
    gradient: 'bg-gradient-to-b from-[#d4b5a0] to-[#b8967e]'
  },
  {
    label: 'Brows',
    color: 'bg-[#C4A882]',
    description: 'Brow services',
    gradient: 'bg-gradient-to-b from-[#c4a882] to-[#a08660]'
  },
  {
    label: 'Ink',
    color: 'bg-[#A3A3A3]',
    description: 'Tattoo services',
    gradient: 'bg-gradient-to-b from-[#71717a] to-[#3f3f46]'
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