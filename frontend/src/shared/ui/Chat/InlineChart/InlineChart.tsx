import { ChartData } from '@/features/chat/chatTypes';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';

interface InlineChartProps {
  chartJson: string;
}

export const InlineChart: React.FC<InlineChartProps> = ({ chartJson }) => {
  const { openChart } = useChartOverlayStore();
  
  let parsedChart: ChartData | null = null;

  try {
    const parsed = JSON.parse(chartJson);

    const isValid =
      parsed &&
      typeof parsed.chart_type === 'string' &&
      Array.isArray(parsed.x) &&
      Array.isArray(parsed.y);

    if (!isValid) return null;

    parsedChart = parsed;
  } catch {
    return null;
  }

  if (!parsedChart) return null;

  const data = [{
    type: parsedChart.chart_type as PlotType,
    x: parsedChart.x,
    y: parsedChart.y,
    name: parsedChart.title,
  }];

  const layout = {
    title: parsedChart.title,
    xaxis: { title: parsedChart.x_label },
    yaxis: { title: parsedChart.y_label },
  };

  return (
    <div onClick={() => openChart(parsedChart)} style={{ cursor: 'pointer' }}>
      <Plot
        data={data}
        layout={layout}
        style={{ width: '100%', height: '300px', marginTop: '10px' }}
        config={{ responsive: true }}
      />
    </div>
  );
};
