package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomQueryRepository;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomQueryRepository chatRoomQueryRepository;

    public ChatRoomListResponse findChatRooms(Integer memberId, LocalDateTime lastMessageAt, int pageSize) {
        ChatRoomListResponse chatRoomListResponse =
                chatRoomQueryRepository.findChatRoomsByCursor(memberId, lastMessageAt, pageSize);
        return chatRoomListResponse;
    }

    public ChatRoom findChatRoomById(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId).orElse(null);
    }

}
