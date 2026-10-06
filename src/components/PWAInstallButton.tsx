import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
        title="Install YardStock PWA on mobile or desktop"
      >
        <Download className="w-3.5 h-3.5 text-amber-600" />
        <span>Install PWA</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Install YardStock Field PWA
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
              {isIOS ? (
                <>
                  <p className="font-medium text-slate-900">iOS Safari Installation:</p>
                  <p>1. Tap the <strong>Share</strong> icon in the Safari bottom bar.</p>
                  <p>2. Select <strong>Add to Home Screen</strong> to launch YardStock full-screen with camera & offline cache.</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-900">Field Ready Progressive Web App:</p>
                  <p>
                    YardStock caches OpenStreetMap tiles, CPWD DSR benchmark rates, and active surplus inventory via Service Worker for low-connectivity construction yards.
                  </p>
                  <p className="text-xs text-slate-500">
                    To install directly from the preview or mobile browser, open the browser menu and select <strong>Install YardStock</strong> or <strong>Add to Home Screen</strong>.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
