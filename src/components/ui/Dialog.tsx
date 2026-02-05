import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-out'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed z-50',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md max-h-[85vh]',
            'bg-white dark:bg-gray-800',
            'rounded-xl shadow-lg',
            'p-6',
            'focus:outline-none',
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-out',
            'overflow-auto'
          )}
        >
          {title && (
            <DialogPrimitive.Title className="text-lg font-semibold mb-1">
              {title}
            </DialogPrimitive.Title>
          )}
          {description && (
            <DialogPrimitive.Description className="text-sm text-gray-500 mb-4">
              {description}
            </DialogPrimitive.Description>
          )}
          {children}
          <DialogPrimitive.Close asChild>
            <button
              className={cn(
                'absolute right-4 top-4',
                'p-1 rounded-lg',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors'
              )}
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
