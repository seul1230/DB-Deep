package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomQueryRepository chatRoomQueryRepository;

    public ChatRoomListResponse findChatRooms(Integer memberId, LocalDateTime lastMessageAt, int pageSize) {
        ChatRoomListResponse chatRoomListResponse =
                chatRoomQueryRepository.findChatRoomsByCursor(memberId, lastMessageAt, pageSize);
        return chatRoomListResponse;
    }

}
