import { useCallback, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { MessageList } from '@/components/MessageList';
import { MessageViewer } from '@/components/MessageViewer';
import { Composer } from '@/components/Composer';
import { ResizeHandle } from '@/components/ResizeHandle';
import { CalendarView } from '@/components/CalendarView';
import { TaskList } from '@/components/TaskList';
import { ContactList } from '@/components/ContactList';
import { KeyManager } from '@/components/KeyManager';
import { FilterManager } from '@/components/FilterManager';
import { SettingsDialog } from '@/components/SettingsView';
import { useEmailStore } from '@/stores/email-store';
import { useAppStore } from '@/stores/app-store';

function MailView() {
  const { listWidth, setListWidth } = useEmailStore();

  const handleListResize = useCallback(
    (delta: number) => setListWidth(listWidth + delta),
    [listWidth, setListWidth],
  );

  return (
    <div className="flex flex-1 min-h-0">
      <div style={{ width: listWidth }} className="shrink-0">
        <MessageList />
      </div>
      <ResizeHandle onResize={handleListResize} />
      <div className="flex-1 min-w-0">
        <MessageViewer />
      </div>
    </div>
  );
}

export function App() {
  const { sidebarWidth, setSidebarWidth, loadAccounts } = useEmailStore();
  const { currentView } = useAppStore();

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const handleSidebarResize = useCallback(
    (delta: number) => setSidebarWidth(sidebarWidth + delta),
    [sidebarWidth, setSidebarWidth],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <div style={{ width: sidebarWidth }} className="shrink-0">
          <Sidebar />
        </div>
        <ResizeHandle onResize={handleSidebarResize} />

        {currentView === 'mail' && <MailView />}
        {currentView === 'calendar' && (
          <div className="flex-1 min-w-0"><CalendarView /></div>
        )}
        {currentView === 'tasks' && (
          <div className="flex-1 min-w-0"><TaskList /></div>
        )}
        {currentView === 'contacts' && (
          <div className="flex-1 min-w-0"><ContactList /></div>
        )}
      </div>
      <Composer />
      <KeyManager />
      <SettingsDialog />
    </div>
  );
}
