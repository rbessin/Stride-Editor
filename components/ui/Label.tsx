import React from 'react';

type LabelVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type LabelSize = 'xs' | 'sm' | 'md';

interface LabelProps {
  children: React.ReactNode;
  variant?: LabelVariant;
  size?: LabelSize;
  className?: string;
}

export function Label({ 
  children, 
  variant = 'default',
  size = 'sm',
  className = ''
}: LabelProps) {
  const baseStyles = "inline-flex items-center rounded font-medium";
  
  const sizeStyles = {
    xs: "px-1 py-0.5 text-xs",
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-1.5 text-base"
  };
  
  const variantStyles = {
    default: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    primary: "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200",
    info: "bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-200"
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}