package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import lombok.Builder;

@Builder
public record ChatRoomSearchResultResponse(
        String chatId,
        String title,
        String message,
        String updatedAt
) {

}
