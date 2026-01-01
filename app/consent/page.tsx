'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeSession, getCompletedSessions, clearCompletedSessions } from '@/lib/counterbalance';
import { getFirstRoute } from '@/lib/navigation';
import { uploadSessions } from '@/lib/supabase';

export default function ConsentPage() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Check for completed sessions on mount
  useEffect(() => {
    const sessions = getCompletedSessions();
    setCompletedCount(sessions.length);
  }, []);

  const handleConsent = () => {
    // Initialize the session with randomized condition order and focal color
    const sessionData = initializeSession();

    // Navigate to the first condition's prep page
    const firstRoute = getFirstRoute(sessionData.conditionOrder);
    router.push(firstRoute);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold mb-4">Consent</h1>
      <p className="text-lg mb-4 max-w-2xl text-center">
        Welcome to the research study. Please read the consent information carefully.
      </p>

      {/* Upload Data Section */}
      <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Completed sessions: <strong>{completedCount}</strong>
          </span>
          <button
            onClick={handleUpload}
            disabled={completedCount === 0 || isUploading}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              completedCount === 0 || isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Data'}
          </button>
        </div>
        {uploadStatus === 'success' && (
          <p className="text-sm text-green-600">{uploadMessage}</p>
        )}
        {uploadStatus === 'error' && (
          <p className="text-sm text-red-600">{uploadMessage}</p>
        )}
      </div>

      {/* Consent Button */}
      <button
        onClick={handleConsent}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        I Consent - Begin Study
      </button>
    </div>
  );
}
