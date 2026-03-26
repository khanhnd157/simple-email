import { useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const startX = useRef(0);
  const onResizeRef = useRef(onResize);
  const dragging = useRef(false);

  useEffect(() => {
    onResizeRef.current = onResize;
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    dragging.current = true;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      if (delta !== 0) {
        startX.current = ev.clientX;
        onResizeRef.current(delta);
      }
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'group relative z-10 w-px cursor-col-resize transition-colors hover:bg-primary-400 dark:hover:bg-primary-500',
        className,
      )}
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
