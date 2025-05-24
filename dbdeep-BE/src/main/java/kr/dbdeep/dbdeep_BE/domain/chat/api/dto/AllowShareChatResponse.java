package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AllowShareChatResponse {
    private String chatRoomId;
}
