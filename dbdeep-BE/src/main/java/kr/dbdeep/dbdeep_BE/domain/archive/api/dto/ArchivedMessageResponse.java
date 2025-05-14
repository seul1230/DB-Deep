package kr.dbdeep.dbdeep_BE.domain.archive.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import kr.dbdeep.dbdeep_BE.domain.archive.entity.Archive;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import lombok.Builder;

@Builder
public record ArchivedMessageResponse(
        Integer archiveId,
        String messageId,
        String chatRoomId,
        String chatName,
        Object lastMessage,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime chatSentAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime archivedAt
) {
    public static ArchivedMessageResponse from(
            Archive archive,
            ChatMessage message,
            ChatRoom chatRoom
    ) {
        return ArchivedMessageResponse.builder()
                .archiveId(archive.getId())
                .chatRoomId(chatRoom.getId())
                .messageId(message.getId())
                .chatName(chatRoom.getChatroomName())
                .lastMessage(message.getContent())
                .chatSentAt(
                        message.getTimestamp().toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .archivedAt(archive.getCreatedAt())
                .build();
    }
}
