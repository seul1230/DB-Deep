import { ArchiveMessage } from "@/features/archive/archiveTypes";
import { ParsedChatContent } from "@/features/chat/chatTypes";

export const convertArchiveToParsedContent = (
  archiveMsg: ArchiveMessage
): ParsedChatContent => {
  let parsedData: Record<string, string | number>[] | undefined = undefined;

  const dataStr = archiveMsg.data?.trim();

  if (dataStr && (dataStr.startsWith("{") || dataStr.startsWith("["))) {
    try {
      const parsed = JSON.parse(dataStr);
      if (Array.isArray(parsed)) {
        parsedData = parsed;
      }
    } catch {
        // 데이터 파싱 실패는 무시 (Markdown 형태 등 허용)
    }
  } else if (dataStr?.startsWith("|")) {
    archiveMsg.insight += `\n\n${dataStr}`;
  }

  return {
    question: archiveMsg.question,
    insight: archiveMsg.insight,
    query: archiveMsg.query,
    chart: archiveMsg.chart,
    data: parsedData,
  };
};
