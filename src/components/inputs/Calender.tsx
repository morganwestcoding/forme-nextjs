'use client';

import { Calendar as SingleDateCalendar } from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
  value: Date,
  onChange: (date: Date) => void;
  disabledDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates
}) => {
  return ( 
    <SingleDateCalendar
color="#262626" // color for the calendar
date={value} // currently selected date
onChange={(item) => onChange(item)} // update parent component upon date change
minDate={new Date()} // minimum date that can be selected
disabledDates={disabledDates} // dates that cannot be selected
/>
   );
}
 
export default Calendar;