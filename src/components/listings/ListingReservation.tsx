'use client';

import { Range } from "react-date-range";
import { useState } from "react";
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
  const [showCalendar, setShowCalendar] = useState(false); 

  return ( 
    <div 
      className="
        overflow-hidden
      "
    >

      <hr />
          <div className="p-4">
        <div className="font-semibold text-lg mb-2">Date</div>
        <div
          className="border border-gray-300 rounded-lg p-2 cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          Select Dates
        </div>
        {showCalendar && (
          <div className="relative">
            <div className="absolute top-full z-10">
              <Calendar
                value={dateRange}
                disabledDates={disabledDates}
                onChange={(value) => onChangeDate(value.selection)}
              />
            </div>
          </div>
        )}
      </div>
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