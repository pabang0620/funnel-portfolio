import React from "react";
import "./Button.css";

const Button = ({ 
  children, 
  variant = "primary", 
  size = "medium", 
  onClick, 
  className = "",
  ...props 
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className}`.trim();

  return (
    <button className={buttonClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;