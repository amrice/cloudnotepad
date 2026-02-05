import { cn } from '@/utils/helpers';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 dark:bg-gray-700',
        'flex items-center justify-center',
        'text-gray-600 dark:text-gray-300',
        sizeClasses[size],
        className
      )}
    >
      <User className={cn(size === 'sm' && 'w-3 h-3', size === 'md' && 'w-4 h-4', size === 'lg' && 'w-5 h-5')} />
    </div>
  );
}
