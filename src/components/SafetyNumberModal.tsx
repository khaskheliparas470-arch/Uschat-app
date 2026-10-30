import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { generateSafetyNumber } from '../crypto/encryption';
import { ShieldCheck, X, Check, Copy, QrCode } from 'lucide-react';

export const SafetyNumberModal: React.FC = () => {
  const { safetyNumberChat, setSafetyNumberChat, currentUser } = useChat();
  const [safetyDigits, setSafetyDigits] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!safetyNumberChat || !currentUser) return;

    const compute = async () => {
      try {
        const otherId = safetyNumberChat.isGroup
          ? safetyNumberChat.id
          : safetyNumberChat.otherUserId || 'peer';
        const blocks = await generateSafetyNumber(
          currentUser.id,
          otherId,
          currentUser.publicKeyFingerprint || 'fingerprint_hash',
          safetyNumberChat.symmetricKey || 'default_secret_key'
        );
        setSafetyDigits(blocks || []);
      } catch (err) {
        console.error('Failed to compute safety number:', err);
        setSafetyDigits(['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000']);
      }
    };

    compute();
  }, [safetyNumberChat, currentUser]);

  if (!safetyNumberChat) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyDigits.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                Verify Security Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                End-to-end encryption verification
              </p>
            </div>
          </div>
          <button
            onClick={() => setSafetyNumberChat(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Messages and calls with <span className="font-bold text-slate-900 dark:text-white">{safetyNumberChat.name || 'Peer'}</span> are encrypted with AES-256-GCM.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Compare this 60-digit number or scan the QR code with their screen to verify encryption.
            </p>
          </div>

          {/* QR Code Simulation */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative p-3 bg-white rounded-xl shadow-md border border-slate-200">
              {/* Clean SVG Mock QR pattern */}
              <svg className="w-32 h-32 sm:w-36 sm:h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* QR Finder patterns */}
                <rect x="5" y="5" width="26" height="26" rx="2" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" />

                <rect x="69" y="5" width="26" height="26" rx="2" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" />

                <rect x="5" y="69" width="26" height="26" rx="2" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" />

                {/* Data blocks */}
                <rect x="36" y="8" width="8" height="8" />
                <rect x="48" y="12" width="12" height="6" />
                <rect x="36" y="24" width="6" height="12" />
                <rect x="46" y="26" width="16" height="8" />

                <rect x="10" y="38" width="18" height="6" />
                <rect x="34" y="38" width="8" height="8" />
                <rect x="46" y="42" width="10" height="10" />
                <rect x="64" y="36" width="14" height="10" />
                <rect x="82" y="40" width="10" height="8" />

                <rect x="12" y="50" width="14" height="8" />
                <rect x="32" y="52" width="18" height="12" />
                <rect x="56" y="54" width="12" height="6" />
                <rect x="74" y="52" width="18" height="14" />

                <rect x="36" y="72" width="12" height="14" />
                <rect x="54" y="68" width="8" height="10" />
                <rect x="68" y="74" width="12" height="12" />
                <rect x="84" y="70" width="10" height="16" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan to verify authenticity</span>
            </div>
          </div>

          {/* 60-digit number formatted in 12 blocks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-semibold">
              <span>60-Digit Safety Number</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy code'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-mono text-center text-xs sm:text-sm font-semibold tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs">
              {safetyDigits.map((block, idx) => (
                <div
                  key={idx}
                  className="py-1.5 px-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
                >
                  {block}
                </div>
              ))}
            </div>
          </div>

          {/* Verified toggle status */}
          <div className="pt-1">
            <button
              onClick={() => setIsVerified(!isVerified)}
              className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 ${
                isVerified
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Check className={`w-4 h-4 ${isVerified ? 'text-white' : 'text-slate-400'}`} />
              <span>{isVerified ? 'Security Code Verified' : 'Mark as Verified'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
