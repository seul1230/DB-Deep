import { useChartOverlayStore } from '@/features/chat/useChatOverlaystore';
import { usePanelStore } from '@/shared/store/usePanelStore';
import styles from './ChartOverlay.module.css';
import Plot from 'react-plotly.js';
import React, { useEffect, useState } from 'react';

export const ChartOverlay = () => {
  const { chart, closeChart } = useChartOverlayStore(); // chart: ChartData | null
  const { openPanel } = usePanelStore();
  const isPanelOpen = !!openPanel;

  const chartTypes = ['bar', 'scatter', 'pie'] as const;
  type ChartTypeOption = typeof chartTypes[number];

  const [chartType, setChartType] = useState<ChartTypeOption>('bar');
  const [xLabel, setXLabel] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [xRange, setXRange] = useState<[number, number] | undefined>();
  const [yRange, setYRange] = useState<[number, number] | undefined>();

  useEffect(() => {
    if (chart) {
      setChartType(chart.chart_type as ChartTypeOption);
      setXLabel(chart.x_label);
      setYLabel(chart.y_label);
      setXRange(undefined);
      setYRange(undefined);
    }
  }, [chart]);

  if (!chart) return null;

  const drawerStyle: React.CSSProperties = {
    left: '68px',
    right: isPanelOpen ? '240px' : '0px',
  };

  return (
    <div className={styles.overlay} style={drawerStyle}>
      <button className={styles.close} onClick={closeChart}>✕</button>

      <div className={styles.controls}>
        <label>
          차트 유형:
          <select value={chartType} onChange={(e) => setChartType(e.target.value as ChartTypeOption)}>
            {chartTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          X축 라벨:
          <input value={xLabel} onChange={(e) => setXLabel(e.target.value)} />
        </label>

        <label>
          Y축 라벨:
          <input value={yLabel} onChange={(e) => setYLabel(e.target.value)} />
        </label>
      </div>

      <Plot
        data={[{
          type: chartType === 'scatter' ? 'scatter' : chartType,
          mode: chartType === 'scatter' ? 'lines' : undefined,
          x: chart.x,
          y: chart.y,
          name: chart.title,
        }]}
        layout={{
          title: chart.title,
          xaxis: { title: xLabel, range: xRange },
          yaxis: { title: yLabel, range: yRange },
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />

      <div className={styles.gridWrapper}>
        <table className={styles.grid}>
          <thead>
            <tr><th>X</th><th>Y</th></tr>
          </thead>
          <tbody>
            {chart.x.map((xVal: string, i: number) => (
              <tr key={i}>
                <td>{xVal}</td>
                <td>{chart.y[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.rangeControls}>
        <div>
          <label>X축 범위:</label>
          <input type="number" placeholder="최소" onChange={(e) => setXRange([+e.target.value, xRange?.[1] ?? +e.target.value + 10])} />
          <input type="number" placeholder="최대" onChange={(e) => setXRange([xRange?.[0] ?? +e.target.value - 10, +e.target.value])} />
        </div>
        <div>
          <label>Y축 범위:</label>
          <input type="number" placeholder="최소" onChange={(e) => setYRange([+e.target.value, yRange?.[1] ?? +e.target.value + 10])} />
          <input type="number" placeholder="최대" onChange={(e) => setYRange([yRange?.[0] ?? +e.target.value - 10, +e.target.value])} />
        </div>
      </div>
    </div>
  );
};
