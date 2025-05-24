import axios from "@/shared/api/axios";
import { ArchiveItem, ArchiveResponse } from "./archiveTypes";

export const fetchArchiveList = async (): Promise<ArchiveItem[]> => {
  const response = await axios.get<ArchiveResponse>("/archives");
  return response.data.result;
};

export const deleteArchive = async (archiveId: string): Promise<void> => {
  await axios.delete(`/archives/${archiveId}`);
};

export const archiveChatMessage = async (messageId: string): Promise<void> => {
  await axios.post(`/archives`, { messageId });
};