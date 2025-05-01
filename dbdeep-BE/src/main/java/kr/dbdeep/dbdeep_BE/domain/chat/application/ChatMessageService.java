package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatMessageListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageListResponse getMessagesByChatRoomId(String chatRoomId) {
        ChatRoom chatRoom = chatRoomService.findChatRoomById(chatRoomId);
        List<ChatMessage> messages = chatMessageRepository.findRecentMessagesByChatRoomId(chatRoomId);

        return ChatMessageListResponse.from(chatRoom, messages);
    }
}
