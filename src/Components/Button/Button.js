import React from "react";
import "./Button.css";

export default function Button({
  disabled = false,
  icon,
  label,
  onClick,
  isLoading,
  className,
  type = "button",
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`button ${className}`}
      title={label}
      type={type}
    >
      <div className="icon">
        {isLoading ? (
          <div className="loader loader-spin">
            <i className="fi fi-rr-loading"></i>
          </div>
        ) : (
          <i className={icon}></i>
        )}
      </div>
      <div className="text">{label}</div>
    </button>
  );
}
