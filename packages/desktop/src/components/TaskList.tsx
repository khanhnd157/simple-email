import { useState } from 'react';
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar, Flag, ListTodo,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { Task } from '@/lib/mock-data-phase3';

const PRIORITY_STYLES = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-gray-400',
};

function TaskRow({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useAppStore();
  const overdue = task.dueDate && isPast(task.dueDate) && !task.completed && !isToday(task.dueDate);

  return (
    <div className={cn(
      'group flex items-start gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors',
      task.completed && 'opacity-50',
    )}>
      <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
        {task.completed
          ? <CheckCircle2 size={20} className="text-green-500" />
          : <Circle size={20} className="text-gray-300 hover:text-gray-400" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          task.completed ? 'line-through text-gray-400' : 'text-gray-800',
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{task.description}</p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs">
          {task.dueDate && (
            <span className={cn('flex items-center gap-1', overdue ? 'text-red-500' : 'text-gray-400')}>
              <Calendar size={11} />
              {isToday(task.dueDate) ? 'Today' : format(task.dueDate, 'MMM d')}
            </span>
          )}
          <span className={cn('flex items-center gap-1', PRIORITY_STYLES[task.priority])}>
            <Flag size={11} /> {task.priority}
          </span>
          <span className="text-gray-300">{task.list}</span>
        </div>
      </div>
      <button
        onClick={() => deleteTask(task.id)}
        className="shrink-0 rounded p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function TaskList() {
  const { tasks, taskFilter, setTaskFilter, addTask } = useAppStore();
  const [newTitle, setNewTitle] = useState('');

  const filtered = tasks.filter((t) => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const prio = { high: 0, medium: 1, low: 2 };
    return prio[a.priority] - prio[b.priority];
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      description: '',
      completed: false,
      priority: 'medium',
      list: 'Work',
      createdAt: new Date(),
    });
    setNewTitle('');
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5">
        <ListTodo size={20} className="text-primary-600" />
        <h2 className="text-sm font-semibold text-gray-800">Tasks</h2>
        <div className="ml-auto flex rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button key={f} onClick={() => setTaskFilter(f)}
              className={cn(
                'px-3 py-1 text-xs font-medium capitalize',
                taskFilter === f ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50',
              )}>
              {f} {f === 'all' ? `(${stats.total})` : f === 'active' ? `(${stats.active})` : `(${stats.completed})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2">
        <Plus size={16} className="text-gray-400" />
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <CheckCircle2 size={40} strokeWidth={1} />
            <p className="mt-2 text-sm">No tasks</p>
          </div>
        ) : (
          filtered.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}
