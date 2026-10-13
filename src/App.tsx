import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { StatusView } from './components/StatusView';
import { CallsView } from './components/CallsView';
import { GroupInfoDrawer } from './components/GroupInfoDrawer';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { EncryptionInspectorModal } from './components/EncryptionInspectorModal';
import { CallScreenModal } from './components/CallScreenModal';
import { NewGroupModal } from './components/NewGroupModal';
import { NewChatModal } from './components/NewChatModal';
import { ArrowLeft, Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeChatId,
    setActiveChatId,
    activeTab,
  } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased select-none">
      {/* Sidebar: Visible on desktop, or mobile when no chat is open or when on status/calls tab */}
      <div
        className={`${
          activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto h-full z-10 shrink-0`}
      >
        <Sidebar />
      </div>

      {/* Main View Area: Either ChatArea, StatusView, or CallsView */}
      <div
        className={`${
          !activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } flex-1 h-full flex-col relative overflow-hidden`}
      >
        {/* Mobile top back bar if in active chat */}
        {activeChatId && activeTab === 'chats' && (
          <div className="md:hidden h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-3 z-30 shrink-0">
            <button
              onClick={() => setActiveChatId(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1 px-2 rounded-lg active:bg-slate-100 dark:active:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chats</span>
            </button>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'chats' && <ChatArea />}
        {activeTab === 'status' && <StatusView />}
        {activeTab === 'calls' && <CallsView />}

        {/* Side Panel Drawer for Group Info & Settings */}
        <GroupInfoDrawer />
      </div>

      {/* Global Modals */}
      <SafetyNumberModal />
      <EncryptionInspectorModal />
      <CallScreenModal />
      <NewGroupModal />
      <NewChatModal />
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
}
