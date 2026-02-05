import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/helpers';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function Tooltip({ content, children, side = 'top', align = 'center' }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 px-2 py-1',
              'text-xs text-white',
              'bg-gray-900 dark:bg-gray-700',
              'rounded-md',
              'animate-fade-in',
              'max-w-[250px] break-words'
            )}
            sideOffset={5}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
