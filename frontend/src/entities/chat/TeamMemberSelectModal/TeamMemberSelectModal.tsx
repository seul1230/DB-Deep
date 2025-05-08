import React, { useState } from "react";
import styles from "./TeamMemberSelectModal.module.css";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import Button from "@/shared/ui/Button/Button";
import { useQuery } from "@tanstack/react-query";
import { Member, fetchMembers } from "@/features/chat/memberApi";
import TeamMemberList from "../TeamMemberList/TeamMemberList";

interface Props {
  onClose: () => void;
  onSelect: (memberId: string) => void;
  onShare: (selectedMembers: Member[]) => void;
}

const TeamMemberSelectModal: React.FC<Props> = ({ onClose, onShare }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "email" | "teamName">("name");

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", searchQuery, searchType],
    queryFn: () => fetchMembers(searchQuery, searchType),
    enabled: searchQuery.trim().length > 0,
    staleTime: 300,
    refetchOnWindowFocus: false,
  });

  const handleToggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
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
              label="공유하기"
              onClick={() => {
                const selected = members.filter((m) => selectedIds.includes(m.id.toString()));
                onShare(selected);
              }}
              borderColor="var(--icon-blue)"
              backgroundColor="var(--icon-blue)"
              textColor="var(--background-color)"
              disabled={selectedIds.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberSelectModal;
