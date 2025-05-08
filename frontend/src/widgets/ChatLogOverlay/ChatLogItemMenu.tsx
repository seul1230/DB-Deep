import React, { forwardRef, useState } from "react";
import styles from "./ChatLogItemMenu.module.css";
import { FiEdit3, FiFolderPlus, FiChevronRight } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import ProjectSelectorOverlay from "../ProjectSelectorOverlay/ProjectSelectorOverlay";

interface Props {
  position: { top: number; left: number } | null;
  onClose: () => void;
  onSaveToProject: (projectId: string) => void;
}

const ChatLogItemMenu = forwardRef<HTMLDivElement, Props>(
  ({ position, onClose, onSaveToProject }, ref) => {
    const [isHoveringProject, setIsHoveringProject] = useState(false);

    return (
      <div
        ref={ref}
        className={styles.ChatLogItemMenu}
        style={
          position
            ? {
                top: position.top + 12,
                left: position.left + 24,
                position: "absolute",
              }
            : undefined
        }
      >
        {/* 이름 바꾸기 */}
        <div className={styles.ChatLogItemMenuItem} onClick={onClose}>
          <FiEdit3 />
          <span>이름 바꾸기</span>
        </div>

        {/* 프로젝트에 저장 + 서브메뉴 */}
        <div
          className={styles.ChatLogItemMenuItem}
          onMouseEnter={() => setIsHoveringProject(true)}
          onMouseLeave={() => setIsHoveringProject(false)}
        >
          <div className={styles.ChatLogItemMenuItemContent}>
            <FiFolderPlus />
            <span>프로젝트에 저장</span>
          </div>
          <FiChevronRight className={styles.ChatLogItemArrow} />

          {/* 서브메뉴 오버레이 */}
          {isHoveringProject && (
            <div className={styles.ChatLogItemSubOverlay}>
              <ProjectSelectorOverlay
                onSelect={(projectId) => {
                  onSaveToProject(projectId);
                  setIsHoveringProject(false); // 선택 후 닫기
                }}
                onClose={() => setIsHoveringProject(false)}
              />
            </div>
          )}
        </div>

        {/* 채팅 삭제 (클릭 이벤트 추가 필요 시 props에 추가하세요) */}
        <div
          className={styles.ChatLogItemMenuItemDanger}
          onClick={() => {
            // 여기에 삭제 핸들러 연결 가능
            console.log("채팅 삭제 클릭됨");
          }}
        >
          <RiDeleteBin6Line />
          <span>채팅 삭제</span>
        </div>
      </div>
    );
  }
);

export default ChatLogItemMenu;
