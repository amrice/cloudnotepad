import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/helpers';
import { forwardRef } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function Dropdown({ trigger, children, align = 'end' }: DropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          className={cn(
            'z-50 min-w-[160px]',
            'bg-white dark:bg-gray-800',
            'rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
            'p-1',
            'animate-fade-in'
          )}
          sideOffset={5}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ children, onClick, danger = false, disabled = false }, ref) => {
    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm',
          'rounded-md cursor-pointer',
          'outline-none',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          danger
            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

interface DropdownSubProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function DropdownSub({ trigger, children }: DropdownSubProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          className={cn(
            'z-50 min-w-[160px]',
            'bg-white dark:bg-gray-800',
            'rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
            'p-1',
            'animate-fade-in'
          )}
          sideOffset={-4}
          alignOffset={-5}
        >
          {children}
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
