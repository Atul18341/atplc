'use client';

import React, { ComponentPropsWithoutRef } from "react";

// Explicitly define the types for the Button component's props
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  label: string;
  icon?: string;
  isLoading?: boolean;
}

export default function Button({
  disabled = false,
  icon,
  label,
  onClick,
  isLoading = false,
  className = "",
  type = "button",
  ...props // Capture any additional native button attributes (like aria tags)
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        group flex items-center justify-center gap-2 px-5 py-2.5 
        text-sm font-semibold tracking-wide rounded-xl border border-transparent
        bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 shadow-sm
        ${className}
      `.trim()}
      title={label}
      type={type}
      {...props}
    >
      {/* Icon or Loading Spinner Wrapper */}
      <div className="flex items-center justify-center min-w-[1.25rem] min-h-[1.25rem]">
        {isLoading ? (
          <div className="animate-spin text-inherit">
            {/* If your flaticon package uses CSS transitions for animations, 'animate-spin' applies standard 360deg rotation flawlessly */}
            <i className="fi fi-rr-loading block"></i>
          </div>
        ) : (
          icon && <i className={`${icon} block text-inherit`}></i>
        )}
      </div>

      {/* Button Text Label */}
      <span className="text-sm font-medium leading-none">{label}</span>
    </button>
  );
}