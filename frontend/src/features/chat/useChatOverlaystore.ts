// useChartOverlayStore.ts
import { create } from 'zustand';
import { ChartData } from '@/features/chat/chatTypes';

interface ChartOverlayStore {
  chart: ChartData | null;
  openChart: (chart: ChartData) => void;
  closeChart: () => void;
}

export const useChartOverlayStore = create<ChartOverlayStore>((set) => ({
  chart: null,
  openChart: (chart) => set({ chart }),
  closeChart: () => set({ chart: null }),
}));
