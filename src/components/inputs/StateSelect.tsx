'use client';

import Select from 'react-select'

import useStates from '@/app/hooks/useStates';

export type StateSelectValue = {
  label: string;
 
  value: string
}

interface StateSelectProps {
  value?: StateSelectValue;
  onChange: (value: StateSelectValue) => void;
}

const StateSelect: React.FC<StateSelectProps> = ({
  value,
  onChange
}) => {
  const { getAll } = useStates();

  return ( 
    <div>
      <Select
        placeholder="Anywhere"
        isClearable
        options={getAll()}
        value={value}
        onChange={(value) => onChange(value as StateSelectValue)}
        formatOptionLabel={(option: any) => (
          <div className="
          flex flex-row items-center gap-3">
           
            <div>
              {option.label}
              <span className="text-neutral-500 ml-1">
              
              </span>
            </div>
          </div>
        )}
        classNames={{
          control: () => 'p-3 border-2',
          input: () => 'text-lg',
          option: () => 'text-lg'
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary: 'black',
            primary25: '#ffe4e6'
          }
        })}
      />
    </div>
   );
}
 
export default StateSelect;