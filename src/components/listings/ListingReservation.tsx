'use client';

import { Range } from "react-date-range";

import ModalButton from "../modals/ModalButton";
import Calendar from "../inputs/Calender";
import PersonTime from "./PersonTime";

interface ListingReservationProps {
  price: number;
  date: Date,
  time: string;
  totalPrice: number;
  onChangeDate: (date: Date) => void;
  onChangeTime: (time: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
}

const ListingReservation: React.FC<
  ListingReservationProps
> = ({
  price,
  date,
  time,
  totalPrice,
  onChangeDate,
  onChangeTime,
  onSubmit,
  disabled,
  disabledDates
}) => {
  
  return ( 
    
    <div 
      className="
      bg-white 
      
      
      
        overflow-hidden
      "
    >
      
    
      
      <Calendar
        value={date}
        disabledDates={disabledDates}
        onChange={onChangeDate}
      />
  <div className="my-4">
      <PersonTime time={time} onTimeChange={onChangeTime} />
    </div>
   
   <div className="mt-4">
        <ModalButton
          disabled={disabled} 
          label="Reserve" 
          onClick={onSubmit}
          
        />
      
      <div 
        className="
          p-4 
          flex 
          flex-row 
          items-center 
          justify-between
          font-semibold
          text-lg
        "
      >
        <div>
          Total
        </div>
        </div>
        <div>
          $ {totalPrice}
        </div>
      </div>
    </div>
   );
}
 
export default ListingReservation;