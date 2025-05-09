import React from 'react';
import Plot from 'react-plotly.js';
import { PlotParams } from 'react-plotly.js';

interface ChartCanvasProps {
  chartData: Pick<PlotParams, 'data' | 'layout'>;
  onClose: () => void;
}

const ChartCanvas: React.FC<ChartCanvasProps> = ({ chartData, onClose }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px' }}>
      <button onClick={onClose} style={{ marginBottom: '10px' }}>
        닫기
      </button>
      <Plot
        data={chartData.data || []}
        layout={chartData.layout}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default ChartCanvas;