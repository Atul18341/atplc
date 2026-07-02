'use client';

import React, { ChangeEvent } from 'react';

// Define strict prop validations for the shared component input/textarea tree
interface InputProps {
  name: string;
  label: string;
  type: string;
  value: string | number;
  onChange: (e: any) => void; 
  // OR use a safe generic signature:
  // onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  icon?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Input({
  icon,
  name,
  onChange,
  value,
  autoComplete = 'on',
  label,
  type,
  placeholder = ' ', // Keeping space placeholder to maintain CSS/Tailwind pure :placeholder-shown state flags
  required = false,
  disabled = false,
  className = '',
}: InputProps) {

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e);
  };

  // Shared wrapper styles for positioning framework elements
  const containerClasses = `group relative w-full ${className}`.trim();

  // Shared base interactive element styling
  const baseFieldClasses = `
    w-full px-4 pt-6 pb-2 text-base text-slate-900 bg-slate-50 
    rounded-xl border border-slate-200 outline-none
    focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500
    disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
    transition-all duration-200 peer
    ${icon ? 'pr-12' : ''}
  `.trim();

  // Floating label transformation rules
  const labelClasses = `
    absolute text-sm font-medium text-slate-400 left-4 top-2
    pointer-events-none transition-all duration-200 origin-[0]
    peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-400
    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600
  `.trim();

  // Unified icon positioning template wrapper
  const renderIcon = () => {
    if (!icon) return null;
    return (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none transition-colors duration-200 peer-focus:text-blue-500">
        <i className={`${icon} text-lg block`}></i>
      </div>
    );
  };

  if (type === 'textarea') {
    return (
      <div className={containerClasses}>
        <textarea
          id={name}
          name={name}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          rows={3}
          className={`${baseFieldClasses} min-h-[5rem] resize-y`}
        />
        {renderIcon()}
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={baseFieldClasses}
      />
      {renderIcon()}
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>
    </div>
  );
}