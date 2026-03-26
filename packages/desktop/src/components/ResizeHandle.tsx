import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const startX = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startX.current = e.clientX;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX.current;
        startX.current = e.clientX;
        onResize(delta);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [onResize],
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'group relative z-10 w-1 cursor-col-resize hover:bg-primary-300 transition-colors',
        className,
      )}
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
