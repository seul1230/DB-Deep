import { forwardRef, useState } from "react";
import styles from "./ChatLogItemMenu.module.css";
import { FiEdit3, FiFolderPlus, FiChevronRight } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import ProjectSelectorOverlay from "../ProjectSelectorOverlay/ProjectSelectorOverlay";
import { useOverlayStore } from "@/shared/store/useChatLogPanelOverlayStore";
import { addChatToProject } from "@/features/project/projectApi";

interface Props {
  position: { top: number; left: number } | null;
  onClose: () => void;
  selectedChatId: string;
  onRequestTitleEdit: (chatId: string) => void;
  onRequestDelete: (chatId: string) => void;
  onSuccess?: () => void;
}

const ChatLogItemMenu = forwardRef<HTMLDivElement, Props>(
  ({ position, onClose, selectedChatId, onRequestTitleEdit, onRequestDelete, onSuccess }, ref) => {
    const [isHoveringProject, setIsHoveringProject] = useState(false);

    const closeMenu = useOverlayStore((state) => state.closeMenu);

    const handleSelectProject = async (projectId: string) => {
      try {
        await addChatToProject(projectId, selectedChatId);

        alert("채팅이 프로젝트에 저장되었습니다.");
      } catch {
        alert("프로젝트에 저장 실패했습니다.");
      } finally {
        setIsHoveringProject(false);
        closeMenu();
      }
    };

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

          {isHoveringProject && (
            <div className={styles.ChatLogItemSubOverlay}>
              <ProjectSelectorOverlay
                chatId={selectedChatId}
                onSelect={handleSelectProject}
                onClose={() => setIsHoveringProject(false)}
                onSuccess={onSuccess}
              />
            </div>
          )}
        </div>

        {/* 채팅 삭제 (클릭 이벤트 추가 필요 시 props에 추가) */}
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
