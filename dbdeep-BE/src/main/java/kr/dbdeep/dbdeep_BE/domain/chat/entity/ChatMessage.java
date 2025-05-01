package kr.dbdeep.dbdeep_BE.domain.chat.entity;

import com.google.cloud.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private String id;
    private String chatRoomId;
    private String content;
    private Long memberId;
    private String senderType;
    private Timestamp timestamp;
}
