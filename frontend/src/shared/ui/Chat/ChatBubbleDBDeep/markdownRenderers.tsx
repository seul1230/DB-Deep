import { Components } from 'react-markdown';
import { ReactNode } from 'react';
import { CustomChartData } from '@/types/chart';

export const ChatMarkdownRenderers = (
  onChartClick: (chartData: CustomChartData) => void
): Components => ({
  p: ({ children }) => <>{children}</>,

  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  hr: (props) => <hr {...props} />,
  li: ({ children, ...props }) => <li {...props}>{children}</li>,
  ol: ({ children, ...props }) => <ol {...props}>{children}</ol>,

  code: (props) => {
    const { inline, className, children } = props as {
      inline?: boolean;
      className?: string;
      children?: ReactNode;
    };

    const content =
      typeof children === 'string'
        ? children
        : Array.isArray(children)
        ? children.join('')
        : '';

    if (!inline && className === 'language-json') {
      try {
        const parsed = JSON.parse(content);
        return (
          <div
            onClick={() =>
              onChartClick({
                x: parsed.x,
                y: parsed.y,
                type: parsed.chart_type,
                name: parsed.title,
                color: '#1f77b4',
                x_label: parsed.x_label,
                y_label: parsed.y_label,
              })
            }
            style={{
              cursor: 'pointer',
              color: 'blue',
              textDecoration: 'underline',
            }}
          >
            📊 차트 보러가기 (자동 차트)
          </div>
        );
      } catch {
        return <pre>{content}</pre>;
      }
    }

    return inline ? (
      <code className={className}>{content}</code>
    ) : (
      <pre className={className}>{content}</pre>
    );
  },
});
