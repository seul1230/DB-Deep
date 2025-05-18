import { useChartOverlayStore } from '@/features/chat/useChartOverlaystore';
import styles from './ChartOverlay.module.css';
import Plot from 'react-plotly.js';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export const ChartOverlay = () => {
  const { chart, closeChart } = useChartOverlayStore();
  const [visible, setVisible] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [xRange, setXRange] = useState<[number, number] | undefined>();
  const [yRange, setYRange] = useState<[number, number] | undefined>();
  const [showGrid, setShowGrid] = useState(true);

  const chartTypes = ['bar', 'line', 'scatter', 'area', 'pie', 'heatmap'] as const;

  useEffect(() => {
    if (chart) {
      setVisible(true);
      setChartType(chart.chart_type);
      setXLabel(chart.x_label);
      setYLabel(chart.y_label);
      setXRange(undefined);
      setYRange(undefined);
      setShowGrid(true);
    }
  }, [chart]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => closeChart(), 300);
  };

  if (!chart && !visible) return null;

  const availableTypes = chartTypes.filter((type) => {
    if (!chart) return false;
    if (type === 'pie') return 'x' in chart && 'y' in chart && chart.x.length === chart.y.length;
    if (type === 'heatmap') return Array.isArray((chart as any).z);
    return true;
  });

  let data;
  if (!chart) return null;

  switch (chartType) {
    case 'pie':
      data = [{
        type: 'pie',
        labels: chart.x,
        values: chart.y,
        name: chart.title,
      }];
      break;
    case 'heatmap':
      data = [{
        type: 'heatmap',
        z: (chart as any).z,
        x: chart.x,
        y: chart.y,
        name: chart.title,
      }];
      break;
    case 'area':
      data = [{
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        x: chart.x,
        y: chart.y,
        name: chart.title,
      }];
      break;
    case 'line':
      data = [{
        type: 'scatter',
        mode: 'lines',
        x: chart.x,
        y: chart.y,
        name: chart.title,
      }];
      break;
    case 'scatter':
      data = [{
        type: 'scatter',
        mode: 'markers',
        x: chart.x,
        y: chart.y,
        name: chart.title,
      }];
      break;
    default:
      data = [{
        type: 'bar',
        x: chart.x,
        y: chart.y,
        name: chart.title,
      }];
  }

  return (
    <div
      className={clsx(styles['chartOverlay-overlay'], {
        [styles['chartOverlay-visible']]: visible,
        [styles['chartOverlay-hidden']]: !visible,
      })}
    >
      <button className={styles['chartOverlay-close']} onClick={handleClose}>✕</button>

      <div className={styles['chartOverlay-tabBar']}>
        {availableTypes.map((type) => (
          <button
            key={type}
            className={clsx(styles['chartOverlay-tab'], {
              [styles['chartOverlay-tab-active']]: type === chartType,
            })}
            onClick={() => setChartType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <Plot
        data={data as any}
        layout={{
          title: chart.title,
          xaxis: { title: xLabel, range: xRange, showgrid: showGrid },
          yaxis: { title: yLabel, range: yRange, showgrid: showGrid },
          autosize: true,
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />

      <div className={styles['chartOverlay-controls']}>
        <label>
          X축 라벨:
          <input value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
        </label>
        <label>
          Y축 라벨:
          <input value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
        </label>
        <label>
          X축 범위:
          <input type="number" placeholder="최소" onChange={(e) => setXRange([+e.target.value, xRange?.[1] ?? +e.target.value + 10])} />
          <input type="number" placeholder="최대" onChange={(e) => setXRange([xRange?.[0] ?? +e.target.value - 10, +e.target.value])} />
        </label>
        <label>
          Y축 범위:
          <input type="number" placeholder="최소" onChange={(e) => setYRange([+e.target.value, yRange?.[1] ?? +e.target.value + 10])} />
          <input type="number" placeholder="최대" onChange={(e) => setYRange([yRange?.[0] ?? +e.target.value - 10, +e.target.value])} />
        </label>
        <label>
          <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} /> 그리드 표시
        </label>
      </div>
    </div>
  );
};
