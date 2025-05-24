declare module 'react-plotly.js' {
    import { Component } from 'react';
    import { Layout, Data, Config, Frame } from 'plotly.js';
  
    export interface PlotParams {
      data: Data[];
      layout?: Partial<Layout>;
      config?: Partial<Config>;
      style?: React.CSSProperties;
      onInitialized?: (figure: {
        data: Data[];
        layout: Partial<Layout>;
        frames?: Frame[];
        config: Partial<Config>;
      }, graphDiv: Plotly.PlotlyHTMLElement) => void;
      onUpdate?: (figure: {
        data: Data[];
        layout: Partial<Layout>;
        frames?: Frame[];
        config: Partial<Config>;
      }) => void;
      useResizeHandler?: boolean;
      divId?: string;
      className?: string;
      debug?: boolean;
    }
  
    export default class Plot extends Component<PlotParams> {}
  }
  