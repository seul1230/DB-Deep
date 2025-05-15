import { ChartData } from '@/features/chat/chatTypes';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';
import { useChartOverlayStore } from '@/features/chat/useChatOverlaystore';

interface InlineChartProps {
  chartJson: string;
}

export const InlineChart: React.FC<InlineChartProps> = ({ chartJson }) => {
  const { openChart } = useChartOverlayStore();
  
  let parsedChart: ChartData | null = null;

  try {
    parsedChart = JSON.parse(chartJson);
  } catch {
    // fallback to dummy
  }

  const data = parsedChart
    ? [{
        type: parsedChart.chart_type as PlotType,
        x: parsedChart.x,
        y: parsedChart.y,
        name: parsedChart.title,
      }]
    : [{
        type: 'bar' as PlotType,
        x: ['A', 'B', 'C'],
        y: [10, 20, 30],
        name: '더미 데이터',
      }];

  const layout = {
    title: parsedChart?.title || '더미 차트',
    xaxis: { title: parsedChart?.x_label || '' },
    yaxis: { title: parsedChart?.y_label || '' },
  };

  return (
    <div onClick={() => parsedChart && openChart(parsedChart)} style={{ cursor: 'pointer' }}>
      <Plot
        data={data}
        layout={layout}
        style={{ width: '100%', height: '300px', marginTop: '10px' }}
        config={{ responsive: true }}
      />
    </div>
  );
};
