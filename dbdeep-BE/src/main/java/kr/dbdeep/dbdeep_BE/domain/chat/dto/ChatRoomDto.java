package kr.dbdeep.dbdeep_BE.domain.chat.dto;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatRoomDto {
    private Integer id;
    private String title;
    private LocalDateTime lastMessageAt;

    public static ChatRoomDto from(ChatRoom chatRoom) {
        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .title(chatRoom.getChatroomName())
                .lastMessageAt(chatRoom.getLastMessageAt())
                .build();
    }

}
