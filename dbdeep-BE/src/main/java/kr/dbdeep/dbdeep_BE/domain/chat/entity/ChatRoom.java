package kr.dbdeep.dbdeep_BE.domain.chat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.global.entity.BaseTimeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chatroom")
public class ChatRoom extends BaseTimeEntity {

    @Id
    private String id;

    @Column(name = "member_id", nullable = false)
    private Integer memberId;

    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "chatroom_name", length = 50)
    private String chatroomName;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    public void updateTitle(String title) {
        this.chatroomName = title;
    }

    public void connectToProject(Integer projectId) {
        this.projectId = projectId;
    }

}