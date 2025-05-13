import axios from "@/shared/api/axios";
import { ArchiveItem, ArchiveResponse } from "./archiveTypes";

export const fetchArchiveList = async (): Promise<ArchiveItem[]> => {
  const response = await axios.get<ArchiveResponse>("/archives");
  return response.data.result;
};

export const deleteArchive = async (archiveId: string): Promise<void> => {
  await axios.delete(`/archives/${archiveId}`);
};

export const archiveChatMessage = async ({
  archiveId,
  messageId,
}: {
  archiveId: number;
  messageId: number;
}): Promise<void> => {
  await axios.post(`/archives/${archiveId}`, {
    messageId,
  });
};
