import React from 'react';
import { useChat } from '../context/ChatContext';
import { Lock, X, Key, Shield, Hash, FileCode } from 'lucide-react';
import { base64ToUint8, bufferToHex } from '../crypto/encryption';

export const EncryptionInspectorModal: React.FC = () => {
  const { inspectingMessage, setInspectingMessage } = useChat();

  if (!inspectingMessage) return null;

  const { encryptedPayload, plaintext, senderName, timestamp } = inspectingMessage;
  let hexCiphertext = '';
  let hexIv = '';

  try {
    hexCiphertext = bufferToHex(base64ToUint8(encryptedPayload.ciphertext));
    hexIv = bufferToHex(base64ToUint8(encryptedPayload.iv));
  } catch {
    hexCiphertext = 'N/A';
    hexIv = 'N/A';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Cryptographic Payload Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AES-256-GCM End-to-End Encrypted Message
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectingMessage(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Metadata pill-free row */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <span>Sender: <strong className="text-slate-800 dark:text-slate-200">{senderName}</strong></span>
            <span>{new Date(timestamp).toLocaleTimeString()}</span>
          </div>

          {/* Plaintext view */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Decrypted Plaintext (Client Side View)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm break-words">
              {plaintext}
            </div>
          </div>

          {/* Ciphertext Base64 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ciphertext (Base64 Over The Wire)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {encryptedPayload.ciphertext.length} chars
              </span>
            </div>
            <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto break-all leading-relaxed shadow-inner">
              {encryptedPayload.ciphertext}
            </div>
          </div>

          {/* Ciphertext Hex */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Hash className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ciphertext Raw Hex Dump</span>
            </div>
            <div className="p-2.5 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto break-all leading-normal max-h-24">
              {hexCiphertext}
            </div>
          </div>

          {/* Initialization Vector & Key Fingerprint */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                <span>IV (Nonce - 96 bit)</span>
              </div>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px] break-all">
                {hexIv}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Algorithm & MAC</span>
              </div>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                {encryptedPayload.algo} · AuthTag
              </p>
            </div>
          </div>

          {/* Cryptographic explanation */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 leading-relaxed">
            In UsChat, messages are encrypted directly inside your browser before transmission. Relays and network observers only see randomized cipher bytes with zero access to plaintext contents or keys.
          </p>
        </div>
      </div>
    </div>
  );
};
