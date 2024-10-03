"use client"

import { useRouter, useSearchParams } from "next/navigation";
import Logo from "../header/Logo";
import { categories } from '../Categories';
import { useState } from "react";

interface Category {
  label: string;
  color: string;
  description: string;
  gradient: string;
}
export const dynamic = 'force-dynamic';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  route: string;
}

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedButton, setSelectedButton] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Category) => {
    if (selectedCategory && selectedCategory.label === category.label) {
      // If the clicked category is already selected, clear the selection
      setSelectedCategory(null);
      const currentParams = new URLSearchParams(searchParams?.toString() ?? '');
      currentParams.delete('category');
      router.push(`/?${currentParams.toString()}`);
    } else {
      // If a new category is selected, update as before
      setSelectedCategory(category);
      const currentParams = new URLSearchParams(searchParams?.toString() ?? '');
      currentParams.set('category', category.label);
      router.push(`/?${currentParams.toString()}`);
    }
  };
  return (

    <div className="fixed top-0 flex h-screen z-50">
      <div className="flex flex-col items-center w-52 h-full px-10 pb-10 pt-8 bg-white  backdrop-blur-full bg drop-shadow-sm rounded-tr-2xl" >
        <Logo/>
        <div className="flex flex-col items-center w-full">
        <span className="mb-5 text-[#a2a2a2] text-xs font-light ">Menu</span>
        
        <ul className="list-none m-0 p-0 flex flex-col items-center hover:text-white ">
          <li className={`group flex items-center justify-start mb-3 p-2  rounded-lg border ${
          selectedButton === 'home' ? 'bg-[#e2e8f0]' : 'bg-[#ffffff] hover:bg-[#e2e8f0]'
          } w-36`}
          onClick={() => {
            router.push('/');
            setSelectedButton('home');
          }}
          >
            <div className="group flex flex-col   rounded-full p-1 cursor-pointer" >
            
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={selectedButton === 'home' ? "#ffffff" : "#a2a2a2"} fill={"none"} className="group-hover:text-white">
                <path d="M9.06165 4.82633L3.23911 9.92134C2.7398 10.3583 3.07458 11.1343 3.76238 11.1343C4.18259 11.1343 4.52324 11.4489 4.52324 11.8371V15.0806C4.52324 17.871 4.52324 19.2662 5.46176 20.1331C6.40029 21 7.91082 21 10.9319 21H13.0681C16.0892 21 17.5997 21 18.5382 20.1331C19.4768 19.2662 19.4768 17.871 19.4768 15.0806V11.8371C19.4768 11.4489 19.8174 11.1343 20.2376 11.1343C20.9254 11.1343 21.2602 10.3583 20.7609 9.92134L14.9383 4.82633C13.5469 3.60878 12.8512 3 12 3C11.1488 3 10.4531 3.60878 9.06165 4.82633Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16H12.009" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          
          </div>
          <span className={`ml-5 text-xs font-light ${
    selectedButton === 'home' ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'
  }`}>Home</span>

          </li>


          {/* Market Icon */}
   
          <li className={`group flex items-center justify-start mb-3 p-2 rounded-lg border ${
              selectedButton === 'market' ? 'bg-[#e2e8f0]' : 'bg-[#ffffff] hover:bg-[#e2e8f0]'
            } w-36`} 
            onClick={() => {
              router.push('/market');
              setSelectedButton('market');
            }}>
          <div className="group flex flex-col  rounded-full p-1 cursor-pointer" >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={selectedButton === 'market' ? "#ffffff" : "#a2a2a2"}  fill={"none"} className=" group-hover:text-white">
            <path d="M3 10.9871V15.4925C3 18.3243 3 19.7403 3.87868 20.62C4.75736 21.4998 6.17157 21.4998 9 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68409 17.584 9 16.9768" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17.7957 2.50294L6.14983 2.53202C4.41166 2.44248 3.966 3.78259 3.966 4.43768C3.966 5.02359 3.89055 5.87774 2.82524 7.4831C1.75993 9.08846 1.83998 9.56536 2.44071 10.6767C2.93928 11.5991 4.20741 11.9594 4.86862 12.02C6.96883 12.0678 7.99065 10.2517 7.99065 8.97523C9.03251 12.1825 11.9955 12.1825 13.3158 11.8157C14.6385 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0096 10.3439 22.4107 9.04401 21.2967 7.6153C20.5285 6.63001 20.2084 5.7018 20.1032 4.73977C20.0423 4.18234 19.9888 3.58336 19.5971 3.20219C19.0247 2.64515 18.2035 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
            </div>
            <span className={`ml-5 text-xs font-light ${
                selectedButton === 'market' ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'
              }`}>Market</span>
            </li>
        

           {/* Favorites Icon */}
       
           <li className={`group flex items-center justify-start mb-3 p-2 rounded-lg border ${
              selectedButton === 'favorites' ? 'bg-[#e2e8f0]' : 'bg-[#ffffff] hover:bg-[#e2e8f0]'
            } w-36`} 
            onClick={() => {
              router.push('/favorites');
              setSelectedButton('favorites');
            }}>
          <div className="group flex  flex-col rounded-full p-1 cursor-pointer" onClick={() => router.push('/favorites')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={17} height={17} color={selectedButton === 'favorites' ? "#ffffff" : "#a2a2a2"} fill={"none"} className=" group-hover:text-white">
              <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>     

           
          <span className={`ml-5 text-xs font-light ${
                selectedButton === 'favorites' ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'
              }`}>Favorites</span>
     
            </li>
       

         {/* Job Icon with Tooltip */}
  
         <li className={`group flex items-center justify-start mb-3 p-2 rounded-lg border ${
              selectedButton === 'jobs' ? 'bg-[#e2e8f0]' : 'bg-[#ffffff] hover:bg-[#e2e8f0]'
            } w-36`} >
          <div className="group flex flex-col rounded-lg p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={selectedButton === 'jobs' ? "#ffffff" : "#a2a2a2"}  fill={"none"} className=" group-hover:text-white">
    <path d="M10 12.3333C10 12.0233 10 11.8683 10.0341 11.7412C10.1265 11.3961 10.3961 11.1265 10.7412 11.0341C10.8683 11 11.0233 11 11.3333 11H12.6667C12.9767 11 13.1317 11 13.2588 11.0341C13.6039 11.1265 13.8735 11.3961 13.9659 11.7412C14 11.8683 14 12.0233 14 12.3333V13C14 14.1046 13.1046 15 12 15C10.8954 15 10 14.1046 10 13V12.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.8016 13C14.1132 12.9095 14.4666 12.8005 14.88 12.673L19.0512 11.3866C20.5358 10.9288 21.2624 10.131 21.4204 8.74977C21.4911 8.13198 21.5265 7.82308 21.4768 7.57022C21.3349 6.84864 20.7289 6.26354 19.9213 6.06839C19.6383 6 19.283 6 18.5724 6H5.42757C4.717 6 4.36172 6 4.07871 6.06839C3.27111 6.26354 2.6651 6.84864 2.52323 7.57022C2.47351 7.82308 2.50886 8.13198 2.57956 8.74977C2.73764 10.131 3.46424 10.9288 4.94882 11.3866L9.11996 12.673C9.53336 12.8005 9.88684 12.9095 10.1984 13" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.46283 11L3.26658 13.1723C2.91481 17.0662 2.73892 19.0131 3.86734 20.2566C4.99576 21.5 6.93851 21.5 10.824 21.5H13.176C17.0615 21.5 19.0042 21.5 20.1327 20.2566C21.2611 19.0131 21.0852 17.0662 20.7334 13.1723L20.5372 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 5.5L15.4227 5.23509C15.0377 3.91505 14.8452 3.25503 14.3869 2.87752C13.9286 2.5 13.3199 2.5 12.1023 2.5H11.8977C10.6801 2.5 10.0714 2.5 9.61309 2.87752C9.15478 3.25503 8.96228 3.91505 8.57727 5.23509L8.5 5.5" stroke="currentColor" strokeWidth="1.5" />
</svg>
          </div>
          <span className={`ml-5 text-xs font-light ${
                selectedButton === 'jobs' ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'
              }`}>Jobs</span>
            
       
          </li>
        

          <li className={`group flex items-center justify-start mb-5 p-2 rounded-lg border ${
              selectedButton === 'bookings' ? 'bg-[#e2e8f0]' : 'bg-[#ffffff] hover:bg-[#e2e8f0]'
            } w-36`} 
            onClick={() => {
              router.push('/reservations');
              setSelectedButton('bookings');
            }}>
          <div className="group flex flex-col  rounded-full p-1 cursor-pointer" onClick={() => router.push('/reservations')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={selectedButton === 'bookings' ? "#ffffff" : "#a2a2a2"}  fill={"none"} className=" group-hover:text-white">
    <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 8H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
          </div>
          <span className={`ml-5 text-xs font-light ${
                selectedButton === 'bookings' ? 'text-white' : 'text-[#a2a2a2] group-hover:text-white'
              }`}>Bookings</span>
          </li>

{/* Categories */}
<span className="mb-5 text-[#a2a2a2] text-xs font-light">Genre</span>
    <li className={`relative flex items-center justify-center mb-4 p-2 rounded-lg shadow w-36 h-20 ${selectedCategory ? selectedCategory.color : 'bg-[#b1dafe]'}`}>
      <span className="text-[#ffffff] text-xs group-hover:text-white font-light w-20 text-center h-10 rounded-lg p-3 bg-white bg-opacity-15 backdrop-blur shadow-sm">
        {selectedCategory ? selectedCategory.label : 'Default'}
      </span>
    </li>
    <div className="w-36">
      <div className="grid grid-cols-4 gap-1.5 rounded-xl grid-rows-2">
        {categories.map((item: Category) => (
          <div 
            key={item.label} 
            className={`h-6 rounded-md shadow ${item.color} cursor-pointer`}
            onClick={() => handleCategorySelect(item)}
          />
        ))}
      </div>
    </div>
       </ul>
        </div>  
          </div>
            </div>

  )
}