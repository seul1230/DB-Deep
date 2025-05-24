package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;

public record CreateChatRoomResponse(
        String chatRoomId
) {
    public static CreateChatRoomResponse from(ChatRoom chatRoom) {
        return new CreateChatRoomResponse(chatRoom.getId());
    }
}
