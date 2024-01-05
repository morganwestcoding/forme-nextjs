'use client';

import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CategoryChoiceProps {
  color: string,
  label: string;
  selected?: boolean;
}

const CategoryChoice: React.FC<CategoryChoiceProps> = ({
  color,
  label,
  selected,
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(() => {
    let currentQuery = {};
    
    if (params) {
      currentQuery = qs.parse(params.toString())
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label
    }

    if (params?.get('category') === label) {
      delete updatedQuery.category;
    }

    const url = qs.stringifyUrl({
      url: '/',
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
  }, [label, router, params]);

  return ( 
    <div
      onClick={handleClick}
      className={`
        flex 
        flex-col 
        items-center 
        justify-center 
        gap-2
        p-3
        border-b-2
        hover:text-white
        transition
        cursor-pointer
        ${selected ? 'border-b-white' : 'border-transparent'}
        ${selected ? 'text-white' : 'text-slate-300'}
      `}
    >
      <span className={`h-6 w-6 rounded-full ${color} inline-block`}></span>
      <div className="font-bold text-xs  uppercase">
        {label}
      </div>
    </div>
   );
}
 
export default CategoryChoice;