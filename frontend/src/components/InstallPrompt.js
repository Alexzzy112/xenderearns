import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isSafari || isIOSDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIOSDevice && !isStandalone) {
      setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
    setShow(false);
  };

  if (isStandalone || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">$</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Install Xender Earnings</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isIOS
                ? 'Tap Share then "Add to Home Screen"'
                : 'Install the app for a better experience'}
            </p>
          </div>
          <button onClick={() => setShow(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {!isIOS && (
          <button onClick={handleInstall} className="w-full mt-3 bg-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
            <FiDownload className="w-4 h-4" /> Install App
          </button>
        )}
      </div>
    </div>
  );
}
