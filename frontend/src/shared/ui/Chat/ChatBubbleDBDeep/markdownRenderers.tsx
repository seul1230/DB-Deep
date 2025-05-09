import { Components } from 'react-markdown';
import { ReactNode } from 'react';

export const ChatMarkdownRenderers = (
  onChartClick: (chartId: string) => void
): Components => ({
  p: ({ children, ...props }) => <p {...props}>{children}</p>,
  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  hr: (props) => <hr {...props} />,
  code: (props) => {
    const { inline, className, children } = props as {
      inline?: boolean;
      className?: string;
      children?: ReactNode;
    };
    const content = typeof children === 'string'
      ? children
      : Array.isArray(children)
      ? children.join('')
      : '';

    if (!inline && className === 'language-json') {
      try {
        JSON.parse(content);
        return (
          <div
            onClick={() => onChartClick('dynamicChart')}
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

    return (
      <code className={className}>
        {content}
      </code>
    );
  },
  text: ({ children }) => {
    const content = typeof children === 'string' ? children : '';
    const chartMatch = content.match(/<Chart id="(.*?)" \/>/);
    if (chartMatch) {
      return (
        <div
          onClick={() => onChartClick(chartMatch[1])}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          📊 차트 보러가기 (ID: {chartMatch[1]})
        </div>
      );
    }
    return <>{children}</>;
  },
});
