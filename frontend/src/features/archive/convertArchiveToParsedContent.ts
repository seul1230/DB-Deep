import { ArchiveMessage } from "@/features/archive/archiveTypes";
import { ParsedChatContent } from "@/features/chat/chatTypes";

export const convertArchiveToParsedContent = (
  archiveMsg: ArchiveMessage
): ParsedChatContent => {
  let parsedData: Record<string, string | number>[] | undefined = undefined;

  const dataStr = archiveMsg.data?.trim();

  // ✅ JSON으로 보이는 경우에만 파싱 시도
  if (dataStr && (dataStr.startsWith("{") || dataStr.startsWith("["))) {
    try {
      const parsed = JSON.parse(dataStr);
      if (Array.isArray(parsed)) {
        parsedData = parsed;
      } else {
        console.warn("📌 data는 배열이 아님:", parsed);
      }
    } catch (e) {
      console.warn("❗ data 파싱 실패:", e);
    }
  } else if (dataStr?.startsWith("|")) {
    // ✅ markdown 형식일 경우 insight에 붙이기
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
