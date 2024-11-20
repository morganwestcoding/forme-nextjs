'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import CategoryChoice from './CategoryChoice';


export const categories = [
  {
    label: 'Salon',
    color: 'bg-[#78C3FB]',
    description: 'This property is modern!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },

  {
    label: 'Trainor',
    color: 'bg-[#0673C6]',
    description: 'This property is near a lake!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Barber',
    color: 'bg-[#D6C3B6]',
    description: 'This property is has windmills!',
    gradient: 'bg-gradient-to-b from-[#cdb3a8] to-[#907d76]'
  },
  {
    label: 'Eyebrows',
    color: 'bg-[#A08C81]',
    description: 'This is property has a beautiful pool!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },



  {
    label: 'Yoga',
    color: 'bg-[#77C6AE]',
    description: 'This property has skiing activies!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },



  {
    label: 'Massage',
    color: 'bg-[#559074]',
    description: 'This property is in the countryside!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },
  {
    label: 'Facial',
    color: 'bg-[#F2BABA]',
    description: 'This property is on an island!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#c1a093]'
  },



  {
    label: 'Nails',
    color: 'bg-[#E26060]',
    description: 'This property is close to the beach!',
    gradient: 'bg-gradient-to-b from-[#dac6be] to-[#6d635f]'
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