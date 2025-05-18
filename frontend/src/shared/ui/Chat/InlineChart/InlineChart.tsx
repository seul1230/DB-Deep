import { useEffect, useState } from 'react';
import { ChartData } from '@/features/chat/chatTypes';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';
import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import { useThemeStore } from "@/shared/store/themeStore";

interface InlineChartProps {
  chartJson: string;
}

export const InlineChart: React.FC<InlineChartProps> = ({ chartJson }) => {
  const { openChart } = useChartOverlayStore();
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
      textColor: getCSSVariable("--text-color"),
      bgColor: getCSSVariable("--background-color"),
      gridColor: getCSSVariable("--light-gray"),
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

  const data = [{
    type: parsedChart.chart_type as PlotType,
    x: parsedChart.x,
    y: parsedChart.y,
    name: parsedChart.title,
  }];

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
    paper_bgcolor: colors.bgColor,
    plot_bgcolor: colors.bgColor,
    font: {
      color: colors.textColor,
    },
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
