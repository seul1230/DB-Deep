import React, { useState } from "react";
import styles from "./ProjectPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { FiMessageSquare, FiChevronRight, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createProject, fetchProjects } from "@/features/project/projectApi";
import { Project } from "@/features/project/projectTypes";
import CreateProjectModal from "@/shared/ui/CreateProjectModal/CreateProjectModal";
import { useQueryClient } from "@tanstack/react-query";


const ProjectPanel: React.FC = () => {
  const { closePanel } = usePanelStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const handleClick = (projectId: string) => {
    closePanel();
    navigate(`/project/${projectId}`);
  };

  const queryClient = useQueryClient();

  const handleCreateProject = async (name: string) => {
    try {
      await createProject(name); // description은 보내지 않음
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      alert("프로젝트 생성 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className={styles.ProjectPanel}>
      <div className={styles["ProjectPanel-header"]}>
        <div className={styles["ProjectPanel-headerLeft"]}>
          <span>프로젝트</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles["ProjectPanel-add"]}
            title="새 프로젝트 생성"
          >
            <FiPlus size={14} />
          </button>
        </div>
        <button onClick={closePanel} className={styles["ProjectPanel-close"]}>×</button>
      </div>

      <div className={styles["ProjectPanel-list"]}>
        {isLoading && <p className={styles.emptyMessage}>로딩 중...</p>}
        {isError && <p className={styles.emptyMessage}>에러가 발생했습니다.</p>}
        {!isLoading && !isError && projects?.length === 0 && (
          <p className={styles.emptyMessage}>프로젝트가 없습니다.</p>
        )}
        {projects?.map((project) => (
          <div
            key={project.projectId}
            className={styles["ProjectPanel-item"]}
            onClick={() => handleClick(project.projectId)}
          >
            <div className={styles["ProjectPanel-content"]}>
              <span className={styles["ProjectPanel-title"]}>{project.projectName}</span>
              <div className={styles["ProjectPanel-info"]}>
                <FiMessageSquare className={styles["ProjectPanel-MessageCount"]} />
                <span>{project.chatCount}개의 채팅</span>
              </div>
            </div>
            <FiChevronRight className={styles["ProjectPanel-arrow"]} />
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
};

export default ProjectPanel;