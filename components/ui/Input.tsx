import React from "react";

// Define input size type
type InputSize = 'sm' | 'md' | 'lg';
// Interface for input properties
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: InputSize;
    className?: string;
}

export function Input({
    size = 'md',
    className = '',
    ...props
}: InputProps) {
    const baseStyles = "w-full rounded bg-tertiary";
  
    const sizeStyles = {
        sm: "px-1 py-0.5 text-xs",
        md: "px-2 py-1 text-sm",
        lg: "px-3 py-1.5 text-base"
    };
    
    return (
        <input className={`${baseStyles} ${sizeStyles[size]} ${className}`} {...props}/>
  );
}