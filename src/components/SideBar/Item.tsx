import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface ItemProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  onIconClick?: (event: React.MouseEvent) => void;
  isActive?: boolean;
  trailingItem?: React.ReactElement;
}

export const Item = forwardRef<HTMLDivElement, ItemProps>(({
  label,
  onClick,
  onIconClick,
  icon: Icon,
  isActive = false,
  trailingItem,
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'group min-h-[27px] text-sm py-1 pr-3 w-full flex items-center text-muted-foreground font-medium',
        isActive && 'bg-neutral-200'
      )}
      onClick={onClick}
      role="button"
      style={{ paddingLeft: '12px' }}
    >
      <Icon
        onClick={onIconClick}
        className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground"
      />
      <span className="truncate">{label}</span>
      {trailingItem}
    </div>
  );
});

Item.displayName = 'Item';