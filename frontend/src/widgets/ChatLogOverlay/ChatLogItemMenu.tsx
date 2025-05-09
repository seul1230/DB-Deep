import { forwardRef, useState } from "react";
import styles from "./ChatLogItemMenu.module.css";
import { FiEdit3, FiFolderPlus, FiChevronRight } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import ProjectSelectorOverlay from "../ProjectSelectorOverlay/ProjectSelectorOverlay";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";

interface Props {
  position: { top: number; left: number } | null;
  onClose: () => void;
  onSaveToProject: (projectId: string) => void;
  selectedChatId: string;
  onRequestTitleEdit: (chatId: string) => void;
  onRequestDelete: (chatId: string) => void;
}

const ChatLogItemMenu = forwardRef<HTMLDivElement, Props>(
  ({ position, onClose, onSaveToProject, selectedChatId, onRequestTitleEdit, onRequestDelete }, ref) => {
    const [isHoveringProject, setIsHoveringProject] = useState(false);

    const closeMenu = useOverlayStore((state) => state.closeMenu);

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
        <div
          className={styles.ChatLogItemMenuItem}
          onClick={() => {
            onClose();
            onRequestTitleEdit(selectedChatId); // 인라인 수정 모드 요청
          }}
        >
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
            closeMenu();
            onRequestDelete(selectedChatId);
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
