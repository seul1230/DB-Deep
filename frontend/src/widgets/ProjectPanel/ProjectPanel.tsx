import React from "react";
import styles from "./ProjectPanel.module.css";
import { usePanelStore } from "@/shared/store/usePanelStore";
import { FiMessageSquare, FiChevronRight } from "react-icons/fi";

const projects = [
  { id: 1, title: "성과 요약 프로젝트", chatCount: 9 },
  { id: 2, title: "캠페인 분석 노트", chatCount: 4 },
  { id: 3, title: "사용자 행동 탐색", chatCount: 5 },
  { id: 4, title: "주간 리포트 모음", chatCount: 11 },
  { id: 5, title: "실험 결과 모음", chatCount: 34 },
  { id: 6, title: "상품별 분석 기록", chatCount: 7 },
  { id: 7, title: "분석 아이디어 스택", chatCount: 20 },
];

const ProjectPanel: React.FC = () => {
  const { closePanel } = usePanelStore();

  return (
    <div className={styles.ProjectPanel}>
      <div className={styles["ProjectPanel-header"]}>
        <span>프로젝트</span>
        <button onClick={closePanel} className={styles["ProjectPanel-close"]}>×</button>
      </div>
      <div className={styles["ProjectPanel-list"]}>
        {projects.map((project) => (
          <div key={project.id} className={styles["ProjectPanel-item"]}>
            <div className={styles["ProjectPanel-content"]}>
              <span className={styles["ProjectPanel-title"]}>{project.title}</span>
              <div className={styles["ProjectPanel-info"]}>
                <FiMessageSquare size={11} />
                <span>{project.chatCount}개 채팅</span>
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
