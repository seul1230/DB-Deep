import React from 'react';
import Plot, { PlotParams } from 'react-plotly.js';
import { PlotType } from 'plotly.js';

interface InlineChartProps {
  chartJson: string;
}

export const InlineChart: React.FC<InlineChartProps> = ({ chartJson }) => {
  const dummyChartData: Partial<PlotParams>['data'] = [
    {
      type: 'bar' as PlotType,
      x: ['A', 'B', 'C'],
      y: [10, 20, 30],
      name: '더미 데이터',
    },
  ];

  try {
    JSON.parse(chartJson);
    // 추후 parsed 사용 예정
  } catch {
    // invalid JSON → fallback to dummy chart
  }

  return (
    <Plot
      data={dummyChartData}
      layout={{ title: '더미 차트' }}
      style={{ width: '100%', height: '300px', marginTop: '10px' }}
      config={{ responsive: true }}
    />
  );
};
