import React from "react";
import styles from "./ProjectPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { FiMessageSquare, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/features/project/projectApi";
import { Project } from "@/features/project/projectTypes";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const ProjectPanel: React.FC = () => {
  const { closePanel } = usePanelStore();
  const navigate = useNavigate();

  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const handleClick = (projectId: string) => {
    closePanel();
    navigate(`/project/${projectId}`);
  };

  return (
    <div className={styles.ProjectPanel}>
      <div className={styles["ProjectPanel-header"]}>
        <span>프로젝트</span>
        <button onClick={closePanel} className={styles["ProjectPanel-close"]}>×</button>
      </div>
      <div className={styles["ProjectPanel-list"]}>
        {isLoading && <p>로딩 중...</p>}
        {isError && <p>에러가 발생했습니다.</p>}
        {projects?.map((project) => (
          <div
            key={project.projectId}
            className={styles["ProjectPanel-item"]}
            onClick={() => handleClick(project.projectId)}
          >
            <div className={styles["ProjectPanel-content"]}>
              <span className={styles["ProjectPanel-title"]}>{project.projectName}</span>
              <div className={styles["ProjectPanel-info"]}>
                <FiMessageSquare size={11} />
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </div>
            <FiChevronRight className={styles["ProjectPanel-arrow"]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPanel;
