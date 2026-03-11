import React, { forwardRef } from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, iconPosition = 'left', fullWidth = false, className = '', ...props }, ref) => {
    const inputClasses = `
      bg-white/60 border border-[#D4C5B0]/40 rounded-lg px-4 py-2.5
      backdrop-blur-[10px] transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-[#D4C5B0]/50 focus:border-[#D4C5B0]/60
      placeholder:text-gray-400
      ${error ? 'border-red-500/60 focus:ring-red-500/50' : ''}
      ${icon && iconPosition === 'left' ? 'pl-11' : ''}
      ${icon && iconPosition === 'right' ? 'pr-11' : ''}
      ${fullWidth ? 'w-full' : ''}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              }`}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputClasses} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
