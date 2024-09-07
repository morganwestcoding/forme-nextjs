  'use client';

  import React, { useState, useEffect, useRef } from 'react';
  import Select, { StylesConfig, components, ControlProps } from 'react-select';
  import Calendar from '../inputs/Calender';
  import ModalButton from "../modals/ModalButton";
  import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
  import { format } from 'date-fns';

  interface ListingRightBarProps {
    listing: SafeListing & { user: SafeUser };
    reservations?: SafeReservation[];
    currentUser?: SafeUser | null;
    onCreateReservation: () => void;
    isLoading: boolean;
    disabledDates: Date[];
    description: string;
    selectedServices: Set<string>;
    toggleServiceSelection: (serviceId: string) => void;
    totalPrice: number;
  }

  interface OptionType {
    value: string;
    label: string;
    price?: number;
  }

  const ListingRightBar: React.FC<ListingRightBarProps> = ({
    listing,
    reservations = [],
    currentUser,
    onCreateReservation,
    isLoading,
    disabledDates,
    description,
    selectedServices,
    toggleServiceSelection,
    totalPrice: propTotalPrice
  }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<OptionType | null>(null);
    const [selectedService, setSelectedService] = useState<OptionType | null>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string>('');
    const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(propTotalPrice);
    const [showCalendar, setShowCalendar] = useState(false);

    const calendarRef = useRef<HTMLDivElement>(null);

    const employeeOptions: OptionType[] = [
      { value: '1', label: 'Employee 1' },
      { value: '2', label: 'Employee 2' },
      { value: '3', label: 'Employee 3' },
    ];

    const serviceOptions: OptionType[] = listing.services.map(service => ({
      value: service.id,
      label: `${service.serviceName} - $${service.price}`,
      price: service.price
    }));

    const timeOptions: OptionType[] = [
      { value: '09:00', label: '09:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '12:00', label: '12:00 PM' },
      { value: '13:00', label: '01:00 PM' },
      { value: '14:00', label: '02:00 PM' },
      { value: '15:00', label: '03:00 PM' },
      { value: '16:00', label: '04:00 PM' },
      { value: '17:00', label: '05:00 PM' },
    ];

    const handleEmployeeChange = (selectedOption: OptionType | null) => {
      setSelectedEmployee(selectedOption);
    };

    const handleServiceChange = (selectedOption: OptionType | null) => {
      setSelectedService(selectedOption);
      if (selectedOption && selectedOption.price) {
        toggleServiceSelection(selectedOption.value);
      }
    };

    const handleDateClick = () => {
      setShowCalendar(!showCalendar);
    };

    const handleDateChange = (newDate: Date) => {
      setDate(newDate);
      setShowCalendar(false);
    };

    const handleTimeChange = (selectedOption: OptionType | null) => {
      setTime(selectedOption ? selectedOption.value : '');
    };

    useEffect(() => {
      const newTotalPrice = listing.services
        .filter(service => selectedServices.has(service.id))
        .reduce((sum, service) => sum + service.price, 0);
      setCalculatedTotalPrice(newTotalPrice);
    }, [selectedServices, listing.services]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
          setShowCalendar(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const customStyles: StylesConfig<OptionType, false> = {
      control: (provided) => ({
        ...provided,
        backgroundColor: 'white',
        borderColor: '#e2e8f0',
        borderRadius: '0.5rem',
        minHeight: '38px',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#cbd5e0',
        },
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: '2px 8px',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#718096',
        fontSize: '0.875rem',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#e2e8f0' : 'white',
        color: '#4a5568',
        '&:hover': {
          backgroundColor: '#edf2f7',
        },
      }),
      singleValue: (provided) => ({
        ...provided,
        color: '#4a5568',
        fontSize: '0.875rem',
      }),
    };

    const dateOption: OptionType | null = date 
    ? { value: date.toISOString(), label: format(date, 'PP') }
    : null;

    return (
      <div className="flex flex-col justify-end bg-transparent gap-4 pr-16 h-auto">
        <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-6 mx-3 md:mr-16">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Booking</h2>
          </div>
          <div className="mb-3">
            <Select<OptionType>
              options={serviceOptions}
              styles={customStyles}
              placeholder="Select a service"
              onChange={handleServiceChange}
            />
          </div>
          <div className="mb-3">
            <Select<OptionType>
              options={employeeOptions}
              styles={customStyles}
              placeholder="Select employee"
              onChange={handleEmployeeChange}
            />
          </div>
          <div className="mb-3 relative">
          <Select<OptionType>
  styles={customStyles}
  value={dateOption}
  onChange={() => handleDateClick()}
  options={[]}
  placeholder="Pick a date"
  isSearchable={false}
/>
            {showCalendar && (
              <div 
                ref={calendarRef} 
                className="absolute z-50 mt-1 bg-white shadow-lg rounded-md"
                style={{
                  left: '0',
                  width: '100%',
                }}
              >
                <Calendar
                  value={date || new Date()}
                  onChange={handleDateChange}
                  disabledDates={disabledDates}
                />
              </div>
            )}
          </div>
          <div className="mb-3">
            <Select<OptionType>
              options={timeOptions}
              styles={customStyles}
              placeholder={date ? "Select time" : "Pick a date first"}
              onChange={handleTimeChange}
              isDisabled={!date}
              value={time ? timeOptions.find(option => option.value === time) : null}
            />
          </div>
          <div className="flex justify-between items-center mb-3">
            <span>Total Price:</span>
            <span>${calculatedTotalPrice}</span>
          </div>
          <ModalButton
            disabled={isLoading || !date || !time || !selectedService || !selectedEmployee}
            label="Reserve"
            onClick={onCreateReservation}
          />
        </div>
        <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 py-6 mx-3 md:mr-16 relative flex flex-col justify-end">
          <h2 className="text-xl font-bold mb-4">Hours</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Mon - Fri</span>
              <span className="text-sm">8:00 AM - 5:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Sat - Sun</span>
              <span className="text-sm">8:00 AM - 5:00 PM</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500 italic flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Open all week • Walk-ins welcome</span>
          </div>
        </div>
      </div>
    );
  }

  export default ListingRightBar;