// InlineChart.tsx
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';
import { useThemeStore } from '@/shared/store/themeStore';
import { CustomChartData } from '@/types/chart';

type SupportedChartType = 'bar' | 'line' | 'scatter' | 'pie' | 'heatmap';

interface ChartData {
  chart_type: string;
  x: string[];
  y: number[];
  x_label: string;
  y_label: string;
  title: string;
}

interface InlineChartProps {
  chartJson: string;
  onClick?: (chartData: CustomChartData) => void;
}

export const InlineChart: React.FC<InlineChartProps> = ({ chartJson, onClick }) => {
  const theme = useThemeStore((state) => state.theme);
  const [colors, setColors] = useState({
    textColor: '',
    bgColor: '',
    gridColor: '',
  });

  useEffect(() => {
    const getCSSVariable = (name: string) =>
      getComputedStyle(document.body).getPropertyValue(name).trim();

    setColors({
      textColor: getCSSVariable('--text-color'),
      bgColor: getCSSVariable('--background-color'),
      gridColor: getCSSVariable('--light-gray'),
    });
  }, [theme]);

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

  const supportedTypes: SupportedChartType[] = ['bar', 'line', 'scatter', 'pie', 'heatmap'];
  const chartType = supportedTypes.includes(parsedChart.chart_type as SupportedChartType)
    ? (parsedChart.chart_type as SupportedChartType)
    : null;

  if (!chartType) return null;

  const actualType: PlotType = chartType === 'line' ? 'scatter' : chartType;
  const mode = chartType === 'line' ? 'lines' : undefined;

  const data = [
    {
      type: actualType,
      mode,
      x: parsedChart.x,
      y: parsedChart.y,
      name: parsedChart.title,
    },
  ];

  const layout = {
    title: parsedChart.title,
    xaxis: {
      title: parsedChart.x_label,
      color: colors.textColor,
      gridcolor: colors.gridColor,
    },
    yaxis: {
      title: parsedChart.y_label,
      color: colors.textColor,
      gridcolor: colors.gridColor,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: colors.textColor,
    },
  };

  return (
    <div
      onClick={() => {
        onClick?.({
          x: parsedChart.x,
          y: parsedChart.y,
          type: chartType,
          name: parsedChart.title,
          color: '#1f77b4',
          x_label: parsedChart.x_label,
          y_label: parsedChart.y_label,
        });
      }}
      style={{ cursor: 'pointer' }}
    >
      <Plot
        data={data as Partial<Plotly.PlotData>[]}
        layout={layout}
        style={{ width: '100%', height: '300px', marginTop: '10px' }}
        config={{ responsive: true }}
      />
    </div>
  );
};
