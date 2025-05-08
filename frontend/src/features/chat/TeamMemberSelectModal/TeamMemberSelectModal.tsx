import React, { useState } from "react";
import styles from "./TeamMemberSelectModal.module.css";
import { FiSearch } from "react-icons/fi";
import Button from "@/shared/ui/Button/Button";

export interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  avatarUrl: string;
}

interface Props {
  members: Member[];
  onClose: () => void;
  onSelect: (memberId: string) => void;
  onShare: (selectedMembers: Member[]) => void;
}

const TeamMemberSelectModal: React.FC<Props> = ({ members, onClose, onShare }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles["TeamMemberSelectModal-overlay"]} onClick={onClose}>
      <div
        className={styles["TeamMemberSelectModal-container"]}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["TeamMemberSelectModal-header"]}>
          <span>채팅 공유</span>
          <button className={styles["TeamMemberSelectModal-close"]} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles["TeamMemberSelectModal-searchWrapper"]}>
          <FiSearch className={styles["TeamMemberSelectModal-searchIcon"]} />
          <input
            className={styles["TeamMemberSelectModal-searchInput"]}
            placeholder="이름 또는 이메일로 검색해주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles["TeamMemberSelectModal-list"]}>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={styles["TeamMemberSelectModal-item"]}
              onClick={() => handleToggleMember(member.id)}
            >
              <div className={styles["TeamMemberSelectModal-profile"]}>
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className={styles["TeamMemberSelectModal-avatar"]}
                />
                <div className={styles["TeamMemberSelectModal-text"]}>
                  <div className={styles["TeamMemberSelectModal-name"]}>{member.name}</div>
                  <div className={styles["TeamMemberSelectModal-email"]}>
                    {member.email} · {member.team}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedIds.includes(member.id)}
                readOnly
              />
            </div>
          ))}
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
                    const selected = members.filter((m) => selectedIds.includes(m.id));
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
