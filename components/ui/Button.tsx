import React from 'react';

// CHANGE: Added 'success', 'warning', and 'info' to ButtonVariant type
type ButtonVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}

interface IconButtonProps extends BaseButtonProps {
  icon: React.ComponentType<{ className?: string }>;
}

interface TextButtonProps extends BaseButtonProps {
  children: React.ReactNode;
}

// Icon Button
export function IconButton({ 
  icon: Icon, 
  onClick, 
  variant = 'default',
  size = 'md',
  disabled = false,
  className = ''
}: IconButtonProps) {
  const baseStyles = "flex items-center gap-1 rounded active:ring-1 transition-colors";
  
  const sizeStyles = {
    sm: "px-1 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const variantStyles = {
    default: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500",
    primary: "bg-primary text-foreground hover:opacity-90 active:opacity-80",
    success: "bg-success text-white hover:opacity-90 active:opacity-80",
    warning: "bg-warning text-white hover:opacity-90 active:opacity-80",
    danger: "bg-danger text-white hover:opacity-90 active:opacity-80",
    info: "bg-info text-white hover:opacity-90 active:opacity-80"
  };
  
  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}

// Text Button
export function TextButton({ 
  children,
  onClick, 
  variant = 'default',
  size = 'md',
  disabled = false,
  className = ''
}: TextButtonProps) {
  const baseStyles = "rounded active:ring-1 transition-colors";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  const variantStyles = {
    default: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500",
    primary: "bg-primary text-foreground hover:opacity-90 active:opacity-80",
    success: "bg-success text-white hover:opacity-90 active:opacity-80",
    warning: "bg-warning text-white hover:opacity-90 active:opacity-80",
    danger: "bg-danger text-white hover:opacity-90 active:opacity-80",
    info: "bg-info text-white hover:opacity-90 active:opacity-80"
  };
  
  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {children}
    </button>
  );
}