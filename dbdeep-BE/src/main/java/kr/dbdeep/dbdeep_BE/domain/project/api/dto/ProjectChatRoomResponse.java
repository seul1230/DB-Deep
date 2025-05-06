package kr.dbdeep.dbdeep_BE.domain.project.api.dto;

import java.time.LocalDateTime;

public record ProjectChatRoomResponse(
        String chatRoomId,
        String chatRoomName,
        LocalDateTime lastMessageAt
) {
}
