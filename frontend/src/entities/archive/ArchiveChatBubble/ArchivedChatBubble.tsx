import React from "react";
import { ChatStreamMessage } from "@/features/chat/chatTypes";
import styles from "./ArchivedChatBubble.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InlineQuery } from "@/shared/ui/Chat/InlineQuery/InlineQuery";
import { InlineChart } from "@/shared/ui/Chat/InlineChart/InlineChart";
import { InlineTable } from "@/shared/ui/Chat/InlineTable/InlineTable";
import { ChatMarkdownRenderers } from "@/shared/ui/Chat/ChatBubbleDBDeep/markdownRenderers";

interface Props {
  message: ChatStreamMessage;
  onChartClick?: (chartId: string) => void;
}

const ArchivedChatBubble: React.FC<Props> = ({ message, onChartClick = () => {} }) => {
  const textParts = message.parts.filter((p) => p.type === "text");
  const sql = message.parts.find((p) => p.type === "sql")?.content;
  const chart = message.parts.find((p) => p.type === "chart")?.content;
  const data = message.parts.find((p) => p.type === "data")?.content;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bubble}>
        {sql && (
          <div className={styles.section}>
            <InlineQuery sql={sql} />
          </div>
        )}

        {data && (
          <div className={styles.section}>
            <InlineTable data={data} />
          </div>
        )}

        {chart && (
          <div className={styles.section}>
            <InlineChart chartJson={JSON.stringify(chart)} />
          </div>
        )}

        {textParts.length > 0 && (
          <div className={styles.section}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={ChatMarkdownRenderers(onChartClick)}
            >
              {textParts.map((p) => p.content).join("\n")}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedChatBubble;
