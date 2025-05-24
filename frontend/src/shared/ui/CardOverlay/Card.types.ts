export interface CardBaseProps {
    id: string;
    title: string;
    date: string;
    description?: string;
    tableData?: string[][];
    chartData?: { label: string; value: number }[];
    onClick?: () => void;
    onMoreClick?: (event: React.MouseEvent, id: string) => void;
  }
  
  export interface CardOverlayProps {
    position: { top: number; left: number };
    targetId: string;
    onCopy: (id: string) => void;
    onDelete?: (id: string) => void;
    showDelete?: boolean;
    onClose?: () => void;
  }
  