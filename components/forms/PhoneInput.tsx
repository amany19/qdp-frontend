'use client';

import React, { forwardRef } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { E164Number } from 'react-phone-number-input';

export interface PhoneInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  value?: E164Number | string;
  onChange?: (value: E164Number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      containerClassName = '',
      value,
      onChange,
      placeholder,
      disabled = false,
      defaultCountry = 'QA', // Qatar as default
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            {label}
          </label>
        )}
        <div className="relative phone-input-wrapper">
          <PhoneInputWithCountry
            international
            defaultCountry={defaultCountry as any}
            value={value as E164Number}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full
              ${error ? 'phone-input-error' : ''}
            `}
            numberInputProps={{
              className: `
                w-full px-4 py-3 rounded-lg
                bg-gray-50 border border-gray-200
                text-gray-900 placeholder:text-gray-400
                text-right
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? 'border-error-500 focus:ring-error-500' : ''}
              `,
              ref: ref as any,
            }}
            countrySelectProps={{
              className: 'country-select',
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500 text-right">{error}</p>
        )}
        <style jsx global>{`
          .phone-input-wrapper {
            direction: ltr;
          }

          .phone-input-wrapper .PhoneInput {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .phone-input-wrapper .PhoneInputCountry {
            display: flex;
            align-items: center;
            padding: 12px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .phone-input-wrapper .PhoneInputCountry:hover {
            background-color: #f3f4f6;
          }

          .phone-input-wrapper .PhoneInputCountryIcon {
            width: 24px;
            height: 24px;
            margin-right: 4px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .phone-input-wrapper .PhoneInputCountrySelect {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }

          .phone-input-wrapper .PhoneInputCountrySelectArrow {
            display: block;
            width: 0.3em;
            height: 0.3em;
            margin-left: 0.35em;
            border-style: solid;
            border-color: #6b7280;
            border-top-width: 0;
            border-bottom-width: 1px;
            border-left-width: 0;
            border-right-width: 1px;
            transform: rotate(45deg);
            opacity: 0.7;
          }

          .phone-input-wrapper input[type="tel"] {
            flex: 1;
          }

          .phone-input-wrapper.phone-input-error .PhoneInputCountry {
            border-color: #ef4444;
          }

          .phone-input-wrapper .PhoneInputCountry:focus-within {
            outline: none;
            ring: 2px;
            ring-color: #3b82f6;
            border-color: transparent;
          }
        `}</style>
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
