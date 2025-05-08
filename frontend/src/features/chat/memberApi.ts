import axios from "@/shared/api/axios";

export interface Member {
  id: string;
  name: string | null;
  email: string;
  teamName: string;
  avatarUrl?: string;
}

export const fetchMembers = async (
  keyword: string,
  searchType: string
): Promise<Member[]> => {
  const params: Record<string, string> = {};

  if (searchType === "name") params.name = keyword;
  if (searchType === "email") params.email = keyword;
  if (searchType === "teamName") params.teamName = keyword;

  const response = await axios.get("/members/search", { params });
  return response.data.result;
};
