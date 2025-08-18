'use client';

import React, { useMemo, useRef, useState } from 'react';
import Select, {
  GroupBase,
  SingleValue,
  StylesConfig,
  type SelectInstance,
} from 'react-select';

export type FLSelectOption = { label: string; value: string };

interface FloatingLabelSelectProps {
  label: string;
  value: FLSelectOption | null;
  options: FLSelectOption[];
  onChange: (v: SingleValue<FLSelectOption>) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: () => string;
  error?: boolean;
  className?: string;
  isSearchable?: boolean;
}

const CONTROL_HEIGHT = 58; // your updated height
const BORDER_RADIUS  = 8;
const PADDING_LEFT   = 16;
const PADDING_RIGHT  = 40; // chevron space
const PADDING_TOP    = 24; // room when label is floated
const PADDING_BOTTOM = 12;
const FONT_SIZE_PX   = 14; // small selected text
const LINE_HEIGHT_PX = 20;

const makeStyles = (error?: boolean): StylesConfig<FLSelectOption, false, GroupBase<FLSelectOption>> => ({
  control: (base, state) => ({
    ...base,
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#fafafa', // neutral-50
    borderColor: error ? '#f43f5e' : state.isFocused ? '#000000' : '#d4d4d4',
    boxShadow: 'none',
    ':hover': { borderColor: error ? '#f43f5e' : state.isFocused ? '#000000' : '#d4d4d4' },
    padding: 0,
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT,
    paddingTop: PADDING_TOP,
    paddingBottom: PADDING_BOTTOM,
  }),
  placeholder: (base) => ({
    ...base,
    opacity: 0, // label acts as placeholder
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#000000',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    color: '#262626',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    position: 'absolute',
    right: 0,
    top: 0,
    height: CONTROL_HEIGHT,
    paddingRight: 12,
    color: '#737373',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  clearIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    borderRadius: BORDER_RADIUS,
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    marginTop: 4,
  }),
  menuList: (base) => ({ ...base, padding: 8 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    padding: '10px 14px',
    backgroundColor: state.isSelected ? '#e5e5e5' : state.isFocused ? '#f5f5f5' : '#ffffff',
    color: '#000000',
    cursor: 'pointer',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
  }),
});

const classNames = {
  container: () => 'relative w-full',
  control: (state: any) =>
    [
      'bg-neutral-50 border rounded-lg transition outline-none',
      state.isFocused ? 'border-black' : 'border-neutral-300',
    ].join(' '),
};

const FloatingLabelSelect: React.FC<FloatingLabelSelectProps> = ({
  label,
  value,
  options,
  onChange,
  isLoading,
  isDisabled,
  noOptionsMessage,
  error,
  className,
  isSearchable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasValue = !!value;

  const styles = useMemo(() => makeStyles(error), [error]);
  const selectRef = useRef<SelectInstance<FLSelectOption, false, GroupBase<FLSelectOption>>>(null);

  const float = focused || hasValue; // position: above vs centered
  const sizeClass = focused ? 'text-xs' : 'text-sm'; // size: xs while focused, sm otherwise

  return (
    <div
      className={`relative ${className || ''}`}
      tabIndex={-1}
      onPointerDownCapture={() => {
        selectRef.current?.focus();
        if (!menuOpen) {
          // @ts-expect-error runtime method exists
          selectRef.current?.openMenu?.();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // @ts-expect-error runtime method exists
          selectRef.current?.openMenu?.();
        }
      }}
    >
      <Select<FLSelectOption, false, GroupBase<FLSelectOption>>
        ref={selectRef}
        classNamePrefix="fls"
        classNames={classNames as any}
        styles={styles}
        options={options}
        value={value}
        onChange={onChange}
        isLoading={isLoading}
        isDisabled={isDisabled}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        placeholder=" "
        noOptionsMessage={noOptionsMessage}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        openMenuOnClick
        openMenuOnFocus
        menuShouldScrollIntoView
        isSearchable={isSearchable}
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />

      {/* Centered by default; floats above while focused/has value.
          Size is xs when focused, sm otherwise (both empty+blurred and filled+blurred). */}
      <label
        className={[
          'absolute left-4 origin-[0] pointer-events-none transition-all duration-150',
          error ? 'text-rose-500' : 'text-neutral-500',
          sizeClass,
          float ? 'top-6 -translate-y-4' : 'top-1/2 -translate-y-1/2',
        ].join(' ')}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelSelect;
