package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.time.LocalDateTime;
import java.util.UUID;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.CreateChatRoomResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.exception.ChatRoomNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomQueryRepository;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomQueryRepository chatRoomQueryRepository;

    public ChatRoomListResponse find(Integer memberId, LocalDateTime lastMessageAt, int pageSize) {
        ChatRoomListResponse chatRoomListResponse =
                chatRoomQueryRepository.findByCursor(memberId, lastMessageAt, pageSize);
        return chatRoomListResponse;
    }

    @Transactional
    public CreateChatRoomResponse create(Integer memberId) {
        ChatRoom chatRoom = ChatRoom.builder()
                .id(UUID.randomUUID().toString())
                .memberId(memberId)
                .lastMessageAt(LocalDateTime.now())
                .build();
        ChatRoom created = save(chatRoom);
        return CreateChatRoomResponse.from(created);
    }

    public ChatRoom findById(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(ErrorCode.CHAT_ROOM_NOT_FOUND));
    }

    @Transactional
    public void deleteById(String chatRoomId) {
        ChatRoom chatRoom = findById(chatRoomId);
        chatRoom.delete();
    }

    @Transactional
    public void updateTitle(String chatRoomId, String title) {
        ChatRoom chatRoom = findById(chatRoomId);
        chatRoom.updateTitle(title);
    }

    @Transactional
    public ChatRoom save(ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }

}
