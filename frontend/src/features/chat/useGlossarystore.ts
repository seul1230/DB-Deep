import { create } from 'zustand';
import { glossaryApi } from '@/features/chat/glossaryApi';

export type GlossaryItem = {
  id: string;
  key: string;
  value: string;
};

interface GlossaryState {
  glossary: GlossaryItem[];
  isLoaded: boolean;
  fetchGlossary: () => Promise<void>;
  setGlossary: (data: GlossaryItem[]) => void;
}

export const useGlossaryStore = create<GlossaryState>((set) => ({
  glossary: [],
  isLoaded: false,

  fetchGlossary: async () => {
    const data = await glossaryApi.getAll();
    set({ glossary: data, isLoaded: true });
  },

  setGlossary: (data) => {
    set({ glossary: data });
  },
}));
