import React, { useEffect, useState } from "react";
import styles from "./ProjectSelectorOverlay.module.css";
import { FiFolder } from "react-icons/fi";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";
import { fetchProjects, addChatToProject  } from "@/features/project/projectApi";
import { Project, ProjectDetail } from "@/features/project/projectTypes";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

interface Props {
  chatId: string;
  onSelect: (projectId: string) => void;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectSelectorOverlay: React.FC<Props> = ({ chatId, onClose, onSuccess }) => {
  const closeMenu = useOverlayStore((state) => state.closeMenu);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("프로젝트 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleSelect = async (projectId: string) => {
    try {
      await addChatToProject(projectId, chatId);
      alert("채팅이 프로젝트에 추가되었습니다.");
  
      const match = location.pathname.match(/^\/projects\/([^/]+)/);
      const currentProjectId = match?.[1];
      const projectKey = String(projectId);
  
      if (currentProjectId === projectKey) {
        const existing = queryClient.getQueryData<ProjectDetail>(["projectDetail", projectKey]);
  
        if (existing && !existing.chatRooms.some((c) => c.id === chatId)) {
          queryClient.setQueryData(["projectDetail", projectKey], {
            ...existing,
            chatRooms: [
              ...existing.chatRooms,
              {
                id: chatId,
                title: "제목 로딩 중...",
                lastMessageAt: new Date().toISOString(),
              },
            ],
          });
        }
  
        queryClient.invalidateQueries({ queryKey: ["projectDetail", projectKey] });
      }
  
      onSuccess?.();
    } catch (err) {
      alert("채팅 추가 실패");
      console.error(err);
    } finally {
      closeMenu();
      onClose();
    }
  };
  

  if (loading) {
    return <div className={styles.ProjectSelectorOverlay}>불러오는 중...</div>;
  }

  return (
    <div className={styles.ProjectSelectorOverlay}>
      {projects.map((project) => (
        <div
          key={project.projectId}
          className={styles.ProjectItem}
          onClick={() => handleSelect(project.projectId)}
        >
          <FiFolder /> {project.projectName}
        </div>
      ))}
    </div>
  );
};

export default ProjectSelectorOverlay;
