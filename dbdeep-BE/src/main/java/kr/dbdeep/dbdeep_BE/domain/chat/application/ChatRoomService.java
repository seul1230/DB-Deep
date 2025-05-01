package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.exception.ChatRoomNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomQueryRepository;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomQueryRepository chatRoomQueryRepository;

    public ChatRoomListResponse find(Integer memberId, LocalDateTime lastMessageAt, int pageSize) {
        ChatRoomListResponse chatRoomListResponse =
                chatRoomQueryRepository.findByCursor(memberId, lastMessageAt, pageSize);
        return chatRoomListResponse;
    }

    public ChatRoom findById(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(ErrorCode.CHAT_ROOM_NOT_FOUND));
    }

}
