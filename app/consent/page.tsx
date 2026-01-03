'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeSession, getCompletedSessions, clearCompletedSessions, clearAllData } from '@/lib/counterbalance';
import { uploadSessions } from '@/lib/supabase';
import { BlockType, FocalColor, FOCAL_COLOR_HEX, SessionData } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ConsentPage() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Consent form state
  const [hasReadInfo, setHasReadInfo] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dev mode state
  const [devTapCount, setDevTapCount] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  // Check for completed sessions on mount
  useEffect(() => {
    const sessions = getCompletedSessions();
    setCompletedCount(sessions.length);
  }, []);

  // Toggle dev mode after 5 taps on text
  const handleTextTap = () => {
    const newCount = devTapCount + 1;
    setDevTapCount(newCount);
    if (newCount >= 5) {
      setDevMode(!devMode);
      setDevTapCount(0);
    }
  };

  const handleConsent = () => {
    // Initialize the session with randomized condition order and focal color
    const sessionData = initializeSession();

    if (devMode) {
      // In dev mode, show the permutation instead of navigating
      setPendingSession(sessionData);
    } else {
      // Navigate to the first condition's prep page
      router.push('/information');
    }
  };

  const handleContinue = () => {
    if (pendingSession) {
      router.push('/information');
    }
  };

  const handleClearAndRestart = () => {
    clearAllData();
    setPendingSession(null);
    setCompletedCount(0);
  };

  const handleUpload = async () => {
    const sessions = getCompletedSessions();
    if (sessions.length === 0) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      await uploadSessions(sessions);
      clearCompletedSessions();
      setCompletedCount(0);
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${sessions.length} session(s).`);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(
        error instanceof Error ? error.message : 'Failed to upload data. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Show permutation view in dev mode after consent
  if (devMode && pendingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
        <h1 className="text-3xl font-bold mb-4">Permutation</h1>

        <div className="w-full max-w-md p-6 bg-gray-100 rounded-lg space-y-4">
          <div className="text-sm text-gray-500 mb-2">Session ID: {pendingSession.id.slice(0, 8)}...</div>

          <div className="space-y-3">
            {pendingSession.conditionOrder.map((condition: BlockType, index: number) => {
              const color: FocalColor = pendingSession.focalColors[condition];
              return (
                <div key={condition} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: FOCAL_COLOR_HEX[color] }}
                  />
                  <span className="font-medium">{condition}</span>
                  <span className="text-gray-400">({color})</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleClearAndRestart}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear & Restart
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      {/* Upload button in top right */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <button
          onClick={handleUpload}
          disabled={completedCount === 0 || isUploading}
          className={`px-4 py-2 text-sm rounded-md border shadow-sm transition-colors ${
            completedCount === 0 || isUploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {isUploading ? 'Uploading...' : `Upload Local Data (${completedCount})`}
        </button>
        {uploadStatus === 'success' && (
          <p className="text-sm text-green-600">{uploadMessage}</p>
        )}
        {uploadStatus === 'error' && (
          <p className="text-sm text-red-600">{uploadMessage}</p>
        )}
      </div>

      {/* Main card */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 flex flex-col items-center gap-8">
          {devMode && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Dev Mode Active
            </div>
          )}

          <p
            className="text-center text-lg sm:text-xl leading-relaxed select-none cursor-default"
            onClick={handleTextTap}
          >
            Please read the information sheet by pressing the button below. After you have read the information sheet,
            please provide your consent by pressing the continue button.
          </p>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setHasReadInfo(true);
            }}
          >
            <DialogTrigger asChild>
              <button
                className="w-48 h-16 text-xl rounded-md transition-colors bg-[#ffeeb2] hover:bg-[#ffe699] text-black"
                onClick={() => setIsDialogOpen(true)}
              >
                Consent Form
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Information Sheet</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <iframe
                  src="/consent-form.pdf"
                  className="w-full h-full min-h-[60vh]"
                  title="Consent Form"
                />
              </div>
            </DialogContent>
          </Dialog>

          <button
            className={`w-48 h-16 text-xl rounded-md transition-colors ${
              hasReadInfo
                ? 'bg-[#c1e6c1] hover:bg-[#a8dba8] text-black'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasReadInfo}
            onClick={handleConsent}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
