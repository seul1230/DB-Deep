export type SupportedChartType = 'bar' | 'line' | 'scatter' | 'pie' | 'heatmap';

export interface CustomChartData {
  x: string[];
  y: number[];
  type: SupportedChartType;
  name: string;
  color: string;
  x_label?: string;
  y_label?: string;
}

import { ChartData } from '@/features/chat/chatTypes';

export const convertChartData = (data: ChartData): CustomChartData => ({
  x: data.x,
  y: data.y,
  type: data.chart_type as SupportedChartType,
  name: data.title,
  color: '#1f77b4',
  x_label: data.x_label,
  y_label: data.y_label,
});