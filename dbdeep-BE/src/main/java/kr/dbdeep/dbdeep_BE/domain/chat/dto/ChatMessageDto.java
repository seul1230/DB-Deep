package kr.dbdeep.dbdeep_BE.domain.chat.dto;

import com.google.cloud.Timestamp;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        String id,
        Object content,
        String senderType,
        Timestamp timestamp
) {
    public static ChatMessageDto from(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .id(chatMessage.getId())
                .content(chatMessage.getContent())
                .senderType(chatMessage.getSenderType())
                .timestamp(chatMessage.getTimestamp())
                .build();
    }
}
