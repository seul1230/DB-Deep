import React, { useEffect, useState } from "react";
import styles from "./ProjectSelectorOverlay.module.css";
import { FiFolder } from "react-icons/fi";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";
import { fetchProjects, addChatToProject  } from "@/features/project/projectApi";
import { Project } from "@/features/project/projectTypes";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

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
  const [selecting, setSelecting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch {
        // console.error("프로젝트 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleSelect = async (projectId: string) => {
    if (selecting) return;
    setSelecting(true);

    try {
      await addChatToProject(projectId, chatId);
      toast.success("채팅이 프로젝트에 성공적으로 추가되었습니다.");
      onSuccess?.();

      const currentProjectId = window.location.pathname.match(/^\/project\/([^/]+)/)?.[1];

      if (currentProjectId === String(projectId)) {
        // 서버에서 최신 projectDetail 재요청
        await queryClient.invalidateQueries({
          queryKey: ["projectDetail", String(projectId)],
          exact: true,
        });
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.code;
      const errorMessage =
        errorCode === 4020
          ? "이미 해당 채팅이 프로젝트에 추가되어 있습니다."
          : "채팅 추가에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setSelecting(false);
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
