'use client';

import Select from 'react-select'

import useStates from '@/app/hooks/useStates';

export type StateSelectValue = {
  label: string;
  id:string;
  value: string
}

interface StateSelectProps {
  label: string;
  id:string;
  value?: StateSelectValue;
  onChange: (value: StateSelectValue) => void;
}

const StateSelect: React.FC<StateSelectProps> = ({
  value,
  onChange
}) => {
  const { getAll } = useStates();

  return ( 
    <div >
      <Select 
        
        required
        placeholder="Select State"
        isClearable
        options={getAll()}
        value={value}
        onChange={(value) => onChange(value as StateSelectValue)}
        formatOptionLabel={(option: any) => (
          <div className="
          flex flex-row items-center gap-3 ">
           
            <div >
              {option.label}
            
            </div>
          </div>
        )}
        classNames={{
          control: () => ' border-2',
          input: () => 'text-lg',
          option: () => 'text-lg'
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: '#7d8085',
            primary25: '#c9c9c9',
            neutral0: '#F9FCFF', // Background color for the input and dropdown
            neutral20: '#7d8085', // Border color
            neutral30: '#ffffff',
            neutral80: '#7d8085'
          }
        })}
      />
    </div>
   );
}
 
export default StateSelect;