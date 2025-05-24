import { useRef, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Layout, PlotData } from 'plotly.js-dist-min';
import styles from './ChartOverlay.module.css';
import { CustomChartData, SupportedChartType } from '@/types/chart';
import type { PlotlyHTMLElement } from 'plotly.js-dist-min';

interface ChartOverlayProps {
  onClose: () => void;
  chartData: CustomChartData;
}

const supportedChartTypes: SupportedChartType[] = ['bar', 'line', 'scatter', 'pie', 'heatmap'];

const ChartOverlay = ({ onClose, chartData }: ChartOverlayProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [chartType, setChartType] = useState<SupportedChartType>(chartData.type);
  const [xLabel, setXLabel] = useState('X 축');
  const [yLabel, setYLabel] = useState('Y 축');
  const [showXLabel, setShowXLabel] = useState(true);
  const [showYLabel, setShowYLabel] = useState(true);
  const [xRange, setXRange] = useState<[number, number]>([0, chartData.x.length - 1]);
  const [yRange, setYRange] = useState<[number, number]>([
    Math.min(...chartData.y),
    Math.max(...chartData.y),
  ]);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [color, setColor] = useState(chartData.color);

  const downloadChart = () => {
    const plot = chartRef.current?.querySelector('.js-plotly-plot');
    if (plot) {
      const node = plot as PlotlyHTMLElement;
      window.Plotly.downloadImage(node, {
        format: 'png',
        filename: 'custom_chart',
        width: 960,
        height: 640,
      });
    }
  };

  const layout: Partial<Layout> = {
    showlegend: showLegend,
    xaxis: {
      title: showXLabel ? xLabel : '',
      range: xRange,
      showgrid: showGrid,
      tickangle: -45,
    },
    yaxis: {
      title: showYLabel ? yLabel : '',
      range: yRange,
      showgrid: showGrid,
    },
    paper_bgcolor: 'var(--background-color)',
    plot_bgcolor: 'var(--background-color)',
    font: { color: 'var(--text-color)' },
  };

  const data: Partial<PlotData>[] = [
    {
      type: chartType === 'line' ? 'scatter' : chartType,
      mode: chartType === 'line' ? 'lines' : chartType === 'scatter' ? 'markers' : undefined,
      x: chartData.x,
      y: chartData.y,
      name: chartData.name,
      marker: { color },
      line: { color },
    },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className={styles.chartOverlayContainer}>
      {/* 헤더 */}
      <div className={styles.chartOverlayHeader}>
        <button onClick={onClose} className={styles.chartOverlayCloseButton}>✕</button>
        <div className={styles.chartOverlayTitle}>그래프 편집기</div>
        <button onClick={downloadChart} className={styles.chartOverlaySaveButton}>저장</button>
      </div>

      {/* 탭 바 */}
      <div className={styles.chartOverlayTabBar}>
        {supportedChartTypes.map((type) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={
              chartType === type
                ? styles.chartOverlayTabActive
                : styles.chartOverlayTab
            }
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <div className={styles.chartOverlayBody}>
        <div className={styles.chartOverlayPlotArea} ref={chartRef}>
          <Plot data={data} layout={layout} style={{ width: '100%', height: '100%' }} config={{ responsive: true }} />
        </div>

        {/* 설정 영역 */}
        <div className={styles.chartOverlaySidebar}>
          {/* 라벨 */}
          <section className={styles.chartOverlaySection}>
            <div className={styles.chartOverlayLabelRow}>
              <label>📌 X축 라벨</label>
              <input
                type="checkbox"
                checked={showXLabel}
                onChange={() => setShowXLabel(!showXLabel)}
              />
            </div>
            <input
              className={styles.chartOverlayInput}
              value={xLabel}
              onChange={(e) => setXLabel(e.target.value)}
              disabled={!showXLabel}
            />

            <div className={styles.chartOverlayLabelRow}>
              <label>📌 Y축 라벨</label>
              <input
                type="checkbox"
                checked={showYLabel}
                onChange={() => setShowYLabel(!showYLabel)}
              />
            </div>
            <input
              className={styles.chartOverlayInput}
              value={yLabel}
              onChange={(e) => setYLabel(e.target.value)}
              disabled={!showYLabel}
            />
          </section>

          {/* 범위 */}
          <section className={styles.chartOverlaySection}>
            <label>X축 범위: {xRange.join(' ~ ')}</label>
            <input
              type="range"
              min={0}
              max={chartData.x.length - 1}
              value={xRange[0]}
              onChange={(e) => setXRange([+e.target.value, xRange[1]])}
            />
            <input
              type="range"
              min={0}
              max={chartData.x.length - 1}
              value={xRange[1]}
              onChange={(e) => setXRange([xRange[0], +e.target.value])}
            />

            <label>Y축 범위: {yRange.join(' ~ ')}</label>
            <input
              type="range"
              min={Math.min(...chartData.y)}
              max={Math.max(...chartData.y)}
              value={yRange[0]}
              onChange={(e) => setYRange([+e.target.value, yRange[1]])}
            />
            <input
              type="range"
              min={Math.min(...chartData.y)}
              max={Math.max(...chartData.y)}
              value={yRange[1]}
              onChange={(e) => setYRange([yRange[0], +e.target.value])}
            />
          </section>

          {/* 토글 */}
          <section className={styles.chartOverlaySection}>
            <div className={styles.chartOverlayToggleRow}>
              <label>🧩 그리드 표시</label>
              <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
            </div>
            <div className={styles.chartOverlayToggleRow}>
              <label>📘 범례 표시</label>
              <input type="checkbox" checked={showLegend} onChange={() => setShowLegend(!showLegend)} />
            </div>
          </section>

          {/* 색상 선택 */}
          <section className={styles.chartOverlaySection}>
            <label>🎨 색상</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={styles.chartOverlayColorButton}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChartOverlay;
