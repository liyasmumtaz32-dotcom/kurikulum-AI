import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  icon,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-transparent",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600",
    accent: "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20 border border-transparent",
    outline: "bg-transparent border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon}
      {children}
    </button>
  );
};