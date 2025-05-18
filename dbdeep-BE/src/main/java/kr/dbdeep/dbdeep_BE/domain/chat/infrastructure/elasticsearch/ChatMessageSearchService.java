package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageSearchService {

    private final ChatRoomRepository chatRoomRepository;
    private final CustomChatMessageRepository customChatMessageRepository;

    public List<ChatRoomSearchResultResponse> findLatestUserMessagesByKeyword(Integer memberId, String keyword) {
        List<ChatMessage> messages = customChatMessageRepository.searchByMemberIdAndKeyword(memberId, keyword);

        List<String> chatRoomIds = messages.stream()
                .map(ChatMessage::getChatRoomId)
                .distinct()
                .toList();

        Map<String, String> chatRoomNames = chatRoomRepository.findAllById(chatRoomIds).stream()
                .collect(Collectors.toMap(
                        chatRoom -> chatRoom.getId().toString(),
                        ChatRoom::getChatroomName
                ));

        return messages.stream()
                .filter(m -> chatRoomNames.containsKey(m.getChatRoomId()))
                .collect(Collectors.toMap(
                        ChatMessage::getChatRoomId,
                        Function.identity(),
                        (existing, replacement) -> existing
                ))
                .values().stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp).reversed())
                .map(m -> ChatRoomSearchResultResponse.builder()
                        .chatId(m.getChatRoomId())
                        .title(chatRoomNames.getOrDefault(m.getChatRoomId(), "알 수 없음"))
                        .message(m.getContent())
                        .updatedAt(m.getTimestamp())
                        .build())
                .toList();
    }

}