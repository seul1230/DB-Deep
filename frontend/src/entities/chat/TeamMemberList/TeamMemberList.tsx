import React from "react";
import styles from "./TeamMemberList.module.css";
import { Member } from "@/features/chat/memberApi";
import defaultProfile from "@/assets/default-profile.jpg"

interface Props {
  members: Member[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const TeamMemberList: React.FC<Props> = ({ members, selectedIds, onToggle }) => {
  if (members.length === 0) {
    return (
      <div style={{ color: "var(--gray-text)", fontStyle: "italic", textAlign: "center", padding: "16px" }}>
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <>
      {members.map((member) => (
        <div
          key={member.id}
          className={styles["TeamMemberList-item"]}
          onClick={() => onToggle(member.id.toString())}
        >
          <div className={styles["TeamMemberList-profile"]}>
            <img
              src={member.profileImage || defaultProfile}
              alt={member.name || "이름없음"}
              className={styles["TeamMemberList-profileImage"]}
            />
            <div className={styles["TeamMemberList-text"]}>
              <div className={styles["TeamMemberList-name"]}>{member.name || "이름없음"}</div>
              <div className={styles["TeamMemberList-email"]}>
                {member.email} · {member.teamName}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            className={styles["TeamMemberList-checkbox"]}
            checked={selectedIds.includes(member.id.toString())}
            readOnly
            />
        </div>
      ))}
    </>
  );
};

export default TeamMemberList;
