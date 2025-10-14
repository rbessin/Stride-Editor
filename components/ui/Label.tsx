import React from 'react';

type LabelVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type LabelSize = 'sm' | 'md' | 'lg';

interface LabelProps {
  children: React.ReactNode;
  variant?: LabelVariant;
  size?: LabelSize;
  className?: string;
}

export function Label({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}: LabelProps) {
  const baseStyles = "inline-flex items-center rounded font-medium";
  
  const sizeStyles = {
    sm: "px-1 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };
  
  const variantStyles = {
    default: "bg-tertiary text-foreground",
    primary: "bg-primary text-foreground",
    success: "bg-success text-foreground",
    warning: "bg-warning text-foreground",
    danger: "bg-danger text-foreground",
    info: "bg-info text-foreground"
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}