package kr.dbdeep.dbdeep_BE.domain.chat.dto;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import lombok.Builder;

@Builder
public record ChatRoomDto(
        String id,
        String title,
        LocalDateTime lastMessageAt
) {
    public static ChatRoomDto from(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .title(chatRoom.getChatroomName())
                .lastMessageAt(chatRoom.getLastMessageAt())
                .build();
    }
}
