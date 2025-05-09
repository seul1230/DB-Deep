import React from "react";
import styles from "./ProjectSelectorOverlay.module.css";
import { FiFolder } from "react-icons/fi";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";

const mockProjects = [
  "성과 요약 프로젝트",
  "캠페인 분석 노트",
  "사용자 행동 탐색",
  "주간 리포트 모음",
  "실험 결과 모음",
  "상품별 분석 기록",
  "분석 아이디어 스택",
];

interface Props {
  onSelect: (projectId: string) => void;
  onClose: () => void;
}

const ProjectSelectorOverlay: React.FC<Props> = ({ onSelect }) => {
  const closeMenu = useOverlayStore((state) => state.closeMenu);
  
  return (
    <div className={styles.ProjectSelectorOverlay}>
      {mockProjects.map((title) => (
        <div
          key={title}
          className={styles.ProjectItem}
          onClick={() => {
            closeMenu();
            onSelect(title)
          }}
        >
          <FiFolder /> {title}
        </div>
      ))}
    </div>
  );
};

export default ProjectSelectorOverlay;
