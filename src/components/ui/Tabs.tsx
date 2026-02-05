import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/utils/helpers';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} className={cn('flex flex-col', className)}>
      {children}
    </TabsPrimitive.Root>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex gap-1 p-1',
        'bg-gray-100 dark:bg-gray-800',
        'rounded-lg',
        className
      )}
    >
      {children}
    </TabsPrimitive.List>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'px-4 py-2 text-sm font-medium',
        'rounded-md',
        'transition-all',
        'focus:outline-none',
        'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
        'data-[state=active]:shadow-sm',
        'data-[state=active]:text-primary',
        'data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400',
        'hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={cn(
        'mt-4 focus:outline-none',
        'animate-fade-in',
        className
      )}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
