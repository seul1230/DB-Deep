package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "chat-messages")
public class ChatMessage {

    @Id
    private String id;

    private String chatRoomId;
    private Object content;
    private Long memberId;
    private String senderType;
    private String timestamp;
}
