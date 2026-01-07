import { create } from 'zustand';
import { Meeting, MeetingCard } from '@/types/meeting';

interface MeetingsState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMeetings: (meetings: Meeting[]) => void;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  updateCardStatus: (meetingId: string, cardId: string, status: string) => Promise<void>;
  updateCard: (meetingId: string, cardId: string, updates: Partial<MeetingCard>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMeetings: () => Promise<void>;
  fetchMeeting: (id: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

export const useMeetingsStore = create<MeetingsState>((set, get) => ({
  meetings: [],
  currentMeeting: null,
  isLoading: false,
  error: null,

  setMeetings: (meetings) => set({ meetings }),
  
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  
  updateCardStatus: async (meetingId, cardId, status) => {
    const currentMeeting = get().currentMeeting;
    if (!currentMeeting) {
      console.error('❌ No current meeting found');
      return;
    }

    console.log('🔄 Updating card status:', { cardId, status, meetingId });

    // Find the card before update
    const cardBefore = currentMeeting.cards.find(c => c.id === cardId);
    console.log('📝 Card before update:', cardBefore);

    // Optimistically update UI
    const updatedCards = currentMeeting.cards.map((card) =>
      card.id === cardId ? { ...card, status: status as any } : card
    );

    console.log('✅ Optimistic update applied');

    set({
      currentMeeting: { ...currentMeeting, cards: updatedCards },
    });

    // Persist to API
    try {
      console.log('🌐 Sending PUT request to /api/card/' + cardId);
      const response = await fetch(`/api/card/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', errorData);
        throw new Error('Failed to update card status');
      }

      const result = await response.json();
      console.log('✅ API Success:', result);
    } catch (error) {
      console.error('❌ Failed to update card status:', error);
      // Revert on error
      await get().fetchMeeting(meetingId);
    }
  },

  updateCard: async (meetingId, cardId, updates) => {
    const currentMeeting = get().currentMeeting;
    if (!currentMeeting) return;

    // Optimistically update UI
    const updatedCards = currentMeeting.cards.map((card) =>
      card.id === cardId ? { ...card, ...updates } as MeetingCard : card
    );

    set({
      currentMeeting: { ...currentMeeting, cards: updatedCards },
    });

    // Persist to API
    try {
      const response = await fetch(`/api/card/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }
    } catch (error) {
      console.error('Failed to update card:', error);
      // Revert on error
      await get().fetchMeeting(meetingId);
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  fetchMeetings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      set({ meetings: data.meetings, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  fetchMeeting: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/board/${id}`);
      if (!response.ok) throw new Error('Failed to fetch meeting');
      const data = await response.json();
      set({ currentMeeting: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  deleteBoard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/board/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete board');
      
      // Remove the board from the meetings list
      const meetings = get().meetings.filter((m) => m.id !== id);
      set({ meetings, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
      throw error;
    }
  },
}));

