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
import { ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeChatId,
    setActiveChatId,
    activeTab,
  } = useChat();

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased select-none">
      {/* Sidebar: Visible on desktop, or mobile when no chat is active */}
      <div
        className={`${
          activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full z-10 shrink-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={`${
          !activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } flex-1 h-full flex-col relative overflow-hidden bg-slate-950`}
      >
        {/* Mobile Back Button Bar for Active Chat */}
        {activeChatId && activeTab === 'chats' && (
          <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 z-30 shrink-0">
            <button
              onClick={() => setActiveChatId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 py-1.5 px-3 rounded-lg bg-emerald-500/10 active:bg-emerald-500/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chats</span>
            </button>
          </div>
        )}

        {/* Dynamic View Switcher */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {activeTab === 'chats' && <ChatArea />}
          {activeTab === 'status' && <StatusView />}
          {activeTab === 'calls' && <CallsView />}
        </div>

        {/* Side Panel Drawer */}
        <GroupInfoDrawer />
      </div>

      {/* Global Application Modals */}
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
