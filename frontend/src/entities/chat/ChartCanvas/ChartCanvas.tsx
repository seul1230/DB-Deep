import { useEffect, useState } from 'react';
import Plotly, { Data, Layout, PlotlyHTMLElement } from 'plotly.js-dist-min';
import styles from './ChartCanvas.module.css';
import Plot from 'react-plotly.js';

interface ChartCanvasProps {
  chartId: string;
  onClose: () => void;
}

interface ChartData {
  data: Data[];
  layout?: Partial<Layout>;
}

const dummyCharts: Record<string, ChartData> = {
  chart1: {
    data: [{
      type: 'bar',
      x: ['뷰티', '패션', '카페/디저트'],
      y: [100, 80, 60],
      marker: { color: 'var(--primary-dark-blue)' },
    }],
    layout: { title: '주요 소비 업종' },
  },
  chart2: {
    data: [{
      type: 'scatter',
      mode: 'lines',
      x: ['1월', '2월', '3월'],
      y: [150000, 170000, 185000],
      marker: { color: 'var(--primary-mid-blue)' },
    }],
    layout: { title: '월별 소비 트렌드' },
  },
  chart3: {
    data: [{
      type: 'bar',
      x: ['영업', '마케팅', 'IT', '인사', '고객센터'],
      y: [18, 22, 12, 25, 30],
      marker: { color: 'var(--primary-dark-blue)' },
    }],
    layout: { title: '부서별 이직률' },
  },
};

export const ChartCanvas = ({ chartId, onClose }: ChartCanvasProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [plotlyElement, setPlotlyElement] = useState<PlotlyHTMLElement | null>(null);

  const handleDownload = () => {
    if (plotlyElement) {
      Plotly.downloadImage(plotlyElement, {
        format: 'png',
        filename: chartId,
        width: 800,
        height: 600,
      });
    }
  };

  const chartData = dummyCharts[chartId] || {};

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => setIsLoading(false), 700); // UX용 딜레이
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles['chartCanvas-overlay']}>
      <div className={styles['chartCanvas-header']}>
        <button className={styles['chartCanvas-close']} onClick={onClose}>닫기</button>
        <button className={styles['chartCanvas-download']} onClick={handleDownload}>이미지 다운로드</button>
      </div>
      <div className={styles['chartCanvas-content']}>
        {isLoading ? (
          <div className={styles['chartCanvas-loading']}>로딩중...</div>
        ) : (
          <Plot
            data={chartData.data}
            layout={chartData.layout}
            style={{ width: '100%', height: '100%' }}
            onInitialized={(_figure, graphDiv) => {
              setPlotlyElement(graphDiv as PlotlyHTMLElement);
            }}
          />
        )}
      </div>
    </div>
  );
};
