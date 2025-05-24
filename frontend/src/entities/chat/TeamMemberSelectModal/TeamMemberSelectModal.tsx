import React, { useState } from "react";
import styles from "./TeamMemberSelectModal.module.css";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import Button from "@/shared/ui/Button/Button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Member, fetchMembers } from "@/features/chat/memberApi";
import TeamMemberList from "../TeamMemberList/TeamMemberList";
import { shareChat } from "@/features/chat/chatApi";
import { useParams } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "@/shared/toast";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  onSelect: (memberId: string) => void;
}

const TeamMemberSelectModal: React.FC<Props> = ({ onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "email" | "teamName">("name");
  const { chatId } = useParams<{ chatId: string }>();

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", searchQuery, searchType],
    queryFn: () => fetchMembers(searchQuery, searchType),
    enabled: searchQuery.trim().length > 0,
    staleTime: 300,
    refetchOnWindowFocus: false,
  });

  const { mutate: shareChatMutation, status } = useMutation({
    mutationFn: () => shareChat(chatId!, selectedIds),
    onSuccess: () => {
      showSuccessToast("채팅이 성공적으로 공유되었습니다!");
      onClose();
    },
    onError: () => {
      showErrorToast("공유 중 오류가 발생했습니다.");
    },
  });

  const handleToggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };
  
  const isSharing = status === 'pending';  

  return createPortal(
    <div className={styles["TeamMemberSelectModal-overlay"]} onClick={onClose}>
      <div className={styles["TeamMemberSelectModal-container"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["TeamMemberSelectModal-header"]}>
          <span>채팅 공유</span>
          <button className={styles["TeamMemberSelectModal-close"]} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles["TeamMemberSelectModal-searchWrapper"]}>
          <div className={styles["TeamMemberSelectModal-searchGroup"]}>
            <div className={styles["TeamMemberSelectModal-selectWrapper"]}>
              <select
                className={styles["TeamMemberSelectModal-select"]}
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "name" | "email" | "teamName")
                }
              >
                <option value="name">이름</option>
                <option value="email">이메일</option>
                <option value="teamName">부서</option>
              </select>
              <FiChevronDown className={styles["TeamMemberSelectModal-selectIcon"]} />
            </div>

            <div className={styles["TeamMemberSelectModal-inputWrapper"]}>
              <FiSearch className={styles["TeamMemberSelectModal-searchIcon"]} />
              <input
                className={styles["TeamMemberSelectModal-searchInput"]}
                placeholder="검색어를 입력해주세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles["TeamMemberSelectModal-list"]}>
          <TeamMemberList
            members={members}
            selectedIds={selectedIds}
            onToggle={handleToggleMember}
          />
        </div>

        <div className={styles["TeamMemberSelectModal-footer"]}>
          <span>{selectedIds.length}명 선택됨</span>
          <div className={styles["TeamMemberSelectModal-buttons"]}>
            <Button
              label="취소"
              onClick={onClose}
              borderColor="var(--icon-blue)"
              backgroundColor="var(--background-color)"
              textColor="var(--icon-blue)"
            />
            <Button
              label={isSharing ? "공유 중..." : "공유하기"}
              onClick={() => shareChatMutation()}
              borderColor="var(--icon-blue)"
              backgroundColor="var(--icon-blue)"
              textColor="var(--background-color)"
              disabled={selectedIds.length === 0 || isSharing}
            />
          </div>
        </div>
      </div>
    </div>
    , document.body
  );
};

export default TeamMemberSelectModal;
