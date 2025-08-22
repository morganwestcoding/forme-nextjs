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
const BORDER_RADIUS = 8;
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
    backgroundColor: '#fafafa',
    borderColor: error ? '#f43f5e' : state.isFocused ? '#000000' : '#d4d4d4',
    boxShadow: 'none',
    ':hover': {
      borderColor: error ? '#f43f5e' : state.isFocused ? '#000000' : '#d4d4d4',
    },
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
    opacity: 0,
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
    border: '1px solid #e5e5e5', // ✅ fixed string
    overflow: 'hidden',
    marginTop: 4,
  }),
  menuList: (base) => ({ ...base, padding: 8 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    padding: '10px 14px',
    backgroundColor: state.isSelected
      ? '#e5e5e5'
      : state.isFocused
      ? '#f5f5f5'
      : '#ffffff',
    color: '#000000',
    cursor: 'pointer',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
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

  // Floating-label behavior
  const labelFloated = focused || hasValue;
  const labelSize = focused ? 'text-xs' : 'text-sm';
  const labelPos = labelFloated ? 'top-6 -translate-y-4' : 'top-1/2 -translate-y-1/2';

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
          error ? 'text-rose-500' : 'text-neutral-500',
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
