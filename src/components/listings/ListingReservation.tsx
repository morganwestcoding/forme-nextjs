'use client';

import { Range } from "react-date-range";

import ModalButton from "../modals/ModalButton";
import Calendar from "../inputs/Calender";

interface ListingReservationProps {
  price: number;
  dateRange: Range,
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
}

const ListingReservation: React.FC<
  ListingReservationProps
> = ({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates
}) => {
  
  return ( 
    <div 
      className="
      bg-white 
        rounded-xl 
        border
      border-neutral-200 
        overflow-hidden
      "
    >
 
      
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => 
          onChangeDate(value.selection)}
      />
      <hr />
      <div className="p-4">
        <ModalButton
          disabled={disabled} 
          label="Reserve" 
          onClick={onSubmit}
        />
      </div>
      <hr />
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
        <div>
          $ {totalPrice}
        </div>
      </div>
    </div>
   );
}
 
export default ListingReservation;