'use client';

import React from 'react';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';

export interface PhoneInputWithCountryCodeProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  phoneValue: string;
  countryCode: string;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PhoneInputWithCountryCode: React.FC<PhoneInputWithCountryCodeProps> = ({
  label,
  error,
  containerClassName = '',
  phoneValue,
  countryCode,
  onPhoneChange,
  onCountryCodeChange,
  placeholder = 'أدخل رقم الهاتف',
  disabled = false,
}) => {
  const countries = getCountries();

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
          {label}
        </label>
      )}
      <div className="flex gap-2" dir="ltr">
        {/* Country Code Selector */}
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          className={`
            px-3 py-3 rounded-lg
            bg-gray-50 border border-gray-200
            text-gray-900
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error-500 focus:ring-error-500' : ''}
            min-w-[120px]
          `}
        >
          {countries.map((country) => {
            const callingCode = getCountryCallingCode(country);
            const countryName = en[country] || country;
            return (
              <option key={country} value={country}>
                {countryName} (+{callingCode})
              </option>
            );
          })}
        </select>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneValue}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 px-4 py-3 rounded-lg
            bg-gray-50 border border-gray-200
            text-gray-900 placeholder:text-gray-400
            text-right
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error-500 focus:ring-error-500' : ''}
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-500 text-right">{error}</p>
      )}
    </div>
  );
};
