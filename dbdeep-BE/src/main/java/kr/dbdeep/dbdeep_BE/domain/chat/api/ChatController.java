package kr.dbdeep.dbdeep_BE.domain.chat.api;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.application.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chats")
public class ChatController {

    private final ChatRoomService chatRoomService;

    @GetMapping
    public ResponseEntity<ChatRoomListResponse> findChatRooms(@CurrentMemberId Integer memberId,
                                                              @RequestParam(required = false, defaultValue = "30") Integer size,
                                                              @RequestParam(required = false) String cursor) {
        LocalDateTime parsedCursor = null;
        if (cursor != null && !cursor.isBlank()) {
            parsedCursor = LocalDateTime.parse(cursor);
        }
        ChatRoomListResponse chatRoomListResponse = chatRoomService.findChatRooms(memberId, parsedCursor, size);
        return ResponseEntity.ok(chatRoomListResponse);
    }

}
