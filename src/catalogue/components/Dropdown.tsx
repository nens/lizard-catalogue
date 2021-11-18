import React from 'react';
import Select, { createFilter } from 'react-select';

export type Value = {
  value: string | number,
  label: string,
  [key: string]: string | number | JSX.Element
};

interface MyProps {
  placeholder: string,
  options: Value[],
  value: Value | null,
  onChange: (value: Value | null) => void,
  dropUp?: boolean,
};

export const convertToSelectObject = (
  value: string | number,
  label?: string,
  initialObject?: object
) => {
  return {
    value,
    label: label || value+'',
    ...initialObject
  };
};

export const Dropdown = (props: MyProps) => {
  const {
    placeholder,
    options,
    value,
    onChange,
    dropUp,
  } = props;

  return (
    <Select
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={option => onChange(option)}
      isClearable={true}
      isSearchable={true}
      menuPlacement={dropUp ? 'top' : undefined}
      styles={{
        menu: (styles) => ({
          ...styles,
          zIndex: 1000
        })
      }}
      filterOption={createFilter({ ignoreAccents: false })}
    />
  );
}