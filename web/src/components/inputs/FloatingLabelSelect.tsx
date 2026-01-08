'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select, {
  GroupBase,
  SingleValue,
  StylesConfig,
  components as RSComponents,
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
  /** Accept either react-select’s signature or a simple function */
  noOptionsMessage?: (obj?: any) => string;
  error?: boolean;
  className?: string;
  isSearchable?: boolean;

  /** Helps avoid browser autofill collisions */
  name?: string;
  inputId?: string;

  /** Clear the internal search box when opening/closing/selecting (default true) */
  clearSearchOnOpen?: boolean;
}

const CONTROL_HEIGHT = 58;
const BORDER_RADIUS = 12;
const PADDING_LEFT = 16;
const PADDING_RIGHT = 40;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 12;
const FONT_SIZE_PX = 14;
const LINE_HEIGHT_PX = 20;

const makeStyles = (
  error?: boolean
): StylesConfig<FLSelectOption, false, GroupBase<FLSelectOption>> => ({
  control: (base, state) => ({
    ...base,
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#ffffff',
    borderColor: error
      ? '#fb7185'
      : state.isFocused
        ? '#60A5FA'
        : 'rgba(229, 231, 235, 0.6)',
    borderWidth: '1px',
    boxShadow: error
      ? state.isFocused
        ? '0 0 0 2px rgba(251, 113, 133, 0.1)'
        : 'none'
      : state.isFocused
        ? '0 0 0 2px rgba(96, 165, 250, 0.1)'
        : 'none',
    ':hover': {
      borderColor: error
        ? '#fb7185'
        : state.isFocused
          ? '#60A5FA'
          : '#d1d5db',
    },
    padding: 0,
    cursor: 'pointer',
    transition: 'all 200ms ease',
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
    opacity: 0,
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#374151',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    color: '#374151',
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
    color: '#9ca3af',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  clearIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    borderRadius: BORDER_RADIUS,
    border: '1px solid rgba(229, 231, 235, 0.6)',
    overflow: 'hidden',
    marginTop: 8,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
  }),
  menuList: (base) => ({ ...base, padding: 6 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    padding: '10px 14px',
    margin: '2px 0',
    backgroundColor: state.isSelected
      ? 'rgba(96, 165, 250, 0.1)'
      : state.isFocused
        ? '#f9fafb'
        : '#ffffff',
    color: state.isSelected ? '#60A5FA' : '#374151',
    cursor: 'pointer',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    transition: 'all 200ms ease',
    fontWeight: state.isSelected ? '500' : '400',
  }),
});

/** Custom Input to discourage Chrome autofill injecting stray text */
const AutoCompleteOffInput = (props: any) => (
  <RSComponents.Input {...props} autoComplete="new-password" />
);

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
  name,
  inputId,
  clearSearchOnOpen = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasValue = !!value;

  // Control the internal react-select search box to prevent ghost text (e.g., "ron")
  const [inputValue, setInputValue] = useState('');

  const styles = useMemo(() => makeStyles(error), [error]);
  const selectRef =
    useRef<SelectInstance<FLSelectOption, false, GroupBase<FLSelectOption>>>(null);

  // Floating-label behavior (should float when focused, has value, menu is open, OR there's an error)
  const labelFloated = focused || hasValue || menuOpen || error;
  const labelSize = labelFloated ? 'text-xs scale-75' : 'text-sm scale-100';
  const labelPos = labelFloated ? 'top-5 -translate-y-4' : 'top-1/2 -translate-y-1/2';

  // Unified “open” behavior anywhere on the control wrapper
  const openMenu = () => {
    // @ts-expect-error runtime method exists in react-select
    selectRef.current?.openMenu?.();
    selectRef.current?.focus();
  };

  // Clear the search box when menu closes to avoid leftover text
  useEffect(() => {
    if (!menuOpen && inputValue) setInputValue('');
  }, [menuOpen, inputValue]);

  return (
    <div
      className={`relative cursor-pointer ${className || ''}`}
      tabIndex={-1}
      onPointerDownCapture={(e) => {
        e.preventDefault();
        openMenu();
      }}
      onMouseDownCapture={(e) => {
        e.preventDefault();
        openMenu();
      }}
      onTouchStartCapture={(e) => {
        e.preventDefault();
        openMenu();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMenu();
        }
      }}
    >
      <Select<FLSelectOption, false, GroupBase<FLSelectOption>>
        ref={selectRef}
        classNamePrefix="fls"
        styles={styles}
        options={options}
        value={value}
        onChange={(opt) => {
          onChange(opt);
          if (clearSearchOnOpen) setInputValue('');
        }}
        isLoading={isLoading}
        isDisabled={isDisabled}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        placeholder=" "
        noOptionsMessage={noOptionsMessage}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMenuOpen={() => {
          setMenuOpen(true);
          if (clearSearchOnOpen) setInputValue('');
        }}
        onMenuClose={() => {
          setMenuOpen(false);
          if (clearSearchOnOpen) setInputValue('');
        }}
        openMenuOnClick
        openMenuOnFocus
        menuShouldScrollIntoView
        isSearchable={isSearchable}
        /** Keep the search box controlled to block autofill “ghost” values */
        inputValue={inputValue}
        onInputChange={(val, meta) => {
          if (meta.action === 'input-change') setInputValue(val);
          if (meta.action === 'menu-close' && clearSearchOnOpen) setInputValue('');
          return val;
        }}
        /** Reduce browser autofill & make distinct per field */
        name={name || 'fls-select'}
        inputId={inputId}
        components={{ Input: AutoCompleteOffInput }}
        /** Render menu to body to avoid clipping inside modals */
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />

      <label
        className={[
          'absolute left-4 origin-[0] pointer-events-none transition-all duration-150',
          error ? 'text-rose-500' : 'text-gray-500',
          labelSize,
          labelPos,
        ].join(' ')}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelSelect;
