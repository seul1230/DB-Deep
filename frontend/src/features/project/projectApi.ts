import api from "@/shared/api/axios";
import { Project, ProjectDetail } from "./projectTypes";

export const createProject = async (
  title: string,
  description: string = ""
): Promise<{ projectId: string; title: string }> => {
  const response = await api.post<{ result: { projectId: string; title: string } }>(
    "/projects",
    { title, description }
  );
  return response.data.result;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await api.get<{ result: Project[] }>("/projects");
  return response.data.result;
};

export const fetchProjectDetail = async (projectId: string): Promise<ProjectDetail> => {
  const response = await api.get<{ result: ProjectDetail }>(`/projects/${projectId}`);
  return response.data.result;
};

export const updateProjectTitle = async (
  projectId: string,
  title: string,
  description: string
): Promise<void> => {
  await api.post(`/projects/${projectId}/title`, {
    title,
    description,
  });
};


export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`);
};

export const addChatToProject = async (projectId: string, chatId: string): Promise<void> => {
  console.log("chatId: ", chatId)
  await api.post(`/projects/${projectId}`, { chatId });
};

export const removeChatFromProject = async (projectId: string, chatId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/chatroom`, {
    data: { chatId },
  });
};