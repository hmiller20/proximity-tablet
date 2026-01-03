// Session data management utilities
import { getSessionData as getSession, updateSession as update, getStorageData } from '@/lib/counterbalance';

// Export getCurrentSession as an alias for getSessionData
export function getCurrentSession() {
  return getSession();
}

// Export updateSession 
export function updateSession(updates: Parameters<typeof update>[0]) {
  return update(updates);
}

// Add a completed session to the completed sessions list
export function addCompletedSession(session: NonNullable<ReturnType<typeof getSession>>): boolean {
  try {
    const storage = getStorageData();
    // Mark as complete and add to completed list
    const completedSession = { ...session, isComplete: true };
    storage.completedSessions.push(completedSession);
    // Save back to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('proximityStudyData', JSON.stringify(storage));
    }
    return true;
  } catch (error) {
    console.error('Error adding completed session:', error);
    return false;
  }
}

