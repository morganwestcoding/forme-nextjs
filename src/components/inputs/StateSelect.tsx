import React, { useState } from 'react';
import Select from 'react-select';
import useStates from '@/app/hooks/useStates'; 
import useCities from '@/app/hooks/useCities';// Adjust the import path based on your project structure

const ListLocationSelect = () => {
  const [selectedCountry] = useState('3169070'); // Example: Country code for the United States
  const [selectedState, setSelectedState] = useState(null);
  
  const states = useStates(selectedCountry);
  const cities = useCities(selectedState ? selectedState.value : null);

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
  };

  return (
    <div>
      <Select
        options={states}
        value={selectedState}
        onChange={handleStateChange}
        placeholder="Select State"
      />
      <Select
        options={cities}
        isDisabled={!selectedState}
        placeholder="Select City"
      />
    </div>
  );
};

export default ListLocationSelect;
