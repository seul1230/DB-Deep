package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import java.util.List;
import java.util.stream.Collectors;
import kr.dbdeep.dbdeep_BE.domain.chat.dto.ChatMessageDto;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatMessageListResponse {

    private String chatId;
    private String chatTitle;
    private List<ChatMessageDto> messages;

    public static ChatMessageListResponse from(ChatRoom chatRoom, List<ChatMessage> chatMessages) {
        return ChatMessageListResponse.builder()
                .chatId(chatRoom.getId())
                .chatTitle(chatRoom.getChatroomName())
                .messages(chatMessages.stream().map(ChatMessageDto::from).collect(Collectors.toList()))
                .build();
    }

}
