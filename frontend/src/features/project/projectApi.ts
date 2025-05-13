import api from "@/shared/api/axios";
import { Project, ProjectDetail } from "./projectTypes";

export const createProject = async (title: string): Promise<Project> => {
  const response = await api.post<{ result: Project }>("/projects", { title });
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


export const deleteChatInProject = async (projectId: string, chatId: string) => {
  await api.delete(`/projects/${projectId}`, {
    data: { chatId },
  });
};