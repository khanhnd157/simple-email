import { useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Repeat,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths,
  addWeeks, startOfDay, eachHourOfInterval, set as dateSet,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { CalendarEvent } from '@/lib/mock-data-phase3';

function EventChip({ event, compact }: { event: CalendarEvent; compact?: boolean }) {
  return (
    <div
      className={cn(
        'truncate rounded px-1.5 text-xs text-white cursor-pointer hover:opacity-80',
        compact ? 'py-0' : 'py-0.5',
      )}
      style={{ backgroundColor: event.color }}
      title={`${event.title} ${event.location ? '@ ' + event.location : ''}`}
    >
      {!event.allDay && !compact && (
        <span className="mr-1 opacity-75">{format(event.start, 'HH:mm')}</span>
      )}
      {event.title}
    </div>
  );
}

function MonthView() {
  const { selectedDate, calendarEvents, setSelectedDate, openEventDialog } = useAppStore();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of calendarEvents) {
      const key = format(ev.start, 'yyyy-MM-dd');
      const list = map.get(key) || [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [calendarEvents]);

  return (
    <div className="flex flex-col h-full dark:bg-navy-950">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-navy-800 dark:bg-navy-900">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 dark:text-navy-400">
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const events = eventsByDay.get(key) || [];
          const inMonth = isSameMonth(day, selectedDate);
          return (
            <div
              key={key}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'border-b border-r border-gray-100 dark:border-navy-800 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-850 min-h-0 overflow-hidden',
                !inMonth && 'bg-gray-50/50 dark:bg-navy-900/50',
              )}
            >
              <div className={cn(
                'mb-0.5 text-xs font-medium',
                isToday(day)
                  ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white'
                  : inMonth
                    ? 'text-gray-700 dark:text-navy-200'
                    : 'text-gray-300 dark:text-navy-400',
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {events.slice(0, 3).map((ev) => (
                  <EventChip key={ev.id} event={ev} compact />
                ))}
                {events.length > 3 && (
                  <div className="text-[10px] text-gray-400 dark:text-navy-400 pl-1">+{events.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView() {
  const { selectedDate, calendarEvents } = useAppStore();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of calendarEvents) {
      const key = format(ev.start, 'yyyy-MM-dd');
      const list = map.get(key) || [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [calendarEvents]);

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin dark:bg-navy-950">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800 z-10">
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className={cn(
            'py-2 text-center border-l border-gray-100 dark:border-navy-800',
            isToday(d) && 'bg-primary-50 dark:bg-navy-850',
          )}>
            <div className="text-xs text-gray-400 dark:text-navy-400">{format(d, 'EEE')}</div>
            <div className={cn(
              'text-sm font-semibold',
              isToday(d) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-navy-100',
            )}>
              {format(d, 'd')}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 dark:bg-navy-950">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] h-14 border-b border-gray-50 dark:border-navy-800">
            <div className="pr-2 text-right text-[10px] text-gray-300 dark:text-navy-400 -mt-1.5">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const events = (eventsByDay.get(key) || []).filter(
                (ev) => !ev.allDay && ev.start.getHours() === hour,
              );
              return (
                <div key={key + hour} className="border-l border-gray-100 dark:border-navy-800 relative px-0.5">
                  {events.map((ev) => (
                    <EventChip key={ev.id} event={ev} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarView() {
  const {
    selectedDate, setSelectedDate, calendarView, setCalendarView, openEventDialog,
  } = useAppStore();

  const navigateBack = () => {
    setSelectedDate(calendarView === 'month'
      ? addMonths(selectedDate, -1)
      : addWeeks(selectedDate, -1));
  };
  const navigateForward = () => {
    setSelectedDate(calendarView === 'month'
      ? addMonths(selectedDate, 1)
      : addWeeks(selectedDate, 1));
  };

  return (
    <div className="flex h-full flex-col dark:bg-navy-950">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-navy-800 dark:bg-navy-900 px-4 py-2.5">
        <button onClick={() => openEventDialog()}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          <Plus size={15} /> New Event
        </button>
        <div className="flex items-center gap-1">
          <button onClick={navigateBack} className="rounded p-1 text-gray-700 dark:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-850"><ChevronLeft size={18} /></button>
          <button onClick={() => setSelectedDate(new Date())} className="rounded px-2 py-0.5 text-sm font-medium text-gray-800 dark:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-850">Today</button>
          <button onClick={navigateForward} className="rounded p-1 text-gray-700 dark:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-850"><ChevronRight size={18} /></button>
        </div>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">
          {format(selectedDate, calendarView === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
        </h2>
        <div className="ml-auto flex rounded-lg border border-gray-200 dark:border-navy-800 overflow-hidden dark:bg-navy-850">
          {(['month', 'week'] as const).map((v) => (
            <button key={v} onClick={() => setCalendarView(v)}
              className={cn(
                'px-3 py-1 text-xs font-medium capitalize',
                calendarView === v
                  ? 'bg-primary-50 text-primary-700 dark:bg-navy-800 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-navy-400 dark:hover:bg-navy-850',
              )}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {calendarView === 'month' ? <MonthView /> : <WeekView />}
      </div>
    </div>
  );
}
