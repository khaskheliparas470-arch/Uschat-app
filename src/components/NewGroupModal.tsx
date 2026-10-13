import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Users, ArrowRight, ArrowLeft, Check, Lock, Shield, Sparkles } from 'lucide-react';

export const NewGroupModal: React.FC = () => {
  const { showNewGroupModal, setShowNewGroupModal, allUsers, currentUser, createGroup } = useChat();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!showNewGroupModal) return null;

  const availableContacts = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery))
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (selectedUserIds.length === 0) return;
    setStep(2);
  };

  const handleCreate = async () => {
    if (!groupName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createGroup(
        groupName.trim(),
        groupDescription.trim() || 'UsChat encrypted group discussion',
        selectedUserIds
      );
      setShowNewGroupModal(false);
      setStep(1);
      setSelectedUserIds([]);
      setGroupName('');
      setGroupDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {step === 1 ? 'Add Group Members' : 'New Group Details'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1
                  ? `${selectedUserIds.length} of ${allUsers.length - 1} selected`
                  : 'End-to-End Encrypted Group'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewGroupModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select members */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {availableContacts.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {user.about}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                disabled={selectedUserIds.length === 0}
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name & Description */}
        {step === 2 && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="flex items-center justify-center py-2">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Users className="w-8 h-8" />
                </div>
                <div className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-600 text-white shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Group Subject / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Product Research, Core Engineering"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={45}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Group Description
              </label>
              <textarea
                placeholder="Describe group purpose, guidelines..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <Shield className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">Cryptographic Group Key Guarantee</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  A unique 256-bit AES-GCM group sender key will be minted. When participants leave or are removed, keys ratchet immediately.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!groupName.trim() || isSubmitting}
                onClick={handleCreate}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Minting Group Key...' : 'Create Encrypted Group'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
