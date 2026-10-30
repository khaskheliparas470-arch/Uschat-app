import React from 'react';
import { useChat } from '../context/ChatContext';
import { Lock, X, Key, Shield, Hash, FileCode } from 'lucide-react';
import { base64ToUint8, bufferToHex } from '../crypto/encryption';

export const EncryptionInspectorModal: React.FC = () => {
  const { inspectingMessage, setInspectingMessage } = useChat();

  if (!inspectingMessage) return null;

  const { encryptedPayload, plaintext, senderName, timestamp } = inspectingMessage;
  
  let hexCiphertext = 'N/A';
  let hexIv = 'N/A';

  try {
    if (encryptedPayload?.ciphertext) {
      hexCiphertext = bufferToHex(base64ToUint8(encryptedPayload.ciphertext));
    }
    if (encryptedPayload?.iv) {
      hexIv = bufferToHex(base64ToUint8(encryptedPayload.iv));
    }
  } catch {
    hexCiphertext = 'Error decoding hex payload';
    hexIv = 'Error decoding IV';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                Cryptographic Payload Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AES-256-GCM End-to-End Encrypted Message
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectingMessage(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
            <span>Sender: <strong className="text-slate-800 dark:text-slate-200">{senderName || 'Anonymous'}</strong></span>
            <span>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Just now'}</span>
          </div>

          {/* Plaintext view */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Decrypted Plaintext (Client Side View)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm break-words shadow-xs">
              {plaintext || 'No message content'}
            </div>
          </div>

          {/* Ciphertext Base64 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ciphertext (Base64 Over The Wire)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {encryptedPayload?.ciphertext?.length || 0} chars
              </span>
            </div>
            <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto break-all leading-relaxed shadow-inner border border-slate-800">
              {encryptedPayload?.ciphertext || 'No active ciphertext'}
            </div>
          </div>

          {/* Ciphertext Hex */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Hash className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ciphertext Raw Hex Dump</span>
            </div>
            <div className="p-2.5 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-2xl overflow-x-auto break-all leading-normal max-h-24 border border-slate-800 shadow-inner">
              {hexCiphertext}
            </div>
          </div>

          {/* Initialization Vector & Key Fingerprint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                <span>IV (Nonce - 96 bit)</span>
              </div>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px] break-all">
                {hexIv}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Algorithm & MAC</span>
              </div>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                {encryptedPayload?.algo || 'AES-GCM-256'} · AuthTag
              </p>
            </div>
          </div>

          {/* Cryptographic explanation */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 leading-relaxed font-medium">
            In UsChat, messages are encrypted directly inside your browser before transmission. Relays and network observers only see randomized cipher bytes with zero access to plaintext contents or keys.
          </p>

        </div>
      </div>
    </div>
  );
};
