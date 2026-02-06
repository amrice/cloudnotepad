import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

const sizeStyles = {
  sm: 'h-9 px-3 py-2 text-sm',
  md: 'h-11 px-4 py-2.5 text-base',
  lg: 'h-13 px-4 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = 'md',
      label,
      helperText,
      error,
      prefixIcon,
      suffixIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border transition-all duration-150',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20',
              disabled && 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed',
              prefixIcon && 'pl-10',
              suffixIcon && 'pr-10',
              sizeStyles[size],
              className
            )}
            disabled={disabled}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {suffixIcon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p className={cn(
            'mt-1.5 text-sm',
            hasError ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
